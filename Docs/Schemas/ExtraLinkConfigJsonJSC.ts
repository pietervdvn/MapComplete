export default {
  "type": "object",
  "properties": {
    "icon": {
      "type": "string"
    },
    "text": {},
    "href": {
      "type": "string"
    },
    "newTab": {
      "type": "boolean"
    },
    "requirements": {
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
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}