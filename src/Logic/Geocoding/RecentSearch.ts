import { Store, UIEventSource } from "../UIEventSource"
import { Feature } from "geojson"
import { OsmConnection } from "../Osm/OsmConnection"
import { GeoCodeResult } from "./GeocodingProvider"
import { GeoOperations } from "../GeoOperations"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"

export class RecentSearch {

    private readonly _recentSearches: UIEventSource<string[]>
    public readonly recentSearches: Store<string[]>

    private readonly _seenThisSession: UIEventSource<GeoCodeResult[]> = new UIEventSource<GeoCodeResult[]>([])
    public readonly seenThisSession: Store<GeoCodeResult[]> = this._seenThisSession

    constructor(state: { layout: LayoutConfig, osmConnection: OsmConnection, selectedElement: Store<Feature> }) {
        const longPref = state.osmConnection.preferencesHandler.GetLongPreference("recent-searches")
        this._recentSearches = longPref.sync(str => !str ? [] : <string[]>JSON.parse(str), [], strs => JSON.stringify(strs))
        this.recentSearches = this._recentSearches

        state.selectedElement.addCallbackAndRunD(selected => {
            const [osm_type, osm_id] = selected.properties.id.split("/")
            const [lon, lat] = GeoOperations.centerpointCoordinates(selected)
            const entry = <GeoCodeResult> {
                feature: selected,
                osm_id, osm_type,
                description: "Viewed recently",
                lon, lat
            }
            this.addSelected(entry)

        })
    }

    addSelected(entry: GeoCodeResult) {
        const arr = [...this.seenThisSession.data.slice(0, 20), entry]

        const seenIds = new Set<string>()
        for (let i = arr.length - 1; i >= 0; i--) {
            const id = arr[i].osm_type + arr[i].osm_id
            if (seenIds.has(id)) {
                arr.splice(i, 1)
            } else {
                seenIds.add(id)
            }
        }
        this._seenThisSession.set(arr)
    }
}
