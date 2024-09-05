import { Store, UIEventSource } from "../UIEventSource"
import { Feature } from "geojson"
import { OsmConnection } from "../Osm/OsmConnection"
import { GeocodeResult } from "./GeocodingProvider"
import { GeoOperations } from "../GeoOperations"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"

export class RecentSearch {


    public readonly seenThisSession: UIEventSource<GeocodeResult[]>

    constructor(state: { layout: LayoutConfig, osmConnection: OsmConnection, selectedElement: Store<Feature> }) {
        const prefs = state.osmConnection.preferencesHandler.GetLongPreference("previous-searches")
        this.seenThisSession = new UIEventSource<GeocodeResult[]>([])//UIEventSource.asObject<GeoCodeResult[]>(prefs, [])

        prefs.addCallbackAndRunD(pref => {
            if (pref === "") {
                return
            }
            try {

                const simpleArr = <GeocodeResult[]>JSON.parse(pref)
                if (simpleArr.length > 0) {
                    this.seenThisSession.set(simpleArr)
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
        const id = entry.osm_type+entry.osm_id
        const arr = [...(this.seenThisSession.data.reverse() ?? []).slice(0, 5)]
            .filter(e => e.osm_type+e.osm_id !== id)

        this.seenThisSession.set([entry, ...arr])
    }
}
