// SPDX-FileCopyrightText: 2023 MapComplete  <https://mapcomplete.osm.be/>
//
// SPDX-License-Identifier: GPL-3.0-ONLY

import OsmChangeAction from "./OsmChangeAction"
import { ChangeDescription } from "./ChangeDescription"
import { TagsFilter } from "../../Tags/TagsFilter"
import { OsmTags } from "../../../Models/OsmFeature"

export default class ChangeTagAction extends OsmChangeAction {
    private readonly _elementId: string
    /**
     * The tags to apply onto the object
     */
    private readonly _tagsFilter: TagsFilter
    /**
     * The current tags of the object to change
     */
    private readonly _currentTags: Record<string, string> | OsmTags
    private readonly _meta: { theme: string; changeType: string }

    /**
     *
     * @param elementId: the element to change
     * @param tagsFilter: the tags to apply
     * @param currentTags: the current tags of the object
     * @param meta: some metainformation
     */
    constructor(
        elementId: string,
        tagsFilter: TagsFilter,
        currentTags: Record<string, string>,
        meta: {
            theme: string
            changeType: "answer" | "soft-delete" | "add-image" | string
        }
    ) {
        super(elementId, true)
        this._elementId = elementId
        this._tagsFilter = tagsFilter
        this._currentTags = currentTags
        this._meta = meta
    }

    /**
     * Doublechecks that no stupid values are added
     */
    private static checkChange(kv: { k: string; v: string }): { k: string; v: string } {
        const key = kv.k
        const value = kv.v
        if (key === undefined || key === null) {
            console.error("Invalid key:", key)
            return undefined
        }
        if (value === undefined || value === null) {
            console.error("Invalid value for ", key, ":", value)
            return undefined
        }

        if (typeof value !== "string") {
            console.error("Invalid value for ", key, "as it is not a string:", value)
            return undefined
        }

        if (
            key.startsWith(" ") ||
            value.startsWith(" ") ||
            value.endsWith(" ") ||
            key.endsWith(" ")
        ) {
            console.warn("Tag starts with or ends with a space - trimming anyway")
        }

        return { k: key.trim(), v: value.trim() }
    }

    async CreateChangeDescriptions(): Promise<ChangeDescription[]> {
        const changedTags: { k: string; v: string }[] = this._tagsFilter
            .asChange(this._currentTags)
            .map(ChangeTagAction.checkChange)
        const typeId = this._elementId.split("/")
        const type = typeId[0]
        const id = Number(typeId[1])
        return [
            {
                type: <"node" | "way" | "relation">type,
                id: id,
                tags: changedTags,
                meta: this._meta,
            },
        ]
    }
}
