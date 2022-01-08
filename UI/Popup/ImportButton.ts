import BaseUIElement from "../BaseUIElement";
import {SubtleButton} from "../Base/SubtleButton";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import {VariableUiElement} from "../Base/VariableUIElement";
import Translations from "../i18n/Translations";
import Constants from "../../Models/Constants";
import Toggle from "../Input/Toggle";
import CreateNewNodeAction from "../../Logic/Osm/Actions/CreateNewNodeAction";
import Loading from "../Base/Loading";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import Lazy from "../Base/Lazy";
import ConfirmLocationOfPoint from "../NewPoint/ConfirmLocationOfPoint";
import Img from "../Base/Img";
import FilteredLayer from "../../Models/FilteredLayer";
import SpecialVisualizations from "../SpecialVisualizations";
import {FixedUiElement} from "../Base/FixedUiElement";
import Svg from "../../Svg";
import {Utils} from "../../Utils";
import Minimap from "../Base/Minimap";
import ShowDataLayer from "../ShowDataLayer/ShowDataLayer";
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource";
import ShowDataMultiLayer from "../ShowDataLayer/ShowDataMultiLayer";
import CreateWayWithPointReuseAction, {MergePointConfig} from "../../Logic/Osm/Actions/CreateWayWithPointReuseAction";
import OsmChangeAction, {OsmCreateAction} from "../../Logic/Osm/Actions/OsmChangeAction";
import FeatureSource from "../../Logic/FeatureSource/FeatureSource";
import {OsmObject, OsmWay} from "../../Logic/Osm/OsmObject";
import FeaturePipelineState from "../../Logic/State/FeaturePipelineState";
import {DefaultGuiState} from "../DefaultGuiState";
import {PresetInfo} from "../BigComponents/SimpleAddUI";
import {TagUtils} from "../../Logic/Tags/TagUtils";
import {And} from "../../Logic/Tags/And";
import ReplaceGeometryAction from "../../Logic/Osm/Actions/ReplaceGeometryAction";
import CreateMultiPolygonWithPointReuseAction from "../../Logic/Osm/Actions/CreateMultiPolygonWithPointReuseAction";
import {Tag} from "../../Logic/Tags/Tag";
import TagApplyButton from "./TagApplyButton";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import * as conflation_json from "../../assets/layers/conflation/conflation.json";
import {GeoOperations} from "../../Logic/GeoOperations";


abstract class AbstractImportButton implements SpecialVisualizations {
    public readonly funcName: string
    public readonly docs: string
    public readonly args: { name: string, defaultValue?: string, doc: string }[]
    private readonly showRemovedTags: boolean;

    constructor(funcName: string, docsIntro: string, extraArgs: { name: string, doc: string, defaultValue?: string }[], showRemovedTags = true) {
        this.funcName = funcName
        this.showRemovedTags = showRemovedTags;

        this.docs = `${docsIntro}

Note that the contributor must zoom to at least zoomlevel 18 to be able to use this functionality.
It is only functional in official themes, but can be tested in unoffical themes.

#### Specifying which tags to copy or add

The argument \`tags\` of the import button takes a \`;\`-seperated list of tags to add.

${Utils.Special_visualizations_tagsToApplyHelpText}
${Utils.special_visualizations_importRequirementDocs}
`
        this.args = [
            {
                name: "targetLayer",
                doc: "The id of the layer where this point should end up. This is not very strict, it will simply result in checking that this layer is shown preventing possible duplicate elements"
            },
            {
                name: "tags",
                doc: "The tags to add onto the new object - see specification above"
            },
            {
                name: "text",
                doc: "The text to show on the button",
                defaultValue: "Import this data into OpenStreetMap"
            },
            {
                name: "icon",
                doc: "A nice icon to show in the button",
                defaultValue: "./assets/svg/addSmall.svg"
            },
            ...extraArgs]

    };

    abstract constructElement(state: FeaturePipelineState,
                              args: { max_snap_distance: string, snap_onto_layers: string, icon: string, text: string, tags: string, newTags: UIEventSource<any>, targetLayer: string },
                              tagSource: UIEventSource<any>,
                              guiState: DefaultGuiState,
                              feature: any,
                              onCancelClicked: () => void): BaseUIElement;


    constr(state, tagSource, argsRaw, guiState) {
        const self = this;
        /**
         * Some generic import button pre-validation is implemented here:
         * - Are we logged in?
         * - Did the user zoom in enough?
         * ...
         *
         * The actual import flow (showing the conflation map, special cases) are handled in 'constructElement'
         */

        const t = Translations.t.general.add.import;
        const t0 = Translations.t.general.add;
        const args = this.parseArgs(argsRaw, tagSource)

        {
            // Some initial validation
            if (!state.layoutToUse.official && !(state.featureSwitchIsTesting.data || state.osmConnection._oauth_config.url === OsmConnection.oauth_configs["osm-test"].url)) {
                return new Combine([t.officialThemesOnly.SetClass("alert"), t.howToTest])
            }
            const targetLayer: FilteredLayer = state.filteredLayers.data.filter(fl => fl.layerDef.id === args.targetLayer)[0]
            if (targetLayer === undefined) {
                const e = `Target layer not defined: error in import button for theme: ${state.layoutToUse.id}: layer ${args.targetLayer} not found`
                console.error(e)
                return new FixedUiElement(e).SetClass("alert")
            }
        }


        let img: BaseUIElement
        if (args.icon !== undefined && args.icon !== "") {
            img = new Img(args.icon)
        } else {
            img = Svg.add_ui()
        }
        const inviteToImportButton = new SubtleButton(img, args.text)

        const id = tagSource.data.id;
        const feature = state.allElements.ContainingFeatures.get(id)


        // Explanation of the tags that will be applied onto the imported/conflated object
        const newTags = TagApplyButton.generateTagsToApply(args.tags, tagSource)
        const appliedTags = new Toggle(
            new VariableUiElement(
                newTags.map(tgs => {
                    const filteredTags = tgs.filter(tg => self.showRemovedTags || (tg.value ?? "") !== "")
                    const asText = new And(filteredTags)
                        .asHumanString(true, true, {})

                    return t0.presetInfo.Subs({tags: asText}).SetClass("subtle");
                })),
            undefined,
            state.osmConnection.userDetails.map(ud => ud.csCount >= Constants.userJourney.tagsVisibleAt)
        )


        const importClicked = new UIEventSource(false);
        inviteToImportButton.onClick(() => {
            importClicked.setData(true);
        })


        const pleaseLoginButton = new Toggle(t0.pleaseLogin
                .onClick(() => state.osmConnection.AttemptLogin())
                .SetClass("login-button-friendly"),
            undefined,
            state.featureSwitchUserbadge)


        const isImported = tagSource.map(tags => tags._imported === "yes")


        /**** THe actual panel showing the import guiding map ****/
        const importGuidingPanel = this.constructElement(state, args, tagSource, guiState, feature, () => importClicked.setData(false))


        const importFlow = new Toggle(
            new Toggle(
                new Loading(t0.stillLoading),
                new Combine([importGuidingPanel, appliedTags]).SetClass("flex flex-col"),
                state.featurePipeline.runningQuery
            ),
            inviteToImportButton,
            importClicked
        );

        return new Toggle(
            new Toggle(
                new Toggle(
                    new Toggle(
                        t.hasBeenImported,
                        importFlow,
                        isImported
                    ),
                    t.zoomInMore,
                    state.locationControl.map(l => l.zoom >= 18)
                ),
                pleaseLoginButton,
                state.osmConnection.isLoggedIn
            ),
            t.wrongType,
            new UIEventSource(this.canBeImported(feature)))

    }

    private parseArgs(argsRaw: string[], originalFeatureTags: UIEventSource<any>): { minzoom: string, max_snap_distance: string, snap_onto_layers: string, icon: string, text: string, tags: string, targetLayer: string, newTags: UIEventSource<Tag[]> } {
        const baseArgs = Utils.ParseVisArgs(this.args, argsRaw)
        if (originalFeatureTags !== undefined) {
            baseArgs["newTags"] = TagApplyButton.generateTagsToApply(baseArgs.tags, originalFeatureTags)
        }
        return baseArgs
    }

    getLayerDependencies(argsRaw: string[]) {
        const args = this.parseArgs(argsRaw, undefined)

        const dependsOnLayers: string[] = []

        // The target layer
        dependsOnLayers.push(args.targetLayer)

        const snapOntoLayers = args.snap_onto_layers?.trim() ?? "";
        if (snapOntoLayers !== "") {
            dependsOnLayers.push(...snapOntoLayers.split(";"))
        }

        return dependsOnLayers
    }


    protected abstract canBeImported(feature: any)

    protected createConfirmPanelForWay(
        state: FeaturePipelineState,
        args: { max_snap_distance: string, snap_onto_layers: string, icon: string, text: string, newTags: UIEventSource<Tag[]>, targetLayer: string },
        feature: any,
        originalFeatureTags: UIEventSource<any>,
        action: (OsmChangeAction & { getPreview(): Promise<FeatureSource>, newElementId?: string }),
        onCancel: () => void): BaseUIElement {
        const self = this;
        const confirmationMap = Minimap.createMiniMap({
            allowMoving: state.featureSwitchIsDebugging.data ?? false,
            background: state.backgroundLayer
        })
        confirmationMap.SetStyle("height: 20rem; overflow: hidden").SetClass("rounded-xl")

        // SHow all relevant data - including (eventually) the way of which the geometry will be replaced
        new ShowDataMultiLayer({
            leafletMap: confirmationMap.leafletMap,
            enablePopups: false,
            zoomToFeatures: true,
            features: new StaticFeatureSource([feature], false),
            allElements: state.allElements,
            layers: state.filteredLayers
        })


        action.getPreview().then(changePreview => {
            new ShowDataLayer({
                leafletMap: confirmationMap.leafletMap,
                enablePopups: false,
                zoomToFeatures: false,
                features: changePreview,
                allElements: state.allElements,
                layerToShow: new LayerConfig(conflation_json, "all_known_layers", true)
            })
        })

        const tagsExplanation = new VariableUiElement(args.newTags.map(tagsToApply => {
                const filteredTags = tagsToApply.filter(t => self.showRemovedTags || (t.value ?? "") !== "")
                const tagsStr = new And(filteredTags).asHumanString(false, true, {})
                return Translations.t.general.add.import.importTags.Subs({tags: tagsStr});
            }
        )).SetClass("subtle")

        const confirmButton = new SubtleButton(new Img(args.icon), new Combine([args.text, tagsExplanation]).SetClass("flex flex-col"))
        confirmButton.onClick(async () => {
            {
                originalFeatureTags.data["_imported"] = "yes"
                originalFeatureTags.ping() // will set isImported as per its definition
                state.changes.applyAction(action)
                state.selectedElement.setData(state.allElements.ContainingFeatures.get(action.newElementId ?? action.mainObjectId))

            }
        })

        const cancel = new SubtleButton(Svg.close_ui(), Translations.t.general.cancel).onClick(onCancel)
        return new Combine([confirmationMap, confirmButton, cancel]).SetClass("flex flex-col")
    }
}

export class ConflateButton extends AbstractImportButton {

    constructor() {
        super("conflate_button", "This button will modify the geometry of an existing OSM way to match the specified geometry. This can conflate OSM-ways with LineStrings and Polygons (only simple polygons with one single ring). An attempt is made to move points with special values to a decent new location (e.g. entrances)",
            [{
                name: "way_to_conflate",
                doc: "The key, of which the corresponding value is the id of the OSM-way that must be conflated; typically a calculatedTag"
            }]
        );
    }

    protected canBeImported(feature: any) {
        return feature.geometry.type === "LineString" || (feature.geometry.type === "Polygon" && feature.geometry.coordinates.length === 1)
    }

    getLayerDependencies(argsRaw: string[]): string[] {
        const deps = super.getLayerDependencies(argsRaw);
        // Force 'type_node' as dependency
        deps.push("type_node")
        return deps;
    }

    constructElement(state: FeaturePipelineState,
                     args: { max_snap_distance: string; snap_onto_layers: string; icon: string; text: string; tags: string; newTags: UIEventSource<Tag[]>; targetLayer: string },
                     tagSource: UIEventSource<any>, guiState: DefaultGuiState, feature: any, onCancelClicked: () => void): BaseUIElement {

        const nodesMustMatch = args.snap_onto_layers?.split(";")?.map((tag, i) => TagUtils.Tag(tag, "TagsSpec for import button " + i))

        const mergeConfigs = []
        if (nodesMustMatch !== undefined && nodesMustMatch.length > 0) {
            const mergeConfig: MergePointConfig = {
                mode: args["point_move_mode"] == "move_osm" ? "move_osm_point" : "reuse_osm_point",
                ifMatches: new And(nodesMustMatch),
                withinRangeOfM: Number(args.max_snap_distance)
            }
            mergeConfigs.push(mergeConfig)
        }


        const key = args["way_to_conflate"]
        const wayToConflate = tagSource.data[key]
        feature = GeoOperations.removeOvernoding(feature);
        const action = new ReplaceGeometryAction(
            state,
            feature,
            wayToConflate,
            {
                theme: state.layoutToUse.id,
                newTags: args.newTags.data
            }
        )

        return this.createConfirmPanelForWay(
            state,
            args,
            feature,
            tagSource,
            action,
            onCancelClicked
        )
    }

}

export class ImportWayButton extends AbstractImportButton {

    constructor() {
        super("import_way_button",
            "This button will copy the data from an external dataset into OpenStreetMap",
            [
                {
                    name: "snap_to_point_if",
                    doc: "Points with the given tags will be snapped to or moved",
                },
                {
                    name: "max_snap_distance",
                    doc: "If the imported object is a LineString or (Multi)Polygon, already existing OSM-points will be reused to construct the geometry of the newly imported way",
                    defaultValue: "5"
                },
                {
                    name: "move_osm_point_if",
                    doc: "Moves the OSM-point to the newly imported point if these conditions are met",
                }, {
                name: "max_move_distance",
                doc: "If an OSM-point is moved, the maximum amount of meters it is moved. Capped on 20m",
                defaultValue: "1"
            }, {
                name: "snap_onto_layers",
                doc: "If no existing nearby point exists, but a line of a specified layer is closeby, snap to this layer instead",

            }, {
                name: "snap_to_layer_max_distance",
                doc: "Distance to distort the geometry to snap to this layer",
                defaultValue: "0.1"
            }],
            false
        )
    }

    canBeImported(feature: any) {
        const type = feature.geometry.type
        return type === "LineString" || type === "Polygon"
    }

    getLayerDependencies(argsRaw: string[]): string[] {
        const deps = super.getLayerDependencies(argsRaw);
        deps.push("type_node")
        return deps
    }

    constructElement(state, args,
                     originalFeatureTags,
                     guiState,
                     feature,
                     onCancel): BaseUIElement {


        const geometry = feature.geometry

        if (!(geometry.type == "LineString" || geometry.type === "Polygon")) {
            console.error("Invalid type to import", geometry.type)
            return new FixedUiElement("Invalid geometry type:" + geometry.type).SetClass("alert")
        }


        // Upload the way to OSM
        const geom = feature.geometry
        let coordinates: [number, number][]
        if (geom.type === "LineString") {
            coordinates = geom.coordinates
        } else if (geom.type === "Polygon") {
            coordinates = geom.coordinates[0]
        }

        const nodesMustMatch = args["snap_to_point_if"]?.split(";")?.map((tag, i) => TagUtils.Tag(tag, "TagsSpec for import button " + i))

        const mergeConfigs = []
        if (nodesMustMatch !== undefined && nodesMustMatch.length > 0) {
            const mergeConfig: MergePointConfig = {
                mode: "reuse_osm_point",
                ifMatches: new And(nodesMustMatch),
                withinRangeOfM: Number(args.max_snap_distance)
            }
            mergeConfigs.push(mergeConfig)
        }


        const moveOsmPointIfTags = args["move_osm_point_if"]?.split(";")?.map((tag, i) => TagUtils.Tag(tag, "TagsSpec for import button " + i))

        if (nodesMustMatch !== undefined && moveOsmPointIfTags.length > 0) {
            const moveDistance = Math.min(20, Number(args["max_move_distance"]))
            const mergeConfig: MergePointConfig = {
                mode: "move_osm_point",
                ifMatches: new And(moveOsmPointIfTags),
                withinRangeOfM: moveDistance
            }
            mergeConfigs.push(mergeConfig)
        }

        let action: OsmCreateAction & { getPreview(): Promise<FeatureSource> };

        const coors = feature.geometry.coordinates
        if (feature.geometry.type === "Polygon" && coors.length > 1) {
            const outer = coors[0]
            const inner = [...coors]
            inner.splice(0, 1)
            action = new CreateMultiPolygonWithPointReuseAction(
                args.newTags.data,
                outer,
                inner,
                state,
                mergeConfigs,
                "import"
            )
        } else {

            action = new CreateWayWithPointReuseAction(
                args.newTags.data,
                coordinates,
                state,
                mergeConfigs
            )
        }


        return this.createConfirmPanelForWay(
            state,
            args,
            feature,
            originalFeatureTags,
            action,
            onCancel
        )

    }
}

export class ImportPointButton extends AbstractImportButton {

    constructor() {
        super("import_button",
            "This button will copy the point from an external dataset into OpenStreetMap",
            [{
                name: "snap_onto_layers",
                doc: "If a way of the given layer(s) is closeby, will snap the new point onto this way (similar as preset might snap). To show multiple layers to snap onto, use a `;`-seperated list"
            },
                {
                    name: "max_snap_distance",
                    doc: "The maximum distance that the imported point will be moved to snap onto a way in an already existing layer (in meters). This is previewed to the contributor, similar to the 'add new point'-action of MapComplete",
                    defaultValue: "5"
                }],
            false
        )
    }

    canBeImported(feature: any) {
        return feature.geometry.type === "Point"
    }

    getLayerDependencies(argsRaw: string[]): string[] {
        const deps = super.getLayerDependencies(argsRaw);
        const layerSnap = argsRaw["snap_onto_layers"] ?? ""
        if (layerSnap === "") {
            return deps
        }

        deps.push(...layerSnap.split(";"))
        return deps
    }

    private static createConfirmPanelForPoint(
        args: { max_snap_distance: string, snap_onto_layers: string, icon: string, text: string, newTags: UIEventSource<any>, targetLayer: string },
        state: FeaturePipelineState,
        guiState: DefaultGuiState,
        originalFeatureTags: UIEventSource<any>,
        feature: any,
        onCancel: () => void,
        close: () => void): BaseUIElement {

        async function confirm(tags: any[], location: { lat: number, lon: number }, snapOntoWayId: string) {

            originalFeatureTags.data["_imported"] = "yes"
            originalFeatureTags.ping() // will set isImported as per its definition
            let snapOnto: OsmObject = undefined
            if (snapOntoWayId !== undefined) {
                snapOnto = await OsmObject.DownloadObjectAsync(snapOntoWayId)
            }
            const newElementAction = new CreateNewNodeAction(tags, location.lat, location.lon, {
                theme: state.layoutToUse.id,
                changeType: "import",
                snapOnto: <OsmWay>snapOnto
            })

            await state.changes.applyAction(newElementAction)
            state.selectedElement.setData(state.allElements.ContainingFeatures.get(
                newElementAction.newElementId
            ))
        }

        const presetInfo = <PresetInfo>{
            tags: args.newTags.data,
            icon: () => new Img(args.icon),
            description: Translations.WT(args.text),
            layerToAddTo: state.filteredLayers.data.filter(l => l.layerDef.id === args.targetLayer)[0],
            name: args.text,
            title: Translations.WT(args.text),
            preciseInput: {
                snapToLayers: args.snap_onto_layers?.split(";"),
                maxSnapDistance: Number(args.max_snap_distance)
            }
        }

        const [lon, lat] = feature.geometry.coordinates
        return new ConfirmLocationOfPoint(state, guiState.filterViewIsOpened, presetInfo, Translations.W(args.text), {
            lon,
            lat
        }, confirm, onCancel, close)

    }

    constructElement(state, args,
                     originalFeatureTags,
                     guiState,
                     feature,
                     onCancel: () => void): BaseUIElement {


        const geometry = feature.geometry

        if (geometry.type === "Point") {
            return new Lazy(() => ImportPointButton.createConfirmPanelForPoint(
                args,
                state,
                guiState,
                originalFeatureTags,
                feature,
                onCancel,
                () => {
                    // Close the current popup
                    state.selectedElement.setData(undefined)
                }
            ))
        }


        console.error("Invalid type to import", geometry.type)
        return new FixedUiElement("Invalid geometry type:" + geometry.type).SetClass("alert")

    }


}