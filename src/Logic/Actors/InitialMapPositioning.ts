import { ImmutableStore, Store, UIEventSource } from "../UIEventSource"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { LocalStorageSource } from "../Web/LocalStorageSource"
import { QueryParameters } from "../Web/QueryParameters"
import Hash from "../Web/Hash"
import OsmObjectDownloader from "../Osm/OsmObjectDownloader"
import { OsmObject } from "../Osm/OsmObject"
import Constants from "../../Models/Constants"
import { Utils } from "../../Utils"
import { GeoLocationState } from "../State/GeoLocationState"

/**
 * This actor is responsible to set the map location.
 * It will attempt to
 * - Set the map to the position of the selected element
 * - Set the map to the position as passed in by the query parameters (if available)
 * - Set the map to the position remembered in LocalStorage (if available)
 * - Set the map to what IP-info says (very coarse)
 * - Set the map to the layout default
 *
 * Additionally, it will save the map location to local storage
 */
export default class InitialMapPositioning {
    public zoom: UIEventSource<number>
    public location: UIEventSource<{ lon: number; lat: number }>
    public useTerrain: Store<boolean>

    constructor(layoutToUse: LayoutConfig, geolocationState: GeoLocationState) {
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

        const initialHash = Hash.hash.data

        // -- Location control initialization
        this.zoom = localStorageSynced(
            "z",
            layoutToUse?.startZoom ?? 1,
            "The initial/current zoom level"
        )
        const defaultLat = layoutToUse?.startLat ?? 0
        const lat = localStorageSynced("lat", defaultLat, "The initial/current latitude")
        const defaultLon = layoutToUse?.startLon ?? 0
        const lon = localStorageSynced(
            "lon",
            defaultLon,
            "The initial/current longitude of the app"
        )

        this.location = new UIEventSource({ lon: lon.data, lat: lat.data })
        // Note: this syncs only in one direction
        this.location.addCallbackD((loc) => {
            lat.setData(loc.lat)
            lon.setData(loc.lon)
        })
        this.useTerrain = new ImmutableStore<boolean>(layoutToUse.enableTerrain)

        if (initialHash?.match(/^(node|way|relation)\/[0-9]+$/)) {
            // We pan to the selected element
            const [type, id] = initialHash.split("/")
            OsmObjectDownloader.RawDownloadObjectAsync(
                type,
                Number(id),
                Constants.osmAuthConfig.url + "/"
            ).then((osmObject) => {
                if (osmObject === "deleted") {
                    return
                }
                const targetLayer = layoutToUse.getMatchingLayer(osmObject.tags)
                this.zoom.setData(Math.max(this.zoom.data, targetLayer.minzoom))
                const [lat, lon] = osmObject.centerpoint()
                this.location.setData({ lon, lat })
            })
        } else if (
            Constants.GeoIpServer &&
            lat.data === defaultLat &&
            lon.data === defaultLon &&
            !Utils.runningFromConsole
        ) {
            console.log("Using geoip to determine start location...")
            // We use geo-IP to zoom to some location
            Utils.downloadJson<{ latitude: number; longitude: number }>(
                Constants.GeoIpServer + "ip"
            ).then(({ longitude, latitude }) => {
                if (geolocationState.currentGPSLocation.data !== undefined) {
                    return // We got a geolocation by now, abort
                }
                console.log("Setting location based on geoip", longitude, latitude)
                this.zoom.setData(8)
                this.location.setData({ lon: longitude, lat: latitude })
            })
        }
    }
}
