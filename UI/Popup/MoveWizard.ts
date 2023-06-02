import { SubtleButton } from "../Base/SubtleButton"
import Combine from "../Base/Combine"
import Svg from "../../Svg"
import Toggle from "../Input/Toggle"
import { UIEventSource } from "../../Logic/UIEventSource"
import Translations from "../i18n/Translations"
import { VariableUiElement } from "../Base/VariableUIElement"
import { Translation } from "../i18n/Translation"
import BaseUIElement from "../BaseUIElement"
import { GeoOperations } from "../../Logic/GeoOperations"
import ChangeLocationAction from "../../Logic/Osm/Actions/ChangeLocationAction"
import MoveConfig from "../../Models/ThemeConfig/MoveConfig"
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
import { And } from "../../Logic/Tags/And"
import { Tag } from "../../Logic/Tags/Tag"
import { LoginToggle } from "./LoginButton"
import { SpecialVisualizationState } from "../SpecialVisualization"
import { Feature, Point } from "geojson"
import { OsmTags } from "../../Models/OsmFeature"
import SvelteUIElement from "../Base/SvelteUIElement"
import { MapProperties } from "../../Models/MapProperties"
import LocationInput from "../InputElement/Helpers/LocationInput.svelte"
import Geosearch from "../BigComponents/Geosearch.svelte"
import Constants from "../../Models/Constants"

interface MoveReason {
    text: Translation | string
    invitingText: Translation | string
    icon: BaseUIElement
    changesetCommentValue: string
    lockBounds: true | boolean
    includeSearch: false | boolean
    background: undefined | "map" | "photo" | string | string[]
    startZoom: number
    minZoom: number
    eraseAddressFields: false | boolean
}

export default class MoveWizard extends Toggle {
    /**
     * The UI-element which helps moving a point
     */
    constructor(
        featureToMove: Feature<Point>,
        tags: UIEventSource<OsmTags>,
        state: SpecialVisualizationState,
        options: MoveConfig
    ) {
        const t = Translations.t.move

        const reasons: MoveReason[] = []
        if (options.enableRelocation) {
            reasons.push({
                text: t.reasons.reasonRelocation,
                invitingText: t.inviteToMove.reasonRelocation,
                icon: Svg.relocation_svg(),
                changesetCommentValue: "relocated",
                lockBounds: false,
                background: undefined,
                includeSearch: true,
                startZoom: 12,
                minZoom: 6,
                eraseAddressFields: true,
            })
        }
        if (options.enableImproveAccuracy) {
            reasons.push({
                text: t.reasons.reasonInaccurate,
                invitingText: t.inviteToMove.reasonInaccurate,
                icon: Svg.crosshair_svg(),
                changesetCommentValue: "improve_accuracy",
                lockBounds: true,
                includeSearch: false,
                background: "photo",
                startZoom: 17,
                minZoom: 16,
                eraseAddressFields: false,
            })
        }

        const currentStep = new UIEventSource<"start" | "reason" | "pick_location" | "moved">(
            "start"
        )
        const moveReason = new UIEventSource<MoveReason>(undefined)
        let moveButton: BaseUIElement
        if (reasons.length === 1) {
            const reason = reasons[0]
            moveReason.setData(reason)
            moveButton = new SubtleButton(
                reason.icon.SetStyle("height: 1.5rem; width: 1.5rem;"),
                Translations.T(reason.invitingText)
            ).onClick(() => {
                currentStep.setData("pick_location")
            })
        } else {
            moveButton = new SubtleButton(
                Svg.move_svg().SetStyle("width: 1.5rem; height: 1.5rem"),
                t.inviteToMove.generic
            ).onClick(() => {
                currentStep.setData("reason")
            })
        }

        const moveAgainButton = new SubtleButton(Svg.move_svg(), t.inviteToMoveAgain).onClick(() => {
            currentStep.setData("reason")
        })

        const selectReason = new Combine(
            reasons.map((r) =>
                new SubtleButton(r.icon, r.text).onClick(() => {
                    moveReason.setData(r)
                    currentStep.setData("pick_location")
                })
            )
        )

        const cancelButton = new SubtleButton(Svg.close_svg(), t.cancel).onClick(() =>
            currentStep.setData("start")
        )

        const [lon, lat] = GeoOperations.centerpointCoordinates(featureToMove)
        const locationInput = moveReason.map((reason) => {
            if (reason === undefined) {
                return undefined
            }

            const mapProperties: Partial<MapProperties> = {
                minzoom: new UIEventSource(reason.minZoom),
                zoom: new UIEventSource(reason?.startZoom ?? 16),
                location: new UIEventSource({ lon, lat }),
                bounds: new UIEventSource(undefined),
                rasterLayer: state.mapProperties.rasterLayer
            }
            const value = new UIEventSource<{ lon: number; lat: number }>(undefined)
            const locationInput = new SvelteUIElement(LocationInput, {
                mapProperties,
                value,
            })

            let searchPanel: BaseUIElement = undefined
            if (reason.includeSearch) {
                searchPanel = new SvelteUIElement(Geosearch, { bounds: mapProperties.bounds })
            }

            locationInput.SetStyle("height: 17.5rem")

            const confirmMove = new SubtleButton(Svg.move_confirm_svg(), t.confirmMove)
            confirmMove.onClick(async () => {
                const loc = value.data
                await state.changes.applyAction(
                    new ChangeLocationAction(featureToMove.properties.id, [loc.lon, loc.lat], {
                        reason: reason.changesetCommentValue,
                        theme: state.layout.id,
                    })
                )
                featureToMove.properties._lat = loc.lat
                featureToMove.properties._lon = loc.lon
                featureToMove.geometry.coordinates = [loc.lon, loc.lat]
                if (reason.eraseAddressFields) {
                    await state.changes.applyAction(
                        new ChangeTagAction(
                            featureToMove.properties.id,
                            new And([
                                new Tag("addr:housenumber", ""),
                                new Tag("addr:street", ""),
                                new Tag("addr:city", ""),
                                new Tag("addr:postcode", ""),
                            ]),
                            featureToMove.properties,
                            {
                                changeType: "relocated",
                                theme: state.layout.id,
                            }
                        )
                    )
                }

                state.featureProperties.getStore(id).ping()
                currentStep.setData("moved")
                state.mapProperties.location.setData(loc)
            })
            const zoomInFurhter = t.zoomInFurther.SetClass("alert block m-6")
            return new Combine([
                searchPanel,
                locationInput,
                new Toggle(
                    confirmMove,
                    zoomInFurhter,
                    mapProperties.zoom.map((zoom) => zoom >= Constants.minZoomLevelToAddNewPoint)
                ),
            ]).SetClass("flex flex-col")
        })

        const dialogClasses = "p-2 md:p-4 m-2 border border-gray-400 rounded-xl flex flex-col"

        const moveFlow = new LoginToggle(
            new VariableUiElement(
                currentStep.map((currentStep) => {
                    switch (currentStep) {
                        case "start":
                            return moveButton
                        case "reason":
                            return new Combine([
                                t.whyMove.SetClass("text-lg font-bold"),
                                selectReason,
                                cancelButton,
                            ]).SetClass(dialogClasses)
                        case "pick_location":
                            return new Combine([
                                t.moveTitle.SetClass("text-lg font-bold"),
                                new VariableUiElement(locationInput),
                                cancelButton,
                            ]).SetClass(dialogClasses)
                        case "moved":
                            return new Combine([
                                t.pointIsMoved.SetClass("thanks"),
                                moveAgainButton,
                            ]).SetClass("flex flex-col")
                    }
                })
            ),
            undefined,
            state
        )
        let id = featureToMove.properties.id
        const backend = state.osmConnection._oauth_config.url
        if (id.startsWith(backend)) {
            id = id.substring(backend.length)
        }

        const moveDisallowedReason = new UIEventSource<BaseUIElement>(undefined)
        if (id.startsWith("way")) {
            moveDisallowedReason.setData(t.isWay)
        } else if (id.startsWith("relation")) {
            moveDisallowedReason.setData(t.isRelation)
        } else if (id.indexOf("-") < 0) {
            state.osmObjectDownloader.DownloadReferencingWays(id).then((referencing) => {
                if (referencing.length > 0) {
                    console.log("Got a referencing way, move not allowed")
                    moveDisallowedReason.setData(t.partOfAWay)
                }
            })
            state.osmObjectDownloader.DownloadReferencingRelations(id).then((partOf) => {
                if (partOf.length > 0) {
                    moveDisallowedReason.setData(t.partOfRelation)
                }
            })
        }
        super(
            moveFlow,
            new Combine([
                Svg.move_not_allowed_svg().SetStyle("height: 2rem").SetClass("m-2"),
                new Combine([
                    t.cannotBeMoved,
                    new VariableUiElement(moveDisallowedReason).SetClass("subtle"),
                ]).SetClass("flex flex-col"),
            ]).SetClass("flex m-2 p-2 rounded-lg bg-gray-200"),
            moveDisallowedReason.map((r) => r === undefined)
        )

        const self = this
        currentStep.addCallback((state) => {
            if (state === "start") {
                return
            }
            self.ScrollIntoView()
        })
    }
}
