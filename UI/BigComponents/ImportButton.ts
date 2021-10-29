import BaseUIElement from "../BaseUIElement";
import {SubtleButton} from "../Base/SubtleButton";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import {VariableUiElement} from "../Base/VariableUIElement";
import Translations from "../i18n/Translations";
import Constants from "../../Models/Constants";
import Toggle from "../Input/Toggle";
import CreateNewNodeAction from "../../Logic/Osm/Actions/CreateNewNodeAction";
import {Tag} from "../../Logic/Tags/Tag";
import Loading from "../Base/Loading";
import OsmChangeAction from "../../Logic/Osm/Actions/OsmChangeAction";
import CreateNewWayAction from "../../Logic/Osm/Actions/CreateNewWayAction";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import {Changes} from "../../Logic/Osm/Changes";
import {ElementStorage} from "../../Logic/ElementStorage";
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline";

export default class ImportButton extends Toggle {
    constructor(imageUrl: string | BaseUIElement, 
                message: string | BaseUIElement,
                originalTags: UIEventSource<any>,
                newTags: UIEventSource<Tag[]>,
                feature: any,
                minZoom: number,
                state: {
                    featureSwitchUserbadge: UIEventSource<boolean>;
                    featurePipeline: FeaturePipeline;
                    allElements: ElementStorage;
                    selectedElement: UIEventSource<any>;
                    layoutToUse: LayoutConfig,
                    osmConnection: OsmConnection,
                    changes: Changes,
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
            state.osmConnection.userDetails.map(ud => ud.csCount >= Constants.userJourney.tagsVisibleAt)
        )
        const button = new SubtleButton(imageUrl, message)

        minZoom = Math.max(16, minZoom ?? 19)

        button.onClick(async () => {
            if (isImported.data) {
                return
            }
            originalTags.data["_imported"] = "yes"
            originalTags.ping() // will set isImported as per its definition
            const newElementAction = ImportButton.createAddActionForFeature(newTags.data, feature, state.layoutToUse.id)
            await state.changes.applyAction(newElementAction)
            state.selectedElement.setData(state.allElements.ContainingFeatures.get(
                newElementAction.newElementId
            ))
            console.log("Did set selected element to", state.allElements.ContainingFeatures.get(
                newElementAction.newElementId
            ))


        })

        const withLoadingCheck = new Toggle(new Toggle(
                new Loading(t.stillLoading.Clone()),
                new Combine([button, appliedTags]).SetClass("flex flex-col"),
                state.featurePipeline.runningQuery
            ), t.zoomInFurther.Clone(),
            state.locationControl.map(l => l.zoom >= minZoom)
        )
        const importButton = new Toggle(t.hasBeenImported, withLoadingCheck, isImported)

        const pleaseLoginButton =
            new Toggle(t.pleaseLogin.Clone()
                    .onClick(() => state.osmConnection.AttemptLogin())
                    .SetClass("login-button-friendly"),
                undefined,
                state.featureSwitchUserbadge)


        super(new Toggle(importButton,
                pleaseLoginButton,
                state.osmConnection.isLoggedIn
            ),
            t.wrongType,
            new UIEventSource(ImportButton.canBeImported(feature))
        )
    }


    private static canBeImported(feature: any) {
        const type = feature.geometry.type
        return type === "Point" || type === "LineString" || (type === "Polygon" && feature.geometry.coordinates.length === 1)
    }

    private static createAddActionForFeature(newTags: Tag[], feature: any, theme: string): OsmChangeAction & { newElementId: string } {
        const geometry = feature.geometry
        const type = geometry.type
        if (type === "Point") {
            const lat = geometry.coordinates[1]
            const lon = geometry.coordinates[0];
            return new CreateNewNodeAction(newTags, lat, lon, {
                theme,
                changeType: "import"
            })
        }

        if (type === "LineString") {
            return new CreateNewWayAction(
                newTags,
                geometry.coordinates.map(coor => ({lon: coor[0], lat: coor[1]})),
                {
                    theme
                }
            )
        }

        if (type === "Polygon") {
            return new CreateNewWayAction(
                newTags,
                geometry.coordinates[0].map(coor => ({lon: coor[0], lat: coor[1]})),
                {
                    theme
                }
            )
        }

        return undefined;

    }
}