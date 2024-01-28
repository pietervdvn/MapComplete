import * as fs from "fs"

function genImages(dryrun = false) {
    console.log("Generating images")
    // These images are not referenced via 'Svg.ts' anymore and can be ignored
    const blacklist: string[] = [
        "add",
        "addSmall",
        "back",
        "circle",
        "blocked",
        "brick_wall",
        "brick_wall_raw",
        "brick_wall_round",
        "brick_wall_square",
        "bug",
        "center",
        "checkmark",
        "clock",
        "close",
        "community",
        "compass",
        "compass_arrow",
        "confirm",
        "copyright",
        "cross",
        "cross_bottom_right",
        "crosshair",
        "crosshair_locked",
        "crosshair-locked",
        "delete_not_allowed",
        "direction_gradient",
        "direction_stroke",
        "duplicate",
        "elevator",
        "elevator_wheelchair",
        "envelope",
        "eye",
        "filter",
        "filter_disable",
        "floppy",
        "gear",
        "gender_bi",
        "gender_inter",
        "gender_female",
        "gender_male",
        "gender_trans",
        "gender_queer",
        "generic_map",
        "gps_arrow",
        "hand",
        "help",
        "home",
        "length_crosshair",
        "length-crosshair",
        "liberapay",
        "location",
        "location_empty",
        "location_locked",
        "location_refused",
        "location-refused",
        "location_unlocked",
        "logo",
        "logout",
        "mapcomplete_logo",
        "mapillary",
        "mapillary_black",
        "mastodon",
        "min",
        "move",
        "move-arrows",
        "move_confirm",
        "move_not_allowed",
        "not_found",
        "osm_logo_us",
        "osm-logo-us",
        "party",
        "pencil",
        "person",
        "pin",
        "plantnet_logo",
        "plus",
        "reload",
        "resolved",
        "ring",
        "robot",
        "scissors",
        "search",
        "search_disable",
        "share",
        "SocialImageForeground",
        "speech_bubble",
        "speech_bubble_black_outline",
        "square",
        "square_rounded",
        "star",
        "star_half",
        "star_outline",
        "teardrop",
        "teardrop_with_hole_green",
        "statistics",
        "translate",
        "triangle",
        "up",
        "Upload",
        "wikidata",
        "wikimedia-commons-white",
        "wikimedia_commons_white",
        "wikipedia",
    ].map((s) => s.toLowerCase())
    const dir = fs.readdirSync("./assets/svg")

    let module =
        'import Img from "./UI/Base/Img";\n\n/* @deprecated */\nexport default class Svg {\n\n\n'
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
