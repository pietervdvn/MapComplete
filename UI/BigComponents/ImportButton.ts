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
import {PresetInfo} from "./SimpleAddUI";
import Img from "../Base/Img";
import {Translation} from "../i18n/Translation";
import FilteredLayer from "../../Models/FilteredLayer";
import SpecialVisualizations, {SpecialVisualization} from "../SpecialVisualizations";
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
import CreateWayWithPointReuseAction from "../../Logic/Osm/Actions/CreateWayWithPointReuseAction";
import OsmChangeAction from "../../Logic/Osm/Actions/OsmChangeAction";
import FeatureSource from "../../Logic/FeatureSource/FeatureSource";


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

    snapSettings?: {
        snapToLayers: string[],
        snapToLayersMaxDist?: number
    },
    conflationSettings?: {
        conflateWayId: string
    }
}

export class ImportButtonSpecialViz implements SpecialVisualization {
    funcName = "import_button"
    docs = `This button will copy the data from an external dataset into OpenStreetMap. It is only functional in official themes but can be tested in unofficial themes.

#### Importing a dataset into OpenStreetMap: requirements

If you want to import a dataset, make sure that:

1. The dataset to import has a suitable license
2. The community has been informed of the import
3. All other requirements of the [import guidelines](https://wiki.openstreetmap.org/wiki/Import/Guidelines) have been followed

There are also some technicalities in your theme to keep in mind:

1. The new feature will be added and will flow through the program as any other new point as if it came from OSM.
    This means that there should be a layer which will match the new tags and which will display it.
2. The original feature from your geojson layer will gain the tag '_imported=yes'.
    This should be used to change the appearance or even to hide it (eg by changing the icon size to zero)
3. There should be a way for the theme to detect previously imported points, even after reloading.
    A reference number to the original dataset is an excellent way to do this
4. When importing ways, the theme creator is also responsible of avoiding overlapping ways. 
    
#### Disabled in unofficial themes

The import button can be tested in an unofficial theme by adding \`test=true\` or \`backend=osm-test\` as [URL-paramter](URL_Parameters.md). 
The import button will show up then. If in testmode, you can read the changeset-XML directly in the web console.
In the case that MapComplete is pointed to the testing grounds, the edit will be made on ${OsmConnection.oauth_configs["osm-test"].url}


#### Specifying which tags to copy or add

The argument \`tags\` of the import button takes a \`;\`-seperated list of tags to add.

${Utils.Special_visualizations_tagsToApplyHelpText}

  
`
    args = [
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
        {
            name: "minzoom",
            doc: "How far the contributor must zoom in before being able to import the point",
            defaultValue: "18"
        }, {
            name: "Snap onto layer(s)/replace geometry with this other way",
            doc: " - If the value corresponding with this key starts with 'way/' and the feature is a LineString or Polygon, the original OSM-way geometry will be changed to match the new geometry\n" +
                " - If a way of the given layer(s) is closeby, will snap the new point onto this way (similar as preset might snap). To show multiple layers to snap onto, use a `;`-seperated list",
        }, {
            name: "snap max distance",
            doc: "The maximum distance that this point will move to snap onto a layer (in meters)",
            defaultValue: "5"
        }]

    constr(state, tagSource, args, guiState) {
        if (!state.layoutToUse.official && !(state.featureSwitchIsTesting.data || state.osmConnection._oauth_config.url === OsmConnection.oauth_configs["osm-test"].url)) {
            return new Combine([new FixedUiElement("The import button is disabled for unofficial themes to prevent accidents.").SetClass("alert"),
                new FixedUiElement("To test, add <b>test=true</b> or <b>backend=osm-test</b> to the URL. The changeset will be printed in the console. Please open a PR to officialize this theme to actually enable the import button.")])
        }
        const newTags = SpecialVisualizations.generateTagsToApply(args[1], tagSource)
        const id = tagSource.data.id;
        const feature = state.allElements.ContainingFeatures.get(id)
        let minZoom = args[4] == "" ? 18 : Number(args[4])
        if (isNaN(minZoom)) {
            console.warn("Invalid minzoom:", minZoom)
            minZoom = 18
        }
        const message = args[2]
        const imageUrl = args[3]
        let img: () => BaseUIElement
        const targetLayer: FilteredLayer = state.filteredLayers.data.filter(fl => fl.layerDef.id === args[0])[0]

        if (imageUrl !== undefined && imageUrl !== "") {
            img = () => new Img(imageUrl)
        } else {
            img = () => Svg.add_ui()
        }

        let snapSettings = undefined
        let conflationSettings = undefined
        const possibleWayId = tagSource.data[args[5]]
        if (possibleWayId?.startsWith("way/")) {
            // This is a conflation
            conflationSettings = {
                conflateWayId: possibleWayId
            }
        } else {


            const snapToLayers = args[5]?.split(";").filter(s => s !== "")
            const snapToLayersMaxDist = Number(args[6] ?? 6)

            if (targetLayer === undefined) {
                const e = "Target layer not defined: error in import button for theme: " + state.layoutToUse.id + ": layer " + args[0] + " not found"
                console.error(e)
                return new FixedUiElement(e).SetClass("alert")
            }
            snapSettings = {
                snapToLayers,
                snapToLayersMaxDist
            }
        }

        return new ImportButton(
            {
                state, guiState, image: img,
                feature, newTags, message, minZoom,
                originalTags: tagSource,
                targetLayer,
                snapSettings,
                conflationSettings
            }
        );
    }
}

export default class ImportButton extends Toggle {

    constructor(o: ImportButtonState) {
        const t = Translations.t.general.add;
        const isImported = o.originalTags.map(tags => tags._imported === "yes")
        const appliedTags = new Toggle(
            new VariableUiElement(
                o.newTags.map(tgs => {
                    const parts = []
                    for (const tag of tgs) {
                        parts.push(tag.key + "=" + tag.value)
                    }
                    const txt = parts.join(" & ")
                    return t.presetInfo.Subs({tags: txt}).SetClass("subtle")
                })), undefined,
            o.state.osmConnection.userDetails.map(ud => ud.csCount >= Constants.userJourney.tagsVisibleAt)
        )
        const button = new SubtleButton(o.image(), o.message)

        o.minZoom = Math.max(16, o.minZoom ?? 19)


        const withLoadingCheck = new Toggle(new Toggle(
                new Loading(t.stillLoading.Clone()),
                new Combine([button, appliedTags]).SetClass("flex flex-col"),
                o.state.featurePipeline.runningQuery
            ), t.zoomInFurther.Clone(),
            o.state.locationControl.map(l => l.zoom >= o.minZoom)
        )
        const importButton = new Toggle(t.hasBeenImported, withLoadingCheck, isImported)


        const importClicked = new UIEventSource(false);
        const importFlow = new Toggle(
            ImportButton.createConfirmPanel(o, isImported, importClicked),
            importButton,
            importClicked
        )

        button.onClick(() => {
            importClicked.setData(true);
        })


        const pleaseLoginButton =
            new Toggle(t.pleaseLogin.Clone()
                    .onClick(() => o.state.osmConnection.AttemptLogin())
                    .SetClass("login-button-friendly"),
                undefined,
                o.state.featureSwitchUserbadge)


        super(new Toggle(importFlow,
                pleaseLoginButton,
                o.state.osmConnection.isLoggedIn
            ),
            t.wrongType,
            new UIEventSource(ImportButton.canBeImported(o.feature))
        )
    }

    public static createConfirmPanel(o: ImportButtonState,
                                     isImported: UIEventSource<boolean>,
                                     importClicked: UIEventSource<boolean>) {
        const geometry = o.feature.geometry
        if (geometry.type === "Point") {
            return new Lazy(() => ImportButton.createConfirmPanelForPoint(o, isImported, importClicked))
        }


        if (geometry.type === "Polygon" || geometry.type == "LineString") {
            return new Lazy(() => ImportButton.createConfirmForWay(o, isImported, importClicked))
        }
        console.error("Invalid type to import", geometry.type)
        return new FixedUiElement("Invalid geometry type:" + geometry.type).SetClass("alert")


    }

    public static createConfirmForWay(o: ImportButtonState,
                                      isImported: UIEventSource<boolean>,
                                      importClicked: UIEventSource<boolean>): BaseUIElement {

        const confirmationMap = Minimap.createMiniMap({
            allowMoving: true,
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
                [{
                    withinRangeOfM: 1,
                    ifMatches: new Tag("_is_part_of_building", "true"),
                    mode: "move_osm_point"
                }]
            )


            confirm = async () => {
                changes.applyAction(action)
                return undefined
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
                return Translations.t.general.add.importTags.Subs({tags: tagsStr});
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

        async function confirm() {
            if (isImported.data) {
                return
            }
            o.originalTags.data["_imported"] = "yes"
            o.originalTags.ping() // will set isImported as per its definition
            const geometry = o.feature.geometry
            const lat = geometry.coordinates[1]
            const lon = geometry.coordinates[0];
            const newElementAction = new CreateNewNodeAction(o.newTags.data, lat, lon, {
                theme: o.state.layoutToUse.id,
                changeType: "import"
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


    private static canBeImported(feature: any) {
        const type = feature.geometry.type
        return type === "Point" || type === "LineString" || (type === "Polygon" && feature.geometry.coordinates.length === 1)
    }
}