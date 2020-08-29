import {UIElement} from "../UI/UIElement";
import {UIEventSource} from "../Logic/UIEventSource";
import {And, Tag, TagsFilter, TagUtils} from "../Logic/Tags";
import {FixedUiElement} from "../UI/Base/FixedUiElement";
import {SaveButton} from "../UI/SaveButton";
import {VariableUiElement} from "../UI/Base/VariableUIElement";
import {TagDependantUIElement} from "./UIElementConstructor";
import {TextField, ValidatedTextField} from "../UI/Input/TextField";
import {InputElement} from "../UI/Input/InputElement";
import {InputElementWrapper} from "../UI/Input/InputElementWrapper";
import {FixedInputElement} from "../UI/Input/FixedInputElement";
import {RadioButton} from "../UI/Input/RadioButton";
import Translations from "../UI/i18n/Translations";
import Locale from "../UI/i18n/Locale";
import {State} from "../State";
import {TagRenderingOptions} from "./TagRenderingOptions";
import Translation from "../UI/i18n/Translation";
import Combine from "../UI/Base/Combine";


export class 
TagRendering extends UIElement implements TagDependantUIElement {


    private readonly _priority: number;
    private readonly _question: string | Translation;
    private readonly _mapping: { k: TagsFilter, txt: string | UIElement, priority?: number }[];

    private currentTags : UIEventSource<any> ;
    
    
    private readonly _freeform: {
        key: string,
        template: string | UIElement,
        renderTemplate: string | Translation,
        placeholder?: string | UIElement,
        extraTags?: TagsFilter
    };


    private readonly _questionElement: InputElement<TagsFilter>;

    private readonly _saveButton: UIElement;
    private readonly _friendlyLogin: UIElement;

    private readonly _skipButton: UIElement;
    private readonly _editButton: UIElement;

    private readonly _appliedTags: UIElement;

    private readonly _questionSkipped: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    private readonly _editMode: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    
    static injectFunction() {
        // This is a workaround as not to import tagrendering into TagREnderingOptions
        TagRenderingOptions.tagRendering = (tags, options) => new TagRendering(tags, options);
        return true;
    }

    constructor(tags: UIEventSource<any>, options: {
        priority?: number

        question?: string | Translation,

        freeform?: {
            key: string,
            template: string | Translation,
            renderTemplate: string | Translation,
            placeholder?: string | Translation,
            extraTags?: TagsFilter,
        },
        tagsPreprocessor?: ((tags: any) => any),
        mappings?: { k: TagsFilter, txt: string | Translation, priority?: number, substitute?: boolean, hideInAnswer?: boolean }[]
    }) {
        super(tags);
        this.ListenTo(Locale.language);
        this.ListenTo(this._questionSkipped);
        this.ListenTo(this._editMode);
        this.ListenTo(State.state?.osmConnection?.userDetails);

        const self = this;
       
        this._priority = options.priority ?? 0;
        
        this.currentTags = this._source.map(tags => 
            {

                if (options.tagsPreprocessor === undefined) {
                    return tags;
                }
                // we clone the tags...
                let newTags = {};
                for (const k in tags) {
                    newTags[k] = tags[k];
                }
                // ... in order to safely edit them here
                options.tagsPreprocessor(newTags); 
                return newTags;
            }
        );

        if (options.question !== undefined) {
            this._question = options.question;
        }
        
        this._mapping = [];
        this._freeform = options.freeform;


        for (const choice of options.mappings ?? []) {


            let choiceSubbed = {
                k: choice.k?.substituteValues(this.currentTags.data),
                txt: choice.txt,
                priority: choice.priority
            }


            this._mapping.push({
                k: choiceSubbed.k,
                txt: choiceSubbed.txt
            });
        }


        // Prepare the actual input element -> pick an appropriate implementation

        this._questionElement = this.InputElementFor(options);
        const save = () => {
            const selection = self._questionElement.GetValue().data;
            console.log("Tagrendering: saving tags ", selection);
            if (selection) {
                State.state.changes.addTag(tags.data.id, selection);
            }
            self._editMode.setData(false);
        }

        this._appliedTags = new VariableUiElement(
            self._questionElement.GetValue().map(
                (tags: TagsFilter) => {
                    if (tags === undefined) {
                        return Translations.t.general.noTagsSelected.SetClass("subtle").Render();
                    }
                    const csCount = State.state.osmConnection.userDetails.data.csCount;
                    if (csCount < State.userJourney.tagsVisibleAt) {
                        return "";
                    }
                    if (csCount < State.userJourney.tagsVisibleAndWikiLinked) {
                        const tagsStr = tags.asHumanString(false, true);
                        return new FixedUiElement(tagsStr).SetClass("subtle").Render();
                    }
                    return tags.asHumanString(true, true);
                }
            )
        );

        const cancel = () => {
            self._questionSkipped.setData(true);
            self._editMode.setData(false);
            self._source.ping(); // Send a ping upstream to render the next question
        }

        // Setup the save button and it's action
        this._saveButton = new SaveButton(this._questionElement.GetValue())
            .onClick(save);

        this._friendlyLogin = Translations.t.general.loginToStart
            .onClick(() => State.state.osmConnection.AttemptLogin())

        this._editButton = new FixedUiElement("");
        if (this._question !== undefined) {
            this._editButton = new FixedUiElement("<img class='editbutton' src='./assets/pencil.svg' alt='edit'>")
                .onClick(() => {
                    self._editMode.setData(true);
                    self._questionElement.GetValue().setData(self.CurrentValue());
                });
        }


        const cancelContents = this._editMode.map((isEditing) => {
            if (isEditing) {
                return "<span class='skip-button'>"+Translations.t.general.cancel.R()+"</span>";
            } else {
                return "<span class='skip-button'>"+Translations.t.general.skip.R()+"</span>";
            }
        }, [Locale.language]);
        // And at last, set up the skip button
        this._skipButton = new VariableUiElement(cancelContents).onClick(cancel)    ;
    }


    private InputElementFor(options: {
        freeform?: {
            key: string, 
            template: string | Translation,
            renderTemplate: string | Translation,
            placeholder?: string | Translation,
            extraTags?: TagsFilter,
        },
        mappings?: { k: TagsFilter, txt: string | Translation, priority?: number, substitute?: boolean, hideInAnswer?: boolean }[]
    }):
        InputElement<TagsFilter> {

        const elements = [];

        if (options.mappings !== undefined) {
            
            const previousTexts= [];
            for (const mapping of options.mappings) {
                if(mapping.k === null){
                    continue;
                }
                if(mapping.hideInAnswer){
                    continue;
                }
                previousTexts.push(this.ApplyTemplate(mapping.txt));
                
                elements.push(this.InputElementForMapping(mapping));
            }
        }

        if (options.freeform !== undefined) {
            elements.push(this.InputForFreeForm(options.freeform));
        }


        if (elements.length == 0) {
            return new FixedInputElement("This should not happen: no tag renderings defined", undefined);
        }
        if (elements.length == 1) {
            return elements[0];
        }

        return new RadioButton(elements, false);

    }


    private InputElementForMapping(mapping: { k: TagsFilter, txt: string | Translation }) {
        return new FixedInputElement(this.ApplyTemplate(mapping.txt),
            mapping.k.substituteValues(this.currentTags.data)
        );
    }


    private InputForFreeForm(freeform): InputElement<TagsFilter> {
        if (freeform === undefined) {
            return undefined;
        }

        const prepost = Translations.W(freeform.template).InnerRender()
            .replace("$$$", "$string$")
            .split("$");
        const type = prepost[1];

        let isValid = ValidatedTextField.inputValidation[type];
        if (isValid === undefined) {
            isValid = () => true;
        }
        let formatter = ValidatedTextField.formatting[type] ?? ((str) => str);

        const pickString =
            (string: any) => {
                if (string === "" || string === undefined) {
                    return undefined;
                }
                if (!isValid(string, this._source.data._country)) {
                    return undefined;
                }
                const tag = new Tag(freeform.key, formatter(string, this._source.data._country));
                
                if (freeform.extraTags === undefined) {
                    return tag;
                }
                return new And([
                        tag,
                        freeform.extraTags
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
                return undefined;
            }


        const textField = new TextField({
            placeholder: this._freeform.placeholder,
            fromString: pickString,
            toString: toString
        });

        const pre = prepost[0] !== undefined ? this.ApplyTemplate(prepost[0]) : "";
        const post = prepost[2] !== undefined ? this.ApplyTemplate(prepost[2]) : "";

        return new InputElementWrapper(pre, textField, post);
    }


    IsKnown(): boolean {
        const tags = TagUtils.proprtiesToKV(this._source.data);

        for (const oneOnOneElement of this._mapping) {
            if (oneOnOneElement.k === null || oneOnOneElement.k === undefined || oneOnOneElement.k.matches(tags)) {
                return true;
            }
        }
        return this._freeform !== undefined && this._source.data[this._freeform.key] !== undefined;
    }

    IsSkipped(): boolean {
        return this._questionSkipped.data;
    }

    private CurrentValue(): TagsFilter {
        const tags = TagUtils.proprtiesToKV(this._source.data);

        for (const oneOnOneElement of this._mapping) {
            if (oneOnOneElement.k !== null && oneOnOneElement.k.matches(tags)) {
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

    private RenderAnswer(): UIElement {
        const tags = TagUtils.proprtiesToKV(this._source.data);

        let freeform: UIElement = new FixedUiElement("");
        let freeformScore = -10;
        if (this._freeform !== undefined && this._source.data[this._freeform.key] !== undefined) {
            freeform = this.ApplyTemplate(this._freeform.renderTemplate);
            freeformScore = 0;
        }


        let highestScore = -100;
        let highestTemplate = undefined;
        for (const oneOnOneElement of this._mapping) {
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
            return this.ApplyTemplate(highestTemplate);
        }
    }


    InnerRender(): string {

        if (this.IsQuestioning() && !State.state?.osmConnection?.userDetails?.data?.loggedIn) {
            const question =
                this.ApplyTemplate(this._question).SetClass('question-text');
            return "<div class='question'>" +
                new Combine([
                    question,
                    "<br/>",
                    this._questionElement.Render(),
                    "<span class='login-button-friendly'>" + this._friendlyLogin.Render() + "</span>",
                ]).Render() + "</div>";
        }

        if (this.IsQuestioning() || this._editMode.data) {
            // Not yet known or questioning, we have to ask a question

            return "<div class='question'>" +
                new Combine([
                    "<span class='question-text'>",
                    this.ApplyTemplate(this._question), 
                    "</span>",
                    "<br/>",
                    "<div>", this._questionElement , "</div>",
                    this._skipButton,
                    this._saveButton,
                    "<br/>",
                    this._appliedTags
                ]).Render() +
                "</div>"
        }

        if (this.IsKnown()) {
            const html = this.RenderAnswer().Render();
            if (html === "") {
                return "";
            }


            let editButton = "";
            if (State.state?.osmConnection?.userDetails?.data?.loggedIn && this._question !== undefined) {
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

    private ApplyTemplate(template: string | Translation): UIElement {
        if (template === undefined || template === null) {
            console.warn("Applying template which is undefined by ",this); // TODO THis error msg can probably be removed
            return undefined;
        }
        return new VariableUiElement(this.currentTags.map(tags => {
            const tr = Translations.WT(template);
            if (tr.Subs === undefined) {
                // This is a weird edge case
                return tr.InnerRender();
            }
            return tr.Subs(tags).InnerRender()
        }));
    }


 
}