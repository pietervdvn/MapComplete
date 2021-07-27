import OsmChangeAction from "./OsmChangeAction";
import {Changes} from "../Changes";
import {ChangeDescription} from "./ChangeDescription";
import {TagsFilter} from "../../Tags/TagsFilter";

export default class ChangeTagAction extends OsmChangeAction {
    private readonly _elementId: string;
    private readonly _tagsFilter: TagsFilter;
    private readonly _currentTags: any;

    constructor(elementId: string, tagsFilter: TagsFilter, currentTags: any) {
        super();
        this._elementId = elementId;
        this._tagsFilter = tagsFilter;
        this._currentTags = currentTags;
    }

    /**
     * Doublechecks that no stupid values are added
     */
    private static checkChange(kv: { k: string, v: string }): { k: string, v: string } {
        const key = kv.k;
        const value = kv.v;
        if (key === undefined || key === null) {
            console.log("Invalid key");
            return undefined;
        }
        if (value === undefined || value === null) {
            console.log("Invalid value for ", key);
            return undefined;
        }

        if (key.startsWith(" ") || value.startsWith(" ") || value.endsWith(" ") || key.endsWith(" ")) {
            console.warn("Tag starts with or ends with a space - trimming anyway")
        }

        return {k: key.trim(), v: value.trim()};
    }

    CreateChangeDescriptions(changes: Changes): ChangeDescription [] {
        const changedTags: { k: string, v: string }[] = this._tagsFilter.asChange(this._currentTags).map(ChangeTagAction.checkChange)
        const typeId = this._elementId.split("/")
        const type = typeId[0]
        const id = Number(typeId  [1])
        return [{
            // @ts-ignore
            type: type,
            id: id,
            tags: changedTags
        }]
    }
}