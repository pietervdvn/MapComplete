import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LayoutConfigJson} from "../../Customizations/JSON/LayoutConfigJson";
import Combine from "../Base/Combine";
import {VariableUiElement} from "../Base/VariableUIElement";
import UserDetails from "../../Logic/Osm/OsmConnection";

export default class SharePanel extends UIElement {
    private _config: UIEventSource<LayoutConfigJson>;

    private _panel: UIElement;

    constructor(config: UIEventSource<LayoutConfigJson>, liveUrl: UIEventSource<string>, userDetails: UserDetails) {
        super(undefined);
        this._config = config;

        this._panel = new Combine([
            "<h2>Share</h2>",
            "Share the following link with friends:<br/>",
            new VariableUiElement(liveUrl.map(url => `<a href='${url}' target="_blank">${url}</a>`)),
            "<h2>Publish on some website</h2>",
            
            "It is possible to load a JSON-file from the wide internet, but you'll need some (public CORS-enabled) server.",
            `Put the raw json online, and use ${window.location.host}?userlayout=https://<your-url-here>.json`,
            "Please note: it used to be possible to load from the wiki - this is not possible anymore due to technical reasons.",
            "</div>"
        ]);
    }

    InnerRender(): string {
        return this._panel.Render();
    }

}