import {Dependencies, TagDependantUIElement, TagDependantUIElementConstructor} from "./UIElementConstructor";
import * as EmailValidator from "email-validator";
import {parsePhoneNumberFromString} from "libphonenumber-js";
import {UIElement} from "../UI/UIElement";
import {TagsFilter, TagUtils} from "../Logic/TagsFilter";
import {OnlyShowIfConstructor} from "./OnlyShowIf";
import {UIEventSource} from "../UI/UIEventSource";

export class TagRenderingOptions implements TagDependantUIElementConstructor {


    public static inputValidation = {
        "$": (str) => true,
        "string": (str) => true,
        "int": (str) => str.indexOf(".") < 0 && !isNaN(Number(str)),
        "nat": (str) => str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) > 0,
        "float": (str) => !isNaN(Number(str)),
        "pfloat": (str) => !isNaN(Number(str)) && Number(str) > 0,
        "email": (str) => EmailValidator.validate(str),
        "phone": (str, country) => {
            return parsePhoneNumberFromString(str, country.toUpperCase())?.isValid() ?? false;
        },
    }

    public static formatting = {
        "phone": (str, country) => {
            console.log("country formatting", country)
            return parsePhoneNumberFromString(str, country.toUpperCase()).formatInternational()
        }
    }

    /**
     * Notes: by not giving a 'question', one disables the question form alltogether
     */

    public options: {
        priority?: number;
        question?: string | UIElement;
        freeform?: {
            key: string;
            tagsPreprocessor?: (tags: any) => any;
            template: string | UIElement;
            renderTemplate: string | UIElement;
            placeholder?: string | UIElement;
            extraTags?: TagsFilter
        };
        mappings?: { k: TagsFilter; txt: string | UIElement; priority?: number, substitute?: boolean }[]
    };


    constructor(options: {


        /**
         * This is the string that is shown in the popup if this tag is missing.
         *
         * If 'question' is undefined, then the question is never asked at all
         * If the question is "" (empty string) then the question is
         */
        question?: UIElement | string,

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
        mappings?: { k: TagsFilter, txt: UIElement | string, priority?: number, substitute?: boolean }[],


        /**
         * If one wants to render a freeform tag (thus no predefined key/values) or if there are a few well-known tags with a freeform object,
         * use this.
         * In the question, it'll offer a textfield
         */
        freeform?: {
            key: string,
            template: string | UIElement,
            renderTemplate: string | UIElement
            placeholder?: string | UIElement,
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
        if (this.options.question === undefined) {
            return false;
        }

        return true;
    }


    public static tagRendering : (tags: UIEventSource<any>, options: { priority?: number; question?: string | UIElement; freeform?: { key: string; tagsPreprocessor?: (tags: any) => any; template: string | UIElement; renderTemplate: string | UIElement; placeholder?: string | UIElement; extraTags?: TagsFilter }; mappings?: { k: TagsFilter; txt: string | UIElement; priority?: number; substitute?: boolean }[] }) => TagDependantUIElement;
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