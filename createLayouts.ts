import {UIElement} from "./UI/UIElement";
// We HAVE to mark this while importing
UIElement.runningFromConsole = true;
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import {Layout} from "./Customizations/Layout";
import {readFileSync, writeFile, writeFileSync} from "fs";
import Locale from "./UI/i18n/Locale";
import svg2img from 'promise-svg2img';
import Translation from "./UI/i18n/Translation";
import Translations from "./UI/i18n/Translations";
import {TagRendering} from "./UI/TagRendering";

TagRendering.injectFunction();
console.log("Building the layouts")

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

    let message = `Translation completenes for theme ${layout.id}`
    let isComplete = true;
    for (const ln of layout.supportedLanguages) {
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

function generateWikiEntry(layout: Layout){
    if(layout.hideFromOverview){
        return "";
    }
    let image = "MapComplete_Screenshot.png";
    if(layout.socialImage){
    //    image = layout.socialImage;
    }
    
    
    if(!image.startsWith("http")){
   //     image = "https://pietervdvn.github.io/MapComplete/"+image
    }
    
   return `{{Software
|name           = ${layout.id}
|author         = ${layout.maintainer ?? "MapComplete builtin"}
|web            = https://pietervdvn.github.io/MapComplete/${layout.id}.html
|repo           = https://github.com/pietervdvn/MapComplete
|platform       = web
|code           = Typescript;HTML;CSS
|languages      = ${layout.supportedLanguages.join(";")}
|genre          = display;editor
|screenshot     = ${image}
|description    = A MapComplete theme: ${Translations.W(layout.description)?.InnerRender() ?? ""}
|map        = yes
|findLocation            = yes
|findNearbyPOI           = yes
|addPOI          = yes
|editPOI         = yes
|editTags        = yes
|
}}`
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
        // Errors are normal here if this file exists
    }

    try {
        console.log("Creating icon ", name, newname)
        // We already read to file, in order to crash here if the file is not found
        readFileSync(iconPath); 
        svg2img(iconPath,
            // @ts-ignore
            {width: size, height: size, preserveAspectRatio: true})
            .then((buffer) => {
                console.log("Writing icon", newname)
                writeFileSync(newname, buffer);
            }).catch((error) => {
            console.log("ERROR while writing" + iconPath, error)
        });

    } catch (e) {
        console.error("Could not read icon", iconPath, "due to", e)
    }

    return newname;
}

function createManifest(layout: Layout, relativePath: string) {
    const name = layout.id;

    const icons = [];

    let icon = layout.icon;
    if (icon.endsWith(".svg")) {
        // This is an svg. Lets create the needed pngs!
        const sizes = [72, 96, 120, 128, 144, 152, 180, 192, 384, 512];
        for (const size of sizes) {
            const name = createIcon(icon, size);
            icons.push({
                src: name,
                sizes: size + "x" + size,
                type: "image/png"
            })
        }
        icons.push({
            src: icon,
            sizes: "513x513",
            type: "image/svg"
        })
    } else {

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
function createLandingPage(layout: Layout) {

    Locale.language.setData(layout.supportedLanguages[0]);

    const ogTitle = Translations.W(layout.title)?.InnerRender();
    const ogDescr = Translations.W(layout.description ?? "Easily add and edit geodata with OpenStreetMap")?.InnerRender();
    const ogImage = layout.socialImage;

    const og = `
    <meta property="og:image" content="${ogImage ?? './assets/add.svg'}">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDescr}">`

    let output = template
        .replace(`./manifest.manifest`, `./${enc(layout.id)}.webmanifest`)
        .replace("<!-- $$$OG-META -->", og)
        .replace(`<link rel="icon" href="assets/add.svg" sizes="any" type="image/svg+xml">`,
            `<link rel="icon" href="${layout.icon}" sizes="any" type="image/svg+xml">`);

    try {
        output = output
            .replace(/<!-- DECORATION 0 START -->.*<!-- DECORATION 0 END -->/s, `<img src='${layout.icon}' width="100%" height="100%">`)
            .replace(/<!-- DECORATION 1 START -->.*<!-- DECORATION 1 END -->/s, `<img src='${layout.icon}' width="100%" height="100%">`);
    } catch (e) {
        console.warn("Error while applying logo: ", e)
    }

    return output;
}

const blacklist = ["", "test", ".", "..", "manifest", "index", "land", "preferences", "account", "openstreetmap"]
const all = AllKnownLayouts.allSets;

let wikiPage = "";

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

    const manifestLocation = encodeURIComponent(layout.id.toLowerCase()) + ".webmanifest";
    writeFile(manifestLocation, manif, err);

    const landing = createLandingPage(layout);
    writeFile(enc(layout.id) + ".html", landing, err)
    
    wikiPage += "\n\n"+generateWikiEntry(layout);
}
writeFile("./assets/generated/wikiIndex", wikiPage, (err) => {
    if (err !== null) {
        console.log("Could not save wikiindex", err);
    }
});
console.log("Counting all translations")
Translations.CountTranslations();
console.log("All done!");