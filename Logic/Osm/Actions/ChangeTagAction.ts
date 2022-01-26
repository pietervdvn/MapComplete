import OsmChangeAction from "./OsmChangeAction";
import {Changes} from "../Changes";
import {ChangeDescription} from "./ChangeDescription";
import {TagsFilter} from "../../Tags/TagsFilter";

export default class ChangeTagAction extends OsmChangeAction {
    private readonly _elementId: string;
    private readonly _tagsFilter: TagsFilter;
    private readonly _currentTags: any;
    private readonly _meta: { theme: string, changeType: string };

    constructor(elementId: string, tagsFilter: TagsFilter, currentTags: any, meta: {
        theme: string,
        changeType: "answer" | "soft-delete" | "add-image" | string
    }) {
        super(elementId, true);
        this._elementId = elementId;
        this._tagsFilter = tagsFilter;
        this._currentTags = currentTags;
        this._meta = meta;
    }

    /**
     * Doublechecks that no stupid values are added
     */
    private static checkChange(kv: { k: string, v: string }): { k: string, v: string } {
        const key = kv.k;
        const value = kv.v;
        if (key === undefined || key === null) {
            console.error("Invalid key:", key);
            return undefined;
        }
        if (value === undefined || value === null) {
            console.error("Invalid value for ", key, ":", value);
            return undefined;
        }

        if (typeof value !== "string") {
            console.error("Invalid value for ", key, "as it is not a string:", value)
            return undefined;
        }

        if (key.startsWith(" ") || value.startsWith(" ") || value.endsWith(" ") || key.endsWith(" ")) {
            console.warn("Tag starts with or ends with a space - trimming anyway")
        }

        return {k: key.trim(), v: value.trim()};
    }

    async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {
        const changedTags: { k: string, v: string }[] = this._tagsFilter.asChange(this._currentTags).map(ChangeTagAction.checkChange)
        const typeId = this._elementId.split("/")
        const type = typeId[0]
        const id = Number(typeId  [1])
        return [{
            type: <"node" | "way" | "relation">type,
            id: id,
            tags: changedTags,
            meta: this._meta
        }]
    }
}