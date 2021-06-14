import {UIEventSource} from "../Logic/UIEventSource";
import {Translation} from "./i18n/Translation";
import Locale from "./i18n/Locale";
import State from "../State";
import {FixedUiElement} from "./Base/FixedUiElement";
import SpecialVisualizations from "./SpecialVisualizations";
import BaseUIElement from "./BaseUIElement";
import {Utils} from "../Utils";
import {VariableUiElement} from "./Base/VariableUIElement";
import Combine from "./Base/Combine";

export class SubstitutedTranslation extends VariableUiElement {

    public constructor(
        translation: Translation,
        tagsSource: UIEventSource<any>) {
        super(
            tagsSource.map(tags => {
                const txt = Utils.SubstituteKeys(translation.txt, tags)
               if (txt === undefined) {
                    return undefined
                }
               return new Combine(SubstitutedTranslation.EvaluateSpecialComponents(txt, tagsSource))
            }, [Locale.language])
        )
        
        
        this.SetClass("w-full")
    }


    private static EvaluateSpecialComponents(template: string, tags: UIEventSource<any>): BaseUIElement[] {

        for (const knownSpecial of SpecialVisualizations.specialVisualizations) {

            // Note: the '.*?' in the regex reads as 'any character, but in a non-greedy way'
            const matched = template.match(`(.*){${knownSpecial.funcName}\\((.*?)\\)}(.*)`);
            if (matched != null) {

                // We found a special component that should be brought to live
                const partBefore = SubstitutedTranslation.EvaluateSpecialComponents(matched[1], tags);
                const argument = matched[2].trim();
                const partAfter = SubstitutedTranslation.EvaluateSpecialComponents(matched[3], tags);
                try {
                    const args = knownSpecial.args.map(arg => arg.defaultValue ?? "");
                    if (argument.length > 0) {
                        const realArgs = argument.split(",").map(str => str.trim());
                        for (let i = 0; i < realArgs.length; i++) {
                            if (args.length <= i) {
                                args.push(realArgs[i]);
                            } else {
                                args[i] = realArgs[i];
                            }
                        }
                    }


                    let element: BaseUIElement = new FixedUiElement(`Constructing ${knownSpecial}(${args.join(", ")})`)
                    try{
                      element =  knownSpecial.constr(State.state, tags, args);
                    }catch(e){
                        console.error("SPECIALRENDERING FAILED for", tags.data.id, e)
                        element = new FixedUiElement(`Could not generate special renering for ${knownSpecial}(${args.join(", ")}) ${e}`).SetClass("alert")
                    }
                        
                    return [...partBefore, element, ...partAfter]
                } catch (e) {
                    console.error(e);
                    return [...partBefore, new FixedUiElement(`Failed loading ${knownSpecial.funcName}(${matched[2]}): ${e}`), ...partAfter]
                }
            }
        }

        // Let's to a small sanity check to help the theme designers:
        if (template.search(/{[^}]+\([^}]*\)}/) >= 0) {
            // Hmm, we might have found an invalid rendering name
            console.warn("Found a suspicious special rendering value in: ", template, " did you mean one of: ", SpecialVisualizations.specialVisualizations.map(sp => sp.funcName + "()").join(", "))
        }

        // IF we end up here, no changes have to be made - except to remove any resting {}
        return [new FixedUiElement(template.replace(/{.*}/g, ""))];
    }

}