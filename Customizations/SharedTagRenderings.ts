import * as questions from "../assets/tagRenderings/questions.json";
import * as icons from "../assets/tagRenderings/icons.json";
import {Utils} from "../Utils";
import TagRenderingConfig from "../Models/ThemeConfig/TagRenderingConfig";
import {TagRenderingConfigJson} from "../Models/ThemeConfig/Json/TagRenderingConfigJson";
import BaseUIElement from "../UI/BaseUIElement";
import Combine from "../UI/Base/Combine";
import Title from "../UI/Base/Title";
import {FixedUiElement} from "../UI/Base/FixedUiElement";
import List from "../UI/Base/List";

export default class SharedTagRenderings {

    public static SharedTagRendering: Map<string, TagRenderingConfig> = SharedTagRenderings.generatedSharedFields();
    public static SharedTagRenderingJson: Map<string, TagRenderingConfigJson> = SharedTagRenderings.generatedSharedFieldsJsons();
    public static SharedIcons: Map<string, TagRenderingConfig> = SharedTagRenderings.generatedSharedFields(true);

    private static generatedSharedFields(iconsOnly = false): Map<string, TagRenderingConfig> {
        const configJsons = SharedTagRenderings.generatedSharedFieldsJsons(iconsOnly)
        const d = new Map<string, TagRenderingConfig>()
        for (const key of Array.from(configJsons.keys())) {
            try {
                d.set(key, new TagRenderingConfig(configJsons.get(key), `SharedTagRenderings.${key}`))
            } catch (e) {
                if (!Utils.runningFromConsole) {
                    console.error("BUG: could not parse", key, " from questions.json or icons.json - this error happened during the build step of the SharedTagRenderings", e)

                }
            }
        }
        return d
    }

    private static generatedSharedFieldsJsons(iconsOnly = false): Map<string, TagRenderingConfigJson> {
        const dict = new Map<string, TagRenderingConfigJson>();

        if (!iconsOnly) {
            for (const key in questions) {
                if (key === "id") {
                    continue
                }
                dict.set(key, <TagRenderingConfigJson>questions[key])
            }
        }
        for (const key in icons) {
            if (key === "id") {
                continue
            }
            dict.set(key, <TagRenderingConfigJson>icons[key])
        }

        dict.forEach((value, key) => {
            if (key === "id") {
                return
            }
            value.id = value.id ?? key;
            if(value["builtin"] !== undefined){
                if(value["override"] == undefined){
                    throw "HUH? Why whould you want to reuse a builtin if one doesn't override? In questions.json/"+key
                }
                if(typeof value["builtin"] !== "string"){
                    return;
                }
                // This is a really funny situation: we extend another tagRendering!
                const parent = Utils.Clone(dict.get(value["builtin"]))
                delete parent.id
                Utils.Merge(value["override"], parent)
                delete value["builtin"]
                delete value["override"]
                for (const pkey in parent) {
                    value[pkey] = parent[pkey]
                }
            }
        })

        
        return dict;
    }


    public static HelpText(): BaseUIElement {
        return new Combine([
            new Combine([

                new Title("Builtin questions",1),

                "The following items can be easily reused in your layers"
            ]).SetClass("flex flex-col"),

            ... Array.from( SharedTagRenderings.SharedTagRendering.keys()).map(key => {
                const tr = SharedTagRenderings.SharedTagRendering.get(key)
                let mappings: BaseUIElement = undefined
                if(tr.mappings?.length > 0){
                    mappings = new List(tr.mappings.map(m => m.then.textFor("en")))
                }
                return new Combine([
                    new Title(key),
                    tr.render?.textFor("en"),
                    tr.question?.textFor("en") ?? new FixedUiElement("Read-only tagrendering").SetClass("font-bold"),
                    mappings
                ]).SetClass("flex flex-col")

            })

        ]).SetClass("flex flex-col")
    }

}
