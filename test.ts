import LayoutConfig from "./Models/ThemeConfig/LayoutConfig"
import * as theme from "./assets/generated/themes/shops.json"
import ThemeViewState from "./Models/ThemeViewState"
import Combine from "./UI/Base/Combine"
import SpecialVisualizations from "./UI/SpecialVisualizations"
import InputHelpers from "./UI/InputElement/InputHelpers"
import BaseUIElement from "./UI/BaseUIElement"
import { UIEventSource } from "./Logic/UIEventSource"
import { VariableUiElement } from "./UI/Base/VariableUIElement"
import { FixedUiElement } from "./UI/Base/FixedUiElement"
import Title from "./UI/Base/Title"
import SvelteUIElement from "./UI/Base/SvelteUIElement"
import ValidatedInput from "./UI/InputElement/ValidatedInput.svelte"
import { SvgToPdf } from "./Utils/svgToPdf"
import { Utils } from "./Utils"

function testspecial() {
    const layout = new LayoutConfig(<any>theme, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    const state = new ThemeViewState(layout)

    const all = SpecialVisualizations.specialVisualizations.map((s) =>
        SpecialVisualizations.renderExampleOfSpecial(state, s)
    )
    new Combine(all).AttachTo("maindiv")
}

function testinput() {
    const els: BaseUIElement[] = []
    for (const key in InputHelpers.AvailableInputHelpers) {
        const value = new UIEventSource<string>(undefined)
        const helper = InputHelpers.AvailableInputHelpers[key](value, {
            mapProperties: {
                zoom: new UIEventSource(16),
                location: new UIEventSource({ lat: 51.1, lon: 3.2 }),
            },
        })

        const feedback: UIEventSource<any> = new UIEventSource<any>(undefined)
        els.push(
            new Combine([
                new Title(key),
                new SvelteUIElement(ValidatedInput, { value, type: key, feedback }),
                helper,
                new VariableUiElement(feedback),
                new VariableUiElement(value.map((v) => new FixedUiElement(v))),
            ]).SetClass("flex flex-col p-1 border-3 border-gray-500")
        )
    }
    new Combine(els).SetClass("flex flex-col").AttachTo("maindiv")
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

// testPdf().then((_) => console.log("All done"))
//testinput()
/*/
testspecial()
//*/
