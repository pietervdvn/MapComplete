import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import {InputElement} from "../Input/InputElement";
import ValidatedTextField from "../Input/ValidatedTextField";
import {FixedInputElement} from "../Input/FixedInputElement";
import {RadioButton} from "../Input/RadioButton";
import {Utils} from "../../Utils";
import CheckBoxes from "../Input/Checkboxes";
import InputElementMap from "../Input/InputElementMap";
import {SaveButton} from "./SaveButton";
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
import BaseUIElement from "../BaseUIElement";
import {DropDown} from "../Input/DropDown";
import InputElementWrapper from "../Input/InputElementWrapper";
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction";
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
import {Unit} from "../../Models/Unit";
import VariableInputElement from "../Input/VariableInputElement";
import Toggle from "../Input/Toggle";
import Img from "../Base/Img";
import FeaturePipelineState from "../../Logic/State/FeaturePipelineState";
import Title from "../Base/Title";

/**
 * Shows the question element.
 * Note that the value _migh_ already be known, e.g. when selected or when changing the value
 */
export default class TagRenderingQuestion extends Combine {

    constructor(tags: UIEventSource<any>,
                configuration: TagRenderingConfig,
                state,
                options?: {
                    units?: Unit[],
                    afterSave?: () => void,
                    cancelButton?: BaseUIElement,
                    saveButtonConstr?: (src: UIEventSource<TagsFilter>) => BaseUIElement,
                    bottomText?: (src: UIEventSource<TagsFilter>) => BaseUIElement
                }
    ) {


        const applicableMappingsSrc =
            UIEventSource.ListStabilized(tags.map(tags => {
                const applicableMappings: { if: TagsFilter, then: any, ifnot?: TagsFilter, addExtraTags: Tag[] }[] = []
                for (const mapping of configuration.mappings ?? []) {
                    if (mapping.hideInAnswer === true) {
                        continue
                    }
                    if (mapping.hideInAnswer === false || mapping.hideInAnswer === undefined) {
                        applicableMappings.push(mapping)
                        continue
                    }
                    const condition = <TagsFilter>mapping.hideInAnswer;
                    const isShown = !condition.matchesProperties(tags)
                    if (isShown) {
                        applicableMappings.push(mapping)
                    }
                }
                return applicableMappings
            }));

        if (configuration === undefined) {
            throw "A question is needed for a question visualization"
        }
        options = options ?? {}
        const applicableUnit = (options.units ?? []).filter(unit => unit.isApplicableToKey(configuration.freeform?.key))[0];
        const question = new Title(new SubstitutedTranslation(configuration.question, tags, state)
            .SetClass("question-text"), 3);


        const feedback = new UIEventSource<Translation>(undefined)
        const inputElement: InputElement<TagsFilter> =
            new VariableInputElement(applicableMappingsSrc.map(applicableMappings =>
                TagRenderingQuestion.GenerateInputElement(state, configuration, applicableMappings, applicableUnit, tags, feedback)
            ))
     


        const save = () => {
            const selection = inputElement.GetValue().data;
            if (selection) {
                (state?.changes)
                    .applyAction(new ChangeTagAction(
                        tags.data.id, selection, tags.data, {
                            theme: state?.layoutToUse?.id ?? "unkown",
                            changeType: "answer",
                        }
                    )).then(_ => {
                    console.log("Tagchanges applied")
                })
                if (options.afterSave) {
                    options.afterSave();
                }
            }
        }

        if (options.saveButtonConstr === undefined) {
            options.saveButtonConstr = v => new SaveButton(v,
                state?.osmConnection)
                .onClick(save)
        }

        const saveButton = new Combine([
            options.saveButtonConstr(inputElement.GetValue()),
        ])

        let bottomTags: BaseUIElement;
        if (options.bottomText !== undefined) {
            bottomTags = options.bottomText(inputElement.GetValue())
        } else {
            bottomTags = new VariableUiElement(
                inputElement.GetValue().map(
                    (tagsFilter: TagsFilter) => {
                        const csCount = state?.osmConnection?.userDetails?.data?.csCount ?? 1000;
                        if (csCount < Constants.userJourney.tagsVisibleAt) {
                            return "";
                        }
                        if (tagsFilter === undefined) {
                            return Translations.t.general.noTagsSelected.SetClass("subtle");
                        }
                        if (csCount < Constants.userJourney.tagsVisibleAndWikiLinked) {
                            const tagsStr = tagsFilter.asHumanString(false, true, tags.data);
                            return new FixedUiElement(tagsStr).SetClass("subtle");
                        }
                        return tagsFilter.asHumanString(true, true, tags.data);
                    }
                )
            ).SetClass("block break-all")
        }
        super([
            question,
            inputElement,
            new Combine([
                new VariableUiElement(feedback.map(t => t?.SetStyle("padding-left: 0.75rem; padding-right: 0.75rem")?.SetClass("alert flex") ?? bottomTags)),
                new Combine([
                    new Combine([options.cancelButton]),
                    saveButton]).SetClass("flex justify-end flex-wrap-reverse")

            ]).SetClass("flex mt-2 justify-between"),Them
            new Toggle(Translations.t.general.testing.SetClass("alert"), undefined, state.featureSwitchIsTesting)
        ])


        this.SetClass("question disable-links")
    }


    private static GenerateInputElement(
        state,
        configuration: TagRenderingConfig,
        applicableMappings: { if: TagsFilter, then: any, ifnot?: TagsFilter, addExtraTags: Tag[] }[],
        applicableUnit: Unit,
        tagsSource: UIEventSource<any>,
        feedback: UIEventSource<Translation>
    ): InputElement<TagsFilter> {

        // FreeForm input will be undefined if not present; will already contain a special input element if applicable
        const ff = TagRenderingQuestion.GenerateFreeform(state, configuration, applicableUnit, tagsSource, feedback);

       
        const hasImages = applicableMappings.filter(mapping => mapping.then.ExtractImages().length > 0).length > 0
        let inputEls: InputElement<TagsFilter>[];


        const ifNotsPresent = applicableMappings.some(mapping => mapping.ifnot !== undefined)

        function allIfNotsExcept(excludeIndex: number): TagsFilter[] {
            if (configuration.mappings === undefined || configuration.mappings.length === 0) {
                return undefined
            }
            if (!ifNotsPresent) {
                return []
            }
            if (configuration.multiAnswer) {
                // The multianswer will do the ifnot configuration themself
                return []
            }

            const negativeMappings = []

            for (let i = 0; i < applicableMappings.length; i++) {
                const mapping = applicableMappings[i];
                if (i === excludeIndex || mapping.ifnot === undefined) {
                    continue
                }
                negativeMappings.push(mapping.ifnot)
            }
            return Utils.NoNull(negativeMappings)

        }


        if (applicableMappings.length < 8 || configuration.multiAnswer || hasImages || ifNotsPresent) {
            inputEls = (applicableMappings ?? []).map((mapping, i) => TagRenderingQuestion.GenerateMappingElement(state, tagsSource, mapping, allIfNotsExcept(i)));
            inputEls = Utils.NoNull(inputEls);
        } else {
            const dropdown: InputElement<TagsFilter> = new DropDown("",
                applicableMappings.map((mapping, i) => {
                    return {
                        value: new And([mapping.if, ...allIfNotsExcept(i)]),
                        shown: Translations.WT(mapping.then)
                    }
                })
            )

            if (ff == undefined) {
                return dropdown;
            } else {
                inputEls = [dropdown]
            }
        }


        if (inputEls.length == 0) {
            if (ff === undefined) {
                throw "Error: could not generate a question: freeform and all mappings are undefined"
            }
            return ff;
        }

        if (ff) {
            inputEls.push(ff);
        }

        if (configuration.multiAnswer) {
            return TagRenderingQuestion.GenerateMultiAnswer(configuration, inputEls, ff, applicableMappings.map(mp => mp.ifnot))
        } else {
            return new RadioButton(inputEls, {selectFirstAsDefault: false})
        }

    }


    private static GenerateMultiAnswer(
        configuration: TagRenderingConfig,
        elements: InputElement<TagsFilter>[], freeformField: InputElement<TagsFilter>, ifNotSelected: TagsFilter[]): InputElement<TagsFilter> {
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
                if (configuration.freeform?.key) {
                    freeformExtras = [...(presentTags[configuration.freeform.key] ?? [])]
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
                            const freeformsToRemove: string[] = (neededTags[configuration.freeform.key] ?? []);
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
                        freeformField.GetValue().setData(new Tag(configuration.freeform.key, freeformExtras.join(";")));
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


    /**
     * Generates a (Fixed) input element for this mapping.
     * Note that the mapping might hide itself if the condition is not met anymore.
     *
     * Returns: [the element itself, the value to select if not selected. The contents of this UIEventSource might swap to undefined if the conditions to show the answer are unmet]
     */
    private static GenerateMappingElement(
        state,
        tagsSource: UIEventSource<any>,
        mapping: {
            if: TagsFilter,
            then: Translation,
            addExtraTags: Tag[],
            img?: string
        }, ifNot?: TagsFilter[]): InputElement<TagsFilter> {

        let tagging: TagsFilter = mapping.if;
        if (ifNot !== undefined) {
            tagging = new And([mapping.if, ...ifNot])
        }
        if (mapping.addExtraTags) {
            tagging = new And([tagging, ...mapping.addExtraTags])
        }


        return new FixedInputElement(
            TagRenderingQuestion.GenerateMappingContent(mapping, tagsSource, state),
            tagging,
            (t0, t1) => t1.isEquivalent(t0));
    }

    private static GenerateMappingContent(mapping: {
        then: Translation,
        icon?: string
    }, tagsSource: UIEventSource<any>, state: FeaturePipelineState): BaseUIElement {
        const text = new SubstitutedTranslation(mapping.then, tagsSource, state)
        if (mapping.icon === undefined) {
            return text;
        }
        return new Combine([new Img(mapping.icon).SetClass("w-6 max-h-6 pr-2"), text]).SetClass("flex")
    }

    private static GenerateFreeform(state, configuration: TagRenderingConfig, applicableUnit: Unit, tags: UIEventSource<any>, feedback: UIEventSource<Translation>)
        : InputElement<TagsFilter> {
        const freeform = configuration.freeform;
        if (freeform === undefined) {
            return undefined;
        }

        const pickString =
            (string: any) => {
                if (string === "" || string === undefined) {
                    return undefined;
                }
                if (string.length >= 255) {
                    return undefined
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

        const tagsData = tags.data;
        const feature = state.allElements.ContainingFeatures.get(tagsData.id)
        const input: InputElement<string> = ValidatedTextField.ForType(configuration.freeform.type).ConstructInputElement({
            country: () => tagsData._country,
            location: [tagsData._lat, tagsData._lon],
            mapBackgroundLayer: state.backgroundLayer,
            unit: applicableUnit,
            args: configuration.freeform.helperArgs,
            feature,
            placeholder: configuration.freeform.placeholder,
            feedback
        });
        
        input.GetValue().setData(tagsData[freeform.key] ?? freeform.default);
        
        input.GetValue().addCallbackD(v => {
            if(v.length >= 255){
                feedback.setData(Translations.t.validation.tooLong.Subs({count: v.length}))
            }
        })

        let inputTagsFilter: InputElement<TagsFilter> = new InputElementMap(
            input, (a, b) => a === b || (a?.isEquivalent(b) ?? false),
            pickString, toString
        );

        if (freeform.inline) {

            inputTagsFilter.SetClass("w-16-imp")
            inputTagsFilter = new InputElementWrapper(inputTagsFilter, configuration.render, freeform.key, tags, state)
            inputTagsFilter.SetClass("block")

        }

        return inputTagsFilter;

    }

}