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
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import {Changes} from "../../Logic/Osm/Changes";
import {ElementStorage} from "../../Logic/ElementStorage";
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline";
import Lazy from "../Base/Lazy";
import ConfirmLocationOfPoint from "../NewPoint/ConfirmLocationOfPoint";
import Img from "../Base/Img";
import {Translation} from "../i18n/Translation";
import FilteredLayer from "../../Models/FilteredLayer";
import SpecialVisualizations from "../SpecialVisualizations";
import {FixedUiElement} from "../Base/FixedUiElement";
import Svg from "../../Svg";
import {Utils} from "../../Utils";
import Minimap from "../Base/Minimap";
import ShowDataLayer from "../ShowDataLayer/ShowDataLayer";
import AllKnownLayers from "../../Customizations/AllKnownLayers";
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource";
import ShowDataMultiLayer from "../ShowDataLayer/ShowDataMultiLayer";
import BaseLayer from "../../Models/BaseLayer";
import ReplaceGeometryAction from "../../Logic/Osm/Actions/ReplaceGeometryAction";
import CreateWayWithPointReuseAction, {MergePointConfig} from "../../Logic/Osm/Actions/CreateWayWithPointReuseAction";
import OsmChangeAction from "../../Logic/Osm/Actions/OsmChangeAction";
import FeatureSource from "../../Logic/FeatureSource/FeatureSource";
import {OsmObject, OsmWay} from "../../Logic/Osm/OsmObject";
import FeaturePipelineState from "../../Logic/State/FeaturePipelineState";
import {DefaultGuiState} from "../DefaultGuiState";
import {PresetInfo} from "../BigComponents/SimpleAddUI";


export interface ImportButtonState {
    description?: Translation;
    image: () => BaseUIElement,
    message: string | BaseUIElement,
    originalTags: UIEventSource<any>,
    newTags: UIEventSource<Tag[]>,
    targetLayer: FilteredLayer,
    feature: any,
    minZoom: number,
    state: {
        backgroundLayer: UIEventSource<BaseLayer>;
        filteredLayers: UIEventSource<FilteredLayer[]>;
        featureSwitchUserbadge: UIEventSource<boolean>;
        featurePipeline: FeaturePipeline;
        allElements: ElementStorage;
        selectedElement: UIEventSource<any>;
        layoutToUse: LayoutConfig,
        osmConnection: OsmConnection,
        changes: Changes,
        locationControl: UIEventSource<{ zoom: number }>
    },
    guiState: { filterViewIsOpened: UIEventSource<boolean> },

    /**
     * SnapSettings for newly imported points
     */
    snapSettings?: {
        snapToLayers: string[],
        snapToLayersMaxDist?: number
    },
    /**
     * Settings if an imported feature must be conflated with an already existing feature
     */
    conflationSettings?: {
        conflateWayId: string
    }

    /**
     * Settings for newly created points which are part of a way: when to snap to already existing points?
     */
    mergeConfigs: MergePointConfig[]
}


abstract class AbstractImportButton implements SpecialVisualizations {
    public readonly funcName: string
    public readonly docs: string
    public readonly args: { name: string, defaultValue?: string, doc: string }[]

    constructor(funcName: string, docsIntro: string, extraArgs: { name: string, doc: string, defaultValue?: string }[]) {
        this.funcName = funcName

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

    abstract constructElement(state: FeaturePipelineState, args: { minzoom: string, max_snap_distance: string, snap_onto_layers: string, icon: string, text: string, tags: string, targetLayer: string },
                              tagSource: UIEventSource<any>, guiState: DefaultGuiState): BaseUIElement;

    constr(state, tagSource, argsRaw, guiState) {

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
        const args = this.parseArgs(argsRaw)

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

        
        /**** THe actual panel showing the import guiding map ****/
        const importGuidingPanel = this.constructElement(state, args, tagSource, guiState)

        // Explanation of the tags that will be applied onto the imported/conflated object
        const newTags = SpecialVisualizations.generateTagsToApply(args.tags, tagSource)
        const appliedTags = new Toggle(
            new VariableUiElement(
                newTags.map(tgs => {
                    const parts = []
                    for (const tag of tgs) {
                        parts.push(tag.key + "=" + tag.value)
                    }
                    const txt = parts.join(" & ")
                    return t0.presetInfo.Subs({tags: txt}).SetClass("subtle")
                })), undefined,
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

        
        
        
        const importFlow = new Toggle(
            new Toggle(
                    new Loading(t0.stillLoading),
                    new Combine([importGuidingPanel, appliedTags]).SetClass("flex flex-col"),
                    state.featurePipeline.runningQuery
            ) ,
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

    private parseArgs(argsRaw: string[]): { minzoom: string, max_snap_distance: string, snap_onto_layers: string, icon: string, text: string, tags: string, targetLayer: string } {
        return Utils.ParseVisArgs(this.args, argsRaw)
    }

    getLayerDependencies(argsRaw: string[]) {
        const args = this.parseArgs(argsRaw)

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
}


export class ImportButtonSpecialViz extends AbstractImportButton {

    constructor() {
        super("import_button",
            "This button will copy the data from an external dataset into OpenStreetMap",
            [{
                name: "snap_onto_layers",
                doc: "If a way of the given layer(s) is closeby, will snap the new point onto this way (similar as preset might snap). To show multiple layers to snap onto, use a `;`-seperated list",
            },
                {
                    name: "max_snap_distance",
                    doc: "If the imported object is a point, the maximum distance that this point will be moved to snap onto a way in an already existing layer (in meters)",
                    defaultValue: "5"
                }]
        )
    }

    canBeImported(feature: any) {
        const type = feature.geometry.type
        return type === "Point" || type === "LineString" || type === "Polygon"
    }

    constructElement(state, args,
                     tagSource, 
                     guiState): BaseUIElement {

        let snapSettings = undefined
        {
            // Configure the snapsettings (if applicable)
        const snapToLayers = args.snap_onto_layers?.trim()?.split(";")?.filter(s => s !== "")
        const snapToLayersMaxDist = Number(args.max_snap_distance ?? 5)
        if (snapToLayers.length > 0) {
            snapSettings = {
                snapToLayers,
                snapToLayersMaxDist
            }
        }
        }
        
        const o =
            {
                state, guiState, image: img,
                feature, newTags, message, minZoom: 18,
                originalTags: tagSource,
                targetLayer,
                snapSettings,
                conflationSettings: undefined,
                mergeConfigs: undefined
            }

        return ImportButton.createConfirmPanel(o, isImported, importClicked),

    }
}

export default class ImportButton {

    public static createConfirmPanel(o: ImportButtonState,
                                     isImported: UIEventSource<boolean>,
                                     importClicked: UIEventSource<boolean>) {
        const geometry = o.feature.geometry
        if (geometry.type === "Point") {
            return new Lazy(() => ImportButton.createConfirmPanelForPoint(o, isImported, importClicked))
        }


        if (geometry.type === "Polygon" && geometry.coordinates.length > 1) {
            return new Lazy(() => ImportButton.createConfirmForMultiPolygon(o, isImported, importClicked))
        }

        if (geometry.type === "Polygon" || geometry.type == "LineString") {
            return new Lazy(() => ImportButton.createConfirmForWay(o, isImported, importClicked))
        }
        console.error("Invalid type to import", geometry.type)
        return new FixedUiElement("Invalid geometry type:" + geometry.type).SetClass("alert")


    }

    public static createConfirmForMultiPolygon(o: ImportButtonState,
                                               isImported: UIEventSource<boolean>,
                                               importClicked: UIEventSource<boolean>): BaseUIElement {
        if (o.conflationSettings !== undefined) {
            return new FixedUiElement("Conflating multipolygons is not supported").SetClass("alert")

        }

        // For every single linear ring, we create a new way
        const createRings: (OsmChangeAction & { getPreview(): Promise<FeatureSource> })[] = []

        for (const coordinateRing of o.feature.geometry.coordinates) {
            createRings.push(new CreateWayWithPointReuseAction(
                // The individual way doesn't receive any tags
                [],
                coordinateRing,
                // @ts-ignore
                o.state,
                o.mergeConfigs
            ))
        }


        return new FixedUiElement("Multipolygon! Here we come").SetClass("alert")
    }

    public static createConfirmForWay(o: ImportButtonState,
                                      isImported: UIEventSource<boolean>,
                                      importClicked: UIEventSource<boolean>): BaseUIElement {

        const confirmationMap = Minimap.createMiniMap({
            allowMoving: false,
            background: o.state.backgroundLayer
        })
        confirmationMap.SetStyle("height: 20rem; overflow: hidden").SetClass("rounded-xl")

        const relevantFeatures = Utils.NoNull([o.feature, o.state.allElements?.ContainingFeatures?.get(o.conflationSettings?.conflateWayId)])
        // SHow all relevant data - including (eventually) the way of which the geometry will be replaced
        new ShowDataMultiLayer({
            leafletMap: confirmationMap.leafletMap,
            enablePopups: false,
            zoomToFeatures: true,
            features: new StaticFeatureSource(relevantFeatures, false),
            allElements: o.state.allElements,
            layers: o.state.filteredLayers
        })

        let action: OsmChangeAction & { getPreview(): Promise<FeatureSource> }

        const changes = o.state.changes
        let confirm: () => Promise<string>
        if (o.conflationSettings !== undefined) {
            // Conflate the way
            action = new ReplaceGeometryAction(
                o.state,
                o.feature,
                o.conflationSettings.conflateWayId,
                {
                    theme: o.state.layoutToUse.id,
                    newTags: o.newTags.data
                }
            )

            confirm = async () => {
                changes.applyAction(action)
                return o.feature.properties.id
            }

        } else {
            // Upload the way to OSM
            const geom = o.feature.geometry
            let coordinates: [number, number][]
            if (geom.type === "LineString") {
                coordinates = geom.coordinates
            } else if (geom.type === "Polygon") {
                coordinates = geom.coordinates[0]
            }

            action = new CreateWayWithPointReuseAction(
                o.newTags.data,
                coordinates,
                // @ts-ignore
                o.state,
                o.mergeConfigs
            )


            confirm = async () => {
                changes.applyAction(action)
                return action.mainObjectId
            }
        }


        action.getPreview().then(changePreview => {
            new ShowDataLayer({
                leafletMap: confirmationMap.leafletMap,
                enablePopups: false,
                zoomToFeatures: false,
                features: changePreview,
                allElements: o.state.allElements,
                layerToShow: AllKnownLayers.sharedLayers.get("conflation")
            })
        })

        const tagsExplanation = new VariableUiElement(o.newTags.map(tagsToApply => {
                const tagsStr = tagsToApply.map(t => t.asHumanString(false, true)).join("&");
                return Translations.t.general.add.import.importTags.Subs({tags: tagsStr});
            }
        )).SetClass("subtle")

        const confirmButton = new SubtleButton(o.image(), new Combine([o.message, tagsExplanation]).SetClass("flex flex-col"))
        confirmButton.onClick(async () => {
            {
                if (isImported.data) {
                    return
                }
                o.originalTags.data["_imported"] = "yes"
                o.originalTags.ping() // will set isImported as per its definition

                const idToSelect = await confirm()

                o.state.selectedElement.setData(o.state.allElements.ContainingFeatures.get(idToSelect))

            }
        })

        const cancel = new SubtleButton(Svg.close_ui(), Translations.t.general.cancel).onClick(() => importClicked.setData(false))


        return new Combine([confirmationMap, confirmButton, cancel]).SetClass("flex flex-col")
    }

    public static createConfirmPanelForPoint(
        o: ImportButtonState,
        isImported: UIEventSource<boolean>,
        importClicked: UIEventSource<boolean>): BaseUIElement {

        async function confirm(tags: any[], location: { lat: number, lon: number }, snapOntoWayId: string) {

            if (isImported.data) {
                return
            }
            o.originalTags.data["_imported"] = "yes"
            o.originalTags.ping() // will set isImported as per its definition
            let snapOnto: OsmObject = undefined
            if (snapOntoWayId !== undefined) {
                snapOnto = await OsmObject.DownloadObjectAsync(snapOntoWayId)
            }
            const newElementAction = new CreateNewNodeAction(tags, location.lat, location.lon, {
                theme: o.state.layoutToUse.id,
                changeType: "import",
                snapOnto: <OsmWay>snapOnto
            })

            await o.state.changes.applyAction(newElementAction)
            o.state.selectedElement.setData(o.state.allElements.ContainingFeatures.get(
                newElementAction.newElementId
            ))
        }

        function cancel() {
            importClicked.setData(false)
        }

        const presetInfo = <PresetInfo>{
            tags: o.newTags.data,
            icon: o.image,
            description: o.description,
            layerToAddTo: o.targetLayer,
            name: o.message,
            title: o.message,
            preciseInput: {
                snapToLayers: o.snapSettings?.snapToLayers,
                maxSnapDistance: o.snapSettings?.snapToLayersMaxDist
            }
        }

        const [lon, lat] = o.feature.geometry.coordinates
        return new ConfirmLocationOfPoint(o.state, o.guiState.filterViewIsOpened, presetInfo, Translations.W(o.message), {
            lon,
            lat
        }, confirm, cancel)

    }


}