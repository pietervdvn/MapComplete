import { Changes } from "../../Logic/Osm/Changes"
import {
    NewGeometryFromChangesFeatureSource
} from "../../Logic/FeatureSource/Sources/NewGeometryFromChangesFeatureSource"
import { WithLayoutSourceState } from "./WithLayoutSourceState"
import ThemeConfig from "../ThemeConfig/ThemeConfig"
import { Utils } from "../../Utils"
import Constants from "../Constants"
import { WritableFeatureSource } from "../../Logic/FeatureSource/FeatureSource"
import OsmObjectDownloader from "../../Logic/Osm/OsmObjectDownloader"
import ChangeToElementsActor from "../../Logic/Actors/ChangeToElementsActor"
import MetaTagging from "../../Logic/MetaTagging"
import { GeoIndexedStoreForLayer } from "../../Logic/FeatureSource/Actors/GeoIndexedStore"
import SaveFeatureSourceToLocalStorage from "../../Logic/FeatureSource/Actors/SaveFeatureSourceToLocalStorage"
import ThemeSource from "../../Logic/FeatureSource/Sources/ThemeSource"
import PerLayerFeatureSourceSplitter from "../../Logic/FeatureSource/PerLayerFeatureSourceSplitter"
import ChangeGeometryApplicator from "../../Logic/FeatureSource/Sources/ChangeGeometryApplicator"
import { Store } from "../../Logic/UIEventSource"
import { Map as MlMap } from "maplibre-gl"
import FilteringFeatureSource from "../../Logic/FeatureSource/Sources/FilteringFeatureSource"
import ShowDataLayer from "../../UI/Map/ShowDataLayer"
import SelectedElementTagsUpdater from "../../Logic/Actors/SelectedElementTagsUpdater"
import NoElementsInViewDetector, { FeatureViewState } from "../../Logic/Actors/NoElementsInViewDetector"

export class WithChangesState extends WithLayoutSourceState {

    readonly changes: Changes
    readonly newFeatures: WritableFeatureSource
    readonly osmObjectDownloader: OsmObjectDownloader
    readonly perLayer: ReadonlyMap<string, GeoIndexedStoreForLayer>
    readonly perLayerFiltered: ReadonlyMap<string, FilteringFeatureSource>
    readonly toCacheSavers: ReadonlyMap<string, SaveFeatureSourceToLocalStorage>
    /**
     * Indicates if there is _some_ data in view, even if it is not shown due to the filters
     */
    readonly hasDataInView: Store<FeatureViewState>

    constructor(theme: ThemeConfig, mvtAvailableLayers: Store<Set<string>>) {
        super(theme, mvtAvailableLayers)
        this.changes = new Changes(
            {
                featureSwitches: this.featureSwitches,
                allElements: this.indexedFeatures,
                osmConnection: this.osmConnection,
                featureProperties: this.featureProperties,
                historicalUserLocations: this.historicalUserLocations,
                reportError: this.reportError
            },
            theme?.isLeftRightSensitive() ?? false
        )
        this.newFeatures = new NewGeometryFromChangesFeatureSource(
            this.changes,
            this.indexedFeatures,
            this.featureProperties
        )
        this.indexedFeatures.addSource(this.newFeatures)

        this.osmObjectDownloader = new OsmObjectDownloader(
            this.osmConnection.Backend(),
            this.changes
        )

        const perLayer = new PerLayerFeatureSourceSplitter(
            Array.from(this.layerState.filteredLayers.values()).filter(
                (l) => l.layerDef?.source !== null
            ),
            new ChangeGeometryApplicator(this.indexedFeatures, this.changes),
            {
                constructStore: (features, layer) =>
                    new GeoIndexedStoreForLayer(features, layer),
                handleLeftovers: (features) => {
                    console.warn(
                        "Got ",
                        features.length,
                        "leftover features, such as",
                        features[0].properties
                    )
                }
            }
        )
        this.perLayer = perLayer.perLayer
        this.perLayerFiltered = this.showNormalDataOn(this.map)

        this.hasDataInView = new NoElementsInViewDetector(this).hasFeatureInView

        this.toCacheSavers = theme.enableCache ? this.initSaveToLocalStorage() : undefined


        ////// ACTORS ////////

        new ChangeToElementsActor(this.changes, this.featureProperties)
        new SelectedElementTagsUpdater(this)

        new MetaTagging({
            theme: this.theme,
            selectedElement: this.selectedElement,
            featureProperties: this.featureProperties,
            indexedFeatures: this.indexedFeatures,
            osmObjectDownloader: this.osmObjectDownloader,
            perLayer: this.perLayer
        })
    }

    public async reportError(message: string | Error | XMLHttpRequest, extramessage: string = "") {
        if (Utils.runningFromConsole) {
            console.error("Got (in themeViewSTate.reportError):", message, extramessage)
            return
        }
        const isTesting = this.featureSwitchIsTesting?.data
        console.log(
            isTesting
                ? ">>> _Not_ reporting error to report server as testmode is on"
                : ">>> Reporting error to",
            Constants.ErrorReportServer,
            message
        )
        if (isTesting) {
            return
        }

        if ("" + message === "[object XMLHttpRequest]") {
            const req = <XMLHttpRequest>message
            let body = ""
            try {
                body = req.responseText
            } catch (e) {
                // pass
            }
            message =
                "XMLHttpRequest with status code " +
                req.status +
                ", " +
                req.statusText +
                ", received: " +
                body
        }

        if (extramessage) {
            message += " (" + extramessage + ")"
        }

        const stacktrace: string = new Error().stack

        try {
            await fetch(Constants.ErrorReportServer, {
                method: "POST",
                body: JSON.stringify({
                    stacktrace,
                    message: "" + message,
                    theme: this.theme.id,
                    version: Constants.vNumber,
                    language: this.userRelatedState.language.data,
                    username: this.osmConnection.userDetails.data?.name,
                    userid: this.osmConnection.userDetails.data?.uid,
                    pendingChanges: this.changes.pendingChanges.data,
                    previousChanges: this.changes.allChanges.data,
                    changeRewrites: Utils.MapToObj(this.changes._changesetHandler._remappings)
                })
            })
        } catch (e) {
            console.error("Could not upload an error report")
        }
    }

    public initSaveToLocalStorage() {
        const toLocalStorage = new Map<string, SaveFeatureSourceToLocalStorage>()
        this.perLayer.forEach((fs, layerId) => {
            if (fs.layer.layerDef.source.geojsonSource !== undefined) {
                return // We don't cache external data layers
            }
            const storage = new SaveFeatureSourceToLocalStorage(
                this.osmConnection.Backend(),
                fs.layer.layerDef.id,
                ThemeSource.fromCacheZoomLevel,
                fs,
                this.featureProperties,
                fs.layer.layerDef.maxAgeOfCache
            )
            toLocalStorage.set(layerId, storage)
        })
        return toLocalStorage
    }

    public showNormalDataOn(map: Store<MlMap>): ReadonlyMap<string, FilteringFeatureSource> {
        const filteringFeatureSource = new Map<string, FilteringFeatureSource>()
        this.perLayer.forEach((fs, layerName) => {
            const doShowLayer = this.mapProperties.zoom.map(
                (z) => {
                    if (
                        (fs.layer.isDisplayed?.data ?? true) &&
                        z >= (fs.layer.layerDef?.minzoom ?? 0)
                    ) {
                        return true
                    }
                    if (this.layerState.globalFilters.data.some((f) => f.forceShowOnMatch)) {
                        return true
                    }
                    return false
                },
                [fs.layer.isDisplayed, this.layerState.globalFilters]
            )

            if (!doShowLayer.data && this.featureSwitches.featureSwitchFilter.data === false) {
                /* This layer is hidden and there is no way to enable it (filterview is disabled or this layer doesn't show up in the filter view as the name is not defined)
                 *
                 * This means that we don't have to filter it, nor do we have to display it
                 *
                 * Note: it is tempting to also permanently disable the layer if it is not visible _and_ the layer name is hidden.
                 * However, this is _not_ correct: the layer might be hidden because zoom is not enough. Zooming in more _will_ reveal the layer!
                 * */
                return
            }
            const filtered = new FilteringFeatureSource(
                fs.layer,
                fs,
                (id) => this.featureProperties.getStore(id),
                this.layerState.globalFilters,
                undefined,
                this.mapProperties.zoom,
                this.selectedElement
            )
            filteringFeatureSource.set(layerName, filtered)

            new ShowDataLayer(map, {
                layer: fs.layer.layerDef,
                features: filtered,
                doShowLayer,
                metaTags: this.userRelatedState.preferencesAsTags,
                selectedElement: this.selectedElement,
                fetchStore: (id) => this.featureProperties.getStore(id)
            })
        })
        return filteringFeatureSource
    }

}
