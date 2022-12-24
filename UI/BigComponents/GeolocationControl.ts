import { VariableUiElement } from "../Base/VariableUIElement"
import Svg from "../../Svg"
import { UIEventSource } from "../../Logic/UIEventSource"
import GeoLocationHandler from "../../Logic/Actors/GeoLocationHandler"
import { BBox } from "../../Logic/BBox"
import Loc from "../../Models/Loc"
import Hotkeys from "../Base/Hotkeys"

/**
 * Displays an icon depending on the state of the geolocation.
 * Will set the 'lock' if clicked twice
 */
export class GeolocationControl extends VariableUiElement {
    constructor(
        geolocationHandler: GeoLocationHandler,
        state: {
            locationControl: UIEventSource<Loc>
            currentBounds: UIEventSource<BBox>
        }
    ) {
        const lastClick = new UIEventSource<Date>(undefined)
        const lastClickWithinThreeSecs = lastClick.map((lastClick) => {
            if (lastClick === undefined) {
                return false
            }
            const timeDiff = (new Date().getTime() - lastClick.getTime()) / 1000
            return timeDiff <= 3
        })
        const geolocationState = geolocationHandler.geolocationState
        super(
            geolocationState.permission.map(
                (permission) => {
                    if (permission === "denied") {
                        return Svg.location_refused_svg()
                    }
                    if (geolocationState.isLocked.data) {
                        return Svg.location_locked_svg()
                    }

                    if (geolocationState.currentGPSLocation.data === undefined) {
                        if (permission === "prompt") {
                            return Svg.location_empty_svg()
                        }
                        // Position not yet found, but permission is either requested or granted: we spin to indicate activity
                        const icon = !geolocationHandler.mapHasMoved.data
                            ? Svg.location_svg()
                            : Svg.location_empty_svg()
                        return icon
                            .SetClass("cursor-wait")
                            .SetStyle("animation: spin 4s linear infinite;")
                    }

                    // We have a location, so we show a dot in the center

                    if (
                        lastClickWithinThreeSecs.data &&
                        geolocationState.permission.data === "granted"
                    ) {
                        return Svg.location_unlocked_svg()
                    }

                    // We have a location, so we show a dot in the center
                    return Svg.location_svg()
                },
                [
                    geolocationState.currentGPSLocation,
                    geolocationState.isLocked,
                    geolocationHandler.mapHasMoved,
                    lastClickWithinThreeSecs,
                ]
            )
        )

        async function handleClick() {
            if (geolocationState.permission.data !== "granted") {
                await geolocationState.requestPermission()
            }

            if (geolocationState.isLocked.data === true) {
                // Unlock
                geolocationState.isLocked.setData(false)
                return
            }

            if (geolocationState.currentGPSLocation.data === undefined) {
                // No location is known yet, not much we can do
                return
            }

            // A location _is_ known! Let's move to this location
            const currentLocation = geolocationState.currentGPSLocation.data
            const inBounds = state.currentBounds.data.contains([
                currentLocation.longitude,
                currentLocation.latitude,
            ])
            geolocationHandler.MoveMapToCurrentLocation()
            if (inBounds) {
                const lc = state.locationControl.data
                state.locationControl.setData({
                    ...lc,
                    zoom: lc.zoom + 3,
                })
            }

            if (lastClickWithinThreeSecs.data && geolocationState.permission.data === "granted") {
                geolocationState.isLocked.setData(true)
                lastClick.setData(undefined)
                return
            }

            lastClick.setData(new Date())
        }

        this.onClick(handleClick)
        Hotkeys.RegisterHotkey(
            { nomod: "L" },
            "Pan the map to the current location or zoom the map to the current location. Requests geopermission",
            handleClick
        )

        lastClick.addCallbackAndRunD((_) => {
            window.setTimeout(() => {
                if (lastClickWithinThreeSecs.data) {
                    lastClick.ping()
                }
            }, 500)
        })
    }
}
