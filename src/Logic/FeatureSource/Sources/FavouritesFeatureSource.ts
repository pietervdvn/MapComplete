import StaticFeatureSource from "./StaticFeatureSource"
import { Feature } from "geojson"
import { Store, UIEventSource } from "../../UIEventSource"
import { OsmConnection } from "../../Osm/OsmConnection"
import { OsmId } from "../../../Models/OsmFeature"
import { GeoOperations } from "../../GeoOperations"
import FeaturePropertiesStore from "../Actors/FeaturePropertiesStore"
import { IndexedFeatureSource } from "../FeatureSource"
import LayoutConfig from "../../../Models/ThemeConfig/LayoutConfig"

/**
 * Generates the favourites from the preferences and marks them as favourite
 */
export default class FavouritesFeatureSource extends StaticFeatureSource {
    public static readonly prefix = "mapcomplete-favourite-"
    private readonly _osmConnection: OsmConnection

    constructor(
        connection: OsmConnection,
        indexedSource: FeaturePropertiesStore,
        allFeatures: IndexedFeatureSource,
        layout: LayoutConfig
    ) {
        const detectedIds = new UIEventSource<Set<string>>(undefined)
        const features: Store<Feature[]> = connection.preferencesHandler.preferences.map(
            (prefs) => {
                const feats: Feature[] = []
                const allIds = new Set<string>()
                for (const key in prefs) {
                    if (!key.startsWith(FavouritesFeatureSource.prefix)) {
                        continue
                    }
                    const id = key.substring(FavouritesFeatureSource.prefix.length)
                    const osmId = id.replace("-", "/")
                    if (id.indexOf("-property-") > 0 || id.indexOf("-layer") > 0) {
                        continue
                    }
                    allIds.add(osmId)
                    const geometry = <[number, number]>JSON.parse(prefs[key])
                    const properties = FavouritesFeatureSource.getPropertiesFor(connection, id)
                    properties._orig_layer = prefs[FavouritesFeatureSource.prefix + id + "-layer"]
                    if (layout.layers.some((l) => l.id === properties._orig_layer)) {
                        continue
                    }
                    properties.id = osmId
                    properties._favourite = "yes"
                    feats.push({
                        type: "Feature",
                        properties,
                        geometry: {
                            type: "Point",
                            coordinates: geometry,
                        },
                    })
                }
                console.log("Favouritess are", feats)
                detectedIds.setData(allIds)
                return feats
            }
        )

        super(features)

        this._osmConnection = connection
        detectedIds.addCallbackAndRunD((detected) =>
            this.markFeatures(detected, indexedSource, allFeatures)
        )
        // We use the indexedFeatureSource as signal to update
        allFeatures.features.map((_) =>
            this.markFeatures(detectedIds.data, indexedSource, allFeatures)
        )
    }

    private static getPropertiesFor(
        osmConnection: OsmConnection,
        id: string
    ): Record<string, string> {
        const properties: Record<string, string> = {}
        const prefs = osmConnection.preferencesHandler.preferences.data
        const minLength = FavouritesFeatureSource.prefix.length + id.length + "-property-".length
        for (const key in prefs) {
            if (key.length < minLength) {
                continue
            }
            if (!key.startsWith(FavouritesFeatureSource.prefix + id)) {
                continue
            }
            const propertyName = key.substring(minLength)
            properties[propertyName] = prefs[key]
        }
        return properties
    }

    public markAsFavourite(
        feature: Feature,
        layer: string,
        theme: string,
        tags: UIEventSource<Record<string, string> & { id: OsmId }>,
        isFavourite: boolean = true
    ) {
        {
            const id = tags.data.id.replace("/", "-")
            const pref = this._osmConnection.GetPreference("favourite-" + id)
            if (isFavourite) {
                const center = GeoOperations.centerpointCoordinates(feature)
                pref.setData(JSON.stringify(center))
                this._osmConnection.GetPreference("favourite-" + id + "-layer").setData(layer)
                this._osmConnection.GetPreference("favourite-" + id + "-theme").setData(theme)

                for (const key in tags.data) {
                    const pref = this._osmConnection.GetPreference(
                        "favourite-" + id + "-property-" + key.replaceAll(":", "__")
                    )
                    pref.setData(tags.data[key])
                }
            } else {
                this._osmConnection.preferencesHandler.removeAllWithPrefix(
                    "mapcomplete-favourite-" + id
                )
            }
        }
        if (isFavourite) {
            tags.data._favourite = "yes"
            tags.ping()
        } else {
            delete tags.data._favourite
            tags.ping()
        }
    }

    private markFeatures(
        detected: Set<string>,
        featureProperties: FeaturePropertiesStore,
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
            if (detected.has(id)) {
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
