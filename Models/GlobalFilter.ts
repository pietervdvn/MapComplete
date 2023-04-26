import { Translation, TypedTranslation } from "../UI/i18n/Translation"
import { Tag } from "../Logic/Tags/Tag"
import { TagsFilter } from "../Logic/Tags/TagsFilter"

export interface GlobalFilter {
    osmTags: TagsFilter
    state: number | string | undefined
    id: string
    onNewPoint: {
        safetyCheck: Translation
        icon: string
        confirmAddNew: TypedTranslation<{ preset: Translation }>
        tags: Tag[]
    }
}
