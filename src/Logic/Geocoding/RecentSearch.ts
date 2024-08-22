import { Store, UIEventSource } from "../UIEventSource"
import { Feature } from "geojson"
import { OsmConnection } from "../Osm/OsmConnection"
import { GeoCodeResult } from "./GeocodingProvider"
import { GeoOperations } from "../GeoOperations"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"

export class RecentSearch {


    private readonly _seenThisSession: UIEventSource<GeoCodeResult[]>
    public readonly seenThisSession: Store<GeoCodeResult[]>

    constructor(state: { layout: LayoutConfig, osmConnection: OsmConnection, selectedElement: Store<Feature> }) {
     //   const prefs = state.osmConnection.preferencesHandler.GetLongPreference("previous-searches")
        this._seenThisSession =  new UIEventSource<GeoCodeResult[]>([])//UIEventSource.asObject<GeoCodeResult[]>(prefs, [])
        this.seenThisSession = this._seenThisSession


        state.selectedElement.addCallbackAndRunD(selected => {
            const [osm_type, osm_id] = selected.properties.id.split("/")
            const [lon, lat] = GeoOperations.centerpointCoordinates(selected)
            const entry = <GeoCodeResult>{
                feature: selected,
                osm_id, osm_type,
                description: "Viewed recently",
                lon, lat
            }
            this.addSelected(entry)

        })
    }

    addSelected(entry: GeoCodeResult) {
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
