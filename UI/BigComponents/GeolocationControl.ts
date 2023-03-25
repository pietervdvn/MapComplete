import { VariableUiElement } from "../Base/VariableUIElement"
import Svg from "../../Svg"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import GeoLocationHandler from "../../Logic/Actors/GeoLocationHandler"
import { BBox } from "../../Logic/BBox"
import Hotkeys from "../Base/Hotkeys"
import Translations from "../i18n/Translations"
import Constants from "../../Models/Constants"
import { MapProperties } from "../../Models/MapProperties"

/**
 * Displays an icon depending on the state of the geolocation.
 * Will set the 'lock' if clicked twice
 */
export class GeolocationControl extends VariableUiElement {
    constructor(geolocationHandler: GeoLocationHandler, state: MapProperties) {
        const lastClick = new UIEventSource<Date>(undefined)
        lastClick.addCallbackD((date) => {
            geolocationHandler.geolocationState.requestMoment.setData(date)
        })
        const lastClickWithinThreeSecs = lastClick.map((lastClick) => {
            if (lastClick === undefined) {
                return false
            }
            const timeDiff = (new Date().getTime() - lastClick.getTime()) / 1000
            return timeDiff <= 3
        })
        const lastRequestWithinTimeout = geolocationHandler.geolocationState.requestMoment.map(
            (date) => {
                if (date === undefined) {
                    return false
                }
                const timeDiff = (new Date().getTime() - date.getTime()) / 1000
                return timeDiff <= Constants.zoomToLocationTimeout
            }
        )
        const geolocationState = geolocationHandler?.geolocationState
        super(
            geolocationState?.permission?.map(
                (permission) => {
                    if (permission === "denied") {
                        return Svg.location_refused_svg()
                    }
                    if (!geolocationState.allowMoving.data) {
                        return Svg.location_locked_svg()
                    }

                    if (geolocationState.currentGPSLocation.data === undefined) {
                        if (permission === "prompt") {
                            return Svg.location_empty_svg()
                        }
                        // Position not yet found, but permission is either requested or granted: we spin to indicate activity
                        const icon =
                            !geolocationHandler.mapHasMoved.data || lastRequestWithinTimeout.data
                                ? Svg.location_svg()
                                : Svg.location_empty_svg()
                        return icon
                            .SetClass("cursor-wait")
                            .SetStyle("animation: spin 4s linear infinite;")
                    }

                    // We have a location, so we show a dot in the center

                    if (lastClickWithinThreeSecs.data) {
                        return Svg.location_unlocked_svg()
                    }

                    // We have a location, so we show a dot in the center
                    return Svg.location_svg()
                },
                [
                    geolocationState.currentGPSLocation,
                    geolocationState.allowMoving,
                    geolocationHandler.mapHasMoved,
                    lastClickWithinThreeSecs,
                    lastRequestWithinTimeout,
                ]
            )
        )

        async function handleClick() {
            if (
                geolocationState.permission.data !== "granted" &&
                geolocationState.currentGPSLocation.data === undefined
            ) {
                lastClick.setData(new Date())
                geolocationState.requestMoment.setData(new Date())
                await geolocationState.requestPermission()
            }

            if (geolocationState.allowMoving.data === false) {
                // Unlock
                geolocationState.allowMoving.setData(true)
                return
            }

            if (geolocationState.currentGPSLocation.data === undefined) {
                // No location is known yet, not much we can do
                lastClick.setData(new Date())
                return
            }

            // A location _is_ known! Let's move to this location
            const currentLocation = geolocationState.currentGPSLocation.data
            const inBounds = state.bounds.data.contains([
                currentLocation.longitude,
                currentLocation.latitude,
            ])
            geolocationHandler.MoveMapToCurrentLocation()
            if (inBounds) {
                state.zoom.update((z) => z + 3)
            }

            if (lastClickWithinThreeSecs.data) {
                geolocationState.allowMoving.setData(false)
                lastClick.setData(undefined)
                return
            }

            lastClick.setData(new Date())
        }

        this.onClick(handleClick)
        Hotkeys.RegisterHotkey(
            { nomod: "L" },
            Translations.t.hotkeyDocumentation.geolocate,
            handleClick
        )

        lastClick.addCallbackAndRunD((_) => {
            window.setTimeout(() => {
                if (lastClickWithinThreeSecs.data) {
                    lastClick.ping()
                }
            }, 500)
        })
        geolocationHandler.geolocationState.requestMoment.addCallbackAndRunD((_) => {
            window.setTimeout(() => {
                if (lastRequestWithinTimeout.data) {
                    geolocationHandler.geolocationState.requestMoment.ping()
                }
            }, 500)
        })
    }
}
