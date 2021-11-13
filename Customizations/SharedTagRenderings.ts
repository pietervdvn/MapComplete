import * as questions from "../assets/tagRenderings/questions.json";
import * as icons from "../assets/tagRenderings/icons.json";
import {Utils} from "../Utils";
import TagRenderingConfig from "../Models/ThemeConfig/TagRenderingConfig";
import {TagRenderingConfigJson} from "../Models/ThemeConfig/Json/TagRenderingConfigJson";

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
                dict.set(key, <TagRenderingConfigJson>questions[key])
            }
        }
        for (const key in icons) {
            dict.set(key, <TagRenderingConfigJson>icons[key])
        }
        
        dict.forEach((value, key) => value.id = key)

        return dict;
    }


}
