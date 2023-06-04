import LayoutConfig from "./Models/ThemeConfig/LayoutConfig"
import * as theme from "./assets/generated/themes/bookcases.json"
import ThemeViewState from "./Models/ThemeViewState"
import Combine from "./UI/Base/Combine"
import SpecialVisualizations from "./UI/SpecialVisualizations"
import {VariableUiElement} from "./UI/Base/VariableUIElement"
import {SvgToPdf} from "./Utils/svgToPdf"
import {Utils} from "./Utils"

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
    const pdf = new SvgToPdf("Test", svgs, {
        freeComponentId:"extradiv"
    })
    new VariableUiElement(pdf.status).AttachTo("maindiv")
    await pdf.ExportPdf("nl")
}

testPdf().then((_) => console.log("All done"))
/*/
testspecial()
//*/
