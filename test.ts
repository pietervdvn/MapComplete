import {Translation} from "./UI/i18n/Translation";
import Locale from "./UI/i18n/Locale";
import Combine from "./UI/Base/Combine";


new Combine(["Some language:",new Translation({en:"English",nl:"Nederlands",fr:"Françcais"})]).AttachTo("maindiv")

Locale.language.setData("nl")
window.setTimeout(() => {
    Locale.language.setData("en")
}, 1000)

window.setTimeout(() => {
    Locale.language.setData("fr")
}, 5000)