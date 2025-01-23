import { WithSelectedElementState } from "./WithSelectedElementState"
import ThemeConfig from "../ThemeConfig/ThemeConfig"
import ThemeSource from "../../Logic/FeatureSource/Sources/ThemeSource"
import BBoxFeatureSource from "../../Logic/FeatureSource/Sources/TouchesBboxFeatureSource"
import FeaturePropertiesStore from "../../Logic/FeatureSource/Actors/FeaturePropertiesStore"
import LayerState from "../../Logic/State/LayerState"
import { Store } from "../../Logic/UIEventSource"
import { FeatureSource, IndexedFeatureSource } from "../../Logic/FeatureSource/FeatureSource"
import { Tag } from "../../Logic/Tags/Tag"

export class WithLayoutSourceState extends WithSelectedElementState {

    readonly layerState: LayerState
    readonly dataIsLoading: Store<boolean>

    readonly featureProperties: FeaturePropertiesStore
    readonly indexedFeatures: IndexedFeatureSource & ThemeSource
    readonly featuresInView: FeatureSource
    /**
     * All 'level'-tags that are available with the current features
     */
    readonly floors: Store<string[]>


    constructor(theme: ThemeConfig, mvtAvailableLayers: Set<string>) {
        super(theme)
        /* Set up the layout source
         * A bit tricky, as this is heavily intertwined with the 'changes'-element, which generates a stream of new and changed features too
         */
        this.layerState = new LayerState(
            this.osmConnection,
            theme.layers,
            theme.id,
            this.featureSwitches.featureSwitchLayerDefault
        )

        const layoutSource = new ThemeSource(
            theme.layers,
            this.featureSwitches,
            this.mapProperties,
            this.osmConnection.Backend(),
            (id) => this.layerState.filteredLayers.get(id).isDisplayed,
            mvtAvailableLayers,
            this.fullNodeDatabase
        )

        this.featuresInView = new BBoxFeatureSource(layoutSource, this.mapProperties.bounds)
        this.dataIsLoading = layoutSource.isLoading
        this.indexedFeatures = layoutSource
        this.featureProperties = new FeaturePropertiesStore(layoutSource)

        this.floors = WithLayoutSourceState.initFloors(this.featuresInView)

        this.initFilters()
    }

    /**
     * Special bypass: if "favourites" is set, we still show items marked as 'favourite' even though the main layer is disabled
     * @private
     */
    private initFilters() {
        this.layerState.filteredLayers
            .get("favourite")
            ?.isDisplayed?.addCallbackAndRunD((favouritesShown) => {
            const oldGlobal = this.layerState.globalFilters.data
            const key = "show-favourite"
            if (favouritesShown) {
                this.layerState.globalFilters.set([
                    ...oldGlobal,
                    {
                        forceShowOnMatch: true,
                        id: key,
                        osmTags: new Tag("_favourite", "yes"),
                        state: 0,
                        onNewPoint: undefined
                    }
                ])
            } else {
                this.layerState.globalFilters.set(oldGlobal.filter((gl) => gl.id !== key))
            }
        })

    }

    private static initFloors(features: FeatureSource): Store<string[]> {
        return features.features.stabilized(500).map((features) => {
            if (!features) {
                return []
            }
            const floors = new Set<string>()
            for (const feature of features) {
                const level = feature.properties["_level"]
                if (level) {
                    const levels = level.split(";")
                    for (const l of levels) {
                        floors.add(l)
                    }
                } else {
                    floors.add("0") // '0' is the default and is thus _always_ present
                }
            }
            const sorted = Array.from(floors)
            // Sort alphabetically first, to deal with floor "A", "B" and "C"
            sorted.sort()
            sorted.sort((a, b) => {
                // We use the laxer 'parseInt' to deal with floor '1A'
                const na = parseInt(a)
                const nb = parseInt(b)
                if (isNaN(na) || isNaN(nb)) {
                    return 0
                }
                return na - nb
            })
            sorted.reverse(/* new list, no side-effects */)
            return sorted
        })
    }

    public openNewDialog() {
        this.selectedElement.setData(undefined)

        const { lon, lat } = this.mapProperties.location.data
        const feature = this.lastClickObject.createFeature(lon, lat)
        this.featureProperties.trackFeature(feature)
        this.selectedElement.setData(feature)
    }


}
