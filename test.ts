import {DropDown} from "./UI/Input/DropDown";
import Locale from "./UI/i18n/Locale";
import Combine from "./UI/Base/Combine";
import Translations from "./UI/i18n/Translations";
import {TagRenderingOptions} from "./Customizations/TagRendering";
import {UIEventSource} from "./UI/UIEventSource";
import {Tag} from "./Logic/TagsFilter";
import {Changes} from "./Logic/Changes";
import {OsmConnection} from "./Logic/OsmConnection";
import Translation from "./UI/i18n/Translation";

console.log("Hello world")
Locale.language.setData("en");
let languagePicker = new DropDown("", ["en", "nl"].map(lang => {
        return {value: lang, shown: lang}
    }
), Locale.language).AttachTo("maindiv");


let tags = new UIEventSource({
    x:"y"
})

new TagRenderingOptions({
    mappings: [{k: new Tag("x","y"), txt: new Translation({en: "ENG", nl: "NED"})}]
}).construct({
    tags: tags,
    changes: new Changes(
        "cs",
        new OsmConnection(true)
    )
}).AttachTo("extradiv")