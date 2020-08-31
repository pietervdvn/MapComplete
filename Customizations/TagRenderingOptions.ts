import {Dependencies, TagDependantUIElement, TagDependantUIElementConstructor} from "./UIElementConstructor";
import {TagsFilter, TagUtils} from "../Logic/Tags";
import {OnlyShowIfConstructor} from "./OnlyShowIf";
import {UIEventSource} from "../Logic/UIEventSource";
import Translation from "../UI/i18n/Translation";
import Translations from "../UI/i18n/Translations";

export class TagRenderingOptions implements TagDependantUIElementConstructor {

    /**
     * Notes: by not giving a 'question', one disables the question form alltogether
     */
    public options: {
        priority?: number;
        question?: string | Translation;
        freeform?: {
            key: string;
            tagsPreprocessor?: (tags: any) => any;
            template: string | Translation;
            renderTemplate: string | Translation;
            placeholder?: string | Translation;
            extraTags?: TagsFilter
        };
        mappings?: { k: TagsFilter; txt: string | Translation; priority?: number, substitute?: boolean, hideInAnwser?: boolean }[]
    };

    constructor(options: {


        /**
         * This is the string that is shown in the popup if this tag is missing.
         *
         * If 'question' is undefined, then the question is never asked at all
         * If the question is "" (empty string) then the question is
         */
        question?: Translation | string,

        /**
         * What is the priority of the question.
         * By default, in the popup of a feature, only one question is shown at the same time. If multiple questions are unanswered, the question with the highest priority is asked first
         */
        priority?: number,


        /**
         * Mappings convert a well-known tag combination into a user friendly text.
         * It converts e.g. 'access=yes' into 'this area can be accessed'
         *
         * If there are multiple tags that should be matched, And can be used. All tags in AND will be added when the question is picked (and the corresponding text will only be shown if all tags are present).
         * If AND is used, it is best practice to make sure every used tag is in every option (with empty string) to erase extra tags.
         *
         * If a 'k' is null, then this one is shown by default. It can be used to force a default value, e.g. to show that the name of a POI is not (yet) known .
         * A mapping where 'k' is null will not be shown as option in the radio buttons.
         *
         *
         */
        mappings?: { k: TagsFilter, txt: Translation | string, priority?: number, substitute?: boolean , hideInAnswer?:boolean}[],


        /**
         * If one wants to render a freeform tag (thus no predefined key/values) or if there are a few well-known tags with a freeform object,
         * use this.
         * In the question, it'll offer a textfield
         */
        freeform?: {
            key: string,
            template: string | Translation,
            renderTemplate: string | Translation
            placeholder?: string | Translation,
            extraTags?: TagsFilter,
        },


        /**
         * In some very rare cases, tags have to be rewritten before displaying
         * This function can be used for that.
         * This function is ran on a _copy_ of the original properties
         */
        tagsPreprocessor?: ((tags: any) => void)
    }) {
        this.options = options;
    }

        OnlyShowIf(tagsFilter: TagsFilter): TagDependantUIElementConstructor {
        return new OnlyShowIfConstructor(tagsFilter, this);
    }


    IsQuestioning(tags: any): boolean {
        const tagsKV = TagUtils.proprtiesToKV(tags);

        for (const oneOnOneElement of this.options.mappings ?? []) {
            if (oneOnOneElement.k === null || oneOnOneElement.k.matches(tagsKV)) {
                return false;
            }
        }
        if (this.options.freeform !== undefined && tags[this.options.freeform.key] !== undefined) {
            return false;
        }
        return this.options.question !== undefined;
    }

    GetContent(tags: any): Translation {
        const tagsKV = TagUtils.proprtiesToKV(tags);

        for (const oneOnOneElement of this.options.mappings ?? []) {
            if (oneOnOneElement.k === null || oneOnOneElement.k.matches(tagsKV)) {
                return Translations.WT(oneOnOneElement.txt);
            }
        }
        if (this.options.freeform !== undefined) {
            let template = Translations.WT(this.options.freeform.renderTemplate);
            return template.Subs(tags);
        }

        console.warn("No content defined for",tags," with mapping",this);
        return undefined;
    }


    public static tagRendering: (tags: UIEventSource<any>, options: { priority?: number; question?: string | Translation; freeform?: { key: string; tagsPreprocessor?: (tags: any) => any; template: string | Translation; renderTemplate: string | Translation; placeholder?: string | Translation; extraTags?: TagsFilter }; mappings?: { k: TagsFilter; txt: string | Translation; priority?: number; substitute?: boolean, hideInAnswer?: boolean }[] }) => TagDependantUIElement;

    construct(dependencies: Dependencies): TagDependantUIElement {
        return TagRenderingOptions.tagRendering(dependencies.tags, this.options);
    }

    IsKnown(properties: any): boolean {
        return !this.IsQuestioning(properties);
    }

    Priority(): number {
        return this.options.priority ?? 0;
    }

}