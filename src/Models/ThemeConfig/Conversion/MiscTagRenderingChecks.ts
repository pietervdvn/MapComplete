import { DesugaringStep } from "./Conversion"
import { TagRenderingConfigJson } from "../Json/TagRenderingConfigJson"
import { LayerConfigJson } from "../Json/LayerConfigJson"
import {
    MappingConfigJson,
    QuestionableTagRenderingConfigJson,
} from "../Json/QuestionableTagRenderingConfigJson"
import { ConversionContext } from "./ConversionContext"
import { Translation } from "../../../UI/i18n/Translation"
import NameSuggestionIndex from "../../../Logic/Web/NameSuggestionIndex"
import { TagUtils } from "../../../Logic/Tags/TagUtils"
import { Tag } from "../../../Logic/Tags/Tag"
import Validators from "../../../UI/InputElement/Validators"
import { CheckTranslation } from "./Validation"

export class MiscTagRenderingChecks extends DesugaringStep<TagRenderingConfigJson> {
    private readonly _layerConfig: LayerConfigJson

    constructor(layerConfig?: LayerConfigJson) {
        super("Miscellaneous checks on the tagrendering", ["special"], "MiscTagRenderingChecks")
        this._layerConfig = layerConfig
    }

    convert(
        json: TagRenderingConfigJson | QuestionableTagRenderingConfigJson,
        context: ConversionContext
    ): TagRenderingConfigJson {
        if (json["special"] !== undefined) {
            context.err(
                'Detected `special` on the top level. Did you mean `{"render":{ "special": ... }}`'
            )
        }

        if (Object.keys(json).length === 1 && typeof json["render"] === "string") {
            context.warn(
                `use the content directly instead of {render: ${JSON.stringify(json["render"])}}`
            )
        }

        {
            for (const key of ["question", "questionHint", "render"]) {
                CheckTranslation.allowUndefined.convert(json[key], context.enter(key))
            }
            for (let i = 0; i < json.mappings?.length ?? 0; i++) {
                const mapping: MappingConfigJson = json.mappings[i]
                CheckTranslation.noUndefined.convert(
                    mapping.then,
                    context.enters("mappings", i, "then")
                )
                if (!mapping.if) {
                    console.log(
                        "Checking mappings",
                        i,
                        "if",
                        mapping.if,
                        context.path.join("."),
                        mapping.then
                    )
                    context.enters("mappings", i, "if").err("No `if` is defined")
                }
                if (mapping.addExtraTags) {
                    for (let j = 0; j < mapping.addExtraTags.length; j++) {
                        if (!mapping.addExtraTags[j]) {
                            context
                                .enters("mappings", i, "addExtraTags", j)
                                .err(
                                    "Detected a 'null' or 'undefined' value. Either specify a tag or delete this item"
                                )
                        }
                    }
                }
                const en = mapping?.then?.["en"]
                if (en && this.detectYesOrNo(en)) {
                    console.log("Found a match with yes or no: ", { en })
                    context
                        .enters("mappings", i, "then")
                        .warn(
                            "A mapping should not start with 'yes' or 'no'. If the attribute is known, it will only show 'yes' or 'no' <i>without</i> the question, resulting in a weird phrasing in the information box"
                        )
                }
            }
        }
        if (json["group"]) {
            context.err('Groups are deprecated, use `"label": ["' + json["group"] + '"]` instead')
        }

        if (json["question"] && json.freeform?.key === undefined && json.mappings === undefined) {
            context.err(
                "A question is defined, but no mappings nor freeform (key) are. Add at least one of them. The question is: "+new Translation(json["question"]).textFor("en")
            )
        }
        if (json["question"] && !json.freeform && (json.mappings?.length ?? 0) == 1) {
            context.err("A question is defined, but there is only one option to choose from.")
        }
        if (json["questionHint"] && !json["question"]) {
            context
                .enter("questionHint")
                .err(
                    "A questionHint is defined, but no question is given. As such, the questionHint will never be shown"
                )
        }

        if (json.icon?.["size"]) {
            context
                .enters("icon", "size")
                .err(
                    "size is not a valid attribute. Did you mean 'class'? Class can be one of `small`, `medium` or `large`"
                )
        }

        if (json.freeform) {
            if (json.render === undefined) {
                context
                    .enter("render")
                    .err(
                        "This tagRendering allows to set a value to key " +
                            json.freeform.key +
                            ", but does not define a `render`. Please, add a value here which contains `{" +
                            json.freeform.key +
                            "}`"
                    )
            } else {
                const render = new Translation(<any>json.render)
                for (const ln in render.translations) {
                    if (ln.startsWith("_")) {
                        continue
                    }
                    const txt: string = render.translations[ln]
                    if (txt === "") {
                        context.enter("render").err(" Rendering for language " + ln + " is empty")
                    }
                    if (
                        txt.indexOf("{" + json.freeform.key + "}") >= 0 ||
                        txt.indexOf("&LBRACE" + json.freeform.key + "&RBRACE") >= 0
                    ) {
                        continue
                    }
                    if (txt.indexOf("{" + json.freeform.key + ":") >= 0) {
                        continue
                    }

                    if (
                        json.freeform["type"] === "opening_hours" &&
                        txt.indexOf("{opening_hours_table(") >= 0
                    ) {
                        continue
                    }
                    const keyFirstArg = ["canonical", "fediverse_link", "translated"]
                    if (
                        keyFirstArg.some(
                            (funcName) => txt.indexOf(`{${funcName}(${json.freeform.key}`) >= 0
                        )
                    ) {
                        continue
                    }
                    if (
                        json.freeform["type"] === "wikidata" &&
                        txt.indexOf("{wikipedia(" + json.freeform.key) >= 0
                    ) {
                        continue
                    }
                    if (json.freeform.key === "wikidata" && txt.indexOf("{wikipedia()") >= 0) {
                        continue
                    }
                    if (
                        json.freeform["type"] === "wikidata" &&
                        txt.indexOf(`{wikidata_label(${json.freeform.key})`) >= 0
                    ) {
                        continue
                    }
                    if (json.freeform.key.indexOf("wikidata") >= 0) {
                        context
                            .enter("render")
                            .err(
                                `The rendering for language ${ln} does not contain \`{${json.freeform.key}}\`. Did you perhaps forget to set "freeform.type: 'wikidata'"?`
                            )
                        continue
                    }

                    if (
                        txt.indexOf(json.freeform.key) >= 0 &&
                        txt.indexOf("{" + json.freeform.key + "}") < 0
                    ) {
                        context
                            .enter("render")
                            .err(
                                `The rendering for language ${ln} does not contain \`{${json.freeform.key}}\`. However, it does contain ${json.freeform.key} without braces. Did you forget the braces?\n\tThe current text is ${txt}`
                            )
                        continue
                    }

                    context
                        .enter("render")
                        .err(
                            `The rendering for language ${ln} does not contain \`{${json.freeform.key}}\`. This is a bug, as this rendering should show exactly this freeform key!\n\tThe current text is ${txt}`
                        )
                }
            }
            if (
                this._layerConfig?.source?.osmTags &&
                NameSuggestionIndex.supportedTypes().indexOf(json.freeform.key) >= 0
            ) {
                const tags = TagUtils.TagD(this._layerConfig?.source?.osmTags)?.usedTags()
                const suggestions = NameSuggestionIndex.getSuggestionsFor(json.freeform.key, tags)
                if (suggestions === undefined) {
                    context
                        .enters("freeform", "type")
                        .err(
                            "No entry found in the 'Name Suggestion Index'. None of the 'osmSource'-tags match an entry in the NSI.\n\tOsmSource-tags are " +
                                tags.map((t) => new Tag(t.key, t.value).asHumanString()).join(" ; ")
                        )
                }
            } else if (json.freeform.type === "nsi") {
                context
                    .enters("freeform", "type")
                    .warn(
                        "No need to explicitly set type to 'NSI', autodetected based on freeform type"
                    )
            }
        }
        if (json.render && json["question"] && json.freeform === undefined) {
            context.err(
                `Detected a tagrendering which takes input without freeform key in ${context}; the question is ${new Translation(
                    json["question"]
                ).textFor("en")}`
            )
        }

        const freeformType = json["freeform"]?.["type"]
        if (freeformType) {
            if (Validators.availableTypes.indexOf(freeformType) < 0) {
                context
                    .enters("freeform", "type")
                    .err(
                        "Unknown type: " +
                            freeformType +
                            "; try one of " +
                            Validators.availableTypes.join(", ")
                    )
            }
        }

        if (context.hasErrors()) {
            return undefined
        }
        return json
    }

    /**
     * const obj = new MiscTagRenderingChecks()
     * obj.detectYesOrNo("Yes, this place has") // => true
     * obj.detectYesOrNo("Yes") // => true
     * obj.detectYesOrNo("No, this place does not have...") // => true
     * obj.detectYesOrNo("This place does not have...") // => false
     */
    private detectYesOrNo(en: string): boolean {
        return en.toLowerCase().match(/^(yes|no)([,:;.?]|$)/) !== null
    }
}
