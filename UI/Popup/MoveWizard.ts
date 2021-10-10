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

interface MoveReason  {text: Translation | string,
    icon: string | BaseUIElement,
    changesetCommentValue: string,
    lockBounds: true | boolean,
    background: undefined | "map" | "photo",
    startZoom: number}

export default class MoveWizard extends Toggle {
    /**
     * The UI-element which helps moving a point
     */
    constructor(
        featureToMove : any,
        state: {
        osmConnection: OsmConnection,
        featureSwitchUserbadge: UIEventSource<boolean>
    },options?: {
        reasons?: {text: Translation | string, 
            icon: string | BaseUIElement, 
            changesetCommentValue: string,
            lockBounds?: true | boolean,
            background?: undefined | "map" | "photo",
            startZoom?: number | 15
        }[]
        disableDefaultReasons?: false | boolean
        
    }) {
        //State.state.featureSwitchUserbadge
       // state = State.state
        options = options ?? {}
       const  t = Translations.t.move
        const loginButton = new Toggle(
          t.loginToMove.Clone()  .SetClass("btn").onClick(() => state.osmConnection.AttemptLogin()),
            undefined,
            state.featureSwitchUserbadge
        )
        
        const currentStep = new UIEventSource<"start" | "reason" | "pick_location">("start")
        const moveReason = new UIEventSource<MoveReason>(undefined)
        const moveButton = new SubtleButton(
            Svg.move_ui(),
            t.inviteToMove.Clone()
        ).onClick(() => {
            currentStep.setData("reason")
        })
        
        
        const reasons : MoveReason[] = []
        if(!options.disableDefaultReasons){
            reasons.push({
                text: t.reasonRelocation.Clone(),
                icon: Svg.relocation_svg(),
                changesetCommentValue: "relocated",
                lockBounds: false,
                background: undefined,
                startZoom: 12
            })
            
            reasons.push({
                text: t.reasonInaccurate.Clone(),
                icon: Svg.crosshair_svg(),
                changesetCommentValue: "improve_accuracy",
                lockBounds: true,
                background: "photo",
                startZoom: 17
            })
        }
        for (const reason of options.reasons ?? []) {
            reasons.push({
                text: reason.text,
                icon: reason.icon,
                changesetCommentValue: reason.changesetCommentValue,
                lockBounds: reason.lockBounds ?? true,
                background: reason.background,
                startZoom: reason.startZoom ?? 15
            })
        }
        
        const selectReason = new Combine(reasons.map(r => new SubtleButton(r.icon, r.text).onClick(() => {
            moveReason.setData(r)
            currentStep.setData("pick_location")
        })))
        
        const cancelButton = new SubtleButton(Svg.close_svg(), t.cancel).onClick(() => currentStep.setData("start"))
        
        
        
        const [lon, lat] = GeoOperations.centerpointCoordinates(featureToMove)
        const locationInput = new LocationInput({
            centerLocation: new UIEventSource<Loc>({
                lon: lon,
                lat: lat,
                zoom: moveReason.data.startZoom
            }),
            
        })
        locationInput.SetStyle("height: 25rem")
        super(
            new VariableUiElement(currentStep.map(currentStep => {
                switch (currentStep){
                    case "start":
                        return moveButton;
                    case "reason":
                        return new Combine([selectReason, cancelButton]);
                    case "pick_location":
                        return new Combine([locationInput])
                }
                
                
                
                
            })),
            loginButton,
            state.osmConnection.isLoggedIn
        )
    }
}