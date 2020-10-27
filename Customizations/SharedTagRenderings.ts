import * as questions from "../assets/questions/questions.json";
import TagRenderingConfig from "./JSON/TagRenderingConfig";

export default class SharedTagRenderings {

    public static SharedTagRendering = SharedTagRenderings.generatedSharedFields();

    private static generatedSharedFields() {
        const dict = {}
        for (const key in questions) {
            try {
                dict[key] = new TagRenderingConfig(questions[key])
            } catch (e) {
                console.error("COULD NOT PARSE", key, " FROM QUESTIONS:", e)
            }
        }
        return dict;
    }

}
