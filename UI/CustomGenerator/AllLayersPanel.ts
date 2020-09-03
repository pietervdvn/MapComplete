import {UIElement} from "../UIElement";
import {TabbedComponent} from "../Base/TabbedComponent";
import {SubtleButton} from "../Base/SubtleButton";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LayoutConfigJson} from "../../Customizations/JSON/LayoutConfigJson";
import Combine from "../Base/Combine";
import {GenerateEmpty} from "./GenerateEmpty";
import LayerPanelWithPreview from "./LayerPanelWithPreview";
import {UserDetails} from "../../Logic/Osm/OsmConnection";

export default class AllLayersPanel extends UIElement {


    private panel: UIElement;
    private readonly _config: UIEventSource<LayoutConfigJson>;
    private readonly languages: UIEventSource<string[]>;

    constructor(config: UIEventSource<LayoutConfigJson>,
                languages: UIEventSource<any>, userDetails: UserDetails) {
        super(undefined);
        this._config = config;
        this.languages = languages;

        this.createPanels(userDetails);
        const self = this;
        config.map<number>(config => config.layers.length).addCallback(() => self.createPanels(userDetails));

    }


    private createPanels(userDetails: UserDetails) {
        const self = this;
        const tabs = [];

        const layers = this._config.data.layers;
        for (let i = 0; i < layers.length; i++) {

            tabs.push({
                header: "<img src='./assets/bug.svg'>",
                content: new LayerPanelWithPreview(this._config, this.languages, i, userDetails)
            });
        }
        tabs.push({
            header: "<img src='./assets/layersAdd.svg'>",
            content: new Combine([
                "<h2>Layer editor</h2>",
                "In this tab page, you can add and edit the layers of the theme. Click the layers above or add a new layer to get started.",
                new SubtleButton(
                    "./assets/layersAdd.svg",
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