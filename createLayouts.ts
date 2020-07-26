import {Groen} from "./Customizations/Layouts/Groen";
import {Bookcases} from "./Customizations/Layouts/Bookcases";
import {GRB} from "./Customizations/Layouts/GRB";
import Cyclofix from "./Customizations/Layouts/Cyclofix";
import {WalkByBrussels} from "./Customizations/Layouts/WalkByBrussels";
import {MetaMap} from "./Customizations/Layouts/MetaMap";
import {StreetWidth} from "./Customizations/Layouts/StreetWidth";
import {Natuurpunt} from "./Customizations/Layouts/Natuurpunt";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import {Layout} from "./Customizations/Layout";
import {readFileSync, writeFile, writeFileSync} from "fs";
import {Utils} from "./Utils";
import svg2img from 'promise-svg2img';
import Translation from "./UI/i18n/Translation";
import Locale from "./UI/i18n/Locale";
import Translations from "./UI/i18n/Translations";
import {UIElement} from "./UI/UIElement";
import {LayerDefinition} from "./Customizations/LayerDefinition";

console.log("Building routers")

UIElement.runningFromConsole = true;

function enc(str: string): string {
    return encodeURIComponent(str.toLowerCase());
}

function validate(layout: Layout) {

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
    for (const ln of layout.supportedLanguages) {
        missing[ln] = 0;
        present[ln] = 0;
        for (const translation of translations) {
            const txt = translation.translations[ln];
            const isMissing = txt === undefined || txt === "" || txt.toLowerCase().indexOf("todo") >= 0;
            if (isMissing) {
                console.log("Missing or suspicious translation for '", translation.txt, "'in", ln, ":", txt)
                missing[ln]++
            } else {
                present[ln]++;
            }
        }
    }

    console.log("Translation completenes for", layout.name);
    for (const ln of layout.supportedLanguages) {
        const amiss = missing[ln];
        const ok = present[ln];
        const total = amiss + ok;
        console.log(`${ln}: ${ok}/${total}`)
    }

}


const alreadyWritten = []

function createIcon(iconPath: string, size: number) {

    let name = iconPath.split(".").slice(0, -1).join(".");
    if(name.startsWith("./")){
        name = name.substr(2)
    }
    const newname = `${name}${size}.png`
        .replace(/\//g,"_")
        .replace("assets_","assets/generated/");

    if (alreadyWritten.indexOf(newname) >= 0) {
        return newname;
    }
    alreadyWritten.push(newname);
    try {
        readFileSync(newname);
        return newname; // File already exists - nothing to do
    } catch (e) {

    }

    svg2img(iconPath,
        // @ts-ignore
        {width: size, height: size, preserveAspectRatio: true})
        .then((buffer) => {
            console.log("Writing icon", newname)
            writeFileSync(newname, buffer);
        }).catch((error) => {
            console.log("ERROR", error)
    });
    return newname;
}

function createManifest(layout: Layout, relativePath: string) {
    const name = Utils.Upper(layout.name);

    const icons = [];

    if (layout.icon.endsWith(".svg")) {
        // This is an svg. Lets create the needed pngs!
        const sizes = [72, 96, 120, 128, 144, 152, 180, 192, 384, 512];
        for (const size of sizes) {
            const name = createIcon(layout.icon, size);
            icons.push({
                src: name,
                sizes: size + "x" + size,
                type: "image/png"
            })
        }
        icons.push({
            src: layout.icon,
            sizes: "513x513",
            type: "image/svg"
        })
    } else {

        throw "Icon is not an svg for " + layout.name
    }
    const ogTitle = Translations.W(layout.title).InnerRender();
    const ogDescr = Translations.W(layout.description).InnerRender();

    const manif = {
        name: name,
        short_name: ogTitle,
        start_url: `${relativePath}/${layout.name.toLowerCase()}.html`,
        display: "standalone",
        background_color: "#fff",
        description: ogDescr,
        orientation: "portrait-primary, landscape-primary",
        icons: icons
    }
    return manif;
}

const template = readFileSync("index.html", "utf8");

function createLandingPage(layout: Layout) {

    Locale.language.setData(layout.supportedLanguages[0]);

    const ogTitle = Translations.W(layout.title).InnerRender();
    const ogDescr = Translations.W(layout.description).InnerRender();
    const ogImage = layout.socialImage;

    const og = `
     <meta property="og:image" content="${ogImage}">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDescr}">`

    return template
        .replace(`./manifest.manifest`, `./${enc(layout.name)}.webmanifest`)
        .replace("<!-- $$$OG-META -->", og)
        .replace(`<link rel="icon" href="assets/add.svg" sizes="any" type="image/svg+xml">`,
            `<link rel="icon" href="${layout.icon}" sizes="any" type="image/svg+xml">`)
}


const blacklist = ["", "test", ".", "..", "manifest", "index", "land", "preferences", "account", "openstreetmap"]
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
    const manif = JSON.stringify(createManifest(layout, "/MapComplete"));

    const manifestLocation = encodeURIComponent(layout.name.toLowerCase()) + ".webmanifest";
    writeFile(manifestLocation, manif, err);

    const landing = createLandingPage(layout);
    writeFile(enc(layout.name) + ".html", landing, err)
}

Translations.CountTranslations();