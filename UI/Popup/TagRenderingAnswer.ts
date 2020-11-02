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
        const self = this;
        tags.addCallbackAndRun(tags => {
            if (tags === undefined) {
                self._content = undefined
                return;
            }
            const tr = this._configuration.GetRenderValue(tags);
            if (tr === undefined) {
                self._content = undefined
                return
            }
            self._content = new SubstitutedTranslation(tr, self._tags)
        })
    }

    InnerRender(): string {
        if (this._configuration.condition !== undefined) {
            if (!this._configuration.condition.matchesProperties(this._tags.data)) {
                return "";
            }
        }
        if(this._content === undefined){
            return "";
        }
        return this._content.Render();
    }

}