import {UIEventSource} from "../UIEventSource";
import {OsmObject} from "../Osm/OsmObject";
import Loc from "../../Models/Loc";
import {ElementStorage} from "../ElementStorage";
import FeaturePipeline from "../FeatureSource/FeaturePipeline";

/**
 * Makes sure the hash shows the selected element and vice-versa.
 */
export default class SelectedFeatureHandler {
    private static readonly _no_trigger_on = new Set(["welcome", "copyright", "layers", "new", "", undefined])
    hash: UIEventSource<string>;
    private readonly state: {
        selectedElement: UIEventSource<any>
    }

    constructor(
        hash: UIEventSource<string>,
        state: {
            selectedElement: UIEventSource<any>,
            allElements: ElementStorage,
            featurePipeline: FeaturePipeline
        }
    ) {
        this.hash = hash;
        this.state = state


        // If the hash changes, set the selected element correctly
        function setSelectedElementFromHash(h){
            if (h === undefined || h === "") {
                // Hash has been cleared - we clear the selected element
                state.selectedElement.setData(undefined);
            }else{
                // we search the element to select
                const feature = state.allElements.ContainingFeatures.get(h)
                if(feature !== undefined){
                    state.selectedElement.setData(feature)
                }
            }
        }

        hash.addCallback(setSelectedElementFromHash)


        // IF the selected element changes, set the hash correctly
        state.selectedElement.addCallback(feature => {
            if (feature === undefined) {
                if (SelectedFeatureHandler._no_trigger_on.has(hash.data)) {
                    hash.setData("")
                }
            }

            const h = feature?.properties?.id;
            if (h !== undefined) {
                hash.setData(h)
            }
        })
        
        state.featurePipeline.newDataLoadedSignal.addCallbackAndRunD(_ => {
            // New data was loaded. In initial startup, the hash might be set (via the URL) but might not be selected yet
            if(hash.data === undefined || SelectedFeatureHandler._no_trigger_on.has(hash.data)){
                // This is an invalid hash anyway
                return;
            }
            if(state.selectedElement.data !== undefined){
                // We already have something selected
                return;
            }
            setSelectedElementFromHash(hash.data)
        })

    }

    // If a feature is selected via the hash, zoom there
    public zoomToSelectedFeature(location: UIEventSource<Loc>) {
        const hash = this.hash.data;
        if (hash === undefined || SelectedFeatureHandler._no_trigger_on.has(hash)) {
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