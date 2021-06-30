/**
 * Asks to add a feature at the last clicked location, at least if zoom is sufficient
 */
import {UIEventSource} from "../../Logic/UIEventSource";
import Svg from "../../Svg";
import {SubtleButton} from "../Base/SubtleButton";
import State from "../../State";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import Constants from "../../Models/Constants";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import {Tag} from "../../Logic/Tags/Tag";
import {TagUtils} from "../../Logic/Tags/TagUtils";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";
import UserDetails from "../../Logic/Osm/OsmConnection";
import {Translation} from "../i18n/Translation";

/*
* The SimpleAddUI is a single panel, which can have multiple states:
* - A list of presets which can be added by the user
* - A 'confirm-selection' button (or alternatively: please enable the layer)
* - A 'something is wrong - please soom in further'
* - A 'read your unread messages before adding a point'
 */

interface PresetInfo {
    description: string | Translation,
    name: string | BaseUIElement,
    icon: BaseUIElement,
    tags: Tag[],
    layerToAddTo: {
        layerDef: LayerConfig,
        isDisplayed: UIEventSource<boolean>
    }
}

export default class SimpleAddUI extends Toggle {

    constructor(isShown: UIEventSource<boolean>) {


        const loginButton = new SubtleButton(Svg.osm_logo_ui(), Translations.t.general.add.pleaseLogin.Clone())
            .onClick(() => State.state.osmConnection.AttemptLogin());
        const readYourMessages = new Combine([
            Translations.t.general.readYourMessages.Clone().SetClass("alert"),
            new SubtleButton(Svg.envelope_ui(),
                Translations.t.general.goToInbox, {url: "https://www.openstreetmap.org/messages/inbox", newTab: false})
        ]);
        
        
        
        const selectedPreset = new UIEventSource<PresetInfo>(undefined);
        isShown.addCallback(_ => selectedPreset.setData(undefined)) // Clear preset selection when the UI is closed/opened
        
        function createNewPoint(tags: any[]){
           const loc = State.state.LastClickLocation.data;
            let feature = State.state.changes.createElement(tags, loc.lat, loc.lon);
            State.state.selectedElement.setData(feature);
        }
        
        const presetsOverview = SimpleAddUI.CreateAllPresetsPanel(selectedPreset)

        const addUi = new VariableUiElement(
            selectedPreset.map(preset => {
                    if (preset === undefined) {
                        return presetsOverview
                    }
                    return SimpleAddUI.CreateConfirmButton(preset,
                        tags => {
                            createNewPoint(tags)
                            selectedPreset.setData(undefined)
                        }, () => {
                            selectedPreset.setData(undefined)
                        })
                }
            ))


        super(
            new Toggle(
                new Toggle(
                    new Toggle(
                        Translations.t.general.add.stillLoading.Clone().SetClass("alert"),
                        addUi,
                        State.state.layerUpdater.runningQuery
                    ),
                    Translations.t.general.add.zoomInFurther.Clone().SetClass("alert")                    ,
                    State.state.locationControl.map(loc => loc.zoom >= Constants.userJourney.minZoomLevelToAddNewPoints)
                ),
                readYourMessages,
                State.state.osmConnection.userDetails.map((userdetails: UserDetails) =>
                    userdetails.csCount >= Constants.userJourney.addNewPointWithUnreadMessagesUnlock ||
                    userdetails.unreadMessages == 0)
            ),
            loginButton,
            State.state.osmConnection.isLoggedIn
        )


        this.SetStyle("font-size:large");
    }



    private static CreateConfirmButton(preset: PresetInfo,
                                       confirm: (tags: any[]) => void, 
                                       cancel: () => void): BaseUIElement {


        const confirmButton = new SubtleButton(preset.icon,
            new Combine([
                Translations.t.general.add.addNew.Subs({category: preset.name}),
                Translations.t.general.add.warnVisibleForEveryone.Clone().SetClass("alert")
            ]).SetClass("flex flex-col")
        ).SetClass("font-bold break-words")
            .onClick(() => confirm(preset.tags));


        const openLayerControl =  
            new SubtleButton(
                Svg.layers_ui(),
                new Combine([
                    Translations.t.general.add.layerNotEnabled
                        .Subs({layer: preset.layerToAddTo.layerDef.name})
                        .SetClass("alert"),
                    Translations.t.general.add.openLayerControl
                ])
            )
           
            .onClick(() => State.state.layerControlIsOpened.setData(true))
        
        const openLayerOrConfirm = new Toggle(
            confirmButton,
            openLayerControl,
            preset.layerToAddTo.isDisplayed
        )
        const tagInfo = SimpleAddUI.CreateTagInfoFor(preset);

        const cancelButton = new SubtleButton(Svg.close_ui(),
            Translations.t.general.cancel
        ).onClick(cancel        )

        return new Combine([
            Translations.t.general.add.confirmIntro.Subs({title: preset.name}),
            State.state.osmConnection.userDetails.data.dryRun ? 
                Translations.t.general.testing.Clone().SetClass("alert") : undefined           , 
            openLayerOrConfirm,
            cancelButton,
            preset.description,
            tagInfo

        ]).SetClass("flex flex-col")

    }

    private static CreateTagInfoFor(preset: PresetInfo, optionallyLinkToWiki = true) {
        const csCount = State.state.osmConnection.userDetails.data.csCount;
        return new Toggle(
            Translations.t.general.add.presetInfo.Subs({
                tags: preset.tags.map(t => t.asHumanString(optionallyLinkToWiki && csCount > Constants.userJourney.tagsVisibleAndWikiLinked, true)).join("&"),
            }).SetStyle("word-break: break-all"),

            undefined,
            State.state.osmConnection.userDetails.map(userdetails => userdetails.csCount >= Constants.userJourney.tagsVisibleAt)
        );
    }

    private static CreateAllPresetsPanel(selectedPreset: UIEventSource<PresetInfo>): BaseUIElement {
        const presetButtons = SimpleAddUI.CreatePresetButtons(selectedPreset)
        let intro: BaseUIElement = Translations.t.general.add.intro;

        let testMode: BaseUIElement = undefined;
        if (State.state.osmConnection?.userDetails?.data?.dryRun) {
            testMode = Translations.t.general.testing.Clone().SetClass("alert")
        }

        return new Combine([intro, testMode, presetButtons]).SetClass("flex flex-col")

    }

    private static CreatePresetSelectButton(preset: PresetInfo){

        const tagInfo =SimpleAddUI.CreateTagInfoFor(preset, false);
        return new SubtleButton(
            preset.icon,
            new Combine([
                Translations.t.general.add.addNew.Subs({
                    category: preset.name
                }).SetClass("font-bold"),
                Translations.WT(preset.description)?.FirstSentence(),
                tagInfo?.SetClass("subtle")
            ]).SetClass("flex flex-col")
        )
    }
 
/*
* Generates the list with all the buttons.*/
    private static CreatePresetButtons(selectedPreset: UIEventSource<PresetInfo>): BaseUIElement {
        const allButtons = [];
        for (const layer of State.state.filteredLayers.data) {
            
            if(layer.isDisplayed.data === false && State.state.featureSwitchLayers){
                continue;
            }
            
            const presets = layer.layerDef.presets;
            for (const preset of presets) {

                const tags = TagUtils.KVtoProperties(preset.tags ?? []);
                let icon: BaseUIElement = layer.layerDef.GenerateLeafletStyle(new UIEventSource<any>(tags), false).icon.html
                    .SetClass("w-12 h-12 block relative");
                const presetInfo: PresetInfo = {
                    tags: preset.tags,
                    layerToAddTo: layer,
                    name: preset.title,
                    description: preset.description,
                    icon: icon
                }

                const button = SimpleAddUI.CreatePresetSelectButton(presetInfo);
                button.onClick(() => {
                    selectedPreset.setData(presetInfo)
                })
                allButtons.push(button);
            }
        }
        return new Combine(allButtons).SetClass("flex flex-col");
    }


}