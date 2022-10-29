import {LanguageElement} from "./UI/Popup/LanguageElement";
import {ImmutableStore, UIEventSource} from "./Logic/UIEventSource";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import Locale from "./UI/i18n/Locale";
import {OsmConnection} from "./Logic/Osm/OsmConnection";

const tgs = new UIEventSource({
    "name": "xyz",
    "id": "node/1234",
    "_country" : "BE",
})
Locale.language.setData("nl")
console.log(tgs)
console.log("Locale", Locale.language)
const conn = new OsmConnection({})
new LanguageElement().constr(<any> {osmConnection: conn, featureSwitchIsTesting: new ImmutableStore(true)}, tgs, [
    "language",
    "What languages are spoken here?",
    "{language()} is spoken here",
    "{language()} is the only language spoken here",
    "The following languages are spoken here: {list()}"
]).AttachTo("maindiv")

new VariableUiElement(tgs.map(JSON.stringify)).AttachTo("extradiv")
