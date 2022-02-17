import {writeFile} from "fs";
import Translations from "../UI/i18n/Translations";
import * as themeOverview from "../assets/generated/theme_overview.json"

function generateWikiEntry(layout: { hideFromOverview: boolean, id: string, shortDescription: any }) {
    if (layout.hideFromOverview) {
        return "";
    }

    const languagesInDescr = []
    for (const shortDescriptionKey in layout.shortDescription) {
        languagesInDescr.push(shortDescriptionKey)
    }

    const languages = languagesInDescr.map(ln => `{{#language:${ln}|en}}`).join(", ")
    let auth = "Yes";
    return `{{service_item
|name= [https://mapcomplete.osm.be/${layout.id} ${layout.id}]
|region= Worldwide
|lang= ${languages}
|descr= A MapComplete theme: ${Translations.WT(layout.shortDescription)
        .textFor("en")
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

for (const layout of themeOverview) {
    if (layout.hideFromOverview) {
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