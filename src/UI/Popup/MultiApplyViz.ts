import { Store, UIEventSource } from "../../Logic/UIEventSource"
import MultiApply from "./MultiApply"
import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"

export class MultiApplyViz implements SpecialVisualization {
    funcName = "multi_apply"
    needsUrls = []
    docs =
        "A button to apply the tagging of this object onto a list of other features. This is an advanced feature for which you'll need calculatedTags"
    args = [
        {
            name: "feature_ids",
            doc: "A JSON-serialized list of IDs of features to apply the tagging on",
        },
        {
            name: "keys",
            doc: "One key (or multiple keys, seperated by ';') of the attribute that should be copied onto the other features.",
            required: true,
        },
        { name: "text", doc: "The text to show on the button" },
        {
            name: "autoapply",
            doc: "A boolean indicating wether this tagging should be applied automatically if the relevant tags on this object are changed. A visual element indicating the multi_apply is still shown",
            required: true,
        },
        {
            name: "overwrite",
            doc: "If set to 'true', the tags on the other objects will always be overwritten. The default behaviour will be to only change the tags on other objects if they are either undefined or had the same value before the change",
            required: true,
        },
    ]
    example =
        "{multi_apply(_features_with_the_same_name_within_100m, name:etymology:wikidata;name:etymology, Apply etymology information on all nearby objects with the same name)}"

    constr(
        state: SpecialVisualizationState,
        tagsSource: UIEventSource<Record<string, string>>,
        args: string[]
    ) {
        const featureIdsKey = args[0]
        const keysToApply = args[1].split(";")
        const text = args[2]
        const autoapply = args[3]?.toLowerCase() === "true"
        const overwrite = args[4]?.toLowerCase() === "true"
        const featureIds: Store<string[]> = tagsSource.map((tags) => {
            const ids = tags[featureIdsKey]
            try {
                if (ids === undefined) {
                    return []
                }
                if (typeof ids === "string" && ids.startsWith("[")) {
                    return JSON.parse(ids)
                }
                return ids
            } catch (e) {
                console.warn(
                    "Could not parse ",
                    ids,
                    "as JSON to extract IDS which should be shown on the map."
                )
                return []
            }
        })
        return new MultiApply({
            featureIds,
            keysToApply,
            text,
            autoapply,
            overwrite,
            tagsSource,
            state,
        })
    }
}
