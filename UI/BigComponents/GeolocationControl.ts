import { VariableUiElement } from "../Base/VariableUIElement"
import Svg from "../../Svg"
import { UIEventSource } from "../../Logic/UIEventSource"
import GeoLocationHandler from "../../Logic/Actors/GeoLocationHandler"

/**
 * Displays an icon depending on the state of the geolocation.
 * Will set the 'lock' if clicked twice
 */
export class GeolocationControl extends VariableUiElement {
    constructor(geolocationHandler: GeoLocationHandler) {
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

                    if (permission === "prompt") {
                        return Svg.location_empty_svg()
                    }
                    if (geolocationState.currentGPSLocation === undefined) {
                        // Position not yet found, but permission is either requested or granted: we spin to indicate activity
                        const icon = !geolocationHandler.mapHasMoved.data
                            ? Svg.location_svg()
                            : Svg.location_empty_svg()
                        return icon
                            .SetClass("cursor-wait")
                            .SetStyle("animation: spin 4s linear infinite;")
                    }

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

        this.onClick(async () => {
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

            // A location _is_ known! Let's zoom to this location
            geolocationHandler.MoveMapToCurrentLocation()

            if (lastClickWithinThreeSecs.data && geolocationState.permission.data === "granted") {
                geolocationState.isLocked.setData(true)
                lastClick.setData(undefined)
                return
            }

            lastClick.setData(new Date())
        })

        lastClick.addCallbackAndRunD((_) => {
            window.setTimeout(() => {
                if (lastClickWithinThreeSecs.data) {
                    lastClick.ping()
                }
            }, 500)
        })
    }
}
