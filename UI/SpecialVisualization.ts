import { Store, UIEventSource } from "../Logic/UIEventSource"
import BaseUIElement from "./BaseUIElement"
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig"
import { IndexedFeatureSource, WritableFeatureSource } from "../Logic/FeatureSource/FeatureSource"
import { OsmConnection } from "../Logic/Osm/OsmConnection"
import { Changes } from "../Logic/Osm/Changes"
import { MapProperties } from "../Models/MapProperties"
import LayerState from "../Logic/State/LayerState"
import { Feature, Geometry } from "geojson"
import FullNodeDatabaseSource from "../Logic/FeatureSource/TiledFeatureSource/FullNodeDatabaseSource"
import { MangroveIdentity } from "../Logic/Web/MangroveReviews"
import { GeoIndexedStoreForLayer } from "../Logic/FeatureSource/Actors/GeoIndexedStore"
import LayerConfig from "../Models/ThemeConfig/LayerConfig"
import FeatureSwitchState from "../Logic/State/FeatureSwitchState"
import { MenuState } from "../Models/MenuState"

/**
 * The state needed to render a special Visualisation.
 */
export interface SpecialVisualizationState {
    readonly guistate: MenuState
    readonly layout: LayoutConfig
    readonly featureSwitches: FeatureSwitchState

    readonly layerState: LayerState
    readonly featureProperties: { getStore(id: string): UIEventSource<Record<string, string>> }

    readonly indexedFeatures: IndexedFeatureSource

    /**
     * Some features will create a new element that should be displayed.
     * These can be injected by appending them to this featuresource (and pinging it)
     */
    readonly newFeatures: WritableFeatureSource

    readonly historicalUserLocations: WritableFeatureSource

    readonly osmConnection: OsmConnection
    readonly featureSwitchUserbadge: Store<boolean>
    readonly featureSwitchIsTesting: Store<boolean>
    readonly changes: Changes
    /**
     * State of the main map
     */
    readonly mapProperties: MapProperties

    readonly selectedElement: UIEventSource<Feature>
    /**
     * Works together with 'selectedElement' to indicate what properties should be displayed
     */
    readonly selectedLayer: UIEventSource<LayerConfig>

    /**
     * If data is currently being fetched from external sources
     */
    readonly dataIsLoading: Store<boolean>
    /**
     * Only needed for 'ReplaceGeometryAction'
     */
    readonly fullNodeDatabase?: FullNodeDatabaseSource

    readonly perLayer: ReadonlyMap<string, GeoIndexedStoreForLayer>
    readonly userRelatedState: {
        readonly mangroveIdentity: MangroveIdentity
        readonly showAllQuestionsAtOnce: UIEventSource<boolean>
        readonly preferencesAsTags: Store<Record<string, string>>
    }
    readonly lastClickObject: WritableFeatureSource
}

export interface SpecialVisualization {
    readonly funcName: string
    readonly docs: string | BaseUIElement
    readonly example?: string

    /**
     * Indicates that this special visualsiation will make requests to the 'alLNodesDatabase' and that it thus should be included
     */
    readonly needsNodeDatabase?: boolean
    readonly args: {
        name: string
        defaultValue?: string
        doc: string
        required?: false | boolean
    }[]
    readonly getLayerDependencies?: (argument: string[]) => string[]

    structuredExamples?(): { feature: Feature<Geometry, Record<string, string>>; args: string[] }[]

    constr(
        state: SpecialVisualizationState,
        tagSource: UIEventSource<Record<string, string>>,
        argument: string[],
        feature: Feature,
        layer: LayerConfig
    ): BaseUIElement
}

export type RenderingSpecification =
    | string
    | {
          func: SpecialVisualization
          args: string[]
          style: string
      }
