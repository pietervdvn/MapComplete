import { JsonSchema, JsonSchemaType } from "./jsonSchema"

export interface ConfigMeta {
    path: string[]
    type: JsonSchemaType | JsonSchema[]
    hints: {
        group?: string
        typehint?: string
        /**
         * If multiple subcategories can be chosen
         */
        types?: string
        question?: string
        ifunset?: string
        inline?: string
        default?: string
    }
    required: boolean
    description: string
}
