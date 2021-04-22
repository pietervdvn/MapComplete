import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import {UIElement} from "../UIElement";
import {Utils} from "../../Utils";
import Combine from "../Base/Combine";
import {SubstitutedTranslation} from "../SubstitutedTranslation";
import {Translation} from "../i18n/Translation";
import {TagUtils} from "../../Logic/Tags/TagUtils";

/***
 * Displays the correct value for a known tagrendering
 */
export default class TagRenderingAnswer extends UIElement {
    private readonly _tags: UIEventSource<any>;
    private _configuration: TagRenderingConfig;
    private _content: UIElement;
    private readonly _contentClass: string;
    private _contentStyle: string;

    constructor(tags: UIEventSource<any>, configuration: TagRenderingConfig, contentClasses: string = "", contentStyle: string = "") {
        super(tags);
        this._tags = tags;
        this._configuration = configuration;
        this._contentClass = contentClasses;
        this._contentStyle = contentStyle;
        if (configuration === undefined) {
            throw "Trying to generate a tagRenderingAnswer without configuration..."
        }
        this.SetClass("flex items-center flex-row text-lg link-underline")
        this.SetStyle("word-wrap: anywhere;");
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
            
            let freeformKeyUsed = this._configuration.freeform?.key === undefined; // If it is undefined, it is "used" already, or at least we don't have to check for it anymore
            const applicableThens: Translation[] = Utils.NoNull(this._configuration.mappings?.map(mapping => {
                if (mapping.if === undefined) {
                    return mapping.then;
                }
                if (TagUtils.MatchesMultiAnswer(mapping.if, tags)) {
                    if(!freeformKeyUsed){
                        if(mapping.if.usedKeys().indexOf(this._configuration.freeform.key) >= 0){
                            freeformKeyUsed = true;
                        }
                    }
                    return mapping.then;
                }
                return undefined;
            }) ?? [])

            if (!freeformKeyUsed
                && tags[this._configuration.freeform.key] !== undefined) {
                applicableThens.push(this._configuration.render)
            }

            const self = this
            const valuesToRender: UIElement[] = applicableThens.map(tr => SubstitutedTranslation.construct(tr, self._tags))

            if (valuesToRender.length >= 0) {
                if (valuesToRender.length === 1) {
                    this._content = valuesToRender[0];
                } else {
                    this._content = new Combine(["<ul>",
                        ...valuesToRender.map(tr => new Combine(["<li>", tr, "</li>"]))
                        ,
                        "</ul>"
                    ])

                }
                return this._content.SetClass(this._contentClass).SetStyle(this._contentStyle).Render();
            }
        }

        const tr = this._configuration.GetRenderValue(tags);
        if (tr !== undefined) {
            this._content = SubstitutedTranslation.construct(tr, this._tags);
            return this._content.SetClass(this._contentClass).SetStyle(this._contentStyle).Render();
        }

        return "";

    }

}