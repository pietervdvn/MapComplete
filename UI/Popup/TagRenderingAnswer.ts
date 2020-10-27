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

    constructor(tags: UIEventSource<any>,
                configuration: TagRenderingConfig) {
        super(tags);
        this._tags = tags;
        this._configuration = configuration;
    }

    InnerRender(): string {
        const tr = this._configuration.GetRenderValue(this._tags.data);
        if(tr === undefined){
            return "";
        }
        return new SubstitutedTranslation(tr, this._tags).Render();
    }

}