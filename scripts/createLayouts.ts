// We HAVE to mark this while importing
import {Utils} from "../Utils";

Utils.runningFromConsole = true;
const sharp = require('sharp');

import LayoutConfig from "../Customizations/JSON/LayoutConfig";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import {existsSync, mkdirSync, readFileSync, writeFile, writeFileSync} from "fs";
import Locale from "../UI/i18n/Locale";
import Translations from "../UI/i18n/Translations";
import {Translation} from "../UI/i18n/Translation";
import Constants from "../Models/Constants";


function enc(str: string): string {
    return encodeURIComponent(str.toLowerCase());
}

function validate(layout: LayoutConfig) {
    const translations: Translation[] = [];
    const queue: any[] = [layout]

    while (queue.length > 0) {
        const item = queue.pop();
        for (const key in item) {
            const v = item[key];
            if (v === undefined) {
                continue;
            }
            if (v instanceof Translation || v?.translations !== undefined) {
                translations.push(v);
            } else if (
                ["string", "function", "boolean", "number"].indexOf(typeof (v)) < 0) {
                queue.push(v)
            }
        }
    }

    const missing = {}
    const present = {}
    for (const ln of layout.language) {
        missing[ln] = 0;
        present[ln] = 0;
        for (const translation of translations) {
            if (translation.translations["*"] !== undefined) {
                continue;
            }
            const txt = translation.translations[ln];
            const isMissing = txt === undefined || txt === "" || txt.toLowerCase().indexOf("todo") >= 0;
            if (isMissing) {
                console.log(`   ${layout.id}: No translation for`, ln, "in", translation.translations, "got:", txt)
                missing[ln]++
            } else {
                present[ln]++;
            }
        }
    }

    let message = `Translation completeness for theme ${layout.id}`
    let isComplete = true;
    for (const ln of layout.language) {
        const amiss = missing[ln];
        const ok = present[ln];
        const total = amiss + ok;
        message += `\n${ln}: ${ok}/${total}`
        if (ok !== total) {
            isComplete = false;
        }
    }
    if (isComplete) {
        console.log(`${layout.id} is fully translated!`)
    } else {
        console.log(message)
    }

}


const alreadyWritten = []

async function createIcon(iconPath: string, size: number, layout: LayoutConfig) {
    let name = iconPath.split(".").slice(0, -1).join(".");
    if (name.startsWith("./")) {
        name = name.substr(2)
    }
    const newname = `${name}${size}.png`
        .replace(/\//g, "_")
        .replace("assets_", "assets/generated/");

    if (alreadyWritten.indexOf(newname) >= 0) {
        return newname;
    }
    alreadyWritten.push(newname);
    try {
        readFileSync(newname);
        return newname; // File already exists - nothing to do
    } catch (e) {
        // Errors are normal here if this file exists
    }

    try {
        // We already read to file, in order to crash here if the file is not found
        readFileSync(iconPath);
        let img = await sharp(iconPath)
        let resized = await img.resize(size)
        await resized.toFile(newname)
    } catch (e) {
        console.error("Could not read icon", iconPath, "due to", e)
    }

    return newname;
}

async function createManifest(layout: LayoutConfig, relativePath: string) {
    const name = layout.id;

    Translation.forcedLanguage = "en"
    const icons = [];

    let icon = layout.icon;
    if (icon.endsWith(".svg") || icon.startsWith("<svg") || icon.startsWith("<?xml")) {
        // This is an svg. Lets create the needed pngs!

        let path = layout.icon;
        if (layout.icon.startsWith("<")) {
            // THis is already the svg
            path = "./assets/generated/" + layout.id + "_logo.svg"
            writeFileSync(path, layout.icon)
        }

        const sizes = [72, 96, 120, 128, 144, 152, 180, 192, 384, 512];
        for (const size of sizes) {
            const name = await createIcon(path, size, layout);
            icons.push({
                src: name,
                sizes: size + "x" + size,
                type: "image/png"
            })
        }
        icons.push({
            src: path,
            sizes: "513x513",
            type: "image/svg"
        })
    } else {
        console.log(icon)
        throw "Icon is not an svg for " + layout.id
    }
    const ogTitle = Translations.W(layout.title).InnerRender();
    const ogDescr = Translations.W(layout.description ?? "").InnerRender();

    const manif = {
        name: name,
        short_name: ogTitle,
        start_url: `${relativePath}/${layout.id.toLowerCase()}.html`,
        display: "standalone",
        background_color: "#fff",
        description: ogDescr,
        orientation: "portrait-primary, landscape-primary",
        icons: icons
    }
    return manif;
}

const template = readFileSync("index.html", "utf8");

async function createLandingPage(layout: LayoutConfig) {

    Locale.language.setData(layout.language[0]);

    const ogTitle = Translations.W(layout.title)?.InnerRender();
    const ogDescr = Translations.W(layout.shortDescription ?? "Easily add and edit geodata with OpenStreetMap")?.InnerRender();
    const ogImage = layout.socialImage;

    let customCss = "";
    if (layout.customCss !== undefined && layout.customCss !== "") {

        try {
            const cssContent = readFileSync(layout.customCss);
            customCss = "<style>" + cssContent + "</style>";
        } catch (e) {
            customCss = `<link rel='stylesheet' href="${layout.customCss}"/>`
        }
    }

    const og = `
    <meta property="og:image" content="${ogImage ?? './assets/svg/add.svg'}">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDescr}">`

    let icon = layout.icon;
    if (icon.startsWith("<?xml") || icon.startsWith("<svg")) {
        // This already is an svg
        icon = `./assets/generated/${layout.id}_icon.svg`
        writeFileSync(icon, layout.icon);
    }


    let themeSpecific = [
        `<title>${ogTitle}</title>`,
        `<link rel="manifest" href="${enc(layout.id)}.webmanifest">`,
        og,
        customCss,
        `<link rel="icon" href="assets/svg/add.svg" sizes="any" type="image/svg+xml">`,
        `<link rel="icon" href="${icon}" sizes="any" type="image/svg+xml">`,
        `<link rel="shortcut icon" href="${icon}">`,
        `<link rel="apple-touch-icon" href="${icon}">`,
    ].join("\n")

    let output = template
        .replace("Loading MapComplete, hang on...", `Loading MapComplete theme <i>${ogTitle}</i>...`)
        .replace(/<!-- THEME-SPECIFIC -->.*<!-- THEME-SPECIFIC-END-->/s, themeSpecific);

    try {
        output = output
            .replace(/<!-- DECORATION 0 START -->.*<!-- DECORATION 0 END -->/s, `<img src='${icon}' width="100%" height="100%">`)
            .replace(/<!-- DECORATION 1 START -->.*<!-- DECORATION 1 END -->/s, `<img src='${icon}' width="100%" height="100%">`);
    } catch (e) {
        console.warn("Error while applying logo: ", e)
    }

    return output;
}

const generatedDir = "./assets/generated";
if (!existsSync(generatedDir)) {
    mkdirSync(generatedDir)
}

const blacklist = ["", "test", ".", "..", "manifest", "index", "land", "preferences", "account", "openstreetmap", "custom"]
const all = AllKnownLayouts.allSets;

for (const layoutName in all) {
    if (blacklist.indexOf(layoutName.toLowerCase()) >= 0) {
        console.log(`Skipping a layout with name${layoutName}, it is on the blacklist`);
        continue;
    }
    const err = err => {
        if (err !== null) {
            console.log("Could not write manifest for ", layoutName, " because ", err)
        }
    };
    const layout = all[layoutName];
    validate(layout)
    createManifest(layout, "").then(manifObj => {
        const manif = JSON.stringify(manifObj, undefined, 2);
        const manifestLocation = encodeURIComponent(layout.id.toLowerCase()) + ".webmanifest";
        writeFile(manifestLocation, manif, err);
    })
    // Create a landing page for the given theme
    createLandingPage(layout).then(landing => {
        writeFile(enc(layout.id) + ".html", landing, err)
    });
}

createManifest(new LayoutConfig({
    icon: "./assets/svg/mapcomplete_logo.svg",
    id: "index",
    language: "en",
    layers: [],
    maintainer: "Pieter Vander Vennet",
    startLat: 0,
    startLon: 0,
    startZoom: 0,
    title: "MapComplete",
    version: Constants.vNumber,
    description: "MapComplete as a map viewer and editor which show thematic POI based on OpenStreetMap"
}), "").then(manifObj => {
    const manif = JSON.stringify(manifObj, undefined, 2);
    writeFileSync("index.manifest", manif)
})

console.log("Counting all translations")
Translations.CountTranslations();
console.log("All done!");