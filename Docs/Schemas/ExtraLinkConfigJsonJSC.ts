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
      "description": "The main representation of Tags.\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for more documentation",
      "anyOf": [
        {
          "$ref": "#/definitions/AndTagConfigJson"
        },
        {
          "description": "Chain many tags, to match, all of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation",
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
    "AndTagConfigJson": {
      "description": "Chain many tags, to match, a single of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation",
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
    "OrTagConfigJson": {
      "description": "Chain many tags, to match, all of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation",
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