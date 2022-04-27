import {VariableUiElement} from "./Base/VariableUIElement";
import {UIEventSource} from "../Logic/UIEventSource";
import Table from "./Base/Table";

export class AllTagsPanel extends VariableUiElement {

    constructor(tags: UIEventSource<any>, state?) {

        const calculatedTags = [].concat(
           // SimpleMetaTagger.lazyTags,
            ...(state?.layoutToUse?.layers?.map(l => l.calculatedTags?.map(c => c[0]) ?? []) ?? []))


        super(tags.map(tags => {
            const parts = [];
            for (const key in tags) {
                if (!tags.hasOwnProperty(key)) {
                    continue
                }
                let v = tags[key]
                if (v === "") {
                    v = "<b>empty string</b>"
                }
                parts.push([key, v ?? "<b>undefined</b>"]);
            }

            for (const key of calculatedTags) {
                const value = tags[key]
                if (value === undefined) {
                    continue
                }
                let type = "";
                if (typeof value !== "string") {
                    type = " <i>" + (typeof value) + "</i>"
                }
                parts.push(["<i>" + key + "</i>", value])
            }

            return new Table(
                ["key", "value"],
                parts
            )
                .SetStyle("border: 1px solid black; border-radius: 1em;padding:1em;display:block;").SetClass("zebra-table")
        }))
    }
}