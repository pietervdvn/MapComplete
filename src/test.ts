import SvelteUIElement from "./UI/Base/SvelteUIElement"
import Test from "./UI/Test.svelte"
import LinkedDataLoader from "./Logic/Web/LinkedDataLoader"
import { src_url_equal } from "svelte/internal"

new SvelteUIElement(Test).AttachTo("maindiv")


const url_multiple_sections = "https://data.velopark.be/data/Stad-Deinze_14"
const url_single_section = "https://data.velopark.be/data/NMBS_764"
const url_with_shape = "https://data.velopark.be/data/Stad-Leuven_APCOA_018"
const url_with_yearly_charge = "https://data.velopark.be/data/Cyclopark_AL02"
const url = url_multiple_sections /*/ url_single_section //*/
const results = await LinkedDataLoader.fetchVeloparkEntry(url_with_yearly_charge)
console.log(results)
