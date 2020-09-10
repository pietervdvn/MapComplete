import {UIEventSource} from "../Logic/UIEventSource";
import {And, Tag, TagsFilter, TagUtils} from "../Logic/Tags";
import Translations from "../UI/i18n/Translations";
import Locale from "../UI/i18n/Locale";
import {State} from "../State";
import Translation from "../UI/i18n/Translation";
import Combine from "../UI/Base/Combine";
import {TagDependantUIElement} from "../Customizations/UIElementConstructor";
import {UIElement} from "./UIElement";
import {VariableUiElement} from "./Base/VariableUIElement";
import InputElementMap from "./Input/InputElementMap";
import {CheckBoxes} from "./Input/Checkboxes";
import {InputElement} from "./Input/InputElement";
import {SaveButton} from "./SaveButton";
import {RadioButton} from "./Input/RadioButton";
import {InputElementWrapper} from "./Input/InputElementWrapper";
import {FixedInputElement} from "./Input/FixedInputElement";
import {TextField, ValidatedTextField} from "./Input/TextField";
import {TagRenderingOptions} from "../Customizations/TagRenderingOptions";
import {FixedUiElement} from "./Base/FixedUiElement";

export class TagRendering extends UIElement implements TagDependantUIElement {


    private readonly _priority: number;
    private readonly _question: string | Translation;
    private readonly _mapping: { k: TagsFilter, txt: string | UIElement, priority?: number }[];

    private currentTags: UIEventSource<any>;


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
        multiAnswer?: boolean,
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

        this._questionElement = this.InputElementFor(options) ??
            new FixedInputElement<TagsFilter>("<span class='alert'>No input possible</span>", new Tag("a", "b"));
        const save = () => {
            const selection = self._questionElement.GetValue().data;
            console.log("Tagrendering: saving tags ", selection);
            if (selection) {
                State.state?.changes?.addTag(tags.data.id, selection);
            }
            self._editMode.setData(false);
        }

        this._appliedTags = new VariableUiElement(
            self._questionElement.GetValue().map(
                (tags: TagsFilter) => {
                    if (tags === undefined) {
                        return Translations.t.general.noTagsSelected.SetClass("subtle").Render();
                    }
                    const csCount = State.state?.osmConnection?.userDetails?.data?.csCount ?? 1000;
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
        ).ListenTo(self._questionElement);

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
            this._editButton = new FixedUiElement(
                "<img style='width: 1.3em;height: 1.3em;padding: 0.5em;border-radius: 0.65em;border: solid black 1px;font-size: medium;float: right;' " +
                "src='./assets/pencil.svg' alt='edit'>")
                .onClick(() => {
                    self._editMode.setData(true);
                    self._questionElement.GetValue().setData(self.CurrentValue());
                });
        }

        const cancelContents = this._editMode.map((isEditing) => {
            if (isEditing) {
                return "<span class='skip-button'>" + Translations.t.general.cancel.R() + "</span>";
            } else {
                return "<span class='skip-button'>" + Translations.t.general.skip.R() + "</span>";
            }
        }, [Locale.language]);
        // And at last, set up the skip button
        this._skipButton = new VariableUiElement(cancelContents).onClick(cancel);
    }


    private InputElementFor(options: {
        freeform?: {
            key: string,
            template: string | Translation,
            renderTemplate: string | Translation,
            placeholder?: string | Translation,
            extraTags?: TagsFilter,
        },
        multiAnswer?: boolean,
        mappings?: { k: TagsFilter, txt: string | Translation, priority?: number, substitute?: boolean, hideInAnswer?: boolean }[]
    }):
        InputElement<TagsFilter> {


        let freeformElement = undefined;
        if (options.freeform !== undefined) {
            freeformElement = this.InputForFreeForm(options.freeform);
        }

        if (options.mappings === undefined || options.mappings.length === 0) {
            return freeformElement;
        }


        const elements: InputElement<TagsFilter>[] = [];

        for (const mapping of options.mappings) {
            if (mapping.k === null) {
                continue;
            }
            if (mapping.hideInAnswer) {
                continue;
            }
            elements.push(this.InputElementForMapping(mapping, mapping.substitute));
        }

        if (freeformElement !== undefined) {
            elements.push(freeformElement);
        }

        if (options.multiAnswer) {
            const possibleTags = elements.map(el => el.GetValue().data);
            const checkBoxes = new CheckBoxes(elements);

            // In order to let this work, we are cheating a lot here
            // First of all, it is very tricky to let the mapping stabilize
            // The selection gets added as list and needs to be flattened into a new 'and'
            // This new and causes the mapping to have a 'set value', which is unpacked to update the UI
            // AFter which the UI reupdates and reapplies the value
            // So, instead we opt to _always return the 'value' below which is statefully updated
            // But, then we still have to figure out when to update...
            // For this, we use the original inputElement
            // This is very dirty code, I know
            const value = new And([]);
            const inputElement = new InputElementMap(checkBoxes,
                (t0: And, t1: And) => {
                    return t0?.isEquivalent(t1) ?? t0 === t1
                },
                (fromUI) => {
                    if (fromUI === undefined) {
                        value.and = [];
                        return value;
                    }
                    const flattened = TagUtils.FlattenMultiAnswer(fromUI);
                    value.and = flattened.and;
                    return value;
                },
                (fromTags) => {
                    return TagUtils.SplitMultiAnswer(fromTags, possibleTags, this._freeform?.key, this._freeform?.extraTags);
                }
            );

            let previousSelectionCount = -1;
            checkBoxes.GetValue().addCallback(selected => {
                const newSelectionCount = selected.length;
                if (newSelectionCount != previousSelectionCount) {
                    previousSelectionCount = newSelectionCount;
                    inputElement.GetValue().ping();
                }
            });

            return inputElement;

        }
        return new RadioButton(elements, false);
    }


    private InputElementForMapping(mapping: { k: TagsFilter, txt: (string | Translation) }, substituteValues: boolean): FixedInputElement<TagsFilter> {
        if (substituteValues) {

            return new FixedInputElement(this.ApplyTemplate(mapping.txt),
                mapping.k.substituteValues(this.currentTags.data),
                (t0, t1) => t0.isEquivalent(t1)
            );
        }
        return new FixedInputElement(this.ApplyTemplate(mapping.txt), mapping.k,
            (t0, t1) => t0.isEquivalent(t1));
    }


    private InputForFreeForm(freeform :  {
        key: string,
        template: string | Translation,
        renderTemplate: string | Translation,
        placeholder?: string | Translation,
        extraTags?: TagsFilter,
    }): InputElement<TagsFilter> {
        if (freeform?.template === undefined) {
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

                if (tag.value.length > 255) {
                    return undefined; // Too long
                }

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
            console.log("Decoding ", tag, "in freeform text element")
                if (tag instanceof And) {
                    for (const subtag of tag.and) {
                        if(subtag instanceof Tag && subtag.key === freeform.key){
                            return subtag.value;
                        }
                    }
                    
                    return undefined;
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
        if (this._question === undefined ||
            this._question === "" ||
            (this._freeform?.template === undefined && (this._mapping?.length ?? 0) == 0)) {
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

        if (this.IsQuestioning() 
            && (State.state !== undefined) // If State.state is undefined, we are testing/custom theme building -> show regular save
            && !State.state.osmConnection.userDetails.data.loggedIn) {
            
            const question =
                this.ApplyTemplate(this._question).SetClass('question-text');
            return "<div class='question'>" +
                new Combine([
                    question.Render(),
                    "<br/>",
                    this._questionElement,
                    "<span class='login-button-friendly'>",
                    this._friendlyLogin,
                    "</span>",
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

            const answer = this.RenderAnswer();
            if(answer.IsEmpty()){
                return "";
            }
            let editButton;
            if (State.state === undefined || // state undefined -> we are custom testing
                State.state?.osmConnection?.userDetails?.data?.loggedIn && this._question !== undefined) {
                editButton = this._editButton;
            }

            return new Combine([
                "<span class='answer'>",
                "<span class='answer-text'>",
                answer,
                "</span>",
                editButton ?? "",
                "</span>"]).Render();
        }

        return "";
    }


    Priority(): number {
        return this._priority;
    }

    private ApplyTemplate(template: string | Translation): UIElement {
        if (template === undefined || template === null) {
            return undefined;
        }
        return new VariableUiElement(this.currentTags.map(tags => {
            const tr = Translations.WT(template);
            if (tr.Subs === undefined) {
                // This is a weird edge case
                return tr.InnerRender();
            }
            return tr.Subs(tags).InnerRender()
        })).ListenTo(Locale.language);
    }


 
}