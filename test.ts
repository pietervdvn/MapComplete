import LayoutConfig from "./Models/ThemeConfig/LayoutConfig"
import * as theme from "./assets/generated/themes/bookcases.json"
import ThemeViewState from "./Models/ThemeViewState"
import Combine from "./UI/Base/Combine"
import SpecialVisualizations from "./UI/SpecialVisualizations"
import {VariableUiElement} from "./UI/Base/VariableUIElement"
import SvelteUIElement from "./UI/Base/SvelteUIElement"
import {SvgToPdf} from "./Utils/svgToPdf"
import {Utils} from "./Utils"
import {PointImportFlowState} from "./UI/Popup/ImportButtons/PointImportFlowState";
import PointImportFlow from "./UI/Popup/ImportButtons/PointImportFlow.svelte";
import {Feature, Point} from "geojson";

function testspecial() {
    const layout = new LayoutConfig(<any>theme, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    const state = new ThemeViewState(layout)

    const all = SpecialVisualizations.specialVisualizations.map((s) =>
        SpecialVisualizations.renderExampleOfSpecial(state, s)
    )
    new Combine(all).AttachTo("maindiv")
}


async function testPdf() {
    const svgs = await Promise.all(
        SvgToPdf.templates["flyer_a4"].pages.map((url) => Utils.download(url))
    )
    console.log("Building svg")
    const pdf = new SvgToPdf("Test", svgs, {})
    new VariableUiElement(pdf.status).AttachTo("maindiv")
    await pdf.ConvertSvg("nl")
}

function testImportButton() {
    const layout = new LayoutConfig(<any>theme, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    const state = new ThemeViewState(layout)
    const originalFeature: Feature<Point> = {
        type: "Feature",
        properties: {
            id: "note/-1"
        },
        geometry: {
            type: "Point",
            coordinates: [3.2255, 51.2112]
        }
    }
    const importFlow = new PointImportFlowState(state, originalFeature, {
        text: "Import this point",
        newTags: undefined,
        targetLayer: "public_bookcase"
    }, tagsToApply)
    new SvelteUIElement(PointImportFlow, {
        importFlow
    }).SetClass("h-full").AttachTo("maindiv")
}

testImportButton()
// testPdf().then((_) => console.log("All done"))
/*/
testspecial()
//*/
