import {UIElement} from "../UIElement";
import {TabbedComponent} from "../Base/TabbedComponent";
import {SubtleButton} from "../Base/SubtleButton";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LayoutConfigJson} from "../../Customizations/JSON/LayoutConfigJson";
import {LayerConfigJson} from "../../Customizations/JSON/LayerConfigJson";
import LayerPanel from "./LayerPanel";
import SingleSetting from "./SingleSetting";

export default class AllLayersPanel extends UIElement {


    private panel: UIElement;
    private _config: UIEventSource<LayoutConfigJson>;
    private _currentlySelected: UIEventSource<SingleSetting<any>>;
    private languages: UIEventSource<string[]>;

    private static createEmptyLayer(): LayerConfigJson {
        return {
            id: undefined,
            name: undefined,
            minzoom: 0,
            overpassTags: undefined,
            title: undefined,
            description: {}
        }
    }

    constructor(config: UIEventSource<LayoutConfigJson>, currentlySelected: UIEventSource<SingleSetting<any>>,
                languages: UIEventSource<any>) {
        super(undefined);
        this._config = config;
        this._currentlySelected = currentlySelected;
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
            tabs.push({
                header: "<img src='./assets/bug.svg'>",
                content: new LayerPanel(this._config, this.languages, i, this._currentlySelected)
            });
        }
        tabs.push({
            header: "<img src='./assets/add.svg'>",
            content: new SubtleButton(
                "./assets/add.svg",
                "Add a new layer"
            ).onClick(() => {
                self._config.data.layers.push(AllLayersPanel.createEmptyLayer())
                self._config.ping();
            })
        })
        
        this.panel = new TabbedComponent(tabs, new UIEventSource<number>(Math.max(0, layers.length-1)));
        this.Update();
    }

    InnerRender(): string {
        return this.panel.Render();
    }

}