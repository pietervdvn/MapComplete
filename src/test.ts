import { Utils } from "./Utils"
import SvelteUIElement from "./UI/Base/SvelteUIElement"
import PointRenderingConfig from "./Models/ThemeConfig/PointRenderingConfig"
import { UIEventSource } from "./Logic/UIEventSource"
import Marker from "./UI/Map/Marker.svelte"

class Test {
    public async test() {
        await Utils.waitFor(0)
        const response = await fetch("http://localhost:1235/layers/atm/atm.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({}),
        })
    }
}

const tags = new UIEventSource({
    id: "node/13",
    amenity: "public_bookcase",
})

const config = new PointRenderingConfig(
    {
        location: ["point"],
        iconSize: "20,20",
        marker: [
            {
                icon: "circle",
                color: "orange",
            },
            {
                icon: "./assets/layers/atm.atm.svg",
            },
        ],
    },
    "test"
)

new SvelteUIElement(Marker, {
    config,
    tags,
}).AttachTo("maindiv")
// new Test().test()
