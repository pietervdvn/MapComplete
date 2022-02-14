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
    "AndOrTagConfigJson": {
      "type": "object",
      "properties": {
        "and": {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "$ref": "#/definitions/AndOrTagConfigJson"
              },
              {
                "type": "string"
              }
            ]
          }
        },
        "or": {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "$ref": "#/definitions/AndOrTagConfigJson"
              },
              {
                "type": "string"
              }
            ]
          }
        }
      }
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}