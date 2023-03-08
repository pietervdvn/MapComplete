import { LayoutConfigJson } from "../Models/ThemeConfig/Json/LayoutConfigJson"
import { LayerConfigJson } from "../Models/ThemeConfig/Json/LayerConfigJson"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"

function main(args: string[]) {
    if (args.length === 0) {
        console.log(
            "Extracts an inline layer from a theme and places it in it's own layer directory."
        )
        console.log("USAGE: ts-node scripts/extractLayerFromTheme.ts <themeid> <layerid>")
        console.log("(Invoke with only the themename to see which layers can be extracted)")
        return
    }
    const themeId = args[0]
    const layerId = args[1]

    const themePath = "./assets/themes/" + themeId + "/" + themeId + ".json"
    const contents = <LayoutConfigJson>JSON.parse(readFileSync(themePath, { encoding: "utf8" }))
    const layers = <LayerConfigJson[]>contents.layers.filter((l) => {
        if (typeof l === "string") {
            return false
        }
        if (l["override"] !== undefined) {
            return false
        }
        return true
    })

    if (layers.length === 0) {
        console.log(
            "No layers can be extracted from this theme. The " +
                contents.layers.length +
                " layers are already substituted layers"
        )
        return
    }

    const layerConfig = layers.find((l) => l.id === layerId)
    if (layerId === undefined || layerConfig === undefined) {
        if (layerId !== undefined) {
            console.error("Layer " + layerId + " not found as inline layer")
        }
        console.log("Layers available for extraction are:")
        console.log(layers.map((l) => l.id).join("\n"))
        return
    }

    const dir = "./assets/layers/" + layerId
    if (!existsSync(dir)) {
        mkdirSync(dir)
    }
    writeFileSync(dir + "/" + layerId + ".json", JSON.stringify(layerConfig, null, "  "))

    const index = contents.layers.findIndex((l) => l["id"] === layerId)
    contents.layers[index] = layerId
    writeFileSync(themePath, JSON.stringify(contents, null, "  "))
}

main(process.argv.slice(2))
