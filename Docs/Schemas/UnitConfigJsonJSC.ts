export default {
  "description": "In some cases, a value is represented in a certain unit (such as meters for heigt/distance/..., km/h for speed, ...)\n\nSometimes, multiple denominations are possible (e.g. km/h vs mile/h; megawatt vs kilowatt vs gigawatt for power generators, ...)\n\nThis brings in some troubles, as there are multiple ways to write it (no denomitation, 'm' vs 'meter' 'metre', ...)\n\nNot only do we want to write consistent data to OSM, we also want to present this consistently to the user.\nThis is handled by defining units.\n\n# Rendering\n\nTo render a value with long (human) denomination, use {canonical(key)}\n\n# Usage\n\nFirst of all, you define which keys have units applied, for example:\n\n```\nunits: [\n appliesTo: [\"maxspeed\", \"maxspeed:hgv\", \"maxspeed:bus\"]\n applicableUnits: [\n     ...\n ]\n]\n```\n\nApplicableUnits defines which is the canonical extension, how it is presented to the user, ...:\n\n```\napplicableUnits: [\n{\n    canonicalDenomination: \"km/h\",\n    alternativeDenomination: [\"km/u\", \"kmh\", \"kph\"]\n    default: true,\n    human: {\n        en: \"kilometer/hour\",\n        nl: \"kilometer/uur\"\n    },\n    humanShort: {\n        en: \"km/h\",\n        nl: \"km/u\"\n    }\n},\n{\n    canoncialDenomination: \"mph\",\n    ... similar for miles an hour ...\n}\n]\n```\n\n\nIf this is defined, then every key which the denominations apply to (`maxspeed`, `maxspeed:hgv` and `maxspeed:bus`) will be rewritten at the metatagging stage:\nevery value will be parsed and the canonical extension will be added add presented to the other parts of the code.\n\nAlso, if a freeform text field is used, an extra dropdown with applicable denominations will be given",
  "type": "object",
  "properties": {
    "quantity": {
      "description": "What is quantified? E.g. 'speed', 'length' (including width, diameter, ...), 'electric tension', 'electric current', 'duration'",
      "type": "string"
    },
    "appliesToKey": {
      "description": "Every key from this list will be normalized.\n\nTo render the value properly (with a human readable denomination), use `{canonical(<key>)}`",
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "eraseInvalidValues": {
      "description": "If set, invalid values will be erased in the MC application (but not in OSM of course!)\nBe careful with setting this",
      "type": "boolean"
    },
    "applicableUnits": {
      "description": "The possible denominations for this unit.\nFor length, denominations could be \"meter\", \"kilometer\", \"miles\", \"foot\"",
      "type": "array",
      "items": {
        "$ref": "#/definitions/DenominationConfigJson"
      }
    },
    "defaultInput": {
      "description": "In some cases, the default denomination is not the most user friendly to input.\nE.g., when measuring kerb heights, it is illogical to ask contributors to input an amount in meters.\n\nWhen a default input method should be used, this can be specified by setting the canonical denomination here, e.g.\n`defaultInput: \"cm\"`. This must be a denomination which appears in the applicableUnits",
      "type": "string"
    }
  },
  "required": [
    "applicableUnits"
  ],
  "definitions": {
    "TagConfigJson": {
      "description": "The main representation of Tags.\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for more documentation\n\ntype: tag",
      "anyOf": [
        {
          "$ref": "#/definitions/{and:TagConfigJson[];}"
        },
        {
          "type": "object",
          "properties": {
            "or": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/TagConfigJson"
              }
            }
          },
          "required": [
            "or"
          ]
        },
        {
          "type": "string"
        }
      ]
    },
    "{and:TagConfigJson[];}": {
      "type": "object",
      "properties": {
        "and": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/TagConfigJson"
          }
        }
      },
      "required": [
        "and"
      ]
    },
    "{or:TagConfigJson[];}": {
      "type": "object",
      "properties": {
        "or": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/TagConfigJson"
          }
        }
      },
      "required": [
        "or"
      ]
    },
    "Record<string,string>": {
      "type": "object"
    },
    "Record<string,string|Record<string,string>>": {
      "type": "object"
    },
    "DenominationConfigJson": {
      "type": "object",
      "properties": {
        "useIfNoUnitGiven": {
          "description": "If this evaluates to true and the value to interpret has _no_ unit given, assumes that this unit is meant.\nAlternatively, a list of country codes can be given where this acts as the default interpretation\n\nE.g., a denomination using \"meter\" would probably set this flag to \"true\";\na denomination for \"mp/h\" will use the condition \"_country=gb\" to indicate that it is the default in the UK.\n\nIf none of the units indicate that they are the default, the first denomination will be used instead",
          "anyOf": [
            {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            {
              "type": "boolean"
            }
          ]
        },
        "canonicalDenomination": {
          "description": "The canonical value for this denomination which will be added to the value in OSM.\ne.g. \"m\" for meters\nIf the user inputs '42', the canonical value will be added and it'll become '42m'.\n\nImportant: often, _no_ canonical values are expected, e.g. in the case of 'maxspeed' where 'km/h' is the default.\nIn this case, an empty string should be used",
          "type": "string"
        },
        "canonicalDenominationSingular": {
          "description": "The canonical denomination in the case that the unit is precisely '1'.\nUsed for display purposes only.\n\nE.g.: for duration of something in minutes: `2 minutes` but `1 minute`; the `minute` goes here",
          "type": "string"
        },
        "alternativeDenomination": {
          "description": "A list of alternative values which can occur in the OSM database - used for parsing.\nE.g.: while 'm' is canonical, `meter`, `mtrs`, ... can occur as well",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "human": {
          "description": "The value for humans in the dropdown. This should not use abbreviations and should be translated, e.g.\n{\n    \"en\": \"meter\",\n    \"fr\": \"metre\"\n}",
          "anyOf": [
            {
              "$ref": "#/definitions/Record<string,string>"
            },
            {
              "type": "string"
            }
          ]
        },
        "humanSingular": {
          "description": "The value for humans in the dropdown. This should not use abbreviations and should be translated, e.g.\n{\n    \"en\": \"minute\",\n    \"nl\": \"minuut\"\n}",
          "anyOf": [
            {
              "$ref": "#/definitions/Record<string,string>"
            },
            {
              "type": "string"
            }
          ]
        },
        "prefix": {
          "description": "If set, then the canonical value will be prefixed instead, e.g. for '€'\nNote that if all values use 'prefix', the dropdown might move to before the text field",
          "type": "boolean"
        },
        "addSpace": {
          "description": "If set, add a space between the quantity and the denomination.\n\nE.g.: `50 mph` instad of `50mph`",
          "type": "boolean"
        }
      },
      "required": [
        "canonicalDenomination"
      ]
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}