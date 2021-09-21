import {UIEventSource} from "../UIEventSource";
import {OsmObject} from "../Osm/OsmObject";
import Loc from "../../Models/Loc";
import {ElementStorage} from "../ElementStorage";

/**
 * Makes sure the hash shows the selected element and vice-versa.
 */
export default class SelectedFeatureHandler {
    private static readonly _no_trigger_on = ["welcome", "copyright", "layers", "new"]
    hash: UIEventSource<string>;
    private readonly state: {
        selectedElement: UIEventSource<any>
    }

    constructor(
        hash: UIEventSource<string>,
        state: {
            selectedElement: UIEventSource<any>,
            allElements: ElementStorage;
        }
    ) {
        this.hash = hash;

        this.state = state
        
        // Getting a blank hash clears the selected element
        hash.addCallback(h => {
            if (h === undefined || h === "") {
                state.selectedElement.setData(undefined);
            }else{
                const feature = state.allElements.ContainingFeatures.get(h)
                if(feature !== undefined){
                    state.selectedElement.setData(feature)
                }
            }
        })


        state.selectedElement.addCallback(feature => {
            if (feature === undefined) {
                console.trace("Resetting hash")
                if (SelectedFeatureHandler._no_trigger_on.indexOf(hash.data) < 0) {
                    hash.setData("")
                }
            }

            const h = feature?.properties?.id;
            if (h !== undefined) {
                hash.setData(h)
            }
        })

    }

    // If a feature is selected via the hash, zoom there
    public zoomToSelectedFeature(location: UIEventSource<Loc>) {
        const hash = this.hash.data;
        if (hash === undefined || SelectedFeatureHandler._no_trigger_on.indexOf(hash) >= 0) {
            return; // No valid feature selected
        }
        // We should have a valid osm-ID and zoom to it... But we wrap it in try-catch to be sure
        try {

            OsmObject.DownloadObject(hash).addCallbackAndRunD(element => {
                const centerpoint = element.centerpoint();
                console.log("Zooming to location for select point: ", centerpoint)
                location.data.lat = centerpoint[0]
                location.data.lon = centerpoint[1]
                location.ping();
            })
        } catch (e) {
            console.error("Could not download OSM-object with id", hash, " - probably a weird hash")
        }
    }

}