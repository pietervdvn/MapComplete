import {LayoutConfigJson} from "../../Customizations/JSON/CustomLayoutFromJSON";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import {Button} from "../Base/Button";
import {VariableUiElement} from "../Base/VariableUIElement";

export class Preview extends UIElement {
    private url: UIEventSource<string>;
    private config: UIEventSource<LayoutConfigJson>;

    private currentPreview = new UIEventSource<string>("")
    private reloadButton: Button;
    private otherPreviews: VariableUiElement;

    constructor(url: UIEventSource<string>, config: UIEventSource<LayoutConfigJson>) {
        super(undefined);
        this.config = config;
        this.url = url;
        this.reloadButton = new Button("Reload the preview", () => {
            this.currentPreview.setData(`<iframe width="99%" height="70%" src="${this.url.data}"></iframe>` +
                '<p class="alert">The above preview is in testmode. Changes will not be sent to OSM, so feel free to add points and answer questions</p> ',
            );
        });
        this.ListenTo(this.currentPreview);


        this.otherPreviews = new VariableUiElement(this.url.map(url => {

            return [
                `<h2>Your link</h2>`,
                '<span class="alert">Bookmark the link below</span><br/>',
                'MapComplete has no backend. The <i>entire</i> theme configuration is saved in the following URL. This means that this URL is needed to revive and change your MapComplete instance.<br/>',
                `<a target='_blank' href='${this.url.data}'>${this.url.data}</a><br/>`,
                '<h2>JSON-configuration</h2>',
                'You can see the configuration in JSON format below.<br/>',
                '<span class=\'literal-code iframe-code-block\' style="width:95%">',
                JSON.stringify(this.config.data, null, 2).replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;"),
                '</span>'

            ].join("")

        }));
    }

    InnerRender(): string {
        const url = this.url.data;
        return new Combine([
            new VariableUiElement(this.currentPreview),
            this.reloadButton,
            "<h2>Statistics</h2>",
            "We track statistics with goatcounter. <a href='https://pietervdvn.goatcounter.com' target='_blank'>The statistics can be seen by anyone, so if you want to see where your theme ends up, click here</a>",
            this.otherPreviews
        ]).Render();
    }

}