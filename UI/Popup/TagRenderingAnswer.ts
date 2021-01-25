import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import {UIElement} from "../UIElement";
import {SubstitutedTranslation} from "../SpecialVisualizations";
import {Utils} from "../../Utils";
import Combine from "../Base/Combine";
import {TagUtils} from "../../Logic/Tags";

/***
 * Displays the correct value for a known tagrendering
 */
export default class TagRenderingAnswer extends UIElement {
    private readonly _tags: UIEventSource<any>;
    private _configuration: TagRenderingConfig;
    private _content: UIElement;

    constructor(tags: UIEventSource<any>, configuration: TagRenderingConfig) {
        super(tags);
        this._tags = tags;
        this._configuration = configuration;
        if (configuration === undefined) {
            throw "Trying to generate a tagRenderingAnswer without configuration..."
        }
        this.SetClass("flex items-center flex-row text-lg")
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

        // The render value doesn't work well with multi-answers (checkboxes), so we have to check for them manually
        if (this._configuration.multiAnswer) {
            const applicableThens = Utils.NoNull(this._configuration.mappings.map(mapping => {
                if (mapping.if === undefined) {
                    return mapping.then;
                }
                if (TagUtils.MatchesMultiAnswer(mapping.if, tags)) {
                    return mapping.then;
                }
                return undefined;
            }))
            if (applicableThens.length >= 0) {
                if (applicableThens.length === 1) {
                    this._content = applicableThens[0];
                } else {
                    this._content = new Combine(["<ul>",
                        ...applicableThens.map(tr => new Combine(["<li>", tr, "</li>"]))
                        ,
                        "</ul>"
                    ])

                }
                return this._content.Render();
            }
        }
        
        const tr = this._configuration.GetRenderValue(tags);
        if (tr !== undefined) {
            this._content = new SubstitutedTranslation(tr, this._tags);
            return this._content.Render();
        }

       
        return "";

    }

}