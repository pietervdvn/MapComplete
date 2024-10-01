export default {
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
  },
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
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}