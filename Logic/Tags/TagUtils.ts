import {Tag} from "./Tag";
import {TagsFilter} from "./TagsFilter";
import {And} from "./And";
import {Utils} from "../../Utils";

export class TagUtils {
    static ApplyTemplate(template: string, tags: any): string {
        for (const k in tags) {
            while (template.indexOf("{" + k + "}") >= 0) {
                const escaped = tags[k].replace(/</g, '&lt;').replace(/>/g, '&gt;');
                template = template.replace("{" + k + "}", escaped);
            }
        }
        return template;
    }

    static KVtoProperties(tags: Tag[]): any {
        const properties = {};
        for (const tag of tags) {
            properties[tag.key] = tag.value
        }
        return properties;
    }

    /**
     * Given two hashes of {key --> values[]}, makes sure that every neededTag is present in availableTags
     */
    static AllKeysAreContained(availableTags: any, neededTags: any) {
        for (const neededKey in neededTags) {
            const availableValues: string[] = availableTags[neededKey]
            if (availableValues === undefined) {
                return false;
            }
            const neededValues: string[] = neededTags[neededKey];
            for (const neededValue of neededValues) {
                if (availableValues.indexOf(neededValue) < 0) {
                    return false;
                }
            }
        }
        return true;
    }

    /***
     * Creates a hash {key --> [values]}, with all the values present in the tagsfilter
     *
     * @param tagsFilters
     * @constructor
     */
    static SplitKeys(tagsFilters: TagsFilter[]) {
        const keyValues = {} // Map string -> string[]
        tagsFilters = [...tagsFilters] // copy all
        while (tagsFilters.length > 0) {
            // Queue
            const tagsFilter = tagsFilters.shift();

            if (tagsFilter === undefined) {
                continue;
            }

            if (tagsFilter instanceof And) {
                tagsFilters.push(...tagsFilter.and);
                continue;
            }

            if (tagsFilter instanceof Tag) {
                if (keyValues[tagsFilter.key] === undefined) {
                    keyValues[tagsFilter.key] = [];
                }
                keyValues[tagsFilter.key].push(...tagsFilter.value.split(";"));
                continue;
            }

            console.error("Invalid type to flatten the multiAnswer", tagsFilter);
            throw "Invalid type to FlattenMultiAnswer"
        }
        return keyValues;
    }

    /**
     * Given multiple tagsfilters which can be used as answer, will take the tags with the same keys together as set.
     * E.g:
     *
     * FlattenMultiAnswer([and: [ "x=a", "y=0;1"], and: ["x=b", "y=2"], and: ["x=", "y=3"]])
     * will result in
     * ["x=a;b", "y=0;1;2;3"]
     *
     * @param tagsFilters
     * @constructor
     */
    static FlattenMultiAnswer(tagsFilters: TagsFilter[]): And {
        if (tagsFilters === undefined) {
            return new And([]);
        }

        let keyValues = TagUtils.SplitKeys(tagsFilters);
        const and: TagsFilter[] = []
        for (const key in keyValues) {
            and.push(new Tag(key, Utils.Dedup(keyValues[key]).join(";")));
        }
        return new And(and);
    }

    static MatchesMultiAnswer(tag: TagsFilter, tags: any): boolean {
        const splitted = TagUtils.SplitKeys([tag]);
        for (const splitKey in splitted) {
            const neededValues = splitted[splitKey];
            if (tags[splitKey] === undefined) {
                return false;
            }

            const actualValue = tags[splitKey].split(";");
            for (const neededValue of neededValues) {
                if (actualValue.indexOf(neededValue) < 0) {
                    return false;
                }
            }
        }
        return true;
    }
}