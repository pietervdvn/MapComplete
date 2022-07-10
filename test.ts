import * as shops from "./assets/generated/layers/shops.json"
import Combine from "./UI/Base/Combine";
import Img from "./UI/Base/Img";
import BaseUIElement from "./UI/BaseUIElement";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import LanguagePicker from "./UI/LanguagePicker";
import TagRenderingConfig, {Mapping} from "./Models/ThemeConfig/TagRenderingConfig";
import {MappingConfigJson} from "./Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {TagsFilter} from "./Logic/Tags/TagsFilter";
import {SearchablePillsSelector} from "./UI/Input/SearchableMappingsSelector";
import {UIEventSource} from "./Logic/UIEventSource";

const mappingsRaw: MappingConfigJson[] = <any>shops.tagRenderings.find(tr => tr.id == "shop_types").mappings
const mappings = mappingsRaw.map((m, i) => TagRenderingConfig.ExtractMapping(m, i, "test", "test"))

function fromMapping(m: Mapping): { show: BaseUIElement, value: TagsFilter, mainTerm: Record<string, string>, searchTerms?: Record<string, string[]> } {
    const el: BaseUIElement = m.then
    let icon: BaseUIElement
    if (m.icon !== undefined) {
        icon = new Img(m.icon).SetClass("h-8 w-8 pr-2")
    } else {
        icon = new FixedUiElement("").SetClass("h-8 w-1")
    }
    const show = new Combine([
        icon,
        el.SetClass("block-ruby")
    ]).SetClass("flex items-center")

    return {show, mainTerm: m.then.translations, searchTerms: m.searchTerms, value: m.if};

}
const search = new UIEventSource("")
const sp = new SearchablePillsSelector(
    mappings.map(m => fromMapping(m)),
    {
        noMatchFound: new VariableUiElement(search.map(s => "Mark this a `"+s+"`")),
        onNoSearch: new FixedUiElement("Search in "+mappingsRaw.length+" categories"),
        selectIfSingle: true,
        searchValue: search
    }
)

sp.AttachTo("maindiv")

const lp = new LanguagePicker(["en", "nl"], "")

new Combine([
    new VariableUiElement(sp.GetValue().map(tf => new FixedUiElement("Selected tags: " + tf.map(tf => tf.asHumanString(false, false, {})).join(", ")))),
    lp
]).SetClass("flex flex-col")
    .AttachTo("extradiv")