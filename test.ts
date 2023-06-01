import LayoutConfig from "./Models/ThemeConfig/LayoutConfig"
import * as theme from "./assets/generated/themes/bookcases.json"
import ThemeViewState from "./Models/ThemeViewState"
import Combine from "./UI/Base/Combine"
import SpecialVisualizations from "./UI/SpecialVisualizations"
import {VariableUiElement} from "./UI/Base/VariableUIElement"
import SvelteUIElement from "./UI/Base/SvelteUIElement"
import {SvgToPdf} from "./Utils/svgToPdf"
import {Utils} from "./Utils"
import DeleteWizard from "./UI/Popup/DeleteFlow/DeleteWizard.svelte";
import DeleteConfig from "./Models/ThemeConfig/DeleteConfig";
import {UIEventSource} from "./Logic/UIEventSource";

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


function testDelete() {
    const layout = new LayoutConfig(<any>theme, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    const state = new ThemeViewState(layout)
    const tags = new UIEventSource({"amenity": "public_bookcase"})
    new SvelteUIElement(DeleteWizard, {
        state,
        tags,
        layer: layout.layers.find(l => l.id === "public_bookcase"),
        featureId: "node/10944136609",
        deleteConfig: new DeleteConfig({
            nonDeleteMappings: [
                {
                    if: {"and": ["disused:amenity=public_bookcase", "amenity="]},
                    then: {
                        en: "The bookcase still exists but is not maintained anymore"
                    }
                }
            ]
        }, "test")
    }).AttachTo("maindiv")

}

testDelete()

// testPdf().then((_) => console.log("All done"))
/*/
testspecial()
//*/
