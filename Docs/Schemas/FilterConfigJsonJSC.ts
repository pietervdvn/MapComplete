export default {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/FilterConfigJson",
  "definitions": {
    "FilterConfigJson": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "An id/name for this filter, used to set the URL parameters"
        },
        "options": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "question": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {}
                ]
              },
              "osmTags": {
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
            "required": [
              "question"
            ]
          },
          "description": "The options for a filter If there are multiple options these will be a list of radio buttons If there is only one option this will be a checkbox Filtering is done based on the given osmTags that are compared to the objects in that layer."
        }
      },
      "required": [
        "id",
        "options"
      ]
    },
    "AndOrTagConfigJson": {
      "type": "object",
      "properties": {
        "and": {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "$ref": "#/definitions/AndOrTagConfigJson"
              }
            ]
          }
        },
        "or": {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "$ref": "#/definitions/AndOrTagConfigJson"
              }
            ]
          }
        }
      }
    }
  }
}