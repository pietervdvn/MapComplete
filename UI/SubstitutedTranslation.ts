import {UIEventSource} from "../Logic/UIEventSource";
import {Translation} from "./i18n/Translation";
import Locale from "./i18n/Locale";
import State from "../State";
import {FixedUiElement} from "./Base/FixedUiElement";
import SpecialVisualizations, {SpecialVisualization} from "./SpecialVisualizations";
import {Utils} from "../Utils";
import {VariableUiElement} from "./Base/VariableUIElement";
import Combine from "./Base/Combine";
import BaseUIElement from "./BaseUIElement";

export class SubstitutedTranslation extends VariableUiElement {

    public constructor(
        translation: Translation,
        tagsSource: UIEventSource<any>,
        mapping: Map<string, BaseUIElement> = undefined) {

        const extraMappings: SpecialVisualization[] = [];

        mapping?.forEach((value, key) => {
            extraMappings.push(
                {
                    funcName: key,
                    constr: (() => {
                        return value
                    }),
                    docs: "Dynamically injected input element",
                    args: [],
                    example: ""
                }
            )
        })

        super(
            Locale.language.map(language => {
                let txt = translation.textFor(language);
                if (txt === undefined) {
                    return undefined
                }
                mapping?.forEach((_, key) => {
                    txt = txt.replace(new RegExp(`{${key}}`, "g"), `{${key}()}`)
                })

                return new Combine(SubstitutedTranslation.ExtractSpecialComponents(txt, extraMappings).map(
                    proto => {
                        if (proto.fixed !== undefined) {
                            return new VariableUiElement(tagsSource.map(tags => Utils.SubstituteKeys(proto.fixed, tags)));
                        }
                        const viz = proto.special;
                        try {
                            return viz.func.constr(State.state, tagsSource, proto.special.args).SetStyle(proto.special.style);
                        } catch (e) {
                            console.error("SPECIALRENDERING FAILED for", tagsSource.data?.id, e)
                            return new FixedUiElement(`Could not generate special rendering for ${viz.func}(${viz.args.join(", ")}) ${e}`).SetStyle("alert")
                        }
                    }
                ))
            })
        )

        this.SetClass("w-full")
    }


    public static ExtractSpecialComponents(template: string, extraMappings: SpecialVisualization[] = []): {
        fixed?: string,
        special?: {
            func: SpecialVisualization,
            args: string[],
            style: string
        }
    }[] {

        for (const knownSpecial of SpecialVisualizations.specialVisualizations.concat(extraMappings)) {

            // Note: the '.*?' in the regex reads as 'any character, but in a non-greedy way'
            const matched = template.match(`(.*){${knownSpecial.funcName}\\((.*?)\\)(:.*)?}(.*)`);
            if (matched != null) {

                // We found a special component that should be brought to live
                const partBefore = SubstitutedTranslation.ExtractSpecialComponents(matched[1], extraMappings);
                const argument = matched[2].trim();
                const style = matched[3]?.substring(1) ?? ""
                const partAfter = SubstitutedTranslation.ExtractSpecialComponents(matched[4], extraMappings);
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