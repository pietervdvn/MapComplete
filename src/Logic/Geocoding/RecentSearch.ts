import { Store, UIEventSource } from "../UIEventSource"
import { Feature } from "geojson"
import { OsmConnection } from "../Osm/OsmConnection"
import { GeocodeResult } from "./GeocodingProvider"
import { GeoOperations } from "../GeoOperations"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"

export class RecentSearch {


    private readonly _seenThisSession: UIEventSource<GeocodeResult[]>
    public readonly seenThisSession: Store<GeocodeResult[]>

    constructor(state: { layout: LayoutConfig, osmConnection: OsmConnection, selectedElement: Store<Feature> }) {
        const prefs = state.osmConnection.preferencesHandler.GetLongPreference("previous-searches")
        this._seenThisSession = new UIEventSource<GeocodeResult[]>([])//UIEventSource.asObject<GeoCodeResult[]>(prefs, [])
        this.seenThisSession = this._seenThisSession

        prefs.addCallbackAndRunD(pref => {
            if (pref === "") {
                return
            }
            try {

                const simpleArr = <GeocodeResult[]>JSON.parse(pref)
                if (simpleArr.length > 0) {
                    this._seenThisSession.set(simpleArr)
                    return true
                }
            } catch (e) {
                console.error(e, pref)
                prefs.setData("")
            }
        })

        this.seenThisSession.stabilized(2500).addCallbackAndRunD(seen => {
            const results = []
            for (let i = 0; i < Math.min(3, seen.length); i++) {
                const gc = seen[i]
                const simple = {
                    category: gc.category,
                    description: gc.description,
                    display_name: gc.display_name,
                    lat: gc.lat, lon: gc.lon,
                    osm_id: gc.osm_id,
                    osm_type: gc.osm_type,
                }
                results.push(simple)
            }
            prefs.setData(JSON.stringify(results))

        })

        state.selectedElement.addCallbackAndRunD(selected => {

            const [osm_type, osm_id] = selected.properties.id.split("/")
            if (!osm_id) {
                return
            }
            if (["node", "way", "relation"].indexOf(osm_type) < 0) {
                return
            }
            const [lon, lat] = GeoOperations.centerpointCoordinates(selected)
            const entry = <GeocodeResult>{
                feature: selected,
                osm_id, osm_type,
                lon, lat,
            }
            this.addSelected(entry)

        })
    }

    addSelected(entry: GeocodeResult) {
        const arr = [...(this.seenThisSession.data ?? []).slice(0, 20), entry]

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
