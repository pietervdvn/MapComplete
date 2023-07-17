import { Utils } from "../Utils"
import TagRenderingConfig from "../Models/ThemeConfig/TagRenderingConfig"
import { TagRenderingConfigJson } from "../Models/ThemeConfig/Json/TagRenderingConfigJson"
import BaseUIElement from "../UI/BaseUIElement"
import Combine from "../UI/Base/Combine"
import Title from "../UI/Base/Title"
import { FixedUiElement } from "../UI/Base/FixedUiElement"
import List from "../UI/Base/List"

export default class SharedTagRenderings {
    public static SharedTagRendering: Map<string, TagRenderingConfig> =
        SharedTagRenderings.generatedSharedFields()
    public static SharedTagRenderingJson: Map<string, TagRenderingConfigJson> =
        SharedTagRenderings.generatedSharedFieldsJsons()

    private static generatedSharedFields(): Map<string, TagRenderingConfig> {
        const configJsons = SharedTagRenderings.generatedSharedFieldsJsons()
        const d = new Map<string, TagRenderingConfig>()
        for (const key of Array.from(configJsons.keys())) {
            try {
                d.set(
                    key,
                    new TagRenderingConfig(configJsons.get(key), `SharedTagRenderings.${key}`)
                )
            } catch (e) {
                if (!Utils.runningFromConsole) {
                    console.error(
                        "BUG: could not parse",
                        key,
                        " from questions.json - this error happened during the build step of the SharedTagRenderings",
                        e
                    )
                }
            }
        }
        return d
    }

    private static generatedSharedFieldsJsons(): Map<string, TagRenderingConfigJson> {
        const dict = new Map<string, TagRenderingConfigJson>()

        // TODO FIXME

        return dict
    }

    public static HelpText(): BaseUIElement {
        return new Combine([
            new Combine([
                new Title("Builtin questions", 1),

                "The following items can be easily reused in your layers",
            ]).SetClass("flex flex-col"),

            ...Array.from(SharedTagRenderings.SharedTagRendering.keys()).map((key) => {
                const tr = SharedTagRenderings.SharedTagRendering.get(key)
                let mappings: BaseUIElement = undefined
                if (tr.mappings?.length > 0) {
                    mappings = new List(tr.mappings.map((m) => m.then.textFor("en")))
                }
                return new Combine([
                    new Title(key),
                    tr.render?.textFor("en"),
                    tr.question?.textFor("en") ??
                        new FixedUiElement("Read-only tagrendering").SetClass("font-bold"),
                    mappings,
                ]).SetClass("flex flex-col")
            }),
        ]).SetClass("flex flex-col")
    }
}
