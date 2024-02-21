import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import { UIEventSource } from "../../Logic/UIEventSource"
import { GeoOperations } from "../../Logic/GeoOperations"
import Constants from "../../Models/Constants"
import SvelteUIElement from "../Base/SvelteUIElement"
import UploadTraceToOsmUI from "../BigComponents/UploadTraceToOsmUI.svelte"

/**
 * Wrapper  around 'UploadTraceToOsmUI'
 */
export class UploadToOsmViz implements SpecialVisualization {
    funcName = "upload_to_osm"
    docs =
        "Uploads the GPS-history as GPX to OpenStreetMap.org; clears the history afterwards. The actual feature is ignored."
    args = []
    needsUrls = [Constants.osmAuthConfig.url]

    constr(
        state: SpecialVisualizationState,
        _: UIEventSource<Record<string, string>>,
        __: string[]
    ) {
        const locations = state.historicalUserLocations.features.data
        return new SvelteUIElement(UploadTraceToOsmUI, {
            state,
            trace: (title: string) => GeoOperations.toGpx(locations, title),
        })
    }
}
