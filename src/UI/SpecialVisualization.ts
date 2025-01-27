import { Store, UIEventSource } from "../Logic/UIEventSource"
import BaseUIElement from "./BaseUIElement"
import ThemeConfig from "../Models/ThemeConfig/ThemeConfig"
import { FeatureSource, IndexedFeatureSource, WritableFeatureSource } from "../Logic/FeatureSource/FeatureSource"
import { OsmConnection } from "../Logic/Osm/OsmConnection"
import { Changes } from "../Logic/Osm/Changes"
import { ExportableMap, MapProperties } from "../Models/MapProperties"
import LayerState from "../Logic/State/LayerState"
import { Feature, Geometry, Point, Polygon } from "geojson"
import FullNodeDatabaseSource from "../Logic/FeatureSource/TiledFeatureSource/FullNodeDatabaseSource"
import { GeoIndexedStoreForLayer } from "../Logic/FeatureSource/Actors/GeoIndexedStore"
import LayerConfig from "../Models/ThemeConfig/LayerConfig"
import FeatureSwitchState from "../Logic/State/FeatureSwitchState"
import OsmObjectDownloader from "../Logic/Osm/OsmObjectDownloader"
import { ImageUploadManager } from "../Logic/ImageProviders/ImageUploadManager"
import FavouritesFeatureSource from "../Logic/FeatureSource/Sources/FavouritesFeatureSource"
import GeoLocationHandler from "../Logic/Actors/GeoLocationHandler"
import ThemeSource from "../Logic/FeatureSource/Sources/ThemeSource"
import { Map as MlMap } from "maplibre-gl"
import ShowDataLayer from "./Map/ShowDataLayer"
import { CombinedFetcher } from "../Logic/Web/NearbyImagesSearch"
import UserRelatedState from "../Logic/State/UserRelatedState"
import FeaturePropertiesStore from "../Logic/FeatureSource/Actors/FeaturePropertiesStore"

/**
 * The state needed to render a special Visualisation.
 */
export interface SpecialVisualizationState {
    readonly theme: ThemeConfig
    readonly featureSwitches: FeatureSwitchState

    readonly layerState: LayerState
    readonly featureProperties: FeaturePropertiesStore

    readonly indexedFeatures: IndexedFeatureSource & ThemeSource
    /**
     * Some features will create a new element that should be displayed.
     * These can be injected by appending them to this featuresource (and pinging it)
     */
    readonly newFeatures: WritableFeatureSource

    readonly historicalUserLocations: WritableFeatureSource<Feature<Point>>

    readonly osmConnection: OsmConnection
    readonly featureSwitchUserbadge: Store<boolean>
    readonly featureSwitchIsTesting: Store<boolean>
    readonly changes: Changes
    readonly osmObjectDownloader: OsmObjectDownloader
    /**
     * State of the main map
     */
    readonly mapProperties: MapProperties & ExportableMap

    readonly selectedElement: UIEventSource<Feature>

    readonly currentView: FeatureSource<Feature<Polygon>>
    readonly favourites: FavouritesFeatureSource

    /**
     * If data is currently being fetched from external sources
     */
    readonly dataIsLoading: Store<boolean>
    /**
     * Only needed for 'ReplaceGeometryAction'
     */
    readonly fullNodeDatabase?: FullNodeDatabaseSource

    readonly perLayer: ReadonlyMap<string, GeoIndexedStoreForLayer>
    readonly userRelatedState: UserRelatedState

    readonly imageUploadManager: ImageUploadManager

    readonly nearbyImageSearcher: CombinedFetcher
    readonly geolocation: GeoLocationHandler
    readonly geocodedImages: UIEventSource<Feature[]>

    getMatchingLayer(properties: Record<string, string>): LayerConfig | undefined

    showCurrentLocationOn(map: Store<MlMap>): ShowDataLayer
    reportError(message: string | Error | XMLHttpRequest, extramessage?: string): Promise<void>
}

export interface SpecialVisualization {
    readonly funcName: string
    readonly docs: string | BaseUIElement
    readonly example?: string
    readonly needsUrls?: string[] | ((args: string[]) => string | string[])

    /**
     * Indicates that this special visualisation will make requests to the 'alLNodesDatabase' and that it thus should be included
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
