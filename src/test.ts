import SvelteUIElement from "./UI/Base/SvelteUIElement"
import Test from "./UI/Test.svelte"
import MvtSource from "./Logic/FeatureSource/Sources/MvtSource"

new MvtSource("https://example.org", undefined, undefined, undefined)

new SvelteUIElement(Test, {}).AttachTo("maindiv")
