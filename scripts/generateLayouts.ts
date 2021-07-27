// We HAVE to mark this while importing
import {Utils} from "../Utils";
Utils.runningFromConsole = true;

import LayoutConfig from "../Customizations/JSON/LayoutConfig";
import {existsSync, mkdirSync, readFileSync, writeFile, writeFileSync} from "fs";
import Locale from "../UI/i18n/Locale";
import Translations from "../UI/i18n/Translations";
import {Translation} from "../UI/i18n/Translation";
import Constants from "../Models/Constants";
import * as all_known_layouts from "../assets/generated/known_layers_and_themes.json"
import {LayoutConfigJson} from "../Customizations/JSON/LayoutConfigJson";
const sharp = require('sharp');


function enc(str: string): string {
    return encodeURIComponent(str.toLowerCase());
}

const alreadyWritten = []

async function createIcon(iconPath: string, size: number) {
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

async function createManifest(layout: LayoutConfig) {
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
            const name = await createIcon(path, size);
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
    } else if (icon.endsWith(".png")){
        icons.push({
            src: icon,
            sizes: "513x513",
            type: "image/png"
        })
    }
    else {
        console.log(icon)
        throw "Icon is not an svg for " + layout.id
    }
    const ogTitle = Translations.WT(layout.title).txt;
    const ogDescr = Translations.WT(layout.description ?? "").txt;

    return {
        name: name,
        short_name: ogTitle,
        start_url: `${layout.id.toLowerCase()}.html`,
        display: "standalone",
        background_color: "#fff",
        description: ogDescr,
        orientation: "portrait-primary, landscape-primary",
        icons: icons
    };
}

const template = readFileSync("index.html", "utf8");

async function createLandingPage(layout: LayoutConfig, manifest) {

    Locale.language.setData(layout.language[0]);

    const ogTitle = Translations.WT(layout.title).txt;
    const ogDescr = Translations.WT(layout.shortDescription ?? "Easily add and edit geodata with OpenStreetMap").txt;
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
    <meta property="og:image" content="${ogImage ?? './assets/SocialImage.png'}">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDescr}">`

    let icon = layout.icon;
    if (icon.startsWith("<?xml") || icon.startsWith("<svg")) {
        // This already is an svg
        icon = `./assets/generated/${layout.id}_icon.svg`
        writeFileSync(icon, layout.icon);
    }
    
    const apple_icons = []
    for (const icon of manifest.icons) {
        if(icon.type !== "image/png"){
            continue;
        }
        apple_icons.push(`<link rel="apple-touch-icon" sizes="${icon.sizes}" href="${icon.src}">`)
    }
    
    let themeSpecific = [
        `<title>${ogTitle}</title>`,
        `<link rel="manifest" href="${enc(layout.id)}.webmanifest">`,
        og,
        customCss,
        `<link rel="icon" href="assets/svg/add.svg" sizes="any" type="image/svg+xml">`,
        `<link rel="icon" href="${icon}" sizes="any" type="image/svg+xml">`,
        ...apple_icons
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
// @ts-ignore
const all : LayoutConfigJson[] = all_known_layouts.themes;
for (const i in all) {
    const layoutConfigJson : LayoutConfigJson = all[i]
    const layout = new LayoutConfig(layoutConfigJson, true, "generating layouts")
    const layoutName = layout.id
    if (blacklist.indexOf(layoutName.toLowerCase()) >= 0) {
        console.log(`Skipping a layout with name${layoutName}, it is on the blacklist`);
        continue;
    }
    const err = err => {
        if (err !== null) {
            console.log("Could not write manifest for ", layoutName, " because ", err)
        }
    };
    createManifest(layout).then(manifObj => {
        const manif = JSON.stringify(manifObj, undefined, 2);
        const manifestLocation = encodeURIComponent(layout.id.toLowerCase()) + ".webmanifest";
        writeFile(manifestLocation, manif, err);
        
        // Create a landing page for the given theme
        createLandingPage(layout, manifObj).then(landing => {
            writeFile(enc(layout.id) + ".html", landing, err)
        });
    }).catch(e => console.log("Could not generate the manifest: ", e))
   
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
    title: {en:"MapComplete"},
    version: Constants.vNumber,
    description: {en:"A thematic map viewer and editor based on OpenStreetMap"}
})).then(manifObj => {
    const manif = JSON.stringify(manifObj, undefined, 2);
    writeFileSync("index.manifest", manif)
})

console.log("Counting all translations")
Translations.CountTranslations();
console.log("All done!");