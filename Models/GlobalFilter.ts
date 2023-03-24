import { Translation, TypedTranslation } from "../UI/i18n/Translation"
import { FilterState } from "./FilteredLayer"
import { Tag } from "../Logic/Tags/Tag"

export interface GlobalFilter {
    filter: FilterState
    id: string
    onNewPoint: {
        safetyCheck: Translation
        confirmAddNew: TypedTranslation<{ preset: Translation }>
        tags: Tag[]
    }
}
