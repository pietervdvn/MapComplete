import {AndOrTagConfigJson} from "./TagConfigJson";
import {Utils} from "../../Utils";
import {RegexTag} from "../../Logic/Tags/RegexTag";
import {Or} from "../../Logic/Tags/Or";
import {And} from "../../Logic/Tags/And";
import {Tag} from "../../Logic/Tags/Tag";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import SubstitutingTag from "../../Logic/Tags/SubstitutingTag";

export class FromJSON {

    public static SimpleTag(json: string): Tag {
        const tag = Utils.SplitFirst(json, "=");
        return new Tag(tag[0], tag[1]);
    }

    public static Tag(json: AndOrTagConfigJson | string, context: string = ""): TagsFilter {
        try {
            return this.TagUnsafe(json, context);
        } catch (e) {
            console.error("Could not parse tag", json, "in context", context, "due to ", e)
            throw e;
        }
    }

    private static TagUnsafe(json: AndOrTagConfigJson | string, context: string = ""): TagsFilter {

        if (json === undefined) {
            throw `Error while parsing a tag: 'json' is undefined in ${context}. Make sure all the tags are defined and at least one tag is present in a complex expression`
        }
        if (typeof (json) == "string") {
            const tag = json as string;
            if (tag.indexOf("!~") >= 0) {
                const split = Utils.SplitFirst(tag, "!~");
                if (split[1] === "*") {
                    throw `Don't use 'key!~*' - use 'key=' instead (empty string as value (in the tag ${tag} while parsing ${context})`
                }
                return new RegexTag(
                    split[0],
                    new RegExp("^" + split[1] + "$"),
                    true
                );
            }
            if (tag.indexOf("~~") >= 0) {
                const split = Utils.SplitFirst(tag, "~~");
                if (split[1] === "*") {
                    split[1] = "..*"
                }
                return new RegexTag(
                    new RegExp("^" + split[0] + "$"),
                    new RegExp("^" + split[1] + "$")
                );
            }
            if(tag.indexOf(":=") >= 0){
                const split = Utils.SplitFirst(tag, ":=");
                return new SubstitutingTag(split[0], split[1]);
            }
            
            if (tag.indexOf("!=") >= 0) {
                const split = Utils.SplitFirst(tag, "!=");
                if (split[1] === "*") {
                    split[1] = "..*"
                }
                return new RegexTag(
                    split[0],
                    new RegExp("^" + split[1] + "$"),
                    true
                );
            }
            if (tag.indexOf("~") >= 0) {
                const split = Utils.SplitFirst(tag, "~");
                if (split[1] === "*") {
                    split[1] = "..*"
                }
                return new RegexTag(
                    split[0],
                    new RegExp("^" + split[1] + "$")
                );
            }
            if (tag.indexOf("=") >= 0) {


                const split = Utils.SplitFirst(tag, "=");
                if (split[1] == "*") {
                    throw `Error while parsing tag '${tag}' in ${context}: detected a wildcard on a normal value. Use a regex pattern instead`
                }
                return new Tag(split[0], split[1])
            }
            throw `Error while parsing tag '${tag}' in ${context}: no key part and value part were found`

        }
        if (json.and !== undefined) {
            return new And(json.and.map(t => FromJSON.Tag(t, context)));
        }
        if (json.or !== undefined) {
            return new Or(json.or.map(t => FromJSON.Tag(t, context)));
        }
    }
}