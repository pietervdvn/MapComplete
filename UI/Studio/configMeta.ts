import { JsonSchema, JsonSchemaType } from "./jsonSchema"

export interface ConfigMeta {
    path: string[]
    type: JsonSchemaType | JsonSchema[]
    hints: {
        group?: string
        typehint?: string
        question?: string
        ifunset?: string
        inline?: string
    }
    required: boolean
    description: string
}
