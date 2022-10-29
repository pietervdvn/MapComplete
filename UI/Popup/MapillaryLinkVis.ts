import {GeoOperations} from "../../Logic/GeoOperations";
import {MapillaryLink} from "../BigComponents/MapillaryLink";
import {UIEventSource} from "../../Logic/UIEventSource";
import Loc from "../../Models/Loc";
import {SpecialVisualization} from "../SpecialVisualization";

export class MapillaryLinkVis implements SpecialVisualization {
    funcName = "mapillary_link"
    docs = "Adds a button to open mapillary on the specified location"
    args = [
        {
            name: "zoom",
            doc: "The startzoom of mapillary",
            defaultValue: "18",
        },
    ]

    public constr(state, tagsSource, args) {
        const feat = state.allElements.ContainingFeatures.get(tagsSource.data.id)
        const [lon, lat] = GeoOperations.centerpointCoordinates(feat)
        let zoom = Number(args[0])
        if (isNaN(zoom)) {
            zoom = 18
        }
        return new MapillaryLink({
            locationControl: new UIEventSource<Loc>({
                lat,
                lon,
                zoom,
            }),
        })
    }
}
