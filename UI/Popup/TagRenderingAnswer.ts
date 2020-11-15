import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import {UIElement} from "../UIElement";
import {SubstitutedTranslation} from "../SpecialVisualizations";

/***
 * Displays the correct value for a known tagrendering
 */
export default class TagRenderingAnswer extends UIElement {
    private _tags: UIEventSource<any>;
    private _configuration: TagRenderingConfig;
    private _content: UIElement;

    constructor(tags: UIEventSource<any>, configuration: TagRenderingConfig) {
        super(tags);
        this._tags = tags;
        this._configuration = configuration;
    }

    InnerRender(): string {
        if (this._configuration.condition !== undefined) {
            if (!this._configuration.condition.matchesProperties(this._tags.data)) {
                return "";
            }
        }

        const tags = this._tags.data;
        if (tags === undefined) {
            return "";
        }
        const tr = this._configuration.GetRenderValue(tags);
        if (tr === undefined) {
            return "";
        }
        // Bit of a hack; remember that the fields are updated
        this._content = new SubstitutedTranslation(tr, this._tags);
        return this._content.Render();
    }

}