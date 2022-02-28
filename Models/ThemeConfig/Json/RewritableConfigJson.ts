import {TagRenderingConfigJson} from "./TagRenderingConfigJson";

export default interface RewritableConfigJson<T> {
    rewrite: {
        sourceString: string[],
        into: (string | any)[][]
    },
    renderings: T
}