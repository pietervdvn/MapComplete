import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import {Utils} from "../../Utils";
import {SubstitutedTranslation} from "../SubstitutedTranslation";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import List from "../Base/List";
import {FixedUiElement} from "../Base/FixedUiElement";

/***
 * Displays the correct value for a known tagrendering
 */
export default class TagRenderingAnswer extends VariableUiElement {

    constructor(tagsSource: UIEventSource<any>, configuration: TagRenderingConfig, contentClasses: string = "", contentStyle: string = "") {
        if (configuration === undefined) {
            throw "Trying to generate a tagRenderingAnswer without configuration..."
        }
        super(tagsSource.map(tags => {
            if(tags === undefined){
                return undefined;
            }
            const trs = Utils.NoNull(configuration.GetRenderValues(tags));
            if(trs.length === 0){
                return  undefined;
            }
            trs.forEach(tr => console.log("Rendering ", tr))
            const valuesToRender: BaseUIElement[] = trs.map(tr => new SubstitutedTranslation(tr, tagsSource))

            if(valuesToRender.length === 1){
               return valuesToRender[0];
            }else if(valuesToRender.length > 1){
                return new List(valuesToRender)
            }
            return undefined;
        }).map(innerComponent => innerComponent?.SetClass(contentClasses)?.SetStyle(contentStyle))
    )

        this.SetClass("flex items-center flex-row text-lg link-underline")
        this.SetStyle("word-wrap: anywhere;");
    }

}