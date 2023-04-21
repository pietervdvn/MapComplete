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
import { WikipediaBoxOptions } from "./UI/Wikipedia/WikipediaBoxOptions"
import Wikipedia from "./Logic/Web/Wikipedia"
import WikipediaPanel from "./UI/Wikipedia/WikipediaPanel.svelte"
import SvelteUIElement from "./UI/Base/SvelteUIElement"
import LanguagePicker from "./UI/LanguagePicker"
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

        els.push(
            new Combine([
                new Title(key),
                helper,
                new VariableUiElement(value.map((v) => new FixedUiElement(v))),
            ]).SetClass("flex flex-col p-1 border-3 border-gray-500")
        )
    }
    new Combine(els).SetClass("flex flex-col").AttachTo("maindiv")
}

async function testWaySplit() {
    const ids = new UIEventSource(["Q42", "Q1"])
    new SvelteUIElement(WikipediaPanel, { wikiIds: ids, addEntry: true }).AttachTo("maindiv")
    new LanguagePicker(["en", "nl"]).AttachTo("extradiv")
    await Utils.waitFor(5000)
    ids.data.push("Q430")
    ids.ping()
}
testWaySplit().then((_) => console.log("inited"))
//testinput()
// testspecial()
