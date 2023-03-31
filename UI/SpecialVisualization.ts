import { Store, UIEventSource } from "../Logic/UIEventSource"
import BaseUIElement from "./BaseUIElement"
import { DefaultGuiState } from "./DefaultGuiState"
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

/**
 * The state needed to render a special Visualisation.
 */
export interface SpecialVisualizationState {
    readonly guistate: DefaultGuiState
    readonly layout: LayoutConfig

    readonly layerState: LayerState
    readonly featureProperties: { getStore(id: string): UIEventSource<Record<string, string>> }

    readonly indexedFeatures: IndexedFeatureSource

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
    }
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
