import { TagsFilter } from "./TagsFilter"
import { Tag } from "./Tag"
import SubstitutingTag from "./SubstitutingTag"
import { And } from "./And"
import { RegexTag } from "./RegexTag"
import ComparingTag from "./ComparingTag"
import { Or } from "./Or"

declare const __is_optimized: unique symbol
type Brand<B> = { [__is_optimized]: B }
/**
 * A marker class, no actual content
 */
export type OptimizedTag = Brand<TagsFilter>


export type UploadableTag = Tag | SubstitutingTag | And
/**
 * Not nested
 */
export type FlatTag = Tag | RegexTag | SubstitutingTag | ComparingTag
export type TagsFilterClosed = FlatTag | And | Or


export class TagTypes {

    static safeAnd(and: And & OptimizedTag): ((FlatTag | (Or & OptimizedTag)) & OptimizedTag)[]{
        return <any> and.and
    }

    static safeOr(or: Or & OptimizedTag): ((FlatTag | (And & OptimizedTag)) & OptimizedTag)[]{
        return <any> or.or
    }

}
