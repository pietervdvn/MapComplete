import {UIElement} from "./UIElement";
import {UIEventSource} from "../Logic/UIEventSource";
import {Translation} from "./i18n/Translation";
import Locale from "./i18n/Locale";
import Combine from "./Base/Combine";
import State from "../State";
import {FixedUiElement} from "./Base/FixedUiElement";
import SpecialVisualizations from "./SpecialVisualizations";
import {Utils} from "../Utils";

export class SubstitutedTranslation extends UIElement {
    private static cachedTranslations:
        Map<string, Map<Translation, Map<UIEventSource<any>, SubstitutedTranslation>>> = new Map<string, Map<Translation, Map<UIEventSource<any>, SubstitutedTranslation>>>();
    private readonly tags: UIEventSource<any>;
    private readonly translation: Translation;
    private content: UIElement[];

    private constructor(
        translation: Translation,
        tags: UIEventSource<any>) {
        super(tags);
        this.translation = translation;
        this.tags = tags;
        const self = this;
        tags.addCallbackAndRun(() => {
            self.content = self.CreateContent();
            self.Update();
        });

        Locale.language.addCallback(() => {
            self.content = self.CreateContent();
            self.Update();
        });
        this.SetClass("w-full")
    }

    public static construct(
        translation: Translation,
        tags: UIEventSource<any>): SubstitutedTranslation {

        /* let cachedTranslations = Utils.getOrSetDefault(SubstitutedTranslation.cachedTranslations, SubstitutedTranslation.GenerateSubCache);
         const innerMap = Utils.getOrSetDefault(cachedTranslations, translation, SubstitutedTranslation.GenerateMap);
 
         const cachedTranslation = innerMap.get(tags);
         if (cachedTranslation !== undefined) {
             return cachedTranslation;
         }*/
        const st = new SubstitutedTranslation(translation, tags);
        // innerMap.set(tags, st);
        return st;
    }

    public static SubstituteKeys(txt: string, tags: any) {
        for (const key in tags) {
            txt = txt.replace(new RegExp("{" + key + "}", "g"), tags[key])
        }
        return txt;
    }

    private static GenerateMap() {
        return new Map<UIEventSource<any>, SubstitutedTranslation>()
    }

    private static GenerateSubCache() {
        return new Map<Translation, Map<UIEventSource<any>, SubstitutedTranslation>>();
    }

    InnerRender(): string {
        if (this.content.length == 1) {
            return this.content[0].Render();
        }
        return new Combine(this.content).Render();
    }

    private CreateContent(): UIElement[] {
        let txt = this.translation?.txt;
        if (txt === undefined) {
            return []
        }
        const tags = this.tags.data;
        txt = SubstitutedTranslation.SubstituteKeys(txt, tags);
        return this.EvaluateSpecialComponents(txt);
    }

    private EvaluateSpecialComponents(template: string): UIElement[] {

        for (const knownSpecial of SpecialVisualizations.specialVisualizations) {

            // Note: the '.*?' in the regex reads as 'any character, but in a non-greedy way'
            const matched = template.match(`(.*){${knownSpecial.funcName}\\((.*?)\\)}(.*)`);
            if (matched != null) {

                // We found a special component that should be brought to live
                const partBefore = this.EvaluateSpecialComponents(matched[1]);
                const argument = matched[2].trim();
                const partAfter = this.EvaluateSpecialComponents(matched[3]);
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


                    const element = knownSpecial.constr(State.state, this.tags, args);
                    return [...partBefore, element, ...partAfter]
                } catch (e) {
                    console.error(e);
                    return [...partBefore, new FixedUiElement(`Failed loading ${knownSpecial.funcName}(${matched[2]}): ${e}`), ...partAfter]
                }
            }
        }

        // Let's to a small sanity check to help the theme designers:
        if(template.search(/{[^}]+\([^}]*\)}/) >= 0){
            // Hmm, we might have found an invalid rendering name
            console.warn("Found a suspicious special rendering value in: ", template, " did you mean one of: ", SpecialVisualizations.specialVisualizations.map(sp => sp.funcName+"()").join(", "))
        }
        
        // IF we end up here, no changes have to be made - except to remove any resting {}
        return [new FixedUiElement(template.replace(/{.*}/g, ""))];
    }

}