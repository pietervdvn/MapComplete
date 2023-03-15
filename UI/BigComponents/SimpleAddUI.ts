/**
 * Asks to add a feature at the last clicked location, at least if zoom is sufficient
 */
import { ImmutableStore, Store, UIEventSource } from "../../Logic/UIEventSource"
import Svg from "../../Svg"
import { SubtleButton } from "../Base/SubtleButton"
import Combine from "../Base/Combine"
import Translations from "../i18n/Translations"
import Constants from "../../Models/Constants"
import { TagUtils } from "../../Logic/Tags/TagUtils"
import BaseUIElement from "../BaseUIElement"
import { VariableUiElement } from "../Base/VariableUIElement"
import Toggle from "../Input/Toggle"
import UserDetails, { OsmConnection } from "../../Logic/Osm/OsmConnection"
import CreateNewNodeAction from "../../Logic/Osm/Actions/CreateNewNodeAction"
import { OsmObject, OsmWay } from "../../Logic/Osm/OsmObject"
import PresetConfig from "../../Models/ThemeConfig/PresetConfig"
import FilteredLayer from "../../Models/FilteredLayer"
import Loc from "../../Models/Loc"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { Changes } from "../../Logic/Osm/Changes"
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline"
import { ElementStorage } from "../../Logic/ElementStorage"
import ConfirmLocationOfPoint from "../NewPoint/ConfirmLocationOfPoint"
import BaseLayer from "../../Models/BaseLayer"
import Loading from "../Base/Loading"
import Hash from "../../Logic/Web/Hash"
import { GlobalFilter } from "../../Logic/State/MapState"
import { WayId } from "../../Models/OsmFeature"
import { Tag } from "../../Logic/Tags/Tag"
import { LoginToggle } from "../Popup/LoginButton"

/*
 * The SimpleAddUI is a single panel, which can have multiple states:
 * - A list of presets which can be added by the user
 * - A 'confirm-selection' button (or alternatively: please enable the layer)
 * - A 'something is wrong - please soom in further'
 * - A 'read your unread messages before adding a point'
 */

export interface PresetInfo extends PresetConfig {
    name: string | BaseUIElement
    icon: () => BaseUIElement
    layerToAddTo: FilteredLayer
    boundsFactor?: 0.25 | number
}

export default class SimpleAddUI extends LoginToggle {
    /**
     *
     * @param isShown
     * @param resetScrollSignal
     * @param filterViewIsOpened
     * @param state
     * @param takeLocationFrom: defaults to state.lastClickLocation. Take this location to add the new point around
     */
    constructor(
        isShown: UIEventSource<boolean>,
        resetScrollSignal: UIEventSource<void>,
        filterViewIsOpened: UIEventSource<boolean>,
        state: {
            featureSwitchIsTesting: UIEventSource<boolean>
            featureSwitchUserbadge: Store<boolean>
            layoutToUse: LayoutConfig
            osmConnection: OsmConnection
            changes: Changes
            allElements: ElementStorage
            LastClickLocation: UIEventSource<{ lat: number; lon: number }>
            featurePipeline: FeaturePipeline
            selectedElement: UIEventSource<any>
            locationControl: UIEventSource<Loc>
            filteredLayers: UIEventSource<FilteredLayer[]>
            featureSwitchFilter: UIEventSource<boolean>
            backgroundLayer: UIEventSource<BaseLayer>
            globalFilters: UIEventSource<GlobalFilter[]>
        },
        takeLocationFrom?: UIEventSource<{ lat: number; lon: number }>
    ) {
        const readYourMessages = new Combine([
            Translations.t.general.readYourMessages.Clone().SetClass("alert"),
            new SubtleButton(Svg.envelope_ui(), Translations.t.general.goToInbox, {
                url: "https://www.openstreetmap.org/messages/inbox",
                newTab: false,
            }),
        ])

        takeLocationFrom = takeLocationFrom ?? state.LastClickLocation
        const selectedPreset = new UIEventSource<PresetInfo>(undefined)
        selectedPreset.addCallback((_) => {
            resetScrollSignal.ping()
        })

        isShown.addCallback((_) => selectedPreset.setData(undefined)) // Clear preset selection when the UI is closed/opened
        takeLocationFrom.addCallback((_) => selectedPreset.setData(undefined))

        const presetsOverview = SimpleAddUI.CreateAllPresetsPanel(selectedPreset, state)

        async function createNewPoint(
            tags: Tag[],
            location: { lat: number; lon: number },
            snapOntoWay?: OsmWay
        ): Promise<void> {
            tags.push(new Tag(Tag.newlyCreated.key, new Date().toISOString()))
            if (snapOntoWay) {
                tags.push(new Tag("_referencing_ways", "way/" + snapOntoWay.id))
            }
            const newElementAction = new CreateNewNodeAction(tags, location.lat, location.lon, {
                theme: state.layoutToUse?.id ?? "unkown",
                changeType: "create",
                snapOnto: snapOntoWay,
            })
            await state.changes.applyAction(newElementAction)
            selectedPreset.setData(undefined)
            isShown.setData(false)
            const selectedFeature = state.allElements.ContainingFeatures.get(
                newElementAction.newElementId
            )
            state.selectedElement.setData(selectedFeature)
            Hash.hash.setData(newElementAction.newElementId)
        }

        const addUi = new VariableUiElement(
            selectedPreset.map((preset) => {
                if (preset === undefined) {
                    return presetsOverview
                }

                function confirm(
                    tags: any[],
                    location: { lat: number; lon: number },
                    snapOntoWayId?: WayId
                ) {
                    if (snapOntoWayId === undefined) {
                        createNewPoint(tags, location, undefined)
                    } else {
                        OsmObject.DownloadObject(snapOntoWayId).addCallbackAndRunD((way) => {
                            createNewPoint(tags, location, way)
                            return true
                        })
                    }
                }

                function cancel() {
                    selectedPreset.setData(undefined)
                }

                const message = Translations.t.general.add.addNew.Subs(
                    { category: preset.name },
                    preset.name["context"]
                )
                return new ConfirmLocationOfPoint(
                    state,
                    filterViewIsOpened,
                    preset,
                    message,
                    takeLocationFrom.data,
                    confirm,
                    cancel,
                    () => {
                        isShown.setData(false)
                    },
                    {
                        cancelIcon: Svg.back_svg(),
                        cancelText: Translations.t.general.add.backToSelect,
                    }
                )
            })
        )

        super(
            new Toggle(
                new Toggle(
                    new Toggle(
                        new Loading(Translations.t.general.add.stillLoading).SetClass("alert"),
                        addUi,
                        state.featurePipeline.runningQuery
                    ),
                    Translations.t.general.add.zoomInFurther.Clone().SetClass("alert"),
                    state.locationControl.map(
                        (loc) => loc.zoom >= Constants.userJourney.minZoomLevelToAddNewPoints
                    )
                ),
                readYourMessages,
                state.osmConnection.userDetails.map(
                    (userdetails: UserDetails) =>
                        userdetails.csCount >=
                            Constants.userJourney.addNewPointWithUnreadMessagesUnlock ||
                        userdetails.unreadMessages == 0
                )
            ),
            Translations.t.general.add.pleaseLogin,
            state
        )
    }

    public static CreateTagInfoFor(
        preset: PresetInfo,
        osmConnection: OsmConnection,
        optionallyLinkToWiki = true
    ) {
        const csCount = osmConnection.userDetails.data.csCount
        return new Toggle(
            Translations.t.general.add.presetInfo
                .Subs({
                    tags: preset.tags
                        .map((t) =>
                            t.asHumanString(
                                optionallyLinkToWiki &&
                                    csCount > Constants.userJourney.tagsVisibleAndWikiLinked,
                                true
                            )
                        )
                        .join("&"),
                })
                .SetStyle("word-break: break-all"),

            undefined,
            osmConnection.userDetails.map(
                (userdetails) => userdetails.csCount >= Constants.userJourney.tagsVisibleAt
            )
        )
    }

    private static CreateAllPresetsPanel(
        selectedPreset: UIEventSource<PresetInfo>,
        state: {
            featureSwitchIsTesting: UIEventSource<boolean>
            filteredLayers: UIEventSource<FilteredLayer[]>
            featureSwitchFilter: UIEventSource<boolean>
            osmConnection: OsmConnection
        }
    ): BaseUIElement {
        const presetButtons = SimpleAddUI.CreatePresetButtons(state, selectedPreset)
        let intro: BaseUIElement = Translations.t.general.add.intro

        let testMode: BaseUIElement = new Toggle(
            Translations.t.general.testing.SetClass("alert"),
            undefined,
            state.featureSwitchIsTesting
        )

        return new Combine([intro, testMode, presetButtons]).SetClass("flex flex-col")
    }

    private static CreatePresetSelectButton(preset: PresetInfo) {
        const title = Translations.t.general.add.addNew.Subs(
            {
                category: preset.name,
            },
            preset.name["context"]
        )
        return new SubtleButton(
            preset.icon(),
            new Combine([
                title.SetClass("font-bold"),
                preset.description?.FirstSentence(),
            ]).SetClass("flex flex-col")
        )
    }

    /*
     * Generates the list with all the buttons.*/
    private static CreatePresetButtons(
        state: {
            filteredLayers: UIEventSource<FilteredLayer[]>
            featureSwitchFilter: UIEventSource<boolean>
            osmConnection: OsmConnection
        },
        selectedPreset: UIEventSource<PresetInfo>
    ): BaseUIElement {
        const allButtons = []
        for (const layer of state.filteredLayers.data) {
            if (layer.isDisplayed.data === false) {
                // The layer is not displayed...
                if (!state.featureSwitchFilter.data) {
                    // ...and we cannot enable the layer control -> we skip, as these presets can never be shown anyway
                    continue
                }

                if (layer.layerDef.name === undefined) {
                    // this layer can never be toggled on in any case, so we skip the presets
                    continue
                }
            }

            const presets = layer.layerDef.presets
            for (const preset of presets) {
                const tags = TagUtils.KVtoProperties(preset.tags ?? [])
                const isSnapping = preset.preciseInput.snapToLayers?.length > 0
                let icon: () => BaseUIElement = () =>
                    layer.layerDef.mapRendering[0]
                        .GenerateLeafletStyle(
                            new ImmutableStore<any>(
                                isSnapping ? tags : { _referencing_ways: ["way/-1"], ...tags }
                            ),
                            false,
                            { noSize: true }
                        )
                        .html.SetClass("w-12 h-12 block relative")
                const presetInfo: PresetInfo = {
                    layerToAddTo: layer,
                    name: preset.title,
                    title: preset.title,
                    icon: icon,
                    preciseInput: preset.preciseInput,
                    ...preset,
                }

                const button = SimpleAddUI.CreatePresetSelectButton(presetInfo)
                button.onClick(() => {
                    selectedPreset.setData(presetInfo)
                })
                allButtons.push(button)
            }
        }
        return new Combine(allButtons).SetClass("flex flex-col")
    }
}
