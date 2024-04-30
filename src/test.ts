import SvelteUIElement from "./UI/Base/SvelteUIElement"
import Test from "./UI/Test.svelte"
import NameSuggestionIndex from "./Logic/Web/NameSuggestionIndex"

const nsi = NameSuggestionIndex.get()
const secondhandshops = nsi.getSuggestionsFor("brands/shop/second_hand", ["be"])
console.log(secondhandshops)
new SvelteUIElement(Test).AttachTo("maindiv")
