import {readFileSync, writeFileSync} from "fs";
import {DesugaringStep} from "../Models/ThemeConfig/Conversion/Conversion";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";
import {Utils} from "../Utils";
import Translations from "../UI/i18n/Translations";

class ConvertImagesToIcon extends DesugaringStep<LayerConfigJson> {
    private _iconClass: string;

    constructor(iconClass: string) {
        super("Searches for images in the 'then' path, removes the <img> block and extracts the image itself a 'icon'",
            [], "ConvertImagesToIcon")
        this._iconClass = iconClass;
    }

    convert(json: LayerConfigJson, context: string): { result: LayerConfigJson; errors?: string[]; warnings?: string[]; information?: string[] } {
        const information = []
        const errors = []
        json = Utils.Clone(json)
        Utils.WalkPath(
            ["tagRenderings", "mappings"],
            json,
            mapping => {
                const then = Translations.T(mapping.then)
                const images = Utils.Dedup(then.ExtractImages())
                if (images.length == 0) {
                    return mapping
                }
                if (images.length > 1) {
                    errors.push("The mapping " + mapping.then + " has multiple images: " + images.join(", "))
                }
                information.push("Replaced image " + images[0])
                const replaced = then.OnEveryLanguage((s) => {
                    return s.replace(/(<div [^>]*>)?<img [^>]*> ?/, "").replace(/<\/div>$/, "")
                })

                mapping.then = replaced.translations
                mapping.icon = {path: images[0], class: this._iconClass}
                return mapping
            }
        )

        return {
            information,
            result: json
        };
    }
}

/**
 * One-of script to load one layer.json-file and rewrite all tagrenderings
 */
function main() {
    let args = [...process.argv]
    args.splice(0, 2)
    const path = args[0]
    const iconClass = args[1] ?? "small"
    const targetFile = args[2] ?? path + ".autoconverted.json"
    const parsed = JSON.parse(readFileSync(path, "UTF8"))
    const converted = new ConvertImagesToIcon(iconClass).convertStrict(parsed, "While running the fixImagesInTagRenderings-script")
    writeFileSync(targetFile, JSON.stringify(converted, null, "  "))
    console.log("Written fixed version to " + targetFile)
}

main();