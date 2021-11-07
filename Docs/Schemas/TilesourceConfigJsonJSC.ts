export default {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/TilesourceConfigJson",
  "definitions": {
    "TilesourceConfigJson": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "Id of this overlay, used in the URL-parameters to set the state"
        },
        "source": {
          "type": "string",
          "description": "The path, where {x}, {y} and {z} will be substituted"
        },
        "isOverlay": {
          "type": "boolean",
          "description": "Wether or not this is an overlay. Default: true"
        },
        "name": {
          "anyOf": [
            {},
            {
              "type": "string"
            }
          ],
          "description": "How this will be shown in the selection menu. Make undefined if this may not be toggled"
        },
        "minZoom": {
          "type": "number",
          "description": "Only visible at this or a higher zoom level"
        },
        "maxZoom": {
          "type": "number",
          "description": "Only visible at this or a lower zoom level"
        },
        "defaultState": {
          "type": "boolean",
          "description": "The default state, set to false to hide by default"
        }
      },
      "required": [
        "id",
        "source",
        "defaultState"
      ],
      "description": "Configuration for a tilesource config"
    }
  }
}