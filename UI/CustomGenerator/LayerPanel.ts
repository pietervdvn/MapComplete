import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LayoutConfigJson} from "../../Customizations/JSON/LayoutConfigJson";
import SettingsTable from "./SettingsTable";
import SingleSetting from "./SingleSetting";
import {SubtleButton} from "../Base/SubtleButton";
import Combine from "../Base/Combine";
import {TextField} from "../Input/TextField";
import {InputElement} from "../Input/InputElement";
import MultiLingualTextFields from "../Input/MultiLingualTextFields";
import CheckBox from "../Input/CheckBox";
import AndOrTagInput from "../Input/AndOrTagInput";
import TagRenderingPanel from "./TagRenderingPanel";
import {DropDown} from "../Input/DropDown";
import {TagRenderingConfigJson} from "../../Customizations/JSON/TagRenderingConfigJson";
import {MultiInput} from "../Input/MultiInput";
import {LayerConfigJson} from "../../Customizations/JSON/LayerConfigJson";
import PresetInputPanel from "./PresetInputPanel";
import UserDetails from "../../Logic/Osm/OsmConnection";
import {FixedUiElement} from "../Base/FixedUiElement";
import ValidatedTextField from "../Input/ValidatedTextField";
import Svg from "../../Svg";
import Constants from "../../Models/Constants";

/**
 * Shows the configuration for a single layer
 */
export default class LayerPanel extends UIElement {
    private readonly _config: UIEventSource<LayoutConfigJson>;

    private readonly settingsTable: UIElement;
    private readonly mapRendering: UIElement;

    private readonly deleteButton: UIElement;

    public readonly titleRendering: UIElement;

    public readonly selectedTagRendering: UIEventSource<TagRenderingPanel>
        = new UIEventSource<TagRenderingPanel>(undefined);
    private tagRenderings: UIElement;
    private presetsPanel: UIElement;

    constructor(config: UIEventSource<LayoutConfigJson>,
                languages: UIEventSource<string[]>,
                index: number,
                currentlySelected: UIEventSource<SingleSetting<any>>,
                userDetails: UserDetails) {
        super();
        this._config = config;
        this.mapRendering = this.setupRenderOptions(config, languages, index, currentlySelected, userDetails);

        const actualDeleteButton = new SubtleButton(
            Svg.delete_icon_ui(),
            "Yes, delete this layer"
        ).onClick(() => {
            config.data.layers.splice(index, 1);
            config.ping();
        });

        this.deleteButton = new CheckBox(
            new Combine(
                [
                    "<h3>Confirm layer deletion</h3>",
                    new SubtleButton(
                        Svg.close_ui(),
                        "No, don't delete"
                    ),
                    "<span class='alert'>Deleting a layer can not be undone!</span>",
                    actualDeleteButton
                ]
            ),
            new SubtleButton(
                Svg.delete_icon_ui(),
                "Remove this layer"
            )
        )

        function setting(input: InputElement<any>, path: string | string[], name: string, description: string | UIElement): SingleSetting<any> {
            let pathPre = ["layers", index];
            if (typeof (path) === "string") {
                pathPre.push(path);
            } else {
                pathPre = pathPre.concat(path);
            }

            return new SingleSetting<any>(config, input, pathPre, name, description);
        }


        this.settingsTable = new SettingsTable([
                setting(new TextField({placeholder:"Layer id"}), "id", "Id", "An identifier for this layer<br/>This should be a simple, lowercase, human readable string that is used to identify the layer."),
                setting(new MultiLingualTextFields(languages), "name", "Name", "The human-readable name of this layer<br/>Used in the layer control panel and the 'Personal theme'"),
                setting(new MultiLingualTextFields(languages, true), "description", "Description", "A description for this layer.<br/>Shown in the layer selections and in the personal theme"),
                setting(ValidatedTextField.NumberInput("nat", n => n < 23), "minzoom", "Minimal zoom",
                    "The minimum zoomlevel needed to load and show this layer."),
                setting(new DropDown("", [
                        {value: 0, shown: "Show ways and areas as ways and lines"},
                        {value: 2, shown: "Show both the ways/areas and the centerpoints"},
                        {value: 1, shown: "Show everything as centerpoint"}]), "wayHandling", "Way handling",
                    "Describes how ways and areas are represented on the map: areas can be represented as the area itself, or it can be converted into the centerpoint"),
                setting(new AndOrTagInput(), ["overpassTags"], "Overpass query",
                    "The tags of the objects to load from overpass"),

            ],
            currentlySelected);
        const self = this;

        const popupTitleRendering = new TagRenderingPanel(languages, currentlySelected, userDetails, {
            title: "Popup title",
            description: "This is the rendering shown as title in the popup for this element",
            disableQuestions: true
        });

        new SingleSetting(config, popupTitleRendering, ["layers", index, "title"], "Popup title", "This is the rendering shown as title in the popup");
        this.titleRendering = popupTitleRendering;
        this.registerTagRendering(popupTitleRendering);


        const renderings = config.map(config => {
            const layer = config.layers[index] as LayerConfigJson;
            // @ts-ignore
            const renderings : TagRenderingConfigJson[] = layer.tagRenderings ;
            return renderings;
        });
        const tagRenderings = new MultiInput<TagRenderingConfigJson>("Add a tag rendering/question",
            () => ({}),
            () => {
                const tagPanel = new TagRenderingPanel(languages, currentlySelected, userDetails)
                self.registerTagRendering(tagPanel);
                return tagPanel;
            }, renderings,
            {allowMovement: true});

        tagRenderings.GetValue().addCallback(
            tagRenderings => {
                (config.data.layers[index] as LayerConfigJson).tagRenderings = tagRenderings;
                config.ping();
            }
        )

        if (userDetails.csCount >= Constants.userJourney.themeGeneratorFullUnlock) {

            const presetPanel = new MultiInput("Add a preset",
                () => ({tags: [], title: {}}),
                () => new PresetInputPanel(currentlySelected, languages),
                undefined, {allowMovement: true});
            new SingleSetting(config, presetPanel, ["layers", index, "presets"], "Presets", "")
            this.presetsPanel = presetPanel;
        } else {
            this.presetsPanel = new FixedUiElement(`Creating a custom theme which also edits OSM is only unlocked after ${Constants.userJourney.themeGeneratorFullUnlock} changesets`).SetClass("alert");
        }

        function loadTagRenderings() {
            const values = (config.data.layers[index] as LayerConfigJson).tagRenderings;
            const renderings: TagRenderingConfigJson[] = [];
            for (const value of values) {
                if (typeof (value) !== "string") {
                    renderings.push(value);
                }

            }
            tagRenderings.GetValue().setData(renderings);
        }

        loadTagRenderings();

        this.tagRenderings = tagRenderings;


    }

    private setupRenderOptions(config: UIEventSource<LayoutConfigJson>,
                               languages: UIEventSource<string[]>,
                               index: number,
                               currentlySelected: UIEventSource<SingleSetting<any>>,
                               userDetails: UserDetails
    ): UIElement {
        const iconSelect = new TagRenderingPanel(
            languages, currentlySelected, userDetails,
            {
                title: "Icon",
                description: "A visual representation for this layer and for the points on the map.",
                disableQuestions: true,
                noLanguage: true
            });
        const size = new TagRenderingPanel(languages, currentlySelected, userDetails,
            {
                title: "Icon Size",
                description: "The size of the icons on the map in pixels. Can vary based on the tagging",
                disableQuestions: true,
                noLanguage: true
            });
        const color = new TagRenderingPanel(languages, currentlySelected, userDetails,
            {
                title: "Way and area color",
                description: "The color or a shown way or area. Can vary based on the tagging",
                disableQuestions: true,
                noLanguage: true
            });
        const stroke = new TagRenderingPanel(languages, currentlySelected, userDetails,
            {
                title: "Stroke width",
                description: "The width of lines representing ways and the outline of areas. Can vary based on the tags",
                disableQuestions: true,
                noLanguage: true
            });
        this.registerTagRendering(iconSelect);
        this.registerTagRendering(size);
        this.registerTagRendering(color);
        this.registerTagRendering(stroke);

        function setting(input: InputElement<any>, path, isIcon: boolean = false): SingleSetting<TagRenderingConfigJson> {
            return new SingleSetting(config, input, ["layers", index, path], undefined, undefined)
        }

        return new SettingsTable([
            setting(iconSelect, "icon"),
            setting(size, "iconSize"),
            setting(color, "color"),
            setting(stroke, "width")
        ], currentlySelected);
    }

    private registerTagRendering(
        tagRenderingPanel: TagRenderingPanel) {

        tagRenderingPanel.IsHovered().addCallback(isHovering => {
            if (!isHovering) {
                return;
            }
            this.selectedTagRendering.setData(tagRenderingPanel);
        })
    }

    InnerRender(): string {
        return new Combine([
            "<h2>General layer settings</h2>",
            this.settingsTable,
            "<h2>Popup contents</h2>",
            this.titleRendering,
            this.tagRenderings,
            "<h2>Presets</h2>",
            "Does this theme support adding a new point?<br/>If this should be the case, add a preset. Make sure that the preset tags do match the overpass-tags, otherwise it might seem like the newly added points dissapear ",
            this.presetsPanel,
            "<h2>Map rendering options</h2>",
            this.mapRendering,
            "<h2>Layer delete</h2>",
            this.deleteButton
        ]).Render();
    }
}