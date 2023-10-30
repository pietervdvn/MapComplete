/**
 * Extracts the data from the scheme file and writes them in a flatter structure
 */

export type JsonSchemaType =
    | string
    | { $ref: string; description?: string }
    | { type: string }
    | JsonSchemaType[]
export interface JsonSchema {
    description?: string
    type?: JsonSchemaType
    properties?: any
    items?: JsonSchema
    allOf?: JsonSchema[]
    anyOf: JsonSchema[]
    enum: JsonSchema[]
    $ref: string
    required: string[]
}
