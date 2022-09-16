import MinimapImplementation from "./UI/Base/MinimapImplementation";

MinimapImplementation.initialize()

import {Utils} from "./Utils";
import {SvgToPdf, SvgToPdfOptions} from "./Utils/svgToPdf";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import Locale from "./UI/i18n/Locale";
import LayerConfig from "./Models/ThemeConfig/LayerConfig";
import {And} from "./Logic/Tags/And";
import {Tag} from "./Logic/Tags/Tag";
import {Overpass} from "./Logic/Osm/Overpass";
import Constants from "./Models/Constants";

let i = 0

function createElement(): string {
    const div = document.createElement("div")
    div.id = "freediv-" + (i++)
    document.getElementById("extradiv").append(div)
    return div.id
}

async function main() {
    {
        // Dirty hack!
        // Make the charging-station layer simpler to allow querying it by overpass
        const chargingStationLayer: LayerConfig = AllKnownLayouts.allKnownLayouts.get("toerisme_vlaanderen").layers.find(l => l.id === "charging_station_ebikes")
        chargingStationLayer.minzoom = 0
        chargingStationLayer.minzoomVisible = 0
       // chargingStationLayer.source.osmTags = new And([new Tag("amenity","charging_station"), new Tag("bicycle","yes")])
        Constants.defaultOverpassUrls.splice(0,1) // remove overpass-api.de for this run
    }


    const svg = await Utils.download(window.location.protocol + "//" + window.location.host + "/assets/templates/MapComplete-flyer.svg")
    const svgBack = await Utils.download(window.location.protocol + "//" + window.location.host + "/assets/templates/MapComplete-flyer.back.svg")

    const options = <SvgToPdfOptions>{
        getFreeDiv: createElement,
        textSubstitutions: {
            mapCount: "" + Array.from(AllKnownLayouts.allKnownLayouts.values()).filter(th => !th.hideFromOverview).length
        },
        disableMaps: true
    }
     const front = await new SvgToPdf([svg, svgBack], options)
    await front.ConvertSvg("Flyer-nl.pdf", "nl")
    await front.ConvertSvg("Flyer-en.pdf", "en")

}

main().then(() => console.log("Done!"))
