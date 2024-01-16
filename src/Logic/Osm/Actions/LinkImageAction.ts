import ChangeTagAction from "./ChangeTagAction"
import { Tag } from "../../Tags/Tag"
import OsmChangeAction from "./OsmChangeAction"
import { ChangeDescription } from "./ChangeDescription"
import { Store } from "../../UIEventSource"

export default class LinkImageAction extends OsmChangeAction {
    private readonly _proposedKey: "image" | "mapillary" | "wiki_commons" | string
    public readonly _url: string
    private readonly _currentTags: Store<Record<string, string>>
    private readonly _meta: { theme: string; changeType: "add-image" | "link-image" }

    /**
     * Adds an image-link to a feature
     * @param elementId
     * @param proposedKey a key which might be used, typically `image`. If the key is already used with a different URL, `key+":0"` will be used instead (or a higher number if needed)
     * @param url
     * @param currentTags
     * @param meta
     *
     */
    constructor(
        elementId: string,
        proposedKey: "image" | "mapillary" | "wiki_commons" | string,
        url: string,
        currentTags: Store<Record<string, string>>,
        meta: {
            theme: string
            changeType: "add-image" | "link-image"
        }
    ) {
        super(elementId, true)
        this._proposedKey = proposedKey
        this._url = url
        this._currentTags = currentTags
        this._meta = meta
    }

    protected CreateChangeDescriptions(): Promise<ChangeDescription[]> {
        let key = this._proposedKey
        let i = 0
        const currentTags: Record<string, string> = this._currentTags.data
        const url = this._url
        while (currentTags[key] !== undefined && currentTags[key] !== url) {
            key = this._proposedKey + ":" + i
            i++
        }
        const tagChangeAction = new ChangeTagAction(
            this.mainObjectId,
            new Tag(key, url),
            currentTags,
            this._meta
        )
        return tagChangeAction.CreateChangeDescriptions()
    }
}
