export default {
  "type": "object",
  "properties": {
    "icon": {
      "description": "question: What icon should be used?\n\nTo reuse icons from a different layer of a library:\n- The library layer has, within tagRenderings one which will output the URL of the image (e.g. mappings: {\"if\": \"shop=xyz\", then: \"./assets/icons/shop_xyz.png\"})\n- Use \"layer_id.tagrendering_id\"\n\nNote that if you reuse icons from a different icon set, you'll probably want to use `override` to set a default rendering\n\n\ntypes: <span class=\"text-lg font-bold\">Use a different icon depending on the value of some attributes</span> ; icon\nsuggestions: return [ \"nsi_brand.icon\", \"nsi_operator.icon\", \"id_presets.shop_rendering\", ...Constants.defaultPinIcons.map(i => ({if: \"value=\"+i, then: i, icon: i}))]",
      "anyOf": [
        {
          "$ref": "#/definitions/MinimalTagRenderingConfigJson"
        },
        {
          "type": "object",
          "properties": {
            "builtin": {
              "type": "string"
            },
            "override": {}
          },
          "required": [
            "builtin",
            "override"
          ]
        },
        {
          "type": "string"
        }
      ]
    },
    "color": {
      "description": "question: What colour should the icon be?\nThis will only work for the default icons such as `pin`,`circle`,...\ntypes: <span class=\"text-lg font-bold\">Use a different color depending on the value of some attributes</span> ; color",
      "anyOf": [
        {
          "$ref": "#/definitions/MinimalTagRenderingConfigJson"
        },
        {
          "type": "object",
          "properties": {
            "builtin": {
              "type": "string"
            },
            "override": {}
          },
          "required": [
            "builtin",
            "override"
          ]
        },
        {
          "type": "string"
        }
      ]
    }
  },
  "required": [
    "icon"
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
    "Record<string,string>": {
      "type": "object"
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
    "FilterConfigOptionJson": {
      "type": "object",
      "properties": {
        "question": {
          "anyOf": [
            {
              "$ref": "#/definitions/Record<string,string>"
            },
            {
              "type": "string"
            }
          ]
        },
        "searchTerms": {
          "$ref": "#/definitions/Record<string,string[]>"
        },
        "emoji": {
          "type": "string"
        },
        "icon": {
          "type": "string"
        },
        "osmTags": {
          "description": "The main representation of Tags.\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for more documentation\n\ntype: tag",
          "anyOf": [
            {
              "$ref": "#/definitions/{and:TagConfigJson[];}"
            },
            {
              "$ref": "#/definitions/{or:TagConfigJson[];}"
            },
            {
              "type": "string"
            }
          ]
        },
        "default": {
          "type": "boolean"
        },
        "fields": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "description": "If name is `search`, use  \"_first_comment~.*{search}.*\" as osmTags",
                "type": "string"
              },
              "type": {
                "type": "string"
              }
            },
            "required": [
              "name"
            ]
          }
        }
      },
      "required": [
        "question"
      ]
    },
    "Record<string,string[]>": {
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
    },
    "MinimalTagRenderingConfigJson": {
      "description": "Mostly used for lineRendering and pointRendering",
      "type": "object",
      "properties": {
        "render": {
          "description": "question: What value should be shown (if no predefined option matches)?\n\nThis piece of text will be shown in the infobox.\nNote that \"&LBRACEkey&RBRACE\"-parts are substituted by the corresponding values of the element.\n\nThis value will be used if there is no mapping which matches (or there are no matches)\nNote that this is a HTML-interpreted value, so you can add links as e.g. '&lt;a href='{website}'>{website}&lt;/a>' or include images such as `This is of type A &lt;br>&lt;img src='typeA-icon.svg' />`",
          "type": "string"
        },
        "mappings": {
          "description": "Allows fixed-tag inputs, shown either as radiobuttons or as checkboxes",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "if": {
                "$ref": "#/definitions/TagConfigJson",
                "description": "question: When should this single mapping match?\n\nIf this condition is met, then the text under `then` will be shown.\nIf no value matches, and the user selects this mapping as an option, then these tags will be uploaded to OSM.\n\nFor example: {'if': 'diet:vegetarion=yes', 'then':'A vegetarian option is offered here'}\n\nThis can be an substituting-tag as well, e.g. {'if': 'addr:street:={_calculated_nearby_streetname}', 'then': '{_calculated_nearby_streetname}'}"
              },
              "then": {
                "description": "question: What text should be shown?\n\nIf the condition `if` is met, the text `then` will be rendered.\nIf not known yet, the user will be presented with `then` as an option",
                "type": "string"
              }
            },
            "required": [
              "if",
              "then"
            ]
          }
        }
      }
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}