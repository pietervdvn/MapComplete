import {UIElement} from "../UI/UIElement";
import {UIEventSource} from "../UI/UIEventSource";
import {And, Tag, TagsFilter, TagUtils} from "../Logic/TagsFilter";
import {FixedUiElement} from "../UI/Base/FixedUiElement";
import {SaveButton} from "../UI/SaveButton";
import {Changes} from "../Logic/Changes";
import {VariableUiElement} from "../UI/Base/VariableUIElement";
import {TagDependantUIElement, TagDependantUIElementConstructor} from "./UIElementConstructor";
import {OnlyShowIfConstructor} from "./OnlyShowIf";
import {UserDetails} from "../Logic/OsmConnection";
import {TextField} from "../UI/Input/TextField";
import {InputElement} from "../UI/Input/InputElement";
import {InputElementWrapper} from "../UI/Input/InputElementWrapper";
import {FixedInputElement} from "../UI/Input/FixedInputElement";
import {RadioButton} from "../UI/Input/RadioButton";

export class TagRenderingOptions implements TagDependantUIElementConstructor {

    /**
     * Notes: by not giving a 'question', one disables the question form alltogether
     */

    public options: {
        priority?: number; question?: string; primer?: string;
        freeform?: { key: string; tagsPreprocessor?: (tags: any) => any; template: string; renderTemplate: string; placeholder?: string; extraTags?: TagsFilter }; mappings?: { k: TagsFilter; txt: string; priority?: number, substitute?: boolean }[]
    };


    constructor(options: {

       

        /**
         * This is the string that is shown in the popup if this tag is missing.
         *
         * If 'question' is undefined, then the question is never asked at all
         * If the question is "" (empty string) then the question is 
         */
        question?: string,

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
        mappings?: { k: TagsFilter, txt: string, priority?: number, substitute?: boolean }[],


        /**
         * If one wants to render a freeform tag (thus no predefined key/values) or if there are a few well-known tags with a freeform object,
         * use this.
         * In the question, it'll offer a textfield
         */
        freeform?: {
            key: string, template: string,
            renderTemplate: string
            placeholder?: string,
            extraTags?: TagsFilter,
        },
        
        
        /**
         * Optional:
         * if defined, this a common piece of tag that is shown in front of every mapping (except freeform)
         */
        primer?: string,

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


    construct(dependencies: { tags: UIEventSource<any>, changes: Changes }): TagDependantUIElement {
        return new TagRendering(dependencies.tags, dependencies.changes, this.options);
    }

    IsKnown(properties: any): boolean {
        return !this.IsQuestioning(properties);
    }

    Priority(): number {
        return this.options.priority ?? 0;
    }

}

class TagRendering extends UIElement implements TagDependantUIElement {


    private _userDetails: UIEventSource<UserDetails>;
    private _priority: number;


    private _question: string;
    private _primer: string;
    private _mapping: { k: TagsFilter, txt: string, priority?: number, substitute?: boolean }[];
    private _renderMapping: { k: TagsFilter, txt: string, priority?: number, substitute?: boolean }[];

    private _tagsPreprocessor?: ((tags: any) => any);
    private _freeform: {
        key: string, template: string,
        renderTemplate: string,

        placeholder?: string,
        extraTags?: TagsFilter
    };


    private readonly _questionElement: InputElement<TagsFilter>;

    private readonly _saveButton: UIElement;
    private readonly _skipButton: UIElement;
    private readonly _editButton: UIElement;

    private readonly _questionSkipped: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    private readonly _editMode: UIEventSource<boolean> = new UIEventSource<boolean>(false);


    constructor(tags: UIEventSource<any>, changes: Changes, options: {
        priority?: number

        question?: string,
        primer?: string,

        freeform?: {
            key: string, template: string,
            renderTemplate: string
            placeholder?: string,
            extraTags?: TagsFilter,
        },
        tagsPreprocessor?: ((tags: any) => any),
        mappings?: { k: TagsFilter, txt: string, priority?: number, substitute?: boolean }[]
    }) {
        super(tags);
        const self = this;
        this.ListenTo(this._questionSkipped);
        this.ListenTo(this._editMode);

        this._userDetails = changes.login.userDetails;
        this.ListenTo(this._userDetails);

        this._question = options.question;
        this._priority = options.priority ?? 0;
        this._primer = options.primer ?? "";
        this._tagsPreprocessor = function (properties) {
            if (options.tagsPreprocessor === undefined) {
                return properties;
            }
            const newTags = {};
            for (const k in properties) {
                newTags[k] = properties[k];
            }
            options.tagsPreprocessor(newTags);
            return newTags;
        };
        
        this._mapping = [];
        this._renderMapping = [];
        this._freeform = options.freeform;

        // Prepare the choices for the Radio buttons
        const choices: UIElement[] = [];
        const usedChoices: string [] = [];

        for (const choice of options.mappings ?? []) {
            if (choice.k === null) {
                this._mapping.push(choice);
                continue;
            }
            let choiceSubbed = choice;
            if (choice.substitute) {
                choiceSubbed = {
                    k: choice.k.substituteValues(
                        options.tagsPreprocessor(this._source.data)),
                    txt: this.ApplyTemplate(choice.txt),
                    substitute: false,
                    priority: choice.priority
                }
            }


            const txt = choiceSubbed.txt
            // Choices is what is shown in the radio buttons
            if (usedChoices.indexOf(txt) < 0) {

                choices.push(new FixedUiElement(txt));
                usedChoices.push(txt);
                // This is used to convert the radio button index into tags needed to add
                this._mapping.push(choiceSubbed);
            } else {
                this._renderMapping.push(choiceSubbed); // only used while rendering
            }
        }


        // Prepare the actual input element -> pick an appropriate implementation

        this._questionElement = this.InputElementFor(options);
        const save = () => {
            const selection = self._questionElement.GetValue().data;
            if (selection) {
                changes.addTag(tags.data.id, selection);
            }
            self._editMode.setData(false);
        }

        const cancel = () => {
            self._questionSkipped.setData(true);
            self._editMode.setData(false);
            self._source.ping(); // Send a ping upstream to render the next question
        }

        // Setup the save button and it's action
        this._saveButton = new SaveButton(this._questionElement.GetValue())
            .onClick(save);

        this._editButton = new FixedUiElement("");
        if (this._question !== undefined) {
            this._editButton = new FixedUiElement("<img class='editbutton' src='./assets/pencil.svg' alt='edit'>")
                .onClick(() => {
                    self._questionElement.GetValue().setData(self.CurrentValue());
                    self._editMode.setData(true);
                });
        }


        const cancelContents = this._editMode.map((isEditing) => {
            if (isEditing) {
                return "<span class='skip-button'>Annuleren</span>";
            } else {
                return "<span class='skip-button'>Overslaan (Ik weet het niet zeker...)</span>";
            }
        });
        // And at last, set up the skip button
        this._skipButton = new VariableUiElement(cancelContents).onClick(cancel);
    }


    private InputElementFor(options: {
        freeform?: {
            key: string, template: string,
            renderTemplate: string
            placeholder?: string,
            extraTags?: TagsFilter,
        },
        mappings?: { k: TagsFilter, txt: string, priority?: number, substitute?: boolean }[]
    }):
        InputElement<TagsFilter> {

        const elements = [];

        if (options.mappings !== undefined) {
            
            const previousTexts= [];
            for (const mapping of options.mappings) {
                console.log(mapping);
                if(mapping.k === null){
                    continue;
                }
                if(previousTexts.indexOf(mapping.txt) >= 0){
                    continue;
                }
                previousTexts.push(mapping.txt);
                
                console.log("PUshed")
                elements.push(this.InputElementForMapping(mapping));
            }
        }

        if (options.freeform !== undefined) {
            elements.push(this.InputForFreeForm(options.freeform));
        }


        if (elements.length == 0) {
            throw "NO TAGRENDERINGS!"
        }
        if (elements.length == 1) {
            return elements[0];
        }

        return new RadioButton(elements, false);

    }


    private InputElementForMapping(mapping: { k: TagsFilter, txt: string }) {
        return new FixedInputElement(mapping.txt, mapping.k);
    }


    private InputForFreeForm(freeform): InputElement<TagsFilter> {
        if (freeform === undefined) {
            return undefined;
        }


        const pickString =
            (string) => {
                if (string === "" || string === undefined) {
                    return undefined;
                }
                const tag = new Tag(freeform.key, string);
                if (freeform.extraTags === undefined) {
                    return tag;
                }
                return new And([
                        freeform.extraTags,
                        tag
                    ]
                );
            };

        const toString =
            (tag) => {
                if (tag instanceof And) {
                    return toString(tag.and[0])
                } else if (tag instanceof Tag) {
                    return tag.value
                }
                console.log("Could not decode tag to string", tag)
                return undefined;
            }


        let inputElement: InputElement<TagsFilter>;
        const textField = new TextField({
            placeholder: this._freeform.placeholder,
            fromString: pickString,
            toString: toString
        });

        const prepost = freeform.template.split("$$$");
        return new InputElementWrapper(prepost[0], textField, prepost[1]);
    }


    IsKnown(): boolean {
        const tags = TagUtils.proprtiesToKV(this._source.data);

        for (const oneOnOneElement of this._mapping.concat(this._renderMapping)) {
            if (oneOnOneElement.k === null || oneOnOneElement.k.matches(tags)) {
                return true;
            }
        }

        return this._freeform !== undefined && this._source.data[this._freeform.key] !== undefined;
    }

    private CurrentValue(): TagsFilter {
        const tags = TagUtils.proprtiesToKV(this._source.data);

        for (const oneOnOneElement of this._mapping.concat(this._renderMapping)) {
            if (oneOnOneElement.k === null || oneOnOneElement.k.matches(tags)) {
                return oneOnOneElement.k;
            }
        }
        if (this._freeform === undefined) {
            return undefined;
        }

        return new Tag(this._freeform.key, this._source.data[this._freeform.key]);
    }


    IsQuestioning(): boolean {
        if (this.IsKnown()) {
            return false;
        }
        if (this._question === undefined) {
            // We don't ask this question in the first place
            return false;
        }
        if (this._questionSkipped.data) {
            // We don't ask for this question anymore, skipped by user
            return false;
        }
        return true;
    }

    private RenderAnwser(): string {
        const tags = TagUtils.proprtiesToKV(this._source.data);

        let freeform = "";
        let freeformScore = -10;
        if (this._freeform !== undefined && this._source.data[this._freeform.key] !== undefined) {
            freeform = this.ApplyTemplate(this._freeform.renderTemplate);
            freeformScore = 0;
        }


            let highestScore = -100;
            let highestTemplate = undefined;
            for (const oneOnOneElement of this._mapping.concat(this._renderMapping)) {
                if (oneOnOneElement.k == null ||
                    oneOnOneElement.k.matches(tags)) {
                    // We have found a matching key -> we use the template, but only if it scores better
                    let score = oneOnOneElement.priority ??
                        (oneOnOneElement.k === null ? -1 : 0);
                    if (score > highestScore) {
                        highestScore = score;
                        highestTemplate = oneOnOneElement.txt
                    }
                }
            }

            if (freeformScore > highestScore) {
                return freeform;
            }

            if (highestTemplate !== undefined) {
                // we render the found template
                return this._primer + this.ApplyTemplate(highestTemplate);
            }
        

    }

    InnerRender(): string {

        if (this.IsQuestioning() || this._editMode.data) {
            // Not yet known or questioning, we have to ask a question


            return "<div class='question'>" +
                "<span class='question-text'>" + this._question + "</span>" +
                (this._question !== "" ? "<br/>" : "") +
                this._questionElement.Render() +
                this._skipButton.Render() +
                this._saveButton.Render() +
                "</div>"
        }

        if (this.IsKnown()) {
            const html = this.RenderAnwser();
            if (html == "") {
                return "";
            }
            let editButton = "";
            if(this._userDetails.data.loggedIn){
                editButton = this._editButton.Render();
            }

            return "<span class='answer'>" +
                "<span class='answer-text'>" + html + "</span>" +
                editButton +
                "</span>";
        }

        return "";

    }


    Priority(): number {
        return this._priority;
    }

    private ApplyTemplate(template: string): string {
        const tags = this._tagsPreprocessor(this._source.data);
        return TagUtils.ApplyTemplate(template, tags);
    }

    
    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        this._questionElement.Update(); // Another manual update for them
    }

}