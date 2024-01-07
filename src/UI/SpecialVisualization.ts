import { Store, UIEventSource } from "../Logic/UIEventSource"
import BaseUIElement from "./BaseUIElement"
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig"
import { IndexedFeatureSource, WritableFeatureSource } from "../Logic/FeatureSource/FeatureSource"
import { OsmConnection } from "../Logic/Osm/OsmConnection"
import { Changes } from "../Logic/Osm/Changes"
import { ExportableMap, MapProperties } from "../Models/MapProperties"
import LayerState from "../Logic/State/LayerState"
import { Feature, Geometry, Point } from "geojson"
import FullNodeDatabaseSource from "../Logic/FeatureSource/TiledFeatureSource/FullNodeDatabaseSource"
import { MangroveIdentity } from "../Logic/Web/MangroveReviews"
import { GeoIndexedStoreForLayer } from "../Logic/FeatureSource/Actors/GeoIndexedStore"
import LayerConfig from "../Models/ThemeConfig/LayerConfig"
import FeatureSwitchState from "../Logic/State/FeatureSwitchState"
import { MenuState } from "../Models/MenuState"
import OsmObjectDownloader from "../Logic/Osm/OsmObjectDownloader"
import { RasterLayerPolygon } from "../Models/RasterLayers"
import { ImageUploadManager } from "../Logic/ImageProviders/ImageUploadManager"
import { OsmTags } from "../Models/OsmFeature"
import FavouritesFeatureSource from "../Logic/FeatureSource/Sources/FavouritesFeatureSource"
import { ProvidedImage } from "../Logic/ImageProviders/ImageProvider"
import GeoLocationHandler from "../Logic/Actors/GeoLocationHandler"

/**
 * The state needed to render a special Visualisation.
 */
export interface SpecialVisualizationState {
    readonly guistate: MenuState
    readonly layout: LayoutConfig
    readonly featureSwitches: FeatureSwitchState

    readonly layerState: LayerState
    readonly featureProperties: {
        getStore(id: string): UIEventSource<Record<string, string>>
        trackFeature?(feature: { properties: OsmTags })
    }

    readonly indexedFeatures: IndexedFeatureSource
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
    /**
     * Works together with 'selectedElement' to indicate what properties should be displayed
     * @deprecated
     *
     * No need to set this anymore
     */
    readonly selectedLayer: UIEventSource<LayerConfig>
    readonly selectedElementAndLayer: Store<{ feature: Feature; layer: LayerConfig }>

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
    readonly userRelatedState: {
        readonly imageLicense: UIEventSource<string>
        readonly showTags: UIEventSource<"no" | undefined | "always" | "yes" | "full">
        readonly mangroveIdentity: MangroveIdentity
        readonly showAllQuestionsAtOnce: UIEventSource<boolean>
        readonly preferencesAsTags: UIEventSource<Record<string, string>>
        readonly language: UIEventSource<string>
    }
    readonly lastClickObject: WritableFeatureSource

    readonly availableLayers: Store<RasterLayerPolygon[]>

    readonly imageUploadManager: ImageUploadManager

    readonly previewedImage: UIEventSource<ProvidedImage>
    readonly geolocation: GeoLocationHandler
}

export interface SpecialVisualization {
    readonly funcName: string
    readonly docs: string | BaseUIElement
    readonly example?: string
    readonly needsUrls?: string[] | ((args: string[]) => string)

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
