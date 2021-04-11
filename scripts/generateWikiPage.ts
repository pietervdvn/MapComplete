import {Utils} from "../Utils";
Utils.runningFromConsole = true;
import {writeFile} from "fs";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";
import Translations from "../UI/i18n/Translations";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";


function generateWikiEntry(layout: LayoutConfig) {
    if (layout.hideFromOverview) {
        return "";
    }
    const languages = layout.language.map(ln => `{{#language:${ln}|en}}`).join(", ")
    let auth = "Yes";
    if (layout.maintainer !== "" && layout.maintainer !== "MapComplete") {
        auth = `Yes, by ${layout.maintainer};`
    }
    return `{{service_item
|name= [https://mapcomplete.osm.be/${layout.id} ${layout.id}]
|region= Worldwide
|lang= ${languages}
|descr= A MapComplete theme: ${Translations.W(layout.description)
        .InnerRender()
        .replace("<a href='", "[[")
        .replace(/'>.*<\/a>/, "]]")
    }
|material= {{yes|[https://mapcomplete.osm.be/ ${auth}]}}
|image= MapComplete_Screenshot.png
|genre= POI, editor, ${layout.id}
}}`
}
let wikiPage = "{|class=\"wikitable sortable\"\n" +
    "! Name, link !! Genre !! Covered region !! Language !! Description !! Free materials !! Image\n" +
    "|-";

for (const layout of AllKnownLayouts.layoutsList) {
    if(layout.hideFromOverview){
        continue;
    }
    wikiPage += "\n" + generateWikiEntry(layout);
}

wikiPage += "\n|}"

writeFile("Docs/wikiIndex.txt", wikiPage, (err) => {
    if (err !== null) {
        console.log("Could not save wikiindex", err);
    }
});