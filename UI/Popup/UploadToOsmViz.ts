import { Utils } from "../../Utils"
import { Feature } from "geojson"
import { Point } from "@turf/turf"
import { GeoLocationPointProperties } from "../../Logic/State/GeoLocationState"
import UploadTraceToOsmUI from "../BigComponents/UploadTraceToOsmUI"
import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import { UIEventSource } from "../../Logic/UIEventSource"
import { GeoOperations } from "../../Logic/GeoOperations"

/**
 * Wrapper  around 'UploadTraceToOsmUI'
 */
export class UploadToOsmViz implements SpecialVisualization {
    funcName = "upload_to_osm"
    docs =
        "Uploads the GPS-history as GPX to OpenStreetMap.org; clears the history afterwards. The actual feature is ignored."
    args = []

    constr(
        state: SpecialVisualizationState,
        featureTags: UIEventSource<Record<string, string>>,
        args: string[]
    ) {
        const locations = state.historicalUserLocations.features.data
        return new UploadTraceToOsmUI((title) => GeoOperations.toGpx(locations, title), state, {
            whenUploaded: async () => {
                state.historicalUserLocations.features.setData([])
            },
        })
    }
}
