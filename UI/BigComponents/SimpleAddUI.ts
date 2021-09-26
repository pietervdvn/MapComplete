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
import {TagUtils} from "../../Logic/Tags/TagUtils";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";
import UserDetails from "../../Logic/Osm/OsmConnection";
import LocationInput from "../Input/LocationInput";
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers";
import CreateNewNodeAction from "../../Logic/Osm/Actions/CreateNewNodeAction";
import {OsmObject, OsmWay} from "../../Logic/Osm/OsmObject";
import PresetConfig from "../../Models/ThemeConfig/PresetConfig";
import FilteredLayer from "../../Models/FilteredLayer";
import {And} from "../../Logic/Tags/And";
import {BBox} from "../../Logic/GeoOperations";

/*
* The SimpleAddUI is a single panel, which can have multiple states:
* - A list of presets which can be added by the user
* - A 'confirm-selection' button (or alternatively: please enable the layer)
* - A 'something is wrong - please soom in further'
* - A 'read your unread messages before adding a point'
 */

/*private*/
interface PresetInfo extends PresetConfig {
    name: string | BaseUIElement,
    icon: () => BaseUIElement,
    layerToAddTo: FilteredLayer
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
        State.state.LastClickLocation.addCallback( _ => selectedPreset.setData(undefined))
        
        const presetsOverview = SimpleAddUI.CreateAllPresetsPanel(selectedPreset)


        function createNewPoint(tags: any[], location: { lat: number, lon: number }, snapOntoWay?: OsmWay) {
            const newElementAction = new CreateNewNodeAction(tags, location.lat, location.lon, {snapOnto: snapOntoWay})
            State.state.changes.applyAction(newElementAction)
            selectedPreset.setData(undefined)
            isShown.setData(false)
            State.state.selectedElement.setData(State.state.allElements.ContainingFeatures.get(
                newElementAction.newElementId
            ))
        }

        const addUi = new VariableUiElement(
            selectedPreset.map(preset => {
                    if (preset === undefined) {
                        return presetsOverview
                    }
                    return SimpleAddUI.CreateConfirmButton(preset,
                        (tags, location, snapOntoWayId?: string) => {
                            if (snapOntoWayId === undefined) {
                                createNewPoint(tags, location, undefined)
                            } else {
                                OsmObject.DownloadObject(snapOntoWayId).addCallbackAndRunD(way => {
                                    createNewPoint(tags, location, <OsmWay>way)
                                    return true;
                                })
                            }
                        },
                        () => {
                            selectedPreset.setData(undefined)
                        })
                }
            ))


        super(
            new Toggle(
                new Toggle(
                    new Toggle(
                        addUi,
                        Translations.t.general.add.stillLoading.Clone().SetClass("alert"),
                        State.state.featurePipeline.somethingLoaded
                    ),
                    Translations.t.general.add.zoomInFurther.Clone().SetClass("alert"),
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
                                       confirm: (tags: any[], location: { lat: number, lon: number }, snapOntoWayId: string) => void,
                                       cancel: () => void): BaseUIElement {

        let location = State.state.LastClickLocation;
        let preciseInput: LocationInput = undefined
        if (preset.preciseInput !== undefined) {
            // We uncouple the event source
            const locationSrc = new UIEventSource({
                lat: location.data.lat,
                lon: location.data.lon,
                zoom: 19
            });

            let backgroundLayer = undefined;
            if (preset.preciseInput.preferredBackground) {
                backgroundLayer = AvailableBaseLayers.SelectBestLayerAccordingTo(locationSrc, new UIEventSource<string | string[]>(preset.preciseInput.preferredBackground))
            }

            let snapToFeatures: UIEventSource<{ feature: any }[]> = undefined
            let mapBounds: UIEventSource<BBox> = undefined
            if (preset.preciseInput.snapToLayers) {
                snapToFeatures = new UIEventSource<{ feature: any }[]>([])
                mapBounds = new UIEventSource<BBox>(undefined)
            }



            const tags = TagUtils.KVtoProperties(preset.tags ?? []);
            preciseInput = new LocationInput({
                mapBackground: backgroundLayer,
                centerLocation: locationSrc,
                snapTo: snapToFeatures,
                snappedPointTags: tags,
                maxSnapDistance: preset.preciseInput.maxSnapDistance,
                bounds: mapBounds
            })
            preciseInput.SetClass("h-32 rounded-xl overflow-hidden border border-gray").SetStyle("height: 12rem;")


            if (preset.preciseInput.snapToLayers) {
                // We have to snap to certain layers.
                // Lets fetch them
                
                let loadedBbox : BBox= undefined
                mapBounds?.addCallbackAndRunD(bbox => {
                    if(loadedBbox !== undefined && bbox.isContainedIn(loadedBbox)){
                        // All is already there
                        // return;
                    }

                    bbox = bbox.pad(2);
                    loadedBbox = bbox;
                    const allFeatures: {feature: any}[] = []
                    preset.preciseInput.snapToLayers.forEach(layerId => {
                       State.state.featurePipeline.GetFeaturesWithin(layerId, bbox).forEach(feats => allFeatures.push(...feats.map(f => ({feature :f}))))
                    })
                    snapToFeatures.setData(allFeatures)
                })
            }
            
        }


        let confirmButton: BaseUIElement = new SubtleButton(preset.icon(),
            new Combine([
                Translations.t.general.add.addNew.Subs({category: preset.name}),
                Translations.t.general.add.warnVisibleForEveryone.Clone().SetClass("alert")
            ]).SetClass("flex flex-col")
        ).SetClass("font-bold break-words")
            .onClick(() => {
                confirm(preset.tags, (preciseInput?.GetValue() ?? location).data, preciseInput?.snappedOnto?.data?.properties?.id);
            });

        if (preciseInput !== undefined) {
            confirmButton = new Combine([preciseInput, confirmButton])
        }

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
                .onClick(() => State.state.filterIsOpened.setData(true))


        const openLayerOrConfirm = new Toggle(
            confirmButton,
            openLayerControl,
            preset.layerToAddTo.isDisplayed
        )

        const disableFilter = new SubtleButton(
            new Combine([
                Svg.filter_ui().SetClass("absolute w-full"),
                Svg.cross_bottom_right_svg().SetClass("absolute red-svg")
            ]).SetClass("relative"),
            new Combine(
                [
                    Translations.t.general.add.disableFiltersExplanation.Clone(),
                    Translations.t.general.add.disableFilters.Clone().SetClass("text-xl")
                ]
            ).SetClass("flex flex-col")
        ).onClick(() => {
            preset.layerToAddTo.appliedFilters.setData(new And([]))
            cancel()
        })

        const disableFiltersOrConfirm = new Toggle(
            openLayerOrConfirm,
            disableFilter,
            preset.layerToAddTo.appliedFilters.map(filters => filters === undefined || filters.normalize().and.length === 0)
        )


        const tagInfo = SimpleAddUI.CreateTagInfoFor(preset);

        const cancelButton = new SubtleButton(Svg.close_ui(),
            Translations.t.general.cancel
        ).onClick(cancel)

        return new Combine([
            // Translations.t.general.add.confirmIntro.Subs({title: preset.name}),
            State.state.osmConnection.userDetails.data.dryRun ?
                Translations.t.general.testing.Clone().SetClass("alert") : undefined,
            disableFiltersOrConfirm,
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

    private static CreatePresetSelectButton(preset: PresetInfo) {

        const tagInfo = SimpleAddUI.CreateTagInfoFor(preset, false);
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
    private static CreatePresetButtons(selectedPreset: UIEventSource<PresetInfo>): BaseUIElement {
        const allButtons = [];
        for (const layer of State.state.filteredLayers.data) {

            if (layer.isDisplayed.data === false && !State.state.featureSwitchFilter.data) {
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
                let icon: () => BaseUIElement = () => layer.layerDef.GenerateLeafletStyle(new UIEventSource<any>(tags), false).icon.html
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