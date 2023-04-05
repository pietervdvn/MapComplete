/**
 * Asks to add a feature at the last clicked location, at least if zoom is sufficient
 */
import { UIEventSource } from "../../Logic/UIEventSource"
import Translations from "../i18n/Translations"
import BaseUIElement from "../BaseUIElement"
import { VariableUiElement } from "../Base/VariableUIElement"
import Toggle from "../Input/Toggle"
import CreateNewNodeAction from "../../Logic/Osm/Actions/CreateNewNodeAction"
import { OsmObject, OsmWay } from "../../Logic/Osm/OsmObject"
import PresetConfig from "../../Models/ThemeConfig/PresetConfig"
import FilteredLayer from "../../Models/FilteredLayer"
import Loading from "../Base/Loading"
import Hash from "../../Logic/Web/Hash"
import { WayId } from "../../Models/OsmFeature"
import { Tag } from "../../Logic/Tags/Tag"
import { SpecialVisualizationState } from "../SpecialVisualization"
import { Feature } from "geojson"
import { FixedUiElement } from "../Base/FixedUiElement"

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

export default class SimpleAddUI extends Toggle {
    constructor(state: SpecialVisualizationState) {
        const takeLocationFrom = state.mapProperties.lastClickLocation
        const selectedPreset = new UIEventSource<PresetInfo>(undefined)

        takeLocationFrom.addCallback((_) => selectedPreset.setData(undefined))

        async function createNewPoint(
            tags: Tag[],
            location: { lat: number; lon: number },
            snapOntoWay?: OsmWay
        ): Promise<void> {
            if (snapOntoWay) {
                tags.push(new Tag("_referencing_ways", "way/" + snapOntoWay.id))
            }
            const newElementAction = new CreateNewNodeAction(tags, location.lat, location.lon, {
                theme: state.layout?.id ?? "unkown",
                changeType: "create",
                snapOnto: snapOntoWay,
            })
            await state.changes.applyAction(newElementAction)
            selectedPreset.setData(undefined)
            const selectedFeature: Feature = state.indexedFeatures.featuresById.data.get(
                newElementAction.newElementId
            )
            state.selectedElement.setData(selectedFeature)
            Hash.hash.setData(newElementAction.newElementId)
        }

        const addUi = new VariableUiElement(
            selectedPreset.map((preset) => {
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
                return new FixedUiElement("ConfirmLocationOfPoint...") /*ConfirmLocationOfPoint(
                    state,
                    filterViewIsOpened,
                    preset,
                    message,
                    takeLocationFrom.data,
                    confirm,
                    cancel,
                    () => {
                        selectedPreset.setData(undefined)
                    },
                    {
                        cancelIcon: Svg.back_svg(),
                        cancelText: Translations.t.general.add.backToSelect,
                    }
                )*/
            })
        )

        super(
            new Loading(Translations.t.general.add.stillLoading).SetClass("alert"),
            addUi,
            state.dataIsLoading
        )
    }
}
