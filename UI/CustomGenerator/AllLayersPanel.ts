import {UIElement} from "../UIElement";
import {TabbedComponent} from "../Base/TabbedComponent";
import {SubtleButton} from "../Base/SubtleButton";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LayoutConfigJson} from "../../Customizations/JSON/LayoutConfigJson";
import LayerPanel from "./LayerPanel";
import SingleSetting from "./SingleSetting";
import Combine from "../Base/Combine";
import {GenerateEmpty} from "./GenerateEmpty";
import PageSplit from "../Base/PageSplit";
import {VariableUiElement} from "../Base/VariableUIElement";
import HelpText from "../../Customizations/HelpText";
import {MultiTagInput} from "../Input/MultiTagInput";
import {FromJSON} from "../../Customizations/JSON/FromJSON";
import {TagRenderingConfigJson} from "../../Customizations/JSON/TagRenderingConfigJson";
import {FixedUiElement} from "../Base/FixedUiElement";
import TagRenderingPanel from "./TagRenderingPanel";

export default class AllLayersPanel extends UIElement {


    private panel: UIElement;
    private readonly _config: UIEventSource<LayoutConfigJson>;
    private readonly languages: UIEventSource<string[]>;

    constructor(config: UIEventSource<LayoutConfigJson>,
                languages: UIEventSource<any>) {
        super(undefined);
        this._config = config;
        this.languages = languages;

        this.createPanels();
        const self = this;
        config.map<number>(config => config.layers.length).addCallback(() => self.createPanels());

    }


    private createPanels() {
        const self = this;
        const tabs = [];

        const layers = this._config.data.layers;
        for (let i = 0; i < layers.length; i++) {
            const currentlySelected = new UIEventSource<(SingleSetting<any>)>(undefined);
            const layer = new LayerPanel(this._config, this.languages, i, currentlySelected);
            const helpText = new HelpText(currentlySelected);

            const previewTagInput = new MultiTagInput();
            previewTagInput.GetValue().setData(["id=123456"]);
            const previewTagValue = previewTagInput.GetValue().map(tags => {
                const properties = {};
                for (const str of tags) {
                    const tag = FromJSON.SimpleTag(str);
                    if (tag !== undefined) {
                        properties[tag.key] = tag.value;
                    }
                }
                return properties;
            });

            const preview = new VariableUiElement(layer.selectedTagRendering.map(
                (tagRenderingPanel: TagRenderingPanel) => {
                    if (tagRenderingPanel === undefined) {
                        return "No tag rendering selected at the moment";
                    }

                    let es = tagRenderingPanel.GetValue();
                    let tagRenderingConfig: TagRenderingConfigJson = es.data;

                    let rendering: UIElement;
                    try {
                        rendering = FromJSON.TagRendering(tagRenderingConfig)
                            .construct({tags: previewTagValue})
                    } catch (e) {
                        console.error("User defined tag rendering incorrect:", e);
                        rendering = new FixedUiElement(e).SetClass("alert");
                    }

                    return new Combine([
                        "<h3>",
                        tagRenderingPanel.options.title ?? "Extra tag rendering",
                        "</h3>",
                        tagRenderingPanel.options.description ?? "This tag rendering will appear in the popup",
                        "<br/>",
                        rendering]).Render();

                },
                [this._config]
            )).ListenTo(layer.selectedTagRendering);

            tabs.push({
                header: "<img src='./assets/bug.svg'>",
                content:
                    new PageSplit(
                        layer.SetClass("scrollable"),
                        new Combine([
                            helpText,
                            "</br>",
                            "<h2>Testing tags</h2>",
                            previewTagInput,
                            "<h2>Tag Rendering preview</h2>",
                            preview

                        ]), 60
                    )
            });
        }
        tabs.push({
            header: "<img src='./assets/add.svg'>",
            content: new Combine([
                "<h2>Layer editor</h2>",
                "In this tab page, you can add and edit the layers of the theme. Click the layers above or add a new layer to get started.",
                new SubtleButton(
                    "./assets/add.svg",
                    "Add a new layer"
                ).onClick(() => {
                    self._config.data.layers.push(GenerateEmpty.createEmptyLayer())
                    self._config.ping();
                })])
        })

        this.panel = new TabbedComponent(tabs, new UIEventSource<number>(Math.max(0, layers.length - 1)));
        this.Update();
    }

    InnerRender(): string {
        return this.panel.Render();
    }

}