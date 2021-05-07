import {Utils} from "../Utils";

Utils.runningFromConsole = true;
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";
import Locale from "../UI/i18n/Locale";
import LayerConfig from "../Customizations/JSON/LayerConfig";
import {Translation} from "../UI/i18n/Translation";
import {readFileSync, writeFileSync} from "fs";

/**
 * Generates all the files in "Docs/TagInfo". These are picked up by the taginfo project, showing a link to the mapcomplete theme if the key is used
 */

const outputDirectory = "Docs/TagInfo"

function generateTagOverview(kv: { k: string, v: string }, description: string) {
    const overview = {
        // OSM tag key (required)
        key: kv.k,
        description: description
    };
    if (kv.v !== undefined) {
        // OSM tag value (optional, if not supplied it means "all values")
        overview["value"] = kv.v
    }
    return overview
}

function generateLayerUsage(layer: LayerConfig, layout: LayoutConfig): any [] {

    const usedTags = layer.source.osmTags.asChange({})
    const result = []
    for (const kv of usedTags) {
        const description = "The MapComplete theme " + layout.title.txt + " has a layer " + layer.name.txt + " showing features with this tag"
        result.push(generateTagOverview(kv, description))
    }

    for (const tr of layer.tagRenderings) {
        {
            const usesImageCarousel = (tr.render?.txt?.indexOf("image_carousel()") ?? -2) > 0
            const usesImageUpload = (tr.render?.txt?.indexOf("image_upload()") ?? -2) > 0
            if (usesImageCarousel || usesImageUpload) {

                const descrNoUpload = `The layer '${layer.name.txt} shows images based on the keys image, image:0, image:1,... and  wikidata, wikipedia, wikimedia_commons and mapillary`;
                const descrUpload = `The layer '${layer.name.txt} allows to upload images and adds them under the 'image'-tag (and image:0, image:1, ... for multiple images). Furhtermore, this layer shows images based on the keys image, wikidata, wikipedia, wikimedia_commons and mapillary`;

                const descr = usesImageUpload ? descrUpload : descrNoUpload;
                result.push(generateTagOverview({k: "image", v: undefined}, descr));
                result.push(generateTagOverview({k: "mapillary", v: undefined}, descr));
                result.push(generateTagOverview({k: "wikidata", v: undefined}, descr));
                result.push(generateTagOverview({k: "wikipedia", v: undefined}, descr));
            }
        }

        const q = tr.question?.txt;
        const key = tr.freeform?.key;
        if (key != undefined) {
            let descr = `Layer '${layer.name.txt}'`;
            if (q == undefined) {
                descr += " shows values with";
            } else {
                descr += " shows and asks freeform values for"
            }
            descr += ` key '${key}' (in the MapComplete.osm.be theme '${layout.title.txt}')`
            result.push(generateTagOverview({k: key, v: undefined}, descr))
        }

        const mappings = tr.mappings ?? []
        for (const mapping of mappings) {

            let descr = "Layer '" + layer.name.txt + "'";
            descr += " shows " + mapping.if.asHumanString(false, false, {}) + " with a fixed text, namely '" + mapping.then.txt + "'";
            if (q != undefined
                && mapping.hideInAnswer != true // != true will also match if a 
            ) {
                descr += " and allows to pick this as a default answer"
            }
            descr += ` (in the MapComplete.osm.be theme '${layout.title.txt}')`
            for (const kv of mapping.if.asChange({})) {
                let d = descr;
                if (q != undefined && kv.v == "") {
                    d = `${descr} Picking this answer will delete the key ${kv.k}.`
                }
                result.push(generateTagOverview(kv, d))
            }

        }
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


    let icon = layout.icon;
    if (icon.startsWith("./")) {
        icon = icon.substring(2)
    }
    /*
        const t = new Date();
        const generationTime = t.getUTCFullYear() + Utils.TwoDigits(t.getUTCMonth()) + Utils.TwoDigits(t.getUTCDate()) + "T" + Utils.TwoDigits(t.getUTCHours()) + Utils.TwoDigits(t.getUTCMinutes()) + Utils.TwoDigits(t.getSeconds()) + "Z"
    */

    const themeInfo = {
        // data format version, currently always 1, will get updated if there are incompatible changes to the format (required)
        "data_format": 1,

        //  "data_url": "...",          # this should be the URL under which this project file can be accessed (optional)
        // timestamp when project file was updated (optional, will use HTTP header date if not available)
        // Not marked as not to pollute the github history
        //"data_updated": generationTime,
        "project": {
            "name": "MapComplete " + layout.title.txt,          // name of the project (required)
            "description": layout.shortDescription.txt,   // short description of the project (required)
            "project_url": "https://mapcomplete.osm.be/" + layout.id,   // home page of the project with general information (required)
            "doc_url": "https://github.com/pietervdvn/MapComplete/tree/master/assets/themes/",       // documentation of the project and especially the tags used (optional)
            "icon_url": "https://mapcomplete.osm.be/" + icon,      // project logo, should work in 16x16 pixels on white and light gray backgrounds (optional)
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

// Write the URLS to the taginfo repository. Might fail if the repository is not checked ou
function generateProjectsOverview() {
    try {
        const tagInfoList = "../taginfo-projects/project_list.txt"
        let projectList = readFileSync(tagInfoList, "UTF8")
            .split("\n")
            .filter(entry => entry.indexOf("mapcomplete_") < 0)
            .concat(files.map(f => `${f} https://raw.githubusercontent.com/pietervdvn/MapComplete/master/Docs/TagInfo/${f}.json`))
            .sort()
            .filter(entry => entry != "")

        console.log("Writing taginfo project filelist");
        writeFileSync(tagInfoList, projectList.join("\n") + "\n");


    } catch (e) {
        console.warn("Could not write the taginfo-projects list - the repository is probably not checked out. Are you creating a fork? Ignore this message then.")
    }

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
generateProjectsOverview();