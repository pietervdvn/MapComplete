import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LayoutConfigJson} from "../../Customizations/JSON/LayoutConfigJson";
import Combine from "../Base/Combine";
import {VariableUiElement} from "../Base/VariableUIElement";

export default class SharePanel extends UIElement {
    private _config: UIEventSource<LayoutConfigJson>;

    private _panel: UIElement;

    constructor(config: UIEventSource<LayoutConfigJson>, liveUrl: UIEventSource<string>) {
        super(undefined);
        this._config = config;

        const json = new VariableUiElement(config.map(config => {
            return JSON.stringify(config, null, 2)
                .replace(/\n/g, "<br/>")
                .replace(/ /g, "&nbsp;");
        }));


        this._panel = new Combine([
            "<h2>share</h2>",
            "Share the following link with friends:<br/>",
            new VariableUiElement(liveUrl.map(url => `<a href='${url}' target="_blank">${url}</a>`)),
            "<h3>Json</h3>",
            "The json configuration is included for debugging purposes",
            "<div class='literal-code json'>",
            json,
            "</div>"
        ]);
    }

    InnerRender(): string {
        return this._panel.Render();
    }

}