export default {
  "type": "object",
  "properties": {
    "id": {
      "description": "An id/name for this filter, used to set the URL parameters",
      "type": "string"
    },
    "strict": {
      "description": "If set, the options will be pruned. Only items for which the filter match the layer source will be kept.\n\nFor example, we import types of brands from the nsi. This contains a ton of items, e.g.\n[{question: \"Brand X\", osmTags: {\"and\": [\"shop=clothes\", \"brand=Brand X]}, {osmTags: {\"and\": \"shop=convenience\", ...} ...} ]\nOf course, when making a layer about `shop=clothes`, we'll only want to keep the clothes shops.\nIf set to strict and the source is `shop=clothes`, only those options which have shop=clothes will be returned",
      "type": "boolean"
    },
    "options": {
      "description": "The options for a filter\nIf there are multiple options these will be a list of radio buttons\nIf there is only one option this will be a checkbox\nFiltering is done based on the given osmTags that are compared to the objects in that layer.\n\nAn example which searches by name:\n\n```\n{\n      \"id\": \"shop-name\",\n      \"options\": [\n        {\n          \"fields\": [\n            {\n              \"name\": \"search\",\n              \"type\": \"string\"\n            }\n          ],\n          \"osmTags\": \"name~i~.*{search}.*\",\n          \"question\": {\n            \"en\": \"Only show shops with name {search}\",\n          }\n        }\n      ]\n    }\n    ```",
      "type": "array",
      "items": {
        "$ref": "#/definitions/FilterConfigOptionJson"
      }
    },
    "#": {
      "description": "Used for comments or to disable a check\n\n\"ignore-possible-duplicate\": disables a check in `DetectDuplicateFilters` which complains that a filter can be replaced by a filter from the `filters`-library-layer",
      "type": "string"
    }
  },
  "required": [
    "id",
    "options"
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
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}