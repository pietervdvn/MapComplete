import "./assets/templates/Ubuntu-M-normal.js"
import "./assets/templates/Ubuntu-L-normal.js"
import "./assets/templates/UbuntuMono-B-bold.js"
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import MinimapImplementation from "./UI/Base/MinimapImplementation";
import {Utils} from "./Utils";
import FeaturePipelineState from "./Logic/State/FeaturePipelineState";
import Locale from "./UI/i18n/Locale";
import {SvgToPdf} from "./Utils/svgToPdf";

MinimapImplementation.initialize()

async function main() {
    const layoutToUse = AllKnownLayouts.allKnownLayouts.get("cyclofix")


    const svg = await Utils.download(window.location.protocol + "//" + window.location.host + "/assets/templates/MapComplete-flyer.svg")
    const svgBack = await Utils.download(window.location.protocol + "//" + window.location.host + "/assets/templates/MapComplete-flyer.back.svg")
     Locale.language.setData("en")
    /*
     await new SvgToPdf([svg], {
         state,
         textSubstitutions: {
             mapCount: "" + Array.from(AllKnownLayouts.allKnownLayouts.values()).filter(th => !th.hideFromOverview).length
         }
     }).ConvertSvg("flyer_en.pdf")

    //*/

    Locale.language.setData("en")
    const svgToPdf = new SvgToPdf([svgBack], {
        freeDivId: "extradiv",
        textSubstitutions: {
            mapCount: "" + Array.from(AllKnownLayouts.allKnownLayouts.values()).filter(th => !th.hideFromOverview).length
        }
    })
    await svgToPdf.Prepare()
    console.log("Used translations", svgToPdf._usedTranslations)
    await svgToPdf.ConvertSvg("flyer_nl.pdf")
    /*
Locale.language.setData("en")
await new SvgToPdf([svgBack], {
    textSubstitutions: {
        mapCount: "" + Array.from(AllKnownLayouts.allKnownLayouts.values()).filter(th => !th.hideFromOverview).length
    }
}).ConvertSvg("flyer_en.pdf")

Locale.language.setData("nl")
await new SvgToPdf([svgBack], {
    textSubstitutions: {
        mapCount: "" + Array.from(AllKnownLayouts.allKnownLayouts.values()).filter(th => !th.hideFromOverview).length
    }
}).ConvertSvg("flyer_nl.pdf")*/
}

main().then(() => console.log("Done!"))
