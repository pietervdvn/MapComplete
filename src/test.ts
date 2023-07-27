import LayoutConfig from "./Models/ThemeConfig/LayoutConfig"
import * as theme from "./assets/generated/themes/bookcases.json"
import ThemeViewState from "./Models/ThemeViewState"
import Combine from "./UI/Base/Combine"
import SpecialVisualizations from "./UI/SpecialVisualizations"
import SvelteUIElement from "./UI/Base/SvelteUIElement"
import TagInput from "./UI/Studio/TagInput/TagInput.svelte"
import { UIEventSource } from "./Logic/UIEventSource"
import { TagsFilter } from "./Logic/Tags/TagsFilter"
import { VariableUiElement } from "./UI/Base/VariableUIElement"
import { TagConfigJson } from "./Models/ThemeConfig/Json/TagConfigJson"

function testspecial() {
    const layout = new LayoutConfig(<any>theme, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    const state = new ThemeViewState(layout)

    const all = SpecialVisualizations.specialVisualizations.map((s) =>
        SpecialVisualizations.renderExampleOfSpecial(state, s)
    )
    new Combine(all).AttachTo("maindiv")
}

const tag = new UIEventSource<TagConfigJson>(undefined)
new SvelteUIElement(TagInput, { tag }).AttachTo("maindiv")
new VariableUiElement(tag.map((t) => JSON.stringify(t))).AttachTo("extradiv")
/*/
testspecial()
//*/
