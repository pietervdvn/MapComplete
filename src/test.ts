import LayoutConfig from "./Models/ThemeConfig/LayoutConfig";
import * as theme from "./assets/generated/themes/bookcases.json";
import ThemeViewState from "./Models/ThemeViewState";
import Combine from "./UI/Base/Combine";
import SpecialVisualizations from "./UI/SpecialVisualizations";

function testspecial() {
    const layout = new LayoutConfig(<any>theme, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    const state = new ThemeViewState(layout)

    const all = SpecialVisualizations.specialVisualizations.map((s) =>
        SpecialVisualizations.renderExampleOfSpecial(state, s)
    )
    new Combine(all).AttachTo("maindiv")
}

/*/
testspecial()
//*/
