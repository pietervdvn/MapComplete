import {UIEventSource} from "../../Logic/UIEventSource";
import {Utils} from "../../Utils";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import List from "../Base/List";
import {SubstitutedTranslation} from "../SubstitutedTranslation";
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";

/***
 * Displays the correct value for a known tagrendering
 */
export default class TagRenderingAnswer extends VariableUiElement {

    constructor(tagsSource: UIEventSource<any>, configuration: TagRenderingConfig,
                state: any,
                contentClasses: string = "", contentStyle: string = "", options?: {
            specialViz: Map<string, BaseUIElement>
        }) {
        if (configuration === undefined) {
            throw "Trying to generate a tagRenderingAnswer without configuration..."
        }
        if (tagsSource === undefined) {
            throw "Trying to generate a tagRenderingAnswer without tagSource..."
        }
        super(tagsSource.map(tags => {
            if (tags === undefined) {
                return undefined;
            }

            if (configuration.condition) {
                if (!configuration.condition.matchesProperties(tags)) {
                    return undefined;
                }
            }

            const trs = Utils.NoNull(configuration.GetRenderValues(tags));
            if (trs.length === 0) {
                return undefined;
            }

            const valuesToRender: BaseUIElement[] = trs.map(tr => new SubstitutedTranslation(tr, tagsSource, state, options?.specialViz))
            if (valuesToRender.length === 1) {
                return valuesToRender[0];
            } else if (valuesToRender.length > 1) {
                return new List(valuesToRender)
            }
            return undefined;
        }).map((element: BaseUIElement) => element?.SetClass(contentClasses)?.SetStyle(contentStyle)))

        this.SetClass("flex items-center flex-row text-lg link-underline")
        this.SetStyle("word-wrap: anywhere;");
    }

}