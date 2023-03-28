import { Utils } from "../../Utils"
import { Feature } from "geojson"
import { Point } from "@turf/turf"
import { GeoLocationPointProperties } from "../../Logic/State/GeoLocationState"
import UploadTraceToOsmUI from "../BigComponents/UploadTraceToOsmUI"
import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import { UIEventSource } from "../../Logic/UIEventSource"

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
        function getTrace(title: string) {
            title = title?.trim()
            if (title === undefined || title === "") {
                title = "Uploaded with MapComplete"
            }
            title = Utils.EncodeXmlValue(title)
            const userLocations = <Feature<Point, GeoLocationPointProperties>[]>(
                state.historicalUserLocations.features.data
            )
            const trackPoints: string[] = []
            for (const l of userLocations) {
                let trkpt = `    <trkpt lat="${l.geometry.coordinates[1]}" lon="${l.geometry.coordinates[0]}">`
                trkpt += `        <time>${l.properties.date}</time>`
                if (l.properties.altitude !== null && l.properties.altitude !== undefined) {
                    trkpt += `        <ele>${l.properties.altitude}</ele>`
                }
                trkpt += "    </trkpt>"
                trackPoints.push(trkpt)
            }
            const header =
                '<gpx version="1.1" creator="MapComplete track uploader" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">'
            return (
                header +
                "\n<name>" +
                title +
                "</name>\n<trk><trkseg>\n" +
                trackPoints.join("\n") +
                "\n</trkseg></trk></gpx>"
            )
        }

        return new UploadTraceToOsmUI(getTrace, state, {
            whenUploaded: async () => {
                state.historicalUserLocations.features.setData([])
            },
        })
    }
}
