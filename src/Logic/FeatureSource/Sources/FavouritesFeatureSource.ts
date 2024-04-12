import StaticFeatureSource from "./StaticFeatureSource"
import { Feature } from "geojson"
import { Store, Stores, UIEventSource } from "../../UIEventSource"
import { OsmConnection } from "../../Osm/OsmConnection"
import { OsmId } from "../../../Models/OsmFeature"
import { GeoOperations } from "../../GeoOperations"
import { IndexedFeatureSource } from "../FeatureSource"
import OsmObjectDownloader from "../../Osm/OsmObjectDownloader"
import { SpecialVisualizationState } from "../../../UI/SpecialVisualization"
import SelectedElementTagsUpdater from "../../Actors/SelectedElementTagsUpdater"

/**
 * Generates the favourites from the preferences and marks them as favourite
 */
export default class FavouritesFeatureSource extends StaticFeatureSource {
    public static readonly prefix = "mapcomplete-favourite-"
    private readonly _osmConnection: OsmConnection
    private readonly _detectedIds: Store<string[]>

    /**
     * All favourites, including the ones which are filtered away because they are already displayed
     */
    public readonly allFavourites: Store<Feature[]>

    constructor(state: SpecialVisualizationState) {
        const features: Store<Feature[]> = Stores.ListStabilized(
            state.osmConnection.preferencesHandler.preferences.map((prefs) => {
                const feats: Feature[] = []
                const allIds = new Set<string>()
                for (const key in prefs) {
                    if (!key.startsWith(FavouritesFeatureSource.prefix)) {
                        continue
                    }

                    try {
                        const feat = FavouritesFeatureSource.ExtractFavourite(key, prefs)
                        if (!feat) {
                            continue
                        }
                        feats.push(feat)
                        allIds.add(feat.properties.id)
                    } catch (e) {
                        console.error("Could not create favourite from", key, "due to", e)
                    }
                }
                return feats
            })
        )

        const featuresWithoutAlreadyPresent = features.map((features) =>
            features.filter(
                (feat) => !state.layout.layers.some((l) => l.id === feat.properties._orig_layer)
            )
        )

        super(featuresWithoutAlreadyPresent)
        this.allFavourites = features

        this._osmConnection = state.osmConnection
        this._detectedIds = Stores.ListStabilized(
            features.map((feats) => feats.map((f) => f.properties.id))
        )
        const allFeatures = state.indexedFeatures
        this._detectedIds.addCallbackAndRunD((detected) =>
            this.markFeatures(detected, state.featureProperties, allFeatures)
        )
        // We use the indexedFeatureSource as signal to update
        allFeatures.features.map(() =>
            this.markFeatures(this._detectedIds.data, state.featureProperties, allFeatures)
        )

        this.allFavourites.addCallbackD((features) => {
            for (const feature of features) {
                this.updateFeature(feature, state.osmObjectDownloader, state)
            }

            return true
        })
    }

    private async updateFeature(
        feature: Feature,
        osmObjectDownloader: OsmObjectDownloader,
        state: SpecialVisualizationState
    ) {
        const id = feature.properties.id
        const upstream = await osmObjectDownloader.DownloadObjectAsync(id)
        if (upstream === "deleted") {
            this.removeFavourite(feature)
            return
        }
        console.debug("Updating metadata due to favourite of", id)
        const latestTags = SelectedElementTagsUpdater.applyUpdate(upstream.tags, id, state)
        this.updatePropertiesOfFavourite(latestTags)
    }

    private static ExtractFavourite(key: string, prefs: Record<string, string>): Feature {
        const id = key.substring(FavouritesFeatureSource.prefix.length)
        const osmId = id.replace("-", "/")
        if (id.indexOf("-property-") > 0 || id.endsWith("-layer") || id.endsWith("-theme")) {
            return undefined
        }
        const geometry = <[number, number]>JSON.parse(prefs[key])
        const properties = FavouritesFeatureSource.getPropertiesFor(prefs, id)
        properties._orig_layer = prefs[FavouritesFeatureSource.prefix + id + "-layer"]
        properties._orig_theme = prefs[FavouritesFeatureSource.prefix + id + "-theme"]

        properties.id = osmId
        properties._favourite = "yes"
        return {
            type: "Feature",
            properties,
            geometry: {
                type: "Point",
                coordinates: geometry,
            },
        }
    }

    private static getPropertiesFor(
        prefs: Record<string, string>,
        id: string
    ): Record<string, string> {
        const properties: Record<string, string> = {}
        const minLength = FavouritesFeatureSource.prefix.length + id.length + "-property-".length
        for (const key in prefs) {
            if (key.length < minLength) {
                continue
            }
            if (!key.startsWith(FavouritesFeatureSource.prefix + id)) {
                continue
            }
            const propertyName = key.substring(minLength).replaceAll("__", ":")
            properties[propertyName] = prefs[key]
        }
        return properties
    }

    /**
     * Sets all the (normal) properties as the feature is updated
     */
    private updatePropertiesOfFavourite(properties: Record<string, string>) {
        const id = properties?.id?.replace("/", "-")
        if (!id) {
            return
        }
        console.debug("Updating store for", id)
        for (const key in properties) {
            const pref = this._osmConnection.GetPreference(
                "favourite-" + id + "-property-" + key.replaceAll(":", "__")
            )
            const v = properties[key]
            if (v === "" || !v) {
                continue
            }
            pref.setData("" + v)
        }
    }

    public removeFavourite(feature: Feature, tags?: UIEventSource<Record<string, string>>) {
        const id = feature.properties.id.replace("/", "-")
        this._osmConnection.preferencesHandler.removeAllWithPrefix("mapcomplete-favourite-" + id)
        if (tags) {
            delete tags.data._favourite
            tags.ping()
        }
    }

    public markAsFavourite(
        feature: Feature,
        layer: string,
        theme: string,
        tags: UIEventSource<Record<string, string> & { id: OsmId }>,
        isFavourite: boolean = true
    ) {
        {
            if (!isFavourite) {
                this.removeFavourite(feature, tags)
                return
            }
            const id = tags.data.id.replace("/", "-")
            const pref = this._osmConnection.GetPreference("favourite-" + id)
            const center = GeoOperations.centerpointCoordinates(feature)
            pref.setData(JSON.stringify(center))
            this._osmConnection.GetPreference("favourite-" + id + "-layer").setData(layer)
            this._osmConnection.GetPreference("favourite-" + id + "-theme").setData(theme)
            this.updatePropertiesOfFavourite(tags.data)
        }
        tags.data._favourite = "yes"
        tags.ping()
    }

    private markFeatures(
        detected: string[],
        featureProperties: { getStore(id: string): UIEventSource<Record<string, string>> },
        allFeatures: IndexedFeatureSource
    ) {
        const feature = allFeatures.features.data
        for (const f of feature) {
            const id = f.properties.id
            if (!id) {
                continue
            }
            const store = featureProperties.getStore(id)
            const origValue = store.data._favourite
            if (detected.indexOf(id) >= 0) {
                if (origValue !== "yes") {
                    store.data._favourite = "yes"
                    store.ping()
                }
            } else {
                if (origValue) {
                    store.data._favourite = ""
                    store.ping()
                }
            }
        }
    }
}
