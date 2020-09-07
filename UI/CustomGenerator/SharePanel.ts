import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LayoutConfigJson} from "../../Customizations/JSON/LayoutConfigJson";
import Combine from "../Base/Combine";
import {VariableUiElement} from "../Base/VariableUIElement";
import {UserDetails} from "../../Logic/Osm/OsmConnection";

export default class SharePanel extends UIElement {
    private _config: UIEventSource<LayoutConfigJson>;

    private _panel: UIElement;

    constructor(config: UIEventSource<LayoutConfigJson>, liveUrl: UIEventSource<string>, userDetails: UserDetails) {
        super(undefined);
        this._config = config;


        const proposedName = `User:${userDetails.name}/${config.data.id}`
        const proposedNameEnc = encodeURIComponent(`wiki:User:${userDetails.name}/${config.data.id}`)

        this._panel = new Combine([
            "<h2>Share</h2>",
            "Share the following link with friends:<br/>",
            new VariableUiElement(liveUrl.map(url => `<a href='${url}' target="_blank">${url}</a>`)),
            "<h2>Publish on OSM Wiki</h2>",
            "In the list of 'hacks upon hacks to make MapComplete work', it is now possible to put the JSON-file onto a Wikipage*.<br/>" +
            "This is a <i>very stable</i> and <i>very well-tested</i> solution. Using wikipages as source control! What could possibly go wrong???? /s<br/><br/>",

            "Why to publish the layout as a wikipage?",
            "<ul>",
            ...["If something breaks, it can be fixed centrally",
                "If someone has a remark about your preset, the talk page can be used to point this out and discuss the preset",
                "In case of a grave error, everyone can step in to fix the prest"].map(li => `<li>${li}</li>`),
            "</ul>",

            "In order to make this work:",
            "<ol>",

            ...[`Create a new page on the OSM-wiki, e.g. <a href='https://wiki.osm.org/wiki/${proposedName}' target="_blank">${proposedName}</a>`,
                "Click 'create page'",
                "Type <span class='literal-code'>&lt;nowiki&gt;</span>, a few newlines and <span class='literal-code'>&lt;/nowiki&gt;</span>",
                "Copy the json configuration from the 'save-tab', paste it between the 'nowiki'-tags in the Wiki",
                "Click 'save' to save the wiki page",
                "Share the link with the url parameter <span class='literal-code'>userlayout=wiki:YOURWIKIPAGE</span>, e.g. " +
                `<a href='./index.html?userlayout=${proposedNameEnc}' target='_blank'>https://pietervdvn.github.io/MapComplete/index.html?userlayout=${proposedNameEnc}</a>`
            ].map(li => `<li>${li}</li>`),

            "</ol>",
            "(* This has made a lot of people very angry and been widely regarded as a bad move.)",
            "</div>"
        ]);
    }

    InnerRender(): string {
        return this._panel.Render();
    }

}