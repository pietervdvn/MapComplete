import {UIElement} from "../UIElement";
import Translation from "../i18n/Translation";
import {VariableUiElement} from "../Base/VariableUIElement";
import InputElementMap from "../Input/InputElementMap";
import CheckBoxes from "../Input/Checkboxes";
import Combine from "../Base/Combine";
import {And, Tag, TagsFilter, TagUtils} from "../../Logic/Tags";
import {InputElement} from "../Input/InputElement";
import {SaveButton} from "./SaveButton";
import {RadioButton} from "../Input/RadioButton";
import {FixedInputElement} from "../Input/FixedInputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import ValidatedTextField from "../Input/ValidatedTextField";
import {TagRenderingOptions} from "../../Customizations/TagRenderingOptions";
import State from "../../State";
import {SubstitutedTranslation} from "../SpecialVisualizations";
import {FixedUiElement} from "../Base/FixedUiElement";
import Translations from "../i18n/Translations";
import {TagDependantUIElement} from "../../Customizations/UIElementConstructor";
import Locale from "../i18n/Locale";

export class TagRendering extends UIElement implements TagDependantUIElement {


    private readonly _question: string | Translation;
    private readonly _mapping: { k: TagsFilter, txt: string | Translation, priority?: number }[];

    private readonly currentTags: UIEventSource<any>;


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
        if (tags === undefined) {
            throw "No tags given for a tagrendering..."
        }
        this.ListenTo(Locale.language);
        this.ListenTo(this._editMode);
        this.ListenTo(this._questionSkipped);
        this.ListenTo(State.state?.osmConnection?.userDetails);

        const self = this;

        this.currentTags = tags.map(tags => {

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
        tags.addCallback(() => self.currentTags.ping());

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
                    const csCount = State.state?.osmConnection?.userDetails?.data?.csCount ?? 1000;
                    if (csCount < State.userJourney.tagsVisibleAt) {
                        return "";
                    }

                    if (tags === undefined) {
                        return Translations.t.general.noTagsSelected.SetClass("subtle").Render();
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

        this._friendlyLogin = Translations.t.general.loginToStart.Clone()
            .SetClass("login-button-friendly")
            .onClick(() => State.state.osmConnection.AttemptLogin())

        this._editButton = new FixedUiElement("");
        if (this._question !== undefined) {
            // 2.3em total width
            this._editButton = new FixedUiElement(
                "<img style='width: 1.3em;height: 1.3em;padding: 0.5em;border-radius: 0.65em;border: solid black 1px;font-size: medium;float: right;' " +
                "src='./assets/pencil.svg' alt='edit'>")
                .onClick(() => {
                    self._editMode.setData(true);
                    self._questionElement.GetValue().setData(self.CurrentValue());
                });
        }

        const cancelContents = this._editMode.map((isEditing) => {
            const tr = Translations.t.general;
            const text = isEditing ? tr.cancel : tr.skip;
            return text
                .SetStyle("display: inline-block;border: solid black 0.5px;padding: 0.2em 0.3em;border-radius: 1.5em;")
                .Render();
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


        let freeformElement: InputElement<TagsFilter> = undefined;
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

        if (!options.multiAnswer) {
            return new RadioButton(elements, false);
        } else {
            const possibleTags = elements.map(el => el.GetValue().data);
            const checkBoxes = new CheckBoxes(elements);


            const inputEl = new InputElementMap<number[], TagsFilter>(checkBoxes,
                (t0, t1) => {
                    return t0?.isEquivalent(t1) ?? false
                },
                (indices) => {
                    if (indices.length === 0) {
                        return undefined;
                    }
                    let tags: TagsFilter[] = indices.map(i => elements[i].GetValue().data);
                    return TagUtils.FlattenMultiAnswer(tags);
                },
                (tags: TagsFilter) => {
                    const splitUpValues = TagUtils.SplitMultiAnswer(tags, possibleTags, this._freeform?.key, this._freeform?.extraTags);
                    const indices: number[] = []

                    for (let i = 0; i < splitUpValues.length; i++) {
                        let splitUpValue = splitUpValues[i];

                        for (let j = 0; j < elements.length; j++) {
                            let inputElement = elements[j];
                            if (inputElement.IsValid(splitUpValue)) {
                                indices.push(j);
                                inputElement.GetValue().setData(splitUpValue);
                                break;
                            }
                        }
                    }
                    return indices;
                },
                [freeformElement?.GetValue()]
            );

            freeformElement?.GetValue()?.addCallbackAndRun(value => {
                const es = checkBoxes.GetValue();
                const i = elements.length - 1;
                const index = es.data.indexOf(i);
                if (value === undefined) {
                    if (index >= 0) {
                        es.data.splice(index, 1);
                        es.ping();
                    }
                } else if (index < 0) {
                    es.data.push(i);
                    es.ping();
                }
            });

            return inputEl;
        }
    }


    private InputElementForMapping(mapping: { k: TagsFilter, txt: (string | Translation) }, substituteValues: boolean): FixedInputElement<TagsFilter> {
        if (substituteValues) {
            return new FixedInputElement(this.ApplyTemplate(mapping.txt),
                mapping.k.substituteValues(this.currentTags.data),
                (t0, t1) => t0.isEquivalent(t1)
            );
        }

        let txt = this.ApplyTemplate(mapping.txt);
        if (txt.Render().indexOf("<img") >= 0) {
            txt.SetClass("question-option-with-border");
        }
        const inputEl = new FixedInputElement(txt, mapping.k,
            (t0, t1) => t1.isEquivalent(t0));

        return inputEl;
    }


    private InputForFreeForm(freeform: {
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
        let type = prepost[1];

        let isTextArea = false;
        if (type === "text") {
            isTextArea = true;
            type = "string";
        }

        if (ValidatedTextField.AllTypes[type] === undefined) {
            console.error("Type:", type, ValidatedTextField.AllTypes)
            throw "Unkown type: " + type;
        }


        const pickString =
            (string: any) => {
                if (string === "" || string === undefined) {
                    return undefined;
                }

                const tag = new Tag(freeform.key, string);

                if (freeform.extraTags === undefined) {
                    return tag;
                }
                return new And([
                        tag,
                        freeform.extraTags
                    ]
                );
            };

        const toString = (tag) => {
            if (tag instanceof And) {
                for (const subtag of tag.and) {
                    if (subtag instanceof Tag && subtag.key === freeform.key) {
                        return subtag.value;
                    }
                }

                return undefined;
            } else if (tag instanceof Tag) {
                return tag.value
            }
            return undefined;
        }

        return ValidatedTextField.Mapped(pickString, toString, {
            placeholder: freeform.placeholder,
            type: type,
            isValid: (str) => (str.length <= 255),
            textArea: isTextArea,
            country: this._source.data._country
        })
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


        for (const oneOnOneElement of this._mapping) {
            if (oneOnOneElement.k.matches(tags)) {
                // We have found a matching key -> we use this template
                return this.ApplyTemplate(oneOnOneElement.txt);
            }
        }

        if (this._freeform !== undefined && this._source.data[this._freeform.key] !== undefined) {
            return this.ApplyTemplate(this._freeform.renderTemplate);
        }

        return new FixedUiElement("");
    }


    private CreateComponent(): UIElement {


        if (this.IsQuestioning()
            && (State.state !== undefined) // If State.state is undefined, we are testing/custom theme building -> show regular save
            && !State.state.osmConnection.userDetails.data.loggedIn) {

            const question =
                this.ApplyTemplate(this._question).SetClass('question-text');
            return new Combine(["<div class='question'>",
                question,
                "<br/>",
                this._questionElement,
                this._friendlyLogin, "</div>"
            ]);
        }

        if (this.IsQuestioning() || this._editMode.data) {
            // Not yet known or questioning, we have to ask a question
            return new Combine([
                this.ApplyTemplate(this._question).SetStyle('question-text'),
                "<br/>",
                "<div>", this._questionElement, "</div>",
                this._skipButton,
                this._saveButton,
                "<br/>",
                this._appliedTags
            ]).SetClass('question');
        }

        if (this.IsKnown()) {

            const answer = this.RenderAnswer();

            if (answer.IsEmpty()) {
                return new FixedUiElement("");
            }


            const answerStyle = "    display: inline-block;" +
                "    margin: 0.1em;" +
                "    width: 100%;" +
                "    font-size: large;"

            if (State.state === undefined || // state undefined -> we are custom testing
                State.state?.osmConnection?.userDetails?.data?.loggedIn && this._question !== undefined) {
                answer.SetStyle("display:inline-block;width:calc(100% - 2.3em);")
                return new Combine([
                    answer,
                    this._editButton])
                    .SetStyle(answerStyle);
            }

            return answer.SetStyle(answerStyle);
        }

        return new FixedUiElement("");
    }

    InnerRender(): string {
        return this.CreateComponent().Render();
    }


    protected InnerUpdate(htmlElement: HTMLElement) {
        this._editButton.Update();
    }

    private readonly answerCache = {}
    // Makes sure that the elements receive updates
    // noinspection JSMismatchedCollectionQueryUpdate
    private readonly substitutedElements : UIElement[]= [];

    private ApplyTemplate(template: string | Translation): UIElement {
        const tr = Translations.WT(template);
        if (this.answerCache[tr.id]) {
            return this.answerCache[tr.id];
        }
        // We have to cache these elemnts, otherwise it is to slow
        const el = new SubstitutedTranslation(tr, this.currentTags);
        this.answerCache[tr.id] = el;
        this.substitutedElements.push(el);
        return el;
    }

}
