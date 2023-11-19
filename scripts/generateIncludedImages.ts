import * as fs from "fs"

function genImages(dryrun = false) {
    console.log("Generating images")
    // These images are not referenced via 'Svg.ts' anymore and can be ignored
    const blacklist: string[] = [
        "add",
        "addSmall",
        "brick_wall_square",
        "clock",
        "community",
        "copyright",
        "cross",
        "cross_bottom_right",
        "crosshair_locked",
        "delete_not_allowed",
        "direction_gradient",
        "direction_stroke",
        "duplicate",
        "elevator",
        "elevator_wheelchair",
        "liberapay",
        "length_crosshair",
        "speech_bubble_black_outline",
        "square",
        "star_half",
        "star_outline",
        "star",
        "osm_logo_us",

        "SocialImageForeground",
        "wikipedia",
        "Upload",
        "pin",
        "mapillary_black",
        "plantnet_logo",
        "mastodon",
        "move-arrows",
        "mapcomplete_logo",
        "logo",
        "logout",
        "hand",
        "help",
        "home",
        "reload",
        "min",
        "plus",
        "not_found",
        "osm_logo_us",
        "party",
        "filter",
        "filter_disable",
        "floppy",
        "eye",
        "gear",
        "gender_bi",
        "compass",
        "blocked",
        "brick_wall",
        "brick_wall_raw",
        "brick_wall_round",
        "bug",
        "back",
    ].map((s) => s.toLowerCase())
    const dir = fs.readdirSync("./assets/svg")

    let module =
        'import Img from "./UI/Base/Img";\nimport {FixedUiElement} from "./UI/Base/FixedUiElement";\n\n/* @deprecated */\nexport default class Svg {\n\n\n'
    for (const path of dir) {
        if (path.endsWith("license_info.json")) {
            continue
        }
        if (path.endsWith(".license")) {
            continue
        }

        if (!path.endsWith(".svg")) {
            throw "Non-svg file detected in the svg files: " + path
        }

        let svg: string = fs
            .readFileSync("./assets/svg/" + path, "utf-8")
            .replace(/<\?xml.*?>/, "")
            .replace(/<!DOCTYPE [^>]*>/, "")
            .replace(/fill: ?none;/g, "fill: none !important;") // This is such a brittle hack...
            .replace(/\n/g, " ")
            .replace(/\r/g, "")
            .replace(/\\/g, "\\")
            .replace(/"/g, '\\"')
            .replaceAll(" ", " ")

        let hasNonAsciiChars = Array.from(svg)
            .filter((char) => char.charCodeAt(0) > 127)
            .map((char) => char.charCodeAt(0))
            .join(", ")
        if (hasNonAsciiChars.length > 0) {
            throw "The svg '" + path + "' has non-ascii characters: " + hasNonAsciiChars
        }
        const name = path.substring(0, path.length - 4).replace(/[ -]/g, "_")

        const nameUC = name.toUpperCase().at(0) + name.substring(1)
        const svelteCode =
            '<script>\nexport let color = "#000000"\n</script>\n' +
            svg
                .replace(
                    "<svg ",
                    "<svg {...$$$$restProps} on:click on:mouseover on:mouseenter on:mouseleave on:keydown "
                )
                .replace(/\\"/g, '"')
                .replace(/(rgb\(0%,0%,0%\)|#000000|#000)/g, "{color}")
        fs.writeFileSync("./src/assets/svg/" + nameUC + ".svelte", svelteCode, "utf8")

        if (blacklist.some((item) => path.toLowerCase().endsWith(item + ".svg"))) {
            continue
        }
        if (dryrun) {
            svg = "<omitting svg - dryrun>"
        }

        let rawName = name

        module += `    public static ${name} = "${svg}"\n`
        if (!dryrun) {
            module += `    public static ${name}_svg() { return new Img(Svg.${rawName}, true);}\n`
        } else {
            module += `    public static ${name}_svg() { return new Img("", true);}\n`
        }
    }
    module += "}\n"
    fs.writeFileSync("src/Svg.ts", module)
    console.log("Done")
}

genImages()
