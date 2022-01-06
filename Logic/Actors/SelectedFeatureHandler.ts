import {UIEventSource} from "../UIEventSource";
import {OsmObject} from "../Osm/OsmObject";
import Loc from "../../Models/Loc";
import {ElementStorage} from "../ElementStorage";
import FeaturePipeline from "../FeatureSource/FeaturePipeline";
import {GeoOperations} from "../GeoOperations";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";

/**
 * Makes sure the hash shows the selected element and vice-versa.
 */
export default class SelectedFeatureHandler {
    private static readonly _no_trigger_on = new Set(["welcome", "copyright", "layers", "new", "filters", "location_track", "", undefined])
    private readonly hash: UIEventSource<string>;
    private readonly state: {
        selectedElement: UIEventSource<any>,
        allElements: ElementStorage,
        locationControl: UIEventSource<Loc>,
        layoutToUse: LayoutConfig
    }

    constructor(
        hash: UIEventSource<string>,
        state: {
            selectedElement: UIEventSource<any>,
            allElements: ElementStorage,
            featurePipeline: FeaturePipeline,
            locationControl: UIEventSource<Loc>,
            layoutToUse: LayoutConfig
        }
    ) {
        this.hash = hash;
        this.state = state


        // If the hash changes, set the selected element correctly

        const self = this;
        hash.addCallback(() => self.setSelectedElementFromHash())


        state.featurePipeline?.newDataLoadedSignal?.addCallbackAndRunD(_ => {
            // New data was loaded. In initial startup, the hash might be set (via the URL) but might not be selected yet
            if (hash.data === undefined || SelectedFeatureHandler._no_trigger_on.has(hash.data)) {
                // This is an invalid hash anyway
                return;
            }
            if (state.selectedElement.data !== undefined) {
                // We already have something selected
                return;
            }
            self.setSelectedElementFromHash()
        })


        this.initialLoad()

    }


    /**
     * On startup: check if the hash is loaded and eventually zoom to it
     * @private
     */
    private initialLoad() {
        const hash = this.hash.data
        if (hash === undefined || hash === "" || hash.indexOf("-") >= 0) {
            return;
        }
        if (SelectedFeatureHandler._no_trigger_on.has(hash)) {
            return;
        }

        if (!(hash.startsWith("node") || hash.startsWith("way") || hash.startsWith("relation"))) {
            return;
        }


        OsmObject.DownloadObjectAsync(hash).then(obj => {

            try {

                console.log("Downloaded selected object from OSM-API for initial load: ", hash)
                const geojson = obj.asGeoJson()
                this.state.allElements.addOrGetElement(geojson)
                this.state.selectedElement.setData(geojson)
                this.zoomToSelectedFeature()
            } catch (e) {
                console.error(e)
            }

        })

    }

    private setSelectedElementFromHash() {
        const state = this.state
        const h = this.hash.data
        if (h === undefined || h === "") {
            // Hash has been cleared - we clear the selected element
            state.selectedElement.setData(undefined);
        } else {

            // we search the element to select
            const feature = state.allElements.ContainingFeatures.get(h)
            if (feature === undefined) {
                return;
            }
            const currentlySeleced = state.selectedElement.data
            if (currentlySeleced === undefined) {
                state.selectedElement.setData(feature)
                return;
            }
            if (currentlySeleced.properties?.id === feature.properties.id) {
                // We already have the right feature
                return;
            }
            state.selectedElement.setData(feature)
        }
    }

    // If a feature is selected via the hash, zoom there
    private zoomToSelectedFeature() {

        const selected = this.state.selectedElement.data
        if (selected === undefined) {
            return
        }

        const centerpoint = GeoOperations.centerpointCoordinates(selected)
        const location = this.state.locationControl;
        location.data.lon = centerpoint[0]
        location.data.lat = centerpoint[1]

        const minZoom = Math.max(14, ...(this.state.layoutToUse?.layers?.map(l => l.minzoomVisible) ?? []))
        if (location.data.zoom < minZoom) {
            location.data.zoom = minZoom
        }

        location.ping();


    }

}