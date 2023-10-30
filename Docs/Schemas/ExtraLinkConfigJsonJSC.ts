export default {
  "type": "object",
  "properties": {
    "icon": {
      "description": "question: What icon should be shown in the link button?\nifunset: do not show an icon\ntype: icon",
      "type": "string"
    },
    "text": {
      "description": "question: What text should be shown in the link icon?\n\nNote that {lat},{lon},{zoom}, {language} and {theme} will be replaced\n\nifunset: do not show a text",
      "anyOf": [
        {
          "$ref": "#/definitions/Record<string,string>"
        },
        {
          "type": "string"
        }
      ]
    },
    "href": {
      "description": "question: if clicked, what webpage should open?\nNote that {lat},{lon},{zoom}, {language} and {theme} will be replaced\n\ntype: url",
      "type": "string"
    },
    "newTab": {
      "description": "question: Should the link open in a new tab?\niftrue: Open in a new tab\niffalse: do not open in a new tab\nifunset: do not open in a new tab",
      "type": "boolean"
    },
    "requirements": {
      "description": "question: When should the extra button be shown?\nsuggestions: return [{if: \"value=iframe\", then: \"When shown in an iframe\"}, {if: \"value=no-iframe\", then: \"When shown as stand-alone webpage\"}, {if: \"value=welcome-message\", then: \"When the welcome messages are enabled\"}, {if: \"value=iframe\", then: \"When the welcome messages are disabled\"}]",
      "type": "array",
      "items": {
        "enum": [
          "iframe",
          "no-iframe",
          "no-welcome-message",
          "welcome-message"
        ],
        "type": "string"
      }
    }
  },
  "required": [
    "href"
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
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}