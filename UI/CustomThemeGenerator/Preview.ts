import {LayoutConfigJson} from "../../Customizations/JSON/CustomLayoutFromJSON";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";

export class Preview extends UIElement {
    private url: UIEventSource<string>;
    private config: UIEventSource<LayoutConfigJson>;

    constructor(url: UIEventSource<string>, config: UIEventSource<LayoutConfigJson>) {
        super(url);
        this.config = config;
        this.url = url;
    }

    InnerRender(): string {
        const url = this.url.data;
        return new Combine([
            `<iframe width="99%" height="70%" src="${this.url.data}"></iframe>`,
            '<p class="alert">The above preview is in testmode. Changes will not be sent to OSM, so feel free to add points and answer questions</p> ',
            `<h2>Your link</h2>`,
            '<span class="alert">Bookmark the link below</span><br/>',
            'MapComplete has no backend. The <i>entire</i> theme configuration is saved in the following URL. This means that this URL is needed to revive and change your MapComplete instance.<br/>',
            `<a target='_blank' href='${this.url.data}'>${this.url.data}</a><br/>`,
            '<h2>JSON-configuration</h2>',
            'You can see the configuration in JSON format below.<br/>',
            '<span class=\'literal-code iframe-code-block\' style="width:95%">',
            JSON.stringify(this.config.data, null, 2).replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;"),
            '</span>'

        ]).Render();
    }

}