import { JsonSchema, JsonSchemaType } from "./jsonSchema"

export interface ConfigMeta {
    path: string[]
    type: JsonSchemaType | JsonSchema[]
    /**
     * All fields are lowercase, as they should be case-insensitive
     */
    hints: {
        group?: string
        typehint?: string
        typehelper?: string
        /**
         * If multiple subcategories can be chosen
         */
        types?: string
        question?: string
        iftrue?: string
        iffalse?: string
        ifunset?: string
        inline?: string
        default?: string
        typesdefault?: string
        suggestions?: []
        title?: string
        multianswer?: "true" | string
    }
    required: boolean
    description: string
}

export class ConfigMetaUtils {
    static isTranslation(configMeta: ConfigMeta) {
        /*      {
    "$ref": "#/definitions/Record<string,string>"
  },
  {
    "type": "string"
  }*/
        if (!configMeta.type) {
            return false
        }
        if (Array.isArray(configMeta.type)) {
            return configMeta.type.some((t) => t["$ref"] === "#/definitions/Record<string,string>")
        } else {
            return configMeta.type["$ref"] === "#/definitions/Record<string,string>"
        }
    }
}
