import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingPanel from "./TagRenderingPanel";
import {VariableUiElement} from "../Base/VariableUIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import Combine from "../Base/Combine";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import EditableTagRendering from "../Popup/EditableTagRendering";

export default class TagRenderingPreview extends UIElement {

    private readonly previewTagValue: UIEventSource<any>;
    private selectedTagRendering: UIEventSource<TagRenderingPanel>;
    private panel: UIElement;

    constructor(selectedTagRendering: UIEventSource<TagRenderingPanel>,
                previewTagValue: UIEventSource<any>) {
        super(selectedTagRendering);
        this.selectedTagRendering = selectedTagRendering;
        this.previewTagValue = previewTagValue;
        this.panel = this.GetPanel(undefined);
        const self = this;
        this.selectedTagRendering.addCallback(trp => {
            self.panel = self.GetPanel(trp);
            self.Update();
        })

    }

    private GetPanel(tagRenderingPanel: TagRenderingPanel): UIElement {
        if (tagRenderingPanel === undefined) {
            return new FixedUiElement("No tag rendering selected at the moment. Hover over a tag rendering to see what it looks like");
        }

        let es = tagRenderingPanel.GetValue();

        let rendering: UIElement;
        const self = this;
        try {
            rendering =
                new VariableUiElement(es.map(tagRenderingConfig => {
                        try {
                            const tr = new EditableTagRendering(self.previewTagValue, new TagRenderingConfig(tagRenderingConfig, undefined,"preview"));
                            return tr.Render();
                        } catch (e) {
                            return new Combine(["Could not show this tagrendering:", e.message]).Render();
                        }
                    }
                ));

        } catch (e) {
            console.error("User defined tag rendering incorrect:", e);
            rendering = new FixedUiElement(e).SetClass("alert");
        }

        return new Combine([
            "<h3>",
            tagRenderingPanel.options.title ?? "Extra tag rendering",
            "</h3>",
            tagRenderingPanel.options.description ?? "This tag rendering will appear in the popup",
            "<br/><br/>",
            rendering]);

    }

    InnerRender(): string {
        return this.panel.Render();
    }

}