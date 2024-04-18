import { AutoAction } from "./AutoApplyButton"
import Translations from "../i18n/Translations"
import { VariableUiElement } from "../Base/VariableUIElement"
import BaseUIElement from "../BaseUIElement"
import { FixedUiElement } from "../Base/FixedUiElement"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { SubtleButton } from "../Base/SubtleButton"
import Combine from "../Base/Combine"
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
import { And } from "../../Logic/Tags/And"
import Toggle from "../Input/Toggle"
import { Utils } from "../../Utils"
import { Tag } from "../../Logic/Tags/Tag"
import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import { Feature } from "geojson"
import Maproulette from "../../Logic/Maproulette"
import SvelteUIElement from "../Base/SvelteUIElement"
import Icon from "../Map/Icon.svelte"

export default class TagApplyButton implements AutoAction, SpecialVisualization {
    public readonly funcName = "tag_apply"
    needsUrls = []
    public readonly docs =
        "Shows a big button; clicking this button will apply certain tags onto the feature.\n\nThe first argument takes a specification of which tags to add.\n" +
        Utils.Special_visualizations_tagsToApplyHelpText
    public readonly supportsAutoAction = true
    public readonly args = [
        {
            name: "tags_to_apply",
            doc: "A specification of the tags to apply. This is either hardcoded in the layer or the `$name` of a property containing the tags to apply. If redirected and the value of the linked property starts with `{`, the other property will be interpreted as a json object",
        },
        {
            name: "message",
            doc: "The text to show to the contributor",
        },
        {
            name: "image",
            doc: "An image to show to the contributor on the button",
        },
        {
            name: "id_of_object_to_apply_this_one",
            defaultValue: undefined,
            doc: "If specified, applies the the tags onto _another_ object. The id will be read from properties[id_of_object_to_apply_this_one] of the selected object. The tags are still calculated based on the tags of the _selected_ element",
        },
        {
            name: "maproulette_id",
            defaultValue: undefined,
            doc: "If specified, this maproulette-challenge will be closed when the tags are applied. This should be the ID of the task, _not_ the task_id.",
        },
    ]
    public readonly example =
        "`{tag_apply(survey_date=$_now:date, Surveyed today!)}`, `{tag_apply(addr:street=$addr:street, Apply the address, apply_icon.svg, _closest_osm_id)"

    public static generateTagsToApply(
        spec: string,
        tagSource: Store<Record<string, string>>
    ): Store<Tag[]> {
        // Check whether we need to look up a single value

        if (!spec.includes(";") && !spec.includes("=") && spec.startsWith("$")) {
            // We seem to be dealing with a single value, fetch it
            spec = tagSource.data[spec.replace("$", "")]
        }

        let tgsSpec: [string, string][]

        if (spec.startsWith("{")) {
            const properties = JSON.parse(spec)
            tgsSpec = []
            for (const key of Object.keys(properties)) {
                tgsSpec.push([key, properties[key]])
            }
        } else {
            tgsSpec = TagApplyButton.parseTagSpec(spec)
        }

        return tagSource.map((tags) => {
            const newTags: Tag[] = []
            for (const [key, value] of tgsSpec) {
                if (value.indexOf("$") >= 0) {
                    let parts = value.split("$")
                    // The first item of the split won't start with a '$', so no substitution needed
                    let actualValue = parts[0]
                    parts.shift()

                    for (const part of parts) {
                        const [_, varName, leftOver] = part.match(/([a-zA-Z0-9_:]*)(.*)/)
                        actualValue += (tags[varName] ?? "") + leftOver
                    }
                    newTags.push(new Tag(key, actualValue))
                } else {
                    newTags.push(new Tag(key, value))
                }
            }
            return newTags
        })
    }

    /**
     * Parses a tag specification
     *
     * TagApplyButton.parseTagSpec("key=value;key0=value0") // => [["key","value"],["key0","value0"]]
     *
     * // Should handle escaped ";"
     * TagApplyButton.parseTagSpec("key=value;key0=value0\\;value1") // => [["key","value"],["key0","value0;value1"]]
     */
    private static parseTagSpec(spec: string): [string, string][] {
        const tgsSpec: [string, string][] = []

        while (spec.length > 0) {
            const [part] = spec.match(/((\\;)|[^;])*/)
            spec = spec.substring(part.length + 1) // +1 to remove the pending ';' as well
            const kv = part.split("=").map((s) => s.trim().replace("\\;", ";"))
            if (kv.length == 2) {
                tgsSpec.push(<[string, string]>kv)
            } else if (kv.length < 2) {
                console.error("Invalid key spec: no '=' found in " + spec)
                throw "Invalid key spec: no '=' found in " + spec
            } else {
                throw "Invalid key spec: multiple '=' found in " + spec
            }
        }

        for (const spec of tgsSpec) {
            if (spec[0].endsWith(":")) {
                throw "The key for a tag specification for import or apply ends with ':'. The theme author probably wrote key:=otherkey instead of key=$otherkey"
            }
        }
        return tgsSpec
    }

    public async applyActionOn(
        _: Feature,
        state: SpecialVisualizationState,
        tags: UIEventSource<any>,
        args: string[]
    ): Promise<void> {
        const tagsToApply = TagApplyButton.generateTagsToApply(args[0], tags)
        const targetIdKey = args[3]

        const targetId = tags.data[targetIdKey] ?? tags.data.id
        const changeAction = new ChangeTagAction(
            targetId,
            new And(tagsToApply.data),
            tags.data, // We pass in the tags of the selected element, not the tags of the target element!
            {
                theme: state.layout.id,
                changeType: "answer",
            }
        )
        await state.changes.applyAction(changeAction)
        try {
            state.selectedElement.setData(state.indexedFeatures.featuresById.data.get(targetId))
        } catch (e) {
            console.error(e)
        }
        const maproulette_id_key = args[4]
        if (maproulette_id_key) {
            const maproulette_id = tags.data[maproulette_id_key]
            const maproulette_feature = state.indexedFeatures.featuresById.data.get(maproulette_id)
            const maproulette_task_id = Number(maproulette_feature.properties.mr_taskId)
            await Maproulette.singleton.closeTask(maproulette_task_id, Maproulette.STATUS_FIXED, {
                comment: "Tags are copied onto " + targetId + " with MapComplete",
            })
            maproulette_feature.properties["mr_taskStatus"] = "Fixed"
            state.featureProperties.getStore(maproulette_id).ping()
        }
    }

    public constr(
        state: SpecialVisualizationState,
        tags: UIEventSource<Record<string, string>>,
        args: string[],
        feature: Feature
    ): BaseUIElement {
        const tagsToApply = TagApplyButton.generateTagsToApply(args[0], tags)
        const msg = args[1]
        let image = args[2]?.trim()
        if (image === "" || image === "undefined") {
            image = undefined
        }

        const targetIdKey = args[3]
        const t = Translations.t.general.apply_button

        const tagsExplanation = new VariableUiElement(
            tagsToApply.map((tagsToApply) => {
                const tagsStr = tagsToApply.map((t) => t.asHumanString(false, true)).join("&")
                let el: BaseUIElement = new FixedUiElement(tagsStr)
                if (targetIdKey !== undefined) {
                    const targetId = tags.data[targetIdKey] ?? tags.data.id
                    el = t.appliedOnAnotherObject.Subs({ tags: tagsStr, id: targetId })
                }
                return el
            })
        ).SetClass("subtle")
        const applied = new UIEventSource(
            tags?.data?.["mr_taskStatus"] !== undefined &&
                tags?.data?.["mr_taskStatus"] !== "Created"
        ) // This will default to 'false' for non-maproulette challenges
        const applyButton = new SubtleButton(
            new SvelteUIElement(Icon, { icon: image }),
            new Combine([msg, tagsExplanation]).SetClass("flex flex-col")
        ).onClick(async () => {
            applied.setData(true)
            await this.applyActionOn(feature, state, tags, args)
        })

        return new Toggle(
            new Toggle(t.isApplied.SetClass("thanks"), applyButton, applied),
            undefined,
            state.osmConnection.isLoggedIn
        )
    }
}
