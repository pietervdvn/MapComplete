import {SubtleButton} from "../Base/SubtleButton";
import Combine from "../Base/Combine";
import Svg from "../../Svg";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import Toggle from "../Input/Toggle";
import {UIEventSource} from "../../Logic/UIEventSource";
import Translations from "../i18n/Translations";
import {VariableUiElement} from "../Base/VariableUIElement";
import {Translation} from "../i18n/Translation";
import BaseUIElement from "../BaseUIElement";
import LocationInput from "../Input/LocationInput";
import Loc from "../../Models/Loc";
import {GeoOperations} from "../../Logic/GeoOperations";
import {OsmObject} from "../../Logic/Osm/OsmObject";
import {Changes} from "../../Logic/Osm/Changes";
import ChangeLocationAction from "../../Logic/Osm/Actions/ChangeLocationAction";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";

interface MoveReason {
    text: Translation | string,
    icon: string | BaseUIElement,
    changesetCommentValue: string,
    lockBounds: true | boolean,
    background: undefined | "map" | "photo",
    startZoom: number,
    minZoom: number
}

export default class MoveWizard extends Toggle {
    /**
     * The UI-element which helps moving a point
     */
    constructor(
        featureToMove: any,
        state: {
            osmConnection: OsmConnection,
            featureSwitchUserbadge: UIEventSource<boolean>,
            changes: Changes,
            layoutToUse: LayoutConfig
        }, options?: {
            reasons?: MoveReason[]
            disableDefaultReasons?: false | boolean

        }) {
        options = options ?? {}

        const t = Translations.t.move
        const loginButton = new Toggle(
            t.loginToMove.Clone().SetClass("btn").onClick(() => state.osmConnection.AttemptLogin()),
            undefined,
            state.featureSwitchUserbadge
        )

        const currentStep = new UIEventSource<"start" | "reason" | "pick_location" | "moved">("start")
        const moveReason = new UIEventSource<MoveReason>(undefined)
        const moveButton = new SubtleButton(
            Svg.move_ui(),
            t.inviteToMove.Clone()
        ).onClick(() => {
            currentStep.setData("reason")
        })

        const moveAgainButton = new SubtleButton(
            Svg.move_ui(),
            t.inviteToMoveAgain.Clone()
        ).onClick(() => {
            currentStep.setData("reason")
        })


        const reasons: MoveReason[] = []
        if (!options.disableDefaultReasons) {
            reasons.push({
                text: t.reasonRelocation.Clone(),
                icon: Svg.relocation_svg(),
                changesetCommentValue: "relocated",
                lockBounds: false,
                background: undefined,
                startZoom: 12,
                minZoom: 6
            })

            reasons.push({
                text: t.reasonInaccurate.Clone(),
                icon: Svg.crosshair_svg(),
                changesetCommentValue: "improve_accuracy",
                lockBounds: true,
                background: "photo",
                startZoom: 17,
                minZoom: 16
            })
        }
        for (const reason of options.reasons ?? []) {
            reasons.push({
                text: reason.text,
                icon: reason.icon,
                changesetCommentValue: reason.changesetCommentValue,
                lockBounds: reason.lockBounds ?? true,
                background: reason.background,
                startZoom: reason.startZoom ?? 15,
                minZoom: reason.minZoom
            })
        }

        const selectReason = new Combine(reasons.map(r => new SubtleButton(r.icon, r.text).onClick(() => {
            moveReason.setData(r)
            currentStep.setData("pick_location")
        })))

        const cancelButton = new SubtleButton(Svg.close_svg(), t.cancel).onClick(() => currentStep.setData("start"))


        const [lon, lat] = GeoOperations.centerpointCoordinates(featureToMove)
        const locationInput = moveReason.map(reason => {
            if (reason === undefined) {
                return undefined
            }
            const loc = new UIEventSource<Loc>({
                lon: lon,
                lat: lat,
                zoom: reason?.startZoom ?? 16
            })


            const locationInput = new LocationInput({
                minZoom: reason.minZoom,
                centerLocation: loc
            })

            if (reason.lockBounds) {
                locationInput.installBounds(0.05, true)
            }

            locationInput.SetStyle("height: 17.5rem")

            const confirmMove = new SubtleButton(Svg.move_confirm_svg(), t.confirmMove)
            confirmMove.onClick(() => {
                state.changes.applyAction(new ChangeLocationAction(featureToMove.properties.id, [locationInput.GetValue().data.lon, locationInput.GetValue().data.lat], {
                    reason: Translations.WT(reason.text).textFor("en"),
                    theme: state.layoutToUse.icon
                }))
                currentStep.setData("moved")
            })
            const zoomInFurhter = t.zoomInFurther.Clone().SetClass("alert block m-6")
            return new Combine([
                locationInput,
                new Toggle(confirmMove, zoomInFurhter, locationInput.GetValue().map(l => l.zoom >= 19))
            ]).SetClass("flex flex-col")
        });

        const dialogClasses = "p-2 md:p-4 m-2 border border-gray-400 rounded-xl flex flex-col"

        const moveFlow = new Toggle(
            new VariableUiElement(currentStep.map(currentStep => {
                switch (currentStep) {
                    case "start":
                        return moveButton;
                    case "reason":
                        return new Combine([t.whyMove.Clone().SetClass("text-lg font-bold"), selectReason, cancelButton]).SetClass(dialogClasses);
                    case "pick_location":
                        return new Combine([t.moveTitle.Clone().SetClass("text-lg font-bold"), new VariableUiElement(locationInput), cancelButton]).SetClass(dialogClasses)
                    case "moved":
                        return new Combine([t.pointIsMoved.Clone().SetClass("thanks"), moveAgainButton]).SetClass("flex flex-col");

                }


            })),
            loginButton,
            state.osmConnection.isLoggedIn
        )
        let id = featureToMove.properties.id
        const backend = state.osmConnection._oauth_config.url
        if (id.startsWith(backend)) {
            id = id.substring(backend.length)
        }

        const moveDisallowedReason = new UIEventSource<BaseUIElement>(undefined)
        if (id.startsWith("way")) {
            moveDisallowedReason.setData(t.isWay.Clone())
        } else if (id.startsWith("relation")) {
            moveDisallowedReason.setData(t.isRelation.Clone())
        } else {
            
            OsmObject.DownloadReferencingWays(id).then(referencing => {
                if (referencing.length > 0) {
                    console.log("Got a referencing way, move not allowed")
                    moveDisallowedReason.setData(t.partOfAWay.Clone())
                }
            })
            OsmObject.DownloadReferencingRelations(id).then(partOf => {
                if(partOf.length > 0){
                moveDisallowedReason.setData(t.partOfRelation.Clone())
                }
            })
        }
        super(
            moveFlow,
            new Combine([
                Svg.move_not_allowed_svg().SetStyle("height: 2rem"),
                new Combine([t.cannotBeMoved.Clone(),
                    new VariableUiElement(moveDisallowedReason).SetClass("subtle")
                ]).SetClass("flex flex-col")
            ]).SetClass("flex"),
            moveDisallowedReason.map(r => r === undefined)
        )
    }
}