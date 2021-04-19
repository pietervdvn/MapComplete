import {Utils} from "../Utils";

Utils.runningFromConsole = true;
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";
import {TagsFilter} from "../Logic/Tags/TagsFilter";
import LanguagePicker from "../UI/LanguagePicker";
import Locale from "../UI/i18n/Locale";
import {Layer} from "leaflet";
import LayerConfig from "../Customizations/JSON/LayerConfig";
import {Translation} from "../UI/i18n/Translation";
import {readFileSync, writeFile, writeFileSync} from "fs";

const outputDirectory = "Docs/TagInfo"

function generateLayerUsage(layer: LayerConfig, layout: LayoutConfig): any [] {
    const usedTags = layer.source.osmTags.asChange({})
    const result = []
    for (const kv of usedTags) {
        const overview = {
            // OSM tag key (required)
            key: kv.k,
            description: "The MapComplete theme " + layout.title.txt + " has a layer " + layer.name.txt + " showing features with this tag"
        };
        if (kv.v !== undefined) {
            // OSM tag value (optional, if not supplied it means "all values")
            overview["value"] = kv.v
        }
        result.push(overview)
    }
    return result;
}

/**
 * Generates the JSON-object representing the theme for inclusion on taginfo
 * @param layout
 */
function generateTagInfoEntry(layout: LayoutConfig): any {
    const usedTags = []
    for (const layer of layout.layers) {
        usedTags.push(...generateLayerUsage(layer, layout))
    }

    const t = new Date();
    const generationTime = t.getUTCFullYear() + Utils.TwoDigits(t.getUTCMonth()) + Utils.TwoDigits(t.getUTCDate()) + "T" + Utils.TwoDigits(t.getUTCHours()) + Utils.TwoDigits(t.getUTCMinutes()) + Utils.TwoDigits(t.getSeconds()) + "Z"

    let icon = layout.icon;
    if (icon.startsWith("./")) {
        icon = icon.substring(2)
    }

    const themeInfo = {
        // data format version, currently always 1, will get updated if there are incompatible changes to the format (required)
        "data_format": 1,

        //  "data_url": "...",          # this should be the URL under which this project file can be accessed (optional)
        // timestamp when project file was updated (optional, will use HTTP header date if not available)
        "data_updated": generationTime,
        "project": {
            "name": "MapComplete " + layout.title.txt,          // name of the project (required)
            "description": layout.shortDescription.txt,   // short description of the project (required)
            "project_url": "https://mapcomplete.osm.be/" + layout.id,   // home page of the project with general information (required)
            "doc_url": "https://github.com/pietervdvn/MapComplete/tree/master/assets/themes/",       // documentation of the project and especially the tags used (optional)
            "icon_url": "https://mapcomplete.osm.be/" + layout.icon,      // project logo, should work in 16x16 pixels on white and light gray backgrounds (optional)
            "contact_name": "Pieter Vander Vennet, " + layout.maintainer,  // contact name, needed for taginfo maintainer (required)
            "contact_email": "pietervdvn@posteo.net"  // contact email, needed for taginfo maintainer (required)
        },
        tags: usedTags
    }

    const filename = "mapcomplete_" + layout.id
    console.log("Writing info about " + layout.id)
    writeFileSync(`${outputDirectory}/${filename}.json`, JSON.stringify(themeInfo, null, " "))
    return filename
}


console.log("Creating taginfo project files")

Locale.language.setData("en")
Translation.forcedLanguage = "en"

const files = []

for (const layout of AllKnownLayouts.layoutsList) {
    if (layout.hideFromOverview) {
        continue;
    }
    files.push(generateTagInfoEntry(layout));
}

const tagInfoList = "../taginfo-projects/project_list.txt"
let projectList = readFileSync(tagInfoList, "UTF8")
    .split("\n")
    .filter(entry => entry.indexOf("mapcomplete_") < 0)
    .concat(files.map(f => `${f} https://raw.githubusercontent.com/pietervdvn/MapComplete/master/Docs/TagInfo/${f}.json`))
    .sort()
    .filter(entry => entry != "")

console.log("Writing taginfo project filelist")
writeFileSync(tagInfoList, projectList.join("\n")+"\n")