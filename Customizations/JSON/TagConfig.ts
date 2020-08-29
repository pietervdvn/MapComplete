/**
 * Read a tagconfig and converts it into a TagsFilter value
 */
import {AndOrTagConfigJson} from "./TagConfigJson";

export default class TagConfig {

    public static fromJson(json: any): TagConfig {
        const config: AndOrTagConfigJson = json;
        return config;
    }

}

