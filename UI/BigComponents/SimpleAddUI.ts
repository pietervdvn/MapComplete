/**
 * Asks to add a feature at the last clicked location, at least if zoom is sufficient
 */
import {UIEventSource} from "../../Logic/UIEventSource";
import Svg from "../../Svg";
import {SubtleButton} from "../Base/SubtleButton";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import Constants from "../../Models/Constants";
import {TagUtils} from "../../Logic/Tags/TagUtils";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";
import UserDetails, {OsmConnection} from "../../Logic/Osm/OsmConnection";
import CreateNewNodeAction from "../../Logic/Osm/Actions/CreateNewNodeAction";
import {OsmObject, OsmWay} from "../../Logic/Osm/OsmObject";
import PresetConfig from "../../Models/ThemeConfig/PresetConfig";
import FilteredLayer from "../../Models/FilteredLayer";
import Loc from "../../Models/Loc";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {Changes} from "../../Logic/Osm/Changes";
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline";
import {ElementStorage} from "../../Logic/ElementStorage";
import ConfirmLocationOfPoint from "../NewPoint/ConfirmLocationOfPoint";
import BaseLayer from "../../Models/BaseLayer";

/*
* The SimpleAddUI is a single panel, which can have multiple states:
* - A list of presets which can be added by the user
* - A 'confirm-selection' button (or alternatively: please enable the layer)
* - A 'something is wrong - please soom in further'
* - A 'read your unread messages before adding a point'
 */

export interface PresetInfo extends PresetConfig {
    name: string | BaseUIElement,
    icon: () => BaseUIElement,
    layerToAddTo: FilteredLayer
}

export default class SimpleAddUI extends Toggle {

    constructor(isShown: UIEventSource<boolean>,
                filterViewIsOpened: UIEventSource<boolean>,
                state: {
                    layoutToUse: LayoutConfig,
                    osmConnection: OsmConnection,
                    changes: Changes,
                    allElements: ElementStorage,
                    LastClickLocation: UIEventSource<{ lat: number, lon: number }>,
                    featurePipeline: FeaturePipeline,
                    selectedElement: UIEventSource<any>,
                    locationControl: UIEventSource<Loc>,
                    filteredLayers: UIEventSource<FilteredLayer[]>,
                    featureSwitchFilter: UIEventSource<boolean>,
                    backgroundLayer: UIEventSource<BaseLayer>
                }) {
        const loginButton = new SubtleButton(Svg.osm_logo_ui(), Translations.t.general.add.pleaseLogin.Clone())
            .onClick(() => state.osmConnection.AttemptLogin());
        const readYourMessages = new Combine([
            Translations.t.general.readYourMessages.Clone().SetClass("alert"),
            new SubtleButton(Svg.envelope_ui(),
                Translations.t.general.goToInbox, {url: "https://www.openstreetmap.org/messages/inbox", newTab: false})
        ]);


        const selectedPreset = new UIEventSource<PresetInfo>(undefined);
        isShown.addCallback(_ => selectedPreset.setData(undefined)) // Clear preset selection when the UI is closed/opened
        state.LastClickLocation.addCallback(_ => selectedPreset.setData(undefined))

        const presetsOverview = SimpleAddUI.CreateAllPresetsPanel(selectedPreset, state)


        async function createNewPoint(tags: any[], location: { lat: number, lon: number }, snapOntoWay?: OsmWay) {
            const newElementAction = new CreateNewNodeAction(tags, location.lat, location.lon, {
                theme: state.layoutToUse?.id ?? "unkown",
                changeType: "create",
                snapOnto: snapOntoWay
            })
            await state.changes.applyAction(newElementAction)
            selectedPreset.setData(undefined)
            isShown.setData(false)
            state.selectedElement.setData(state.allElements.ContainingFeatures.get(
                newElementAction.newElementId
            ))
        }

        const addUi = new VariableUiElement(
            selectedPreset.map(preset => {
                    if (preset === undefined) {
                        return presetsOverview
                    }

                    function confirm(tags:any[], location: {lat: number, lon:number}, snapOntoWayId?: string) {
                        if (snapOntoWayId === undefined) {
                            createNewPoint(tags, location, undefined)
                        } else {
                            OsmObject.DownloadObject(snapOntoWayId).addCallbackAndRunD(way => {
                                createNewPoint(tags, location, <OsmWay>way)
                                return true;
                            })
                        }
                    }

                    function cancel() {
                        selectedPreset.setData(undefined)
                    }

                    const message = Translations.t.general.add.addNew.Subs({category: preset.name});
                    return new ConfirmLocationOfPoint(state, filterViewIsOpened, preset,
                        message,
                        state.LastClickLocation.data,
                        confirm,
                        cancel)
                }
            ))


        super(
            new Toggle(
                new Toggle(
                    new Toggle(
                        Translations.t.general.add.stillLoading.Clone().SetClass("alert"),
                        addUi,
                        state.featurePipeline.runningQuery
                    ),
                    Translations.t.general.add.zoomInFurther.Clone().SetClass("alert"),
                    state.locationControl.map(loc => loc.zoom >= Constants.userJourney.minZoomLevelToAddNewPoints)
                ),
                readYourMessages,
                state.osmConnection.userDetails.map((userdetails: UserDetails) =>
                    userdetails.csCount >= Constants.userJourney.addNewPointWithUnreadMessagesUnlock ||
                    userdetails.unreadMessages == 0)
            ),
            loginButton,
            state.osmConnection.isLoggedIn
        )


        this.SetStyle("font-size:large");
    }


    public static CreateTagInfoFor(preset: PresetInfo, osmConnection: OsmConnection, optionallyLinkToWiki = true) {
        const csCount = osmConnection.userDetails.data.csCount;
        return new Toggle(
            Translations.t.general.add.presetInfo.Subs({
                tags: preset.tags.map(t => t.asHumanString(optionallyLinkToWiki && csCount > Constants.userJourney.tagsVisibleAndWikiLinked, true)).join("&"),
            }).SetStyle("word-break: break-all"),

            undefined,
            osmConnection.userDetails.map(userdetails => userdetails.csCount >= Constants.userJourney.tagsVisibleAt)
        );
    }

    private static CreateAllPresetsPanel(selectedPreset: UIEventSource<PresetInfo>,
                                         state: {
                                             filteredLayers: UIEventSource<FilteredLayer[]>,
                                             featureSwitchFilter: UIEventSource<boolean>,
                                             osmConnection: OsmConnection
                                         }): BaseUIElement {
        const presetButtons = SimpleAddUI.CreatePresetButtons(state, selectedPreset)
        let intro: BaseUIElement = Translations.t.general.add.intro;

        let testMode: BaseUIElement = undefined;
        if (state.osmConnection?.userDetails?.data?.dryRun) {
            testMode = Translations.t.general.testing.Clone().SetClass("alert")
        }

        return new Combine([intro, testMode, presetButtons]).SetClass("flex flex-col")

    }

    private static CreatePresetSelectButton(preset: PresetInfo, osmConnection: OsmConnection) {

        const tagInfo = SimpleAddUI.CreateTagInfoFor(preset, osmConnection, false);
        return new SubtleButton(
            preset.icon(),
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
    private static CreatePresetButtons(
        state: {
            filteredLayers: UIEventSource<FilteredLayer[]>,
            featureSwitchFilter: UIEventSource<boolean>,
            osmConnection: OsmConnection
        },
        selectedPreset: UIEventSource<PresetInfo>): BaseUIElement {
        const allButtons = [];
        for (const layer of state.filteredLayers.data) {

            if (layer.isDisplayed.data === false && !state.featureSwitchFilter.data) {
                // The layer is not displayed and we cannot enable the layer control -> we skip
                continue;
            }

            if (layer.layerDef.name === undefined) {
                // this is a parlty hidden layer
                continue;
            }

            const presets = layer.layerDef.presets;
            for (const preset of presets) {

                const tags = TagUtils.KVtoProperties(preset.tags ?? []);
                let icon: () => BaseUIElement = () => layer.layerDef.mapRendering[0].GenerateLeafletStyle(new UIEventSource<any>(tags), false).html
                    .SetClass("w-12 h-12 block relative");
                const presetInfo: PresetInfo = {
                    tags: preset.tags,
                    layerToAddTo: layer,
                    name: preset.title,
                    title: preset.title,
                    description: preset.description,
                    icon: icon,
                    preciseInput: preset.preciseInput
                }

                const button = SimpleAddUI.CreatePresetSelectButton(presetInfo, state.osmConnection);
                button.onClick(() => {
                    selectedPreset.setData(presetInfo)
                })
                allButtons.push(button);
            }
        }
        return new Combine(allButtons).SetClass("flex flex-col");
    }


}