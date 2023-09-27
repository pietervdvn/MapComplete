import { GeoOperations } from "../../Logic/GeoOperations"
import { ImmutableStore, UIEventSource } from "../../Logic/UIEventSource"
import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import { Feature } from "geojson"
import BaseUIElement from "../BaseUIElement"
import SvelteUIElement from "../Base/SvelteUIElement"
import MapillaryLink from "../BigComponents/MapillaryLink.svelte"

export class MapillaryLinkVis implements SpecialVisualization {
    funcName = "mapillary_link"
    docs = "Adds a button to open mapillary on the specified location"
    needsUrls = []

    args = [
        {
            name: "zoom",
            doc: "The startzoom of mapillary",
            defaultValue: "18",
        },
    ]

    public constr(
        state: SpecialVisualizationState,
        tagsSource: UIEventSource<Record<string, string>>,
        args: string[],
        feature: Feature
    ): BaseUIElement {
        const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
        let zoom = Number(args[0])
        if (isNaN(zoom)) {
            zoom = 18
        }
        return new SvelteUIElement(MapillaryLink, {
            mapProperties: {
                lat,
                lon,
            },
            zoom: new ImmutableStore(zoom),
        })
    }
}
