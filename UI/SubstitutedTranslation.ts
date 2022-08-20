import {UIEventSource} from "../Logic/UIEventSource";
import {Translation} from "./i18n/Translation";
import Locale from "./i18n/Locale";
import {FixedUiElement} from "./Base/FixedUiElement";
import SpecialVisualizations, {SpecialVisualization} from "./SpecialVisualizations";
import {Utils} from "../Utils";
import {VariableUiElement} from "./Base/VariableUIElement";
import Combine from "./Base/Combine";
import BaseUIElement from "./BaseUIElement";
import {DefaultGuiState} from "./DefaultGuiState";
import FeaturePipelineState from "../Logic/State/FeaturePipelineState";
import LinkToWeblate from "./Base/LinkToWeblate";

export class SubstitutedTranslation extends VariableUiElement {

    public constructor(
        translation: Translation,
        tagsSource: UIEventSource<Record<string, string>>,
        state: FeaturePipelineState,
        mapping: Map<string, BaseUIElement |
            ((state: FeaturePipelineState, tagSource: UIEventSource<Record<string, string>>, argument: string[], guistate: DefaultGuiState) => BaseUIElement)> = undefined) {

        const extraMappings: SpecialVisualization[] = [];

        mapping?.forEach((value, key) => {
            extraMappings.push(
                {
                    funcName: key,
                    constr: typeof value === "function" ? value : () => value,
                    docs: "Dynamically injected input element",
                    args: [],
                    example: ""
                }
            )
        })

        const linkToWeblate = translation !== undefined ? new LinkToWeblate(translation.context, translation.translations) : undefined;
        
        super(
            Locale.language.map(language => {
                let txt = translation?.textFor(language);
                if (txt === undefined) {
                    return undefined
                }
                mapping?.forEach((_, key) => {
                    txt = txt.replace(new RegExp(`{${key}}`, "g"), `{${key}()}`)
                })

                const allElements = SubstitutedTranslation.ExtractSpecialComponents(txt, extraMappings).map(
                    proto => {
                        if (proto.fixed !== undefined) {
                            if(tagsSource === undefined){
                                return Utils.SubstituteKeys(proto.fixed, undefined)
                            }
                            return new VariableUiElement(tagsSource.map(tags => Utils.SubstituteKeys(proto.fixed, tags)));
                        }
                        const viz = proto.special;
                        if(viz === undefined){
                            console.error("SPECIALRENDERING UNDEFINED for", tagsSource.data?.id, "THIS IS REALLY WEIRD")
                            return undefined

                        }
                        try {
                            return viz.func.constr(state, tagsSource, proto.special.args, DefaultGuiState.state)?.SetStyle(proto.special.style);
                        } catch (e) {
                            console.error("SPECIALRENDERING FAILED for", tagsSource.data?.id, e)
                            return new FixedUiElement(`Could not generate special rendering for ${viz.func.funcName}(${viz.args.join(", ")}) ${e}`).SetStyle("alert")
                        }
                    });
                allElements.push(linkToWeblate)
                
                return new Combine(
                   allElements
                )
            })
        )

        this.SetClass("w-full")
    }

    /**
     * 
     * // Return empty list on empty input
     * SubstitutedTranslation.ExtractSpecialComponents("") // => []
     *  
     * // Advanced cases with commas, braces and newlines should be handled without problem
     * const templates = SubstitutedTranslation.ExtractSpecialComponents("{send_email(&LBRACEemail&RBRACE,Broken bicycle pump,Hello&COMMA\n\nWith this email&COMMA I'd like to inform you that the bicycle pump located at https://mapcomplete.osm.be/cyclofix?lat=&LBRACE_lat&RBRACE&lon=&LBRACE_lon&RBRACE&z=18#&LBRACEid&RBRACE is broken.\n\n Kind regards,Report this bicycle pump as broken)}")
     * const templ = templates[0]
     * templ.special.func.funcName // => "send_email"
     * templ.special.args[0] = "{email}"
     */
    public static ExtractSpecialComponents(template: string, extraMappings: SpecialVisualization[] = []): {
        fixed?: string,
        special?: {
            func: SpecialVisualization,
            args: string[],
            style: string
        }
    }[] {
        
        if(template === ""){
            return []
        }

        for (const knownSpecial of extraMappings.concat(SpecialVisualizations.specialVisualizations)) {
            
            // Note: the '.*?' in the regex reads as 'any character, but in a non-greedy way'
            const matched = template.match(new RegExp(`(.*){${knownSpecial.funcName}\\((.*?)\\)(:.*)?}(.*)`, "s"));
            if (matched != null) {

                // We found a special component that should be brought to live
                const partBefore = SubstitutedTranslation.ExtractSpecialComponents(matched[1], extraMappings);
                const argument = matched[2].trim();
                const style = matched[3]?.substring(1) ?? ""
                const partAfter = SubstitutedTranslation.ExtractSpecialComponents(matched[4], extraMappings);
                const args = knownSpecial.args.map(arg => arg.defaultValue ?? "");
                if (argument.length > 0) {
                    const realArgs = argument.split(",").map(str => str.trim()
                        .replace(/&LPARENS/g, '(')
                        .replace(/&RPARENS/g, ')')
                        .replace(/&LBRACE/g, '{')
                        .replace(/&RBRACE/g, '}')
                        .replace(/&COMMA/g, ','));
                    for (let i = 0; i < realArgs.length; i++) {
                        if (args.length <= i) {
                            args.push(realArgs[i]);
                        } else {
                            args[i] = realArgs[i];
                        }
                    }
                }

                let element;
                element = {
                    special: {
                        args: args,
                        style: style,
                        func: knownSpecial
                    }
                }
                return [...partBefore, element, ...partAfter]
            }
        }

        // Let's to a small sanity check to help the theme designers:
        if (template.search(/{[^}]+\([^}]*\)}/) >= 0) {
            // Hmm, we might have found an invalid rendering name
            console.warn("Found a suspicious special rendering value in: ", template, " did you mean one of: ", SpecialVisualizations.specialVisualizations.map(sp => sp.funcName + "()").join(", "))
        }
        
        // IF we end up here, no changes have to be made - except to remove any resting {}
        return [{fixed: template}];
    }

}