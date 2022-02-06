import {appendFileSync, existsSync, mkdirSync, readFileSync, writeFile, writeFileSync} from "fs";
import Locale from "../UI/i18n/Locale";
import Translations from "../UI/i18n/Translations";
import {Translation} from "../UI/i18n/Translation";
import Constants from "../Models/Constants";
import * as all_known_layouts from "../assets/generated/known_layers_and_themes.json"
import {LayoutConfigJson} from "../Models/ThemeConfig/Json/LayoutConfigJson";
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
import xml2js from 'xml2js';
import ScriptUtils from "./ScriptUtils";

const sharp = require('sharp');
const template = readFileSync("theme.html", "utf8");
const codeTemplate = readFileSync("index_theme.ts.template", "utf8");


function enc(str: string): string {
    return encodeURIComponent(str.toLowerCase());
}

async function createIcon(iconPath: string, size: number, alreadyWritten: string[]) {
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
        // Errors are normal here if this file does not exists
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

async function createManifest(layout: LayoutConfig, alreadyWritten: string[]) {
    const name = layout.id;

    Translation.forcedLanguage = "en"
    const icons = [];


    let icon = layout.icon;
    if (icon.endsWith(".svg") || icon.startsWith("<svg") || icon.startsWith("<?xml")) {
        // This is an svg. Lets create the needed pngs and do some checkes!

        const whiteBackgroundPath = "./assets/generated/theme_"+layout.id+"_white_background.svg"
        {
            const svgResult = await xml2js.parseStringPromise(readFileSync(icon, "UTF8"))
            const svg = svgResult.svg
            const width: string = svg.$.width;
            const height: string = svg.$.height;
            if(width !== height){
                console.warn("WARNING: the icon for theme "+layout.id+" is not square. Please square the icon at "+icon+"\n   Width = "+width, "height =", height)
               /* const process = exec("inkscape " + icon, ((error, stdout, stderr) => {
                    console.log("Inkscape: ", stdout)
                    if (error !== null) {
                        console.error(error)
                    }
                    if (stderr !== "") {
                        console.error(stderr)
                    }
                }))//*/
        
            }

            const builder = new xml2js.Builder();
            const withRect = {rect: {"$":{width, height, style: "fill:#ffffff;"}}, ...svg}
            const xml = builder.buildObject({svg: withRect});
            writeFileSync(whiteBackgroundPath, xml)
        }
        
        let path = layout.icon;
        if (layout.icon.startsWith("<")) {
            // THis is already the svg
            path = "./assets/generated/" + layout.id + "_logo.svg"
            writeFileSync(path, layout.icon)
        }

        const sizes = [72, 96, 120, 128, 144, 152, 180, 192, 384, 512];
        for (const size of sizes) {
            const name = await createIcon(path, size, alreadyWritten);
            createIcon(whiteBackgroundPath, size, alreadyWritten)
            icons.push({
                src: "./"+name,
                sizes: size + "x" + size,
                type: "image/png"
            })
        }
        icons.push({
            src: path,
            sizes: "513x513",
            type: "image/svg"
        })
    } else if (icon.endsWith(".png")) {
        icons.push({
            src: icon,
            sizes: "513x513",
            type: "image/png"
        })
    } else {
        console.log(icon)
        throw "Icon is not an svg for " + layout.id
    }
    const ogTitle = Translations.WT(layout.title).txt;
    const ogDescr = Translations.WT(layout.description ?? "").txt;

    return {
        name: name,
        short_name: ogTitle,
        start_url: `${layout.id.toLowerCase()}.html`,
        lang: "en",
        display: "standalone",
        background_color: "#fff",
        description: ogDescr,
        orientation: "portrait-primary, landscape-primary",
        icons: icons,
        categories: ["map", "navigation"]
    };
}

async function createLandingPage(layout: LayoutConfig, manifest) {

    Locale.language.setData(layout.language[0]);

    const ogTitle = Translations.WT(layout.title).txt.replace(/"/g, '\\"');
    const ogDescr = Translations.WT(layout.shortDescription ?? "Easily add and edit geodata with OpenStreetMap").txt.replace(/"/g, '\\"');
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
    <meta property="og:image" content="${ogImage ?? 'assets/SocialImage.png'}">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDescr}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@mapcomplete.osm;be">
    <meta name="twitter:creator" content="@pietervdvn">
    <meta name="twitter:title" content="${ogTitle}">
    <meta name="twitter:description" content="${ogDescr}">
    <meta name="twitter:image" content="${ogImage}">`

    let icon = layout.icon;
    if (icon.startsWith("<?xml") || icon.startsWith("<svg")) {
        // This already is an svg
        icon = `./assets/generated/${layout.id}_icon.svg`
        writeFileSync(icon, layout.icon);
    }

    const apple_icons = []
    for (const icon of manifest.icons) {
        if (icon.type !== "image/png") {
            continue;
        }
        apple_icons.push(`<link rel="apple-touch-icon" sizes="${icon.sizes}" href="./assets/generated/generated_theme_${layout.id}_white_background${icon.sizes.substr(icon.sizes.indexOf("x")+ 1)}.png">`)
    }

    let themeSpecific = [
        `<title>${ogTitle}</title>`,
        `<link rel="manifest" href="${enc(layout.id)}.webmanifest">`,
        og,
        customCss,
        `<link rel="icon" href="${icon}" sizes="any" type="image/svg+xml">`,
        ...apple_icons
    ].join("\n")

    let output = template
        .replace("Loading MapComplete, hang on...", `Loading MapComplete theme <i>${ogTitle}</i>...`)
        .replace(/<!-- THEME-SPECIFIC -->.*<!-- THEME-SPECIFIC-END-->/s, themeSpecific)
        .replace(/<!-- DESCRIPTION START -->.*<!-- DESCRIPTION END -->/s, layout.shortDescription.textFor("en"))
        .replace("<script src=\"./index.ts\"></script>", `<script src='./index_${layout.id}.ts'></script>`);

    try {
        output = output
            .replace(/<!-- DECORATION 0 START -->.*<!-- DECORATION 0 END -->/s, `<img src='${icon}' width="100%" height="100%">`)
            .replace(/<!-- DECORATION 1 START -->.*<!-- DECORATION 1 END -->/s, `<img src='${icon}' width="100%" height="100%">`);
    } catch (e) {
        console.warn("Error while applying logo: ", e)
    }

    return output;
}

async function createIndexFor(theme: LayoutConfig) {
    const filename = "index_" + theme.id + ".ts"
    writeFileSync(filename, `import * as themeConfig from "./assets/generated/themes/${theme.id}.json"\n`)
    appendFileSync(filename, codeTemplate)
}

function createDir(path){
    if (!existsSync(path)) {
        mkdirSync(path)
    }
}

async function main(): Promise<void>{
    

    const alreadyWritten = []
    createDir("./assets/generated")
    createDir("./assets/generated/layers")
    createDir("./assets/generated/themes")
    createDir("./assets/generated/white_background")

    const blacklist = ["", "test", ".", "..", "manifest", "index", "land", "preferences", "account", "openstreetmap", "custom", "theme"]
    // @ts-ignore
    const all: LayoutConfigJson[] = all_known_layouts.themes;
    const args = process.argv
    const theme = args[2]
    if(theme !== undefined){
        console.warn("Only generating layout "+theme)
    }
    for (const i in all) {
        const layoutConfigJson: LayoutConfigJson = all[i]
        if(theme !== undefined && layoutConfigJson.id !== theme){
            continue
        }
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
        await createManifest(layout, alreadyWritten).then(manifObj => {
            const manif = JSON.stringify(manifObj, undefined, 2);
            const manifestLocation = encodeURIComponent(layout.id.toLowerCase()) + ".webmanifest";
            writeFile(manifestLocation, manif, err);
    
            // Create a landing page for the given theme
            createLandingPage(layout, manifObj).then(landing => {
                writeFile(enc(layout.id) + ".html", landing, err)
            });
            createIndexFor(layout)
        }).catch(e => console.log("Could not generate the manifest: ", e))
    
    }
    
    await createManifest(new LayoutConfig({
        icon: "assets/svg/mapcomplete_logo.svg",
        id: "index",
        layers: [],
        maintainer: "Pieter Vander Vennet",
        socialImage: "assets/SocialImage.png",
        startLat: 0,
        startLon: 0,
        startZoom: 0,
        title: {en: "MapComplete"},
        version: Constants.vNumber,
        description: {en: "A thematic map viewer and editor based on OpenStreetMap"}
    }), alreadyWritten).then(manifObj => {
        const manif = JSON.stringify(manifObj, undefined, 2);
        writeFileSync("index.manifest", manif)
    })
}

main().then(() => {
    console.log("All done!")
})