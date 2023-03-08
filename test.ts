import ContactLink from "./UI/BigComponents/ContactLink.svelte"
import SvelteUIElement from "./UI/Base/SvelteUIElement"
import { Utils } from "./Utils"
import List from "./UI/Base/List"
import { GeoOperations } from "./Logic/GeoOperations"
import { Tiles } from "./Models/TileRange"
import { Stores } from "./Logic/UIEventSource"

async function main() {
    const location: [number, number] = [3.21, 51.2]
    const t = Tiles.embedded_tile(location[1], location[0], 6)
    const url = `https://raw.githubusercontent.com/pietervdvn/MapComplete-data/main/community_index/tile_${t.z}_${t.x}_${t.y}.geojson`
    const be = Stores.FromPromise(Utils.downloadJson(url)).mapD(
        (data) => data.features.find((f) => GeoOperations.inside(location, f)).properties
    )
    new SvelteUIElement(ContactLink, { country: be }).AttachTo("maindiv")
    /*
    const links = data.features
        .filter((f) => GeoOperations.inside(location, f))
        .map((f) => new SvelteUIElement(ContactLink, { country: f.properties }))
    new List(links).AttachTo("maindiv")
    //*/
}

main().then((_) => {})
