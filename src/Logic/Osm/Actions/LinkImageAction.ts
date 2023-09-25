import ChangeTagAction from "./ChangeTagAction"
import { Tag } from "../../Tags/Tag"

export default class LinkPicture extends ChangeTagAction {
    /**
     * Adds a link to an image
     * @param elementId
     * @param proposedKey: a key which might be used, typically `image`. If the key is already used with a different URL, `key+":0"` will be used instead (or a higher number if needed)
     * @param url
     * @param currentTags
     * @param meta
     *
     */
    constructor(
        elementId: string,
        proposedKey: "image" | "mapillary" | "wiki_commons" | string,
        url: string,
        currentTags: Record<string, string>,
        meta: {
            theme: string
            changeType: "add-image" | "link-image"
        }
    ) {
        let key = proposedKey
        let i = 0
        while (currentTags[key] !== undefined && currentTags[key] !== url) {
            key = proposedKey + ":" + i
            i++
        }
        super(elementId, new Tag(key, url), currentTags, meta)
    }
}
