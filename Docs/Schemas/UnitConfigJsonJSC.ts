export default {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/UnitConfigJson",
  "definitions": {
    "UnitConfigJson": {
      "type": "object",
      "properties": {
        "appliesToKey": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Every key from this list will be normalized"
        },
        "eraseInvalidValues": {
          "type": "boolean",
          "description": "If set, invalid values will be erased in the MC application (but not in OSM of course!) Be careful with setting this"
        },
        "applicableUnits": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/ApplicableUnitJson"
          },
          "description": "The possible denominations"
        }
      },
      "required": [
        "appliesToKey",
        "applicableUnits"
      ]
    },
    "ApplicableUnitJson": {
      "type": "object",
      "properties": {
        "canonicalDenomination": {
          "type": "string",
          "description": "The canonical value which will be added to the text. e.g. \"m\" for meters If the user inputs '42', the canonical value will be added and it'll become '42m'"
        },
        "canonicalDenominationSingular": {
          "type": "string",
          "description": "The canonical denomination in the case that the unit is precisely '1'"
        },
        "alternativeDenomination": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "A list of alternative values which can occur in the OSM database - used for parsing."
        },
        "human": {
          "anyOf": [
            {
              "type": "string"
            },
            {}
          ],
          "description": "The value for humans in the dropdown. This should not use abbreviations and should be translated, e.g. {     \"en\": \"meter\",     \"fr\": \"metre\" }"
        },
        "humanSingular": {
          "anyOf": [
            {
              "type": "string"
            },
            {}
          ],
          "description": "The value for humans in the dropdown. This should not use abbreviations and should be translated, e.g. {     \"en\": \"minute\",     \"nl\": \"minuut\"x² }"
        },
        "prefix": {
          "type": "boolean",
          "description": "If set, then the canonical value will be prefixed instead, e.g. for '€' Note that if all values use 'prefix', the dropdown might move to before the text field"
        },
        "default": {
          "type": "boolean",
          "description": "The default interpretation - only one can be set. If none is set, the first unit will be considered the default interpretation of a value without a unit"
        }
      },
      "required": [
        "canonicalDenomination"
      ]
    }
  }
}