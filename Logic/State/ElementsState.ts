import FeatureSwitchState from "./FeatureSwitchState"
import { ElementStorage } from "../ElementStorage"
import { Changes } from "../Osm/Changes"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { UIEventSource } from "../UIEventSource"
import Loc from "../../Models/Loc"
import { BBox } from "../BBox"
import { QueryParameters } from "../Web/QueryParameters"
import { LocalStorageSource } from "../Web/LocalStorageSource"
import { Utils } from "../../Utils"
import ChangeToElementsActor from "../Actors/ChangeToElementsActor"
import PendingChangesUploader from "../Actors/PendingChangesUploader"

/**
 * The part of the state keeping track of where the elements, loading them, configuring the feature pipeline etc
 */
export default class ElementsState extends FeatureSwitchState {
    /**
     The mapping from id -> UIEventSource<properties>
     */
    public allElements: ElementStorage = new ElementStorage()

    /**
     The latest element that was selected
     */
    public readonly selectedElement = new UIEventSource<any>(undefined, "Selected element")

    /**
     * The map location: currently centered lat, lon and zoom
     */
    public readonly locationControl = new UIEventSource<Loc>(undefined, "locationControl")

    /**
     * The current visible extent of the screen
     */
    public readonly currentBounds = new UIEventSource<BBox>(undefined)

    constructor(layoutToUse: LayoutConfig) {
        super(layoutToUse)

        this.selectedElement.addCallbackAndRun((e) => {
            console.trace("Selected element is now", e)
        })
        function localStorageSynced(
            key: string,
            deflt: number,
            docs: string
        ): UIEventSource<number> {
            const localStorage = LocalStorageSource.Get(key)
            const previousValue = localStorage.data
            const src = UIEventSource.asFloat(
                QueryParameters.GetQueryParameter(key, "" + deflt, docs).syncWith(localStorage)
            )

            if (src.data === deflt) {
                const prev = Number(previousValue)
                if (!isNaN(prev)) {
                    src.setData(prev)
                }
            }

            return src
        }

        // -- Location control initialization
        const zoom = localStorageSynced(
            "z",
            layoutToUse?.startZoom ?? 1,
            "The initial/current zoom level"
        )
        const lat = localStorageSynced(
            "lat",
            layoutToUse?.startLat ?? 0,
            "The initial/current latitude"
        )
        const lon = localStorageSynced(
            "lon",
            layoutToUse?.startLon ?? 0,
            "The initial/current longitude of the app"
        )

        this.locationControl.setData({
            zoom: Utils.asFloat(zoom.data),
            lat: Utils.asFloat(lat.data),
            lon: Utils.asFloat(lon.data),
        })
        this.locationControl.addCallback((latlonz) => {
            // Sync the location controls
            zoom.setData(latlonz.zoom)
            lat.setData(latlonz.lat)
            lon.setData(latlonz.lon)
        })
    }
}
