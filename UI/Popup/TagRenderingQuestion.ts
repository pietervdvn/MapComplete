import { Store, Stores, UIEventSource } from "../../Logic/UIEventSource"
import Combine from "../Base/Combine"
import { InputElement, ReadonlyInputElement } from "../Input/InputElement"
import ValidatedTextField from "../Input/ValidatedTextField"
import { FixedInputElement } from "../Input/FixedInputElement"
import { RadioButton } from "../Input/RadioButton"
import { Utils } from "../../Utils"
import CheckBoxes from "../Input/Checkboxes"
import InputElementMap from "../Input/InputElementMap"
import { SaveButton } from "./SaveButton"
import { VariableUiElement } from "../Base/VariableUIElement"
import Translations from "../i18n/Translations"
import { FixedUiElement } from "../Base/FixedUiElement"
import { Translation } from "../i18n/Translation"
import Constants from "../../Models/Constants"
import { SubstitutedTranslation } from "../SubstitutedTranslation"
import { TagsFilter } from "../../Logic/Tags/TagsFilter"
import { Tag } from "../../Logic/Tags/Tag"
import { And } from "../../Logic/Tags/And"
import { TagUtils, UploadableTag } from "../../Logic/Tags/TagUtils"
import BaseUIElement from "../BaseUIElement"
import { DropDown } from "../Input/DropDown"
import InputElementWrapper from "../Input/InputElementWrapper"
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
import TagRenderingConfig, { Mapping } from "../../Models/ThemeConfig/TagRenderingConfig"
import { Unit } from "../../Models/Unit"
import VariableInputElement from "../Input/VariableInputElement"
import Toggle from "../Input/Toggle"
import Img from "../Base/Img"
import FeaturePipelineState from "../../Logic/State/FeaturePipelineState"
import Title from "../Base/Title"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import { GeoOperations } from "../../Logic/GeoOperations"
import { SearchablePillsSelector } from "../Input/SearchableMappingsSelector"
import { OsmTags } from "../../Models/OsmFeature"

/**
 * Shows the question element.
 * Note that the value _migh_ already be known, e.g. when selected or when changing the value
 */
export default class TagRenderingQuestion extends Combine {
    constructor(
        tags: UIEventSource<Record<string, string> & { id: string }>,
        configuration: TagRenderingConfig,
        state?: FeaturePipelineState,
        options?: {
            units?: Unit[]
            afterSave?: () => void
            cancelButton?: BaseUIElement
            saveButtonConstr?: (src: Store<TagsFilter>) => BaseUIElement
            bottomText?: (src: Store<TagsFilter>) => BaseUIElement
        }
    ) {
        const applicableMappingsSrc = Stores.ListStabilized(
            tags.map((tags) => {
                const applicableMappings: Mapping[] = []
                for (const mapping of configuration.mappings ?? []) {
                    if (mapping.hideInAnswer === true) {
                        continue
                    }
                    if (mapping.hideInAnswer === false || mapping.hideInAnswer === undefined) {
                        applicableMappings.push(mapping)
                        continue
                    }
                    const condition = <TagsFilter>mapping.hideInAnswer
                    const isShown = !condition.matchesProperties(tags)
                    if (isShown) {
                        applicableMappings.push(mapping)
                    }
                }
                return applicableMappings
            })
        )

        if (configuration === undefined) {
            throw "A question is needed for a question visualization"
        }
        options = options ?? {}
        const applicableUnit = (options.units ?? []).filter((unit) =>
            unit.isApplicableToKey(configuration.freeform?.key)
        )[0]
        const question = new Title(
            new SubstitutedTranslation(configuration.question, tags, state).SetClass(
                "question-text"
            ),
            3
        )

        const feedback = new UIEventSource<Translation>(undefined)
        const inputElement: ReadonlyInputElement<UploadableTag> = new VariableInputElement(
            applicableMappingsSrc.map((applicableMappings) => {
                return TagRenderingQuestion.GenerateInputElement(
                    state,
                    configuration,
                    applicableMappings,
                    applicableUnit,
                    tags,
                    feedback
                )
            })
        )

        const save = () => {
            const selection = TagUtils.FlattenMultiAnswer(
                TagUtils.FlattenAnd(inputElement.GetValue().data, tags.data)
            )
            if (selection) {
                ;(state?.changes)
                    .applyAction(
                        new ChangeTagAction(tags.data.id, selection, tags.data, {
                            theme: state?.layoutToUse?.id ?? "unkown",
                            changeType: "answer",
                        })
                    )
                    .then((_) => {
                        console.log("Tagchanges applied")
                    })
                if (options.afterSave) {
                    options.afterSave()
                }
            }
        }

        if (options.saveButtonConstr === undefined) {
            options.saveButtonConstr = (v) => new SaveButton(v, state?.osmConnection).onClick(save)
        }

        const saveButton = new Combine([options.saveButtonConstr(inputElement.GetValue())])

        let bottomTags: BaseUIElement
        if (options.bottomText !== undefined) {
            bottomTags = options.bottomText(inputElement.GetValue())
        } else {
            bottomTags = TagRenderingQuestion.CreateTagExplanation(
                inputElement.GetValue(),
                tags,
                state
            )
        }
        super([
            question,
            inputElement,
            new Combine([
                new VariableUiElement(
                    feedback.map(
                        (t) =>
                            t
                                ?.SetStyle("padding-left: 0.75rem; padding-right: 0.75rem")
                                ?.SetClass("alert flex") ?? bottomTags
                    )
                ),
                new Combine([new Combine([options.cancelButton]), saveButton]).SetClass(
                    "flex justify-end flex-wrap-reverse"
                ),
            ]).SetClass("flex mt-2 justify-between"),
            new Toggle(
                Translations.t.general.testing.SetClass("alert"),
                undefined,
                state?.featureSwitchIsTesting
            ),
        ])

        this.SetClass("question disable-links")
    }

    private static GenerateInputElement(
        state: FeaturePipelineState,
        configuration: TagRenderingConfig,
        applicableMappings: Mapping[],
        applicableUnit: Unit,
        tagsSource: UIEventSource<any>,
        feedback: UIEventSource<Translation>
    ): ReadonlyInputElement<UploadableTag> {
        const hasImages = applicableMappings.findIndex((mapping) => mapping.icon !== undefined) >= 0
        let inputEls: InputElement<UploadableTag>[]

        const ifNotsPresent = applicableMappings.some((mapping) => mapping.ifnot !== undefined)

        if (
            applicableMappings.length > 8 &&
            (configuration.freeform?.type === undefined ||
                configuration.freeform?.type === "string") &&
            (!configuration.multiAnswer || configuration.freeform === undefined)
        ) {
            return TagRenderingQuestion.GenerateSearchableSelector(
                state,
                configuration,
                applicableMappings,
                tagsSource
            )
        }

        // FreeForm input will be undefined if not present; will already contain a special input element if applicable
        const ff = TagRenderingQuestion.GenerateFreeform(
            state,
            configuration,
            applicableUnit,
            tagsSource,
            feedback
        )

        function allIfNotsExcept(excludeIndex: number): UploadableTag[] {
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
                const mapping = applicableMappings[i]
                if (i === excludeIndex || mapping.ifnot === undefined) {
                    continue
                }
                negativeMappings.push(mapping.ifnot)
            }
            return Utils.NoNull(negativeMappings)
        }

        if (
            applicableMappings.length < 8 ||
            configuration.multiAnswer ||
            (hasImages && applicableMappings.length < 16) ||
            ifNotsPresent
        ) {
            inputEls = (applicableMappings ?? []).map((mapping, i) =>
                TagRenderingQuestion.GenerateMappingElement(
                    state,
                    tagsSource,
                    mapping,
                    allIfNotsExcept(i)
                )
            )
            inputEls = Utils.NoNull(inputEls)
        } else {
            const dropdown: InputElement<UploadableTag> = new DropDown(
                "",
                applicableMappings.map((mapping, i) => {
                    return {
                        value: new And([mapping.if, ...allIfNotsExcept(i)]),
                        shown: mapping.then.Subs(tagsSource.data),
                    }
                })
            )

            if (ff == undefined) {
                return dropdown
            } else {
                inputEls = [dropdown]
            }
        }

        if (inputEls.length == 0) {
            if (ff === undefined) {
                throw "Error: could not generate a question: freeform and all mappings are undefined"
            }
            return ff
        }

        if (ff) {
            inputEls.push(ff)
        }

        if (configuration.multiAnswer) {
            return TagRenderingQuestion.GenerateMultiAnswer(
                configuration,
                inputEls,
                ff,
                applicableMappings.map((mp) => mp.ifnot)
            )
        } else {
            return new RadioButton(inputEls, { selectFirstAsDefault: false })
        }
    }

    private static MappingToPillValue(
        applicableMappings: Mapping[],
        tagsSource: UIEventSource<OsmTags>,
        state: FeaturePipelineState
    ): {
        show: BaseUIElement
        value: number
        mainTerm: Record<string, string>
        searchTerms?: Record<string, string[]>
        original: Mapping
    }[] {
        const values: {
            show: BaseUIElement
            value: number
            mainTerm: Record<string, string>
            searchTerms?: Record<string, string[]>
            original: Mapping
        }[] = []
        const addIcons = applicableMappings.some((m) => m.icon !== undefined)
        for (let i = 0; i < applicableMappings.length; i++) {
            const mapping = applicableMappings[i]
            const tr = mapping.then.Subs(tagsSource.data)
            const patchedMapping = <Mapping>{
                ...mapping,
                iconClass: mapping.iconClass ?? `small-height`,
                icon: mapping.icon ?? (addIcons ? "./assets/svg/none.svg" : undefined)
            }
            const fancy = TagRenderingQuestion.GenerateMappingContent(
                patchedMapping,
                tagsSource,
                state
            ).SetClass("normal-background")
            values.push({
                show: fancy,
                value: i,
                mainTerm: tr.translations,
                searchTerms: mapping.searchTerms,
                original: mapping,
            })
        }
        return values
    }

    /**
     *
     * // Should return the search as freeform value
     * const source = new UIEventSource({id: "1234"})
     * const tr =  new TagRenderingConfig({
     *      id:"test",
     *      render:"The value is {key}",
     *      freeform: {
     *          key:"key"
     *      },
     *      mappings: [
     *          {
     *            if:"x=y",
     *            then:"z",
     *            searchTerms: {
     *              "en" : ["z"]
     *            }
     *          }
     *      ]
     * }, "test");
     * const selector = TagRenderingQuestion.GenerateSearchableSelector(
     *          undefined,
     *          tr,
     *          tr.mappings,
     *          source,
     *          {
     *              search: new UIEventSource<string>("value")
     *          }
     *      );
     * selector.GetValue().data // => new And([new Tag("key","value")])
     *
     * // Should return the search as freeform value, even if a previous search matched
     * const source = new UIEventSource({id: "1234"})
     * const search = new UIEventSource<string>("")
     * const tr =  new TagRenderingConfig({
     *      id:"test",
     *      render:"The value is {key}",
     *      freeform: {
     *          key:"key"
     *      },
     *      mappings: [
     *          {
     *            if:"x=y",
     *            then:"z",
     *            searchTerms: {
     *              "en" : ["z"]
     *            }
     *          }
     *      ]
     * }, "test");
     * const selector = TagRenderingQuestion.GenerateSearchableSelector(
     *          undefined,
     *          tr,
     *          tr.mappings,
     *          source,
     *          {
     *              search
     *          }
     *      );
     * search.setData("z")
     * search.setData("zx")
     * selector.GetValue().data // => new And([new Tag("key","zx")])
     */
    private static GenerateSearchableSelector(
        state: FeaturePipelineState,
        configuration: TagRenderingConfig,
        applicableMappings: Mapping[],
        tagsSource: UIEventSource<OsmTags>,
        options?: {
            search: UIEventSource<string>
        }
    ): InputElement<UploadableTag> {
        const values = TagRenderingQuestion.MappingToPillValue(
            applicableMappings,
            tagsSource,
            state
        )

        const searchValue: UIEventSource<string> =
            options?.search ?? new UIEventSource<string>(undefined)
        const ff = configuration.freeform
        let onEmpty: BaseUIElement = undefined
        if (ff !== undefined) {
            onEmpty = new VariableUiElement(
                searchValue.map((search) => configuration.render.Subs({ [ff.key]: search }))
            )
        }
        const mode = configuration.multiAnswer ? "select-many" : "select-one"

        const tooMuchElementsValue = new UIEventSource<number[]>([])

        let priorityPresets: BaseUIElement = undefined
        const classes = "h-64 overflow-scroll"

        if (applicableMappings.some((m) => m.priorityIf !== undefined)) {
            const priorityValues = tagsSource.map((tags) =>
                TagRenderingQuestion.MappingToPillValue(
                    applicableMappings,
                    tagsSource,
                    state
                ).filter((v) => v.original.priorityIf?.matchesProperties(tags))
            )
            priorityPresets = new VariableUiElement(
                priorityValues.map((priority) => {
                    if (priority.length === 0) {
                        return Translations.t.general.useSearch
                    }
                    return new Combine([
                        Translations.t.general.useSearchForMore.Subs({
                            total: applicableMappings.length,
                        }),
                        new SearchablePillsSelector(priority, {
                            selectedElements: tooMuchElementsValue,
                            hideSearchBar: true,
                            mode,
                        }),
                    ])
                        .SetClass("flex flex-col items-center ")
                        .SetClass(classes)
                })
            )
        }
        const presetSearch = new SearchablePillsSelector<number>(values, {
            selectIfSingle: true,
            mode,
            searchValue,
            onNoMatches: onEmpty?.SetClass(classes).SetClass("flex justify-center items-center"),
            searchAreaClass: classes,
            onManyElementsValue: tooMuchElementsValue,
            onManyElements: priorityPresets,
        })
        const fallbackTag = searchValue.map((s) => {
            if (s === undefined || ff?.key === undefined) {
                return undefined
            }
            return new Tag(ff.key, s)
        })
        return new InputElementMap<number[], And>(
            presetSearch,
            (x0, x1) => {
                if (x0 == x1) {
                    return true
                }
                if (x0 === undefined || x1 === undefined) {
                    return false
                }
                if (x0.and.length !== x1.and.length) {
                    return false
                }
                for (let i = 0; i < x0.and.length; i++) {
                    if (x1.and[i] != x0.and[i]) {
                        return false
                    }
                }
                return true
            },
            (selected) => {
                if (
                    ff !== undefined &&
                    searchValue.data?.length > 0 &&
                    !presetSearch.someMatchFound.data
                ) {
                    const t = fallbackTag.data
                    if (ff.addExtraTags) {
                        return new And([t, ...ff.addExtraTags])
                    }
                    return new And([t])
                }

                if (selected === undefined || selected.length == 0) {
                    return undefined
                }

                const tfs = Utils.NoNull(
                    applicableMappings.map((mapping, i) => {
                        if (selected.indexOf(i) >= 0) {
                            return mapping.if
                        } else {
                            return mapping.ifnot
                        }
                    })
                )
                return new And(tfs)
            },
            (tf) => {
                if (tf === undefined) {
                    return []
                }
                const selected: number[] = []
                for (let i = 0; i < applicableMappings.length; i++) {
                    const mapping = applicableMappings[i]
                    if (tf.and.some((t) => mapping.if == t)) {
                        selected.push(i)
                    }
                }
                return selected
            },
            [searchValue, presetSearch.someMatchFound]
        )
    }

    private static GenerateMultiAnswer(
        configuration: TagRenderingConfig,
        elements: InputElement<UploadableTag>[],
        freeformField: InputElement<UploadableTag>,
        ifNotSelected: UploadableTag[]
    ): InputElement<UploadableTag> {
        const checkBoxes = new CheckBoxes(elements)

        const inputEl = new InputElementMap<number[], UploadableTag>(
            checkBoxes,
            (t0, t1) => {
                return t0?.shadows(t1) ?? false
            },
            (indices) => {
                if (indices.length === 0) {
                    return undefined
                }
                const tags: UploadableTag[] = indices.map((i) => elements[i].GetValue().data)
                const oppositeTags: UploadableTag[] = []
                for (let i = 0; i < ifNotSelected.length; i++) {
                    if (indices.indexOf(i) >= 0) {
                        continue
                    }
                    const notSelected = ifNotSelected[i]
                    if (notSelected === undefined) {
                        continue
                    }
                    oppositeTags.push(notSelected)
                }
                tags.push(TagUtils.FlattenMultiAnswer(oppositeTags))
                return TagUtils.FlattenMultiAnswer(tags)
            },
            (tags: UploadableTag) => {
                // {key --> values[]}

                const presentTags = TagUtils.SplitKeys([tags])
                const indices: number[] = []
                // We also collect the values that have to be added to the freeform field
                let freeformExtras: string[] = []
                if (configuration.freeform?.key) {
                    freeformExtras = [...(presentTags[configuration.freeform.key] ?? [])]
                }

                for (let j = 0; j < elements.length; j++) {
                    const inputElement = elements[j]
                    if (inputElement === freeformField) {
                        continue
                    }
                    const val = inputElement.GetValue()
                    const neededTags = TagUtils.SplitKeys([val.data])

                    // if every 'neededKeys'-value is present in presentKeys, we have a match and enable the index
                    if (TagUtils.AllKeysAreContained(presentTags, neededTags)) {
                        indices.push(j)
                        if (freeformExtras.length > 0) {
                            const freeformsToRemove: string[] =
                                neededTags[configuration.freeform.key] ?? []
                            for (const toRm of freeformsToRemove) {
                                const i = freeformExtras.indexOf(toRm)
                                if (i >= 0) {
                                    freeformExtras.splice(i, 1)
                                }
                            }
                        }
                    }
                }
                if (freeformField) {
                    if (freeformExtras.length > 0) {
                        freeformField
                            .GetValue()
                            .setData(new Tag(configuration.freeform.key, freeformExtras.join(";")))
                        indices.push(elements.indexOf(freeformField))
                    } else {
                        freeformField.GetValue().setData(undefined)
                    }
                }

                return indices
            },
            elements.map((el) => el.GetValue())
        )

        freeformField?.GetValue()?.addCallbackAndRun((value) => {
            // The list of indices of the selected elements
            const es = checkBoxes.GetValue()
            const i = elements.length - 1
            // The actual index of the freeform-element
            const index = es.data.indexOf(i)
            if (value === undefined) {
                // No data is set in the freeform text field; so we delete the checkmark if it is selected
                if (index >= 0) {
                    es.data.splice(index, 1)
                    es.ping()
                }
            } else if (index < 0) {
                // There is data defined in the checkmark, but the checkmark isn't checked, so we check it
                // This is of course because the data changed
                es.data.push(i)
                es.ping()
            }
        })

        return inputEl
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
        mapping: Mapping,
        ifNot?: UploadableTag[]
    ): InputElement<UploadableTag> {
        let tagging: UploadableTag = mapping.if
        if (ifNot !== undefined) {
            tagging = new And([mapping.if, ...ifNot])
        }
        if (mapping.addExtraTags) {
            tagging = new And([tagging, ...mapping.addExtraTags])
        }

        return new FixedInputElement(
            TagRenderingQuestion.GenerateMappingContent(mapping, tagsSource, state),
            tagging,
            (t0, t1) => t1.shadows(t0)
        )
    }

    private static GenerateMappingContent(
        mapping: Mapping,
        tagsSource: UIEventSource<any>,
        state: FeaturePipelineState
    ): BaseUIElement {
        const text = new SubstitutedTranslation(mapping.then, tagsSource, state)
        if (mapping.icon === undefined) {
            return text
        }
        return new Combine([
            new Img(mapping.icon).SetClass("mr-1 mapping-icon-" + (mapping.iconClass ?? "small")),
            text,
        ]).SetClass("flex items-center")
    }

    private static GenerateFreeform(
        state: FeaturePipelineState,
        configuration: TagRenderingConfig,
        applicableUnit: Unit,
        tags: UIEventSource<any>,
        feedback: UIEventSource<Translation>
    ): InputElement<UploadableTag> {
        const freeform = configuration.freeform
        if (freeform === undefined) {
            return undefined
        }

        const pickString = (string: any) => {
            if (string === "" || string === undefined) {
                return undefined
            }
            if (string.length >= 255) {
                return undefined
            }

            const tag = new Tag(freeform.key, string)

            if (freeform.addExtraTags === undefined) {
                return tag
            }
            return new And([tag, ...freeform.addExtraTags])
        }

        const toString = (tag) => {
            if (tag instanceof And) {
                for (const subtag of tag.and) {
                    if (subtag instanceof Tag && subtag.key === freeform.key) {
                        return subtag.value
                    }
                }

                return undefined
            } else if (tag instanceof Tag) {
                return tag.value
            }
            return undefined
        }

        const tagsData = tags.data
        const feature = state?.allElements?.ContainingFeatures?.get(tagsData.id)
        const center = feature != undefined ? GeoOperations.centerpointCoordinates(feature) : [0, 0]
        console.log("Creating a tr-question with applicableUnit", applicableUnit)
        const input: InputElement<string> = ValidatedTextField.ForType(
            configuration.freeform.type
        )?.ConstructInputElement({
            country: () => tagsData._country,
            location: [center[1], center[0]],
            mapBackgroundLayer: state?.backgroundLayer,
            unit: applicableUnit,
            args: configuration.freeform.helperArgs,
            feature,
            placeholder: configuration.freeform.placeholder,
            feedback,
        })

        // Init with correct value
        input?.GetValue().setData(tagsData[freeform.key] ?? freeform.default)

        // Add a length check
        input?.GetValue().addCallbackD((v: string | undefined) => {
            if (v?.length >= 255) {
                feedback.setData(Translations.t.validation.tooLong.Subs({ count: v.length }))
            }
        })

        let inputTagsFilter: InputElement<UploadableTag> = new InputElementMap(
            input,
            (a, b) => a === b || (a?.shadows(b) ?? false),
            pickString,
            toString
        )

        if (freeform.inline) {
            inputTagsFilter.SetClass("w-48-imp")
            inputTagsFilter = new InputElementWrapper(
                inputTagsFilter,
                configuration.render,
                freeform.key,
                tags,
                state
            )
            inputTagsFilter.SetClass("block")
        }

        return inputTagsFilter
    }

    public static CreateTagExplanation(
        selectedValue: Store<TagsFilter>,
        tags: Store<object>,
        state?: { osmConnection?: OsmConnection }
    ) {
        return new VariableUiElement(
            selectedValue.map(
                (tagsFilter: TagsFilter) => {
                    const csCount =
                        state?.osmConnection?.userDetails?.data?.csCount ??
                        Constants.userJourney.tagsVisibleAndWikiLinked + 1
                    if (csCount < Constants.userJourney.tagsVisibleAt) {
                        return ""
                    }
                    if (tagsFilter === undefined) {
                        return Translations.t.general.noTagsSelected.SetClass("subtle")
                    }
                    if (csCount < Constants.userJourney.tagsVisibleAndWikiLinked) {
                        const tagsStr = tagsFilter.asHumanString(false, true, tags.data)
                        return new FixedUiElement(tagsStr).SetClass("subtle")
                    }
                    return tagsFilter.asHumanString(true, true, tags.data)
                },
                [state?.osmConnection?.userDetails]
            )
        ).SetClass("block break-all")
    }
}
