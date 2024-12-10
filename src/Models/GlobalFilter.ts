import { Translation, TypedTranslation } from "../UI/i18n/Translation"
import { Tag } from "../Logic/Tags/Tag"
import { TagsFilter } from "../Logic/Tags/TagsFilter"

export interface GlobalFilter {
    osmTags: TagsFilter
    /**
     * If set, this object will be shown instead of hidden, even if the layer is not displayed
     */
    forceShowOnMatch?: boolean
    state: number | string | undefined
    id: string
    onNewPoint: {
        safetyCheck: Translation
        icon: string
        confirmAddNew: TypedTranslation<{ preset: Translation }>
        tags: Tag[]
    }
}
