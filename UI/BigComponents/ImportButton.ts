import BaseUIElement from "../BaseUIElement";
import {SubtleButton} from "../Base/SubtleButton";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import {VariableUiElement} from "../Base/VariableUIElement";
import Translations from "../i18n/Translations";
import State from "../../State";
import Constants from "../../Models/Constants";
import Toggle from "../Input/Toggle";
import CreateNewNodeAction from "../../Logic/Osm/Actions/CreateNewNodeAction";
import {Tag} from "../../Logic/Tags/Tag";
import Loading from "../Base/Loading";

export default class ImportButton extends Toggle {
    constructor(imageUrl: string | BaseUIElement, message: string | BaseUIElement,
                originalTags: UIEventSource<any>,
                newTags: UIEventSource<Tag[]>, 
                lat: number, lon: number,
                minZoom: number,
                state: {   
                    locationControl: UIEventSource<{ zoom: number }>
                }) {
        const t = Translations.t.general.add;
        const isImported = originalTags.map(tags => tags._imported === "yes")
        const appliedTags = new Toggle(
            new VariableUiElement(
                newTags.map(tgs => {
                    const parts = []
                    for (const tag of tgs) {
                        parts.push(tag.key + "=" + tag.value)
                    }
                    const txt = parts.join(" & ")
                    return t.presetInfo.Subs({tags: txt}).SetClass("subtle")
                })), undefined,
            State.state.osmConnection.userDetails.map(ud => ud.csCount >= Constants.userJourney.tagsVisibleAt)
        )
        const button = new SubtleButton(imageUrl, message)

        minZoom = Math.max(16, minZoom ?? 19)

        button.onClick(async () => {
            if (isImported.data) {
                return
            }
            originalTags.data["_imported"] = "yes"
            originalTags.ping() // will set isImported as per its definition
            const newElementAction = new CreateNewNodeAction(newTags.data, lat, lon, {
                theme: State.state.layoutToUse.id,
                changeType: "import"
            })
            await State.state.changes.applyAction(newElementAction)
            State.state.selectedElement.setData(State.state.allElements.ContainingFeatures.get(
                newElementAction.newElementId
            ))
            console.log("Did set selected element to", State.state.allElements.ContainingFeatures.get(
                newElementAction.newElementId
            ))


        })

        const withLoadingCheck = new Toggle(new Toggle(
            new Loading(t.stillLoading.Clone()),
            new Combine([button, appliedTags]).SetClass("flex flex-col"),
            State.state.featurePipeline.runningQuery
        ),t.zoomInFurther.Clone(),
                state.locationControl.map(l => l.zoom >= minZoom)    
            )
        const importButton = new Toggle(t.hasBeenImported, withLoadingCheck, isImported)

        const pleaseLoginButton =
            new Toggle(t.pleaseLogin.Clone()
                    .onClick(() => State.state.osmConnection.AttemptLogin())
                    .SetClass("login-button-friendly"),
                undefined,
                State.state.featureSwitchUserbadge)
            

        super(importButton,
            pleaseLoginButton,
            State.state.osmConnection.isLoggedIn
        )
    }
}