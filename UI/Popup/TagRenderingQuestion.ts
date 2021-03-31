import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import {InputElement} from "../Input/InputElement";
import ValidatedTextField from "../Input/ValidatedTextField";
import {FixedInputElement} from "../Input/FixedInputElement";
import {RadioButton} from "../Input/RadioButton";
import {Utils} from "../../Utils";
import CheckBoxes from "../Input/Checkboxes";
import InputElementMap from "../Input/InputElementMap";
import {SaveButton} from "./SaveButton";
import State from "../../State";
import {Changes} from "../../Logic/Osm/Changes";
import {VariableUiElement} from "../Base/VariableUIElement";
import Translations from "../i18n/Translations";
import {FixedUiElement} from "../Base/FixedUiElement";
import {Translation} from "../i18n/Translation";
import Constants from "../../Models/Constants";
import {SubstitutedTranslation} from "../SubstitutedTranslation";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import {Tag} from "../../Logic/Tags/Tag";
import {And} from "../../Logic/Tags/And";
import {TagUtils} from "../../Logic/Tags/TagUtils";

/**
 * Shows the question element.
 * Note that the value _migh_ already be known, e.g. when selected or when changing the value
 */
export default class TagRenderingQuestion extends UIElement {
    private readonly _tags: UIEventSource<any>;
    private _configuration: TagRenderingConfig;

    private _saveButton: UIElement;

    private _inputElement: InputElement<TagsFilter>;
    private _cancelButton: UIElement;
    private _appliedTags: UIElement;
    private _question: UIElement;

    constructor(tags: UIEventSource<any>,
                configuration: TagRenderingConfig,
                afterSave?: () => void,
                cancelButton?: UIElement
    ) {
        super(tags);
        this._tags = tags;
        this._configuration = configuration;
        this._cancelButton = cancelButton;
        this._question = SubstitutedTranslation.construct(this._configuration.question, tags)
            .SetClass("question-text");
        if (configuration === undefined) {
            throw "A question is needed for a question visualization"
        }


        this._inputElement = this.GenerateInputElement()
        const self = this;
        const save = () => {
            const selection = self._inputElement.GetValue().data;
            console.log("Save button clicked, the tags are is", selection)
            if (selection) {
                (State.state?.changes ?? new Changes())
                    .addTag(tags.data.id, selection, tags);
            }

            if (afterSave) {
                afterSave();
            }
        }


        this._saveButton = new SaveButton(this._inputElement.GetValue(), State.state?.osmConnection)
            .onClick(save)


        this._appliedTags = new VariableUiElement(
            self._inputElement.GetValue().map(
                (tags: TagsFilter) => {
                    const csCount = State.state?.osmConnection?.userDetails?.data?.csCount ?? 1000;
                    if (csCount < Constants.userJourney.tagsVisibleAt) {
                        return "";
                    }
                    if (tags === undefined) {
                        return Translations.t.general.noTagsSelected.SetClass("subtle").Render();
                    }
                    if (csCount < Constants.userJourney.tagsVisibleAndWikiLinked) {
                        const tagsStr = tags.asHumanString(false, true, self._tags.data);
                        return new FixedUiElement(tagsStr).SetClass("subtle").Render();
                    }
                    return tags.asHumanString(true, true, self._tags.data);
                }
            )
        ).SetClass("block")
    }

    InnerRender(): string {
        return new Combine([
            this._question,
            this._inputElement,
            this._cancelButton,
            this._saveButton,
            this._appliedTags]
        )
            .SetClass("question")
            .Render()
    }

    private GenerateInputElement(): InputElement<TagsFilter> {
        const ff = this.GenerateFreeform();
        const self = this;
        let mappings =
            (this._configuration.mappings ?? []).map(mapping => self.GenerateMappingElement(mapping));
        mappings = Utils.NoNull(mappings);

        if (mappings.length == 0) {
            return ff;
        }

        if (ff) {
            mappings.push(ff);
        }

        if (this._configuration.multiAnswer) {
            return this.GenerateMultiAnswer(mappings, ff, this._configuration.mappings.map(mp => mp.ifnot))
        } else {
            return new RadioButton(mappings, false)
        }

    }

    private GenerateMultiAnswer(elements: InputElement<TagsFilter>[], freeformField: InputElement<TagsFilter>, ifNotSelected: TagsFilter[]): InputElement<TagsFilter> {
        const checkBoxes = new CheckBoxes(elements);
        const inputEl = new InputElementMap<number[], TagsFilter>(
            checkBoxes,
            (t0, t1) => {
                return t0?.isEquivalent(t1) ?? false
            },
            (indices) => {
                if (indices.length === 0) {
                    return undefined;
                }
                const tags: TagsFilter[] = indices.map(i => elements[i].GetValue().data);
                const oppositeTags: TagsFilter[] = [];
                for (let i = 0; i < ifNotSelected.length; i++) {
                    if (indices.indexOf(i) >= 0) {
                        continue;
                    }
                    const notSelected = ifNotSelected[i];
                    if (notSelected === undefined) {
                        continue;
                    }
                    oppositeTags.push(notSelected);
                }
                tags.push(TagUtils.FlattenMultiAnswer(oppositeTags));
                return TagUtils.FlattenMultiAnswer(tags);
            },
            (tags: TagsFilter) => {
                // {key --> values[]}
                const presentTags = TagUtils.SplitKeys([tags]);
                const indices: number[] = []
                // We also collect the values that have to be added to the freeform field
                let freeformExtras: string[] = []
                if (this._configuration.freeform?.key) {
                    freeformExtras = [...(presentTags[this._configuration.freeform.key] ?? [])]
                }

                for (let j = 0; j < elements.length; j++) {
                    const inputElement = elements[j];
                    if (inputElement === freeformField) {
                        continue;
                    }
                    const val = inputElement.GetValue();
                    const neededTags = TagUtils.SplitKeys([val.data]);

                    // if every 'neededKeys'-value is present in presentKeys, we have a match and enable the index
                    if (TagUtils.AllKeysAreContained(presentTags, neededTags)) {
                        indices.push(j);
                        if (freeformExtras.length > 0) {
                            const freeformsToRemove: string[] = (neededTags[this._configuration.freeform.key] ?? []);
                            for (const toRm of freeformsToRemove) {
                                const i = freeformExtras.indexOf(toRm);
                                if (i >= 0) {
                                    freeformExtras.splice(i, 1);
                                }
                            }
                        }
                    }

                }
                if (freeformField) {
                    if (freeformExtras.length > 0) {
                        freeformField.GetValue().setData(new Tag(this._configuration.freeform.key, freeformExtras.join(";")));
                        indices.push(elements.indexOf(freeformField))
                    } else {
                        freeformField.GetValue().setData(undefined);
                    }
                }


                return indices;
            },
            elements.map(el => el.GetValue())
        );


        freeformField?.GetValue()?.addCallbackAndRun(value => {
            // The list of indices of the selected elements
            const es = checkBoxes.GetValue();
            const i = elements.length - 1;
            // The actual index of the freeform-element
            const index = es.data.indexOf(i);
            if (value === undefined) {
                // No data is set in the freeform text field; so we delete the checkmark if it is selected
                if (index >= 0) {
                    es.data.splice(index, 1);
                    es.ping();
                }
            } else if (index < 0) {
                // There is data defined in the checkmark, but the checkmark isn't checked, so we check it
                // This is of course because the data changed
                es.data.push(i);
                es.ping();
            }
        });

        return inputEl;
    }

    private GenerateMappingElement(mapping: {
        if: TagsFilter,
        then: Translation,
        hideInAnswer: boolean | TagsFilter
    }): InputElement<TagsFilter> {
        if (mapping.hideInAnswer === true) {
            return undefined;
        }
        if (typeof (mapping.hideInAnswer) !== "boolean" && mapping.hideInAnswer.matchesProperties(this._tags.data)) {
            return undefined;
        }
        return new FixedInputElement(
            SubstitutedTranslation.construct(mapping.then, this._tags),
            mapping.if,
            (t0, t1) => t1.isEquivalent(t0));
    }

    private GenerateFreeform(): InputElement<TagsFilter> {
        const freeform = this._configuration.freeform;
        if (freeform === undefined) {
            return undefined;
        }

        const pickString =
            (string: any) => {
                if (string === "" || string === undefined) {
                    return undefined;
                }

                const tag = new Tag(freeform.key, string);

                if (freeform.addExtraTags === undefined) {
                    return tag;
                }
                return new And([
                        tag,
                        ...freeform.addExtraTags
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

        const textField = ValidatedTextField.InputForType(this._configuration.freeform.type, {
            isValid: (str) => (str.length <= 255),
            country: () => this._tags.data._country,
            location: [this._tags.data._lat, this._tags.data._lon]
        });

        textField.GetValue().setData(this._tags.data[this._configuration.freeform.key]);

        return new InputElementMap(
            textField, (a, b) => a === b || (a?.isEquivalent(b) ?? false),
            pickString, toString
        );

    }

}