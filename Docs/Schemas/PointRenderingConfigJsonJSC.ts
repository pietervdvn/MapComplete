export default {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/PointRenderingConfigJson",
  "definitions": {
    "PointRenderingConfigJson": {
      "type": "object",
      "properties": {
        "location": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "point",
              "centroid",
              "start",
              "end"
            ]
          },
          "description": "All the locations that this point should be rendered at. Using `location: [\"point\", \"centroid\"] will always render centerpoint"
        },
        "icon": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            }
          ],
          "description": "The icon for an element. Note that this also doubles as the icon for this layer (rendered with the overpass-tags) ánd the icon in the presets.\n\nThe result of the icon is rendered as follows: the resulting string is interpreted as a _list_ of items, separated by \";\". The bottommost layer is the first layer. As a result, on could use a generic pin, then overlay it with a specific icon. To make things even more practical, one can use all SVG's from the folder \"assets/svg\" and _substitute the color_ in it. E.g. to draw a red pin, use \"pin:#f00\", to have a green circle with your icon on top, use `circle:#0f0;<path to my icon.svg>`"
        },
        "iconBadges": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "if": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/definitions/AndOrTagConfigJson"
                  }
                ]
              },
              "then": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/definitions/TagRenderingConfigJson"
                  }
                ]
              }
            },
            "required": [
              "if",
              "then"
            ]
          },
          "description": "A list of extra badges to show next to the icon as small badge They will be added as a 25% height icon at the bottom right of the icon, with all the badges in a flex layout.\n\nNote: strings are interpreted as icons, so layering and substituting is supported. You can use `circle:white;./my_icon.svg` to add a background circle"
        },
        "iconSize": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            }
          ],
          "description": "A string containing \"width,height\" or \"width,height,anchorpoint\" where anchorpoint is any of 'center', 'top', 'bottom', 'left', 'right', 'bottomleft','topright', ... Default is '40,40,center'"
        },
        "rotation": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            }
          ],
          "description": "The rotation of an icon, useful for e.g. directions. Usage: as if it were a css property for 'rotate', thus has to end with 'deg', e.g. `90deg`, `{direction}deg`, `calc(90deg - {camera:direction}deg)``"
        },
        "label": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            }
          ],
          "description": "A HTML-fragment that is shown below the icon, for example: <div style=\"background: white; display: block\">{name}</div>\n\nIf the icon is undefined, then the label is shown in the center of the feature. Note that, if the wayhandling hides the icon then no label is shown as well."
        }
      },
      "required": [
        "location"
      ],
      "description": "The PointRenderingConfig gives all details onto how to render a single point of a feature.\n\nThis can be used if:\n\n- The feature is a point\n- To render something at the centroid of an area, or at the start, end or projected centroid of a way"
    },
    "TagRenderingConfigJson": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The id of the tagrendering, should be an unique string. Used to keep the translations in sync. Only used in the tagRenderings-array of a layerConfig, not requered otherwise"
        },
        "group": {
          "type": "string",
          "description": "If 'group' is defined on many tagRenderings, these are grouped together when shown. The questions are grouped together as well. The first tagRendering of a group will always be a sticky element."
        },
        "render": {
          "anyOf": [
            {
              "type": "string"
            },
            {}
          ],
          "description": "Renders this value. Note that \"{key}\"-parts are substituted by the corresponding values of the element. If neither 'textFieldQuestion' nor 'mappings' are defined, this text is simply shown as default value.\n\nNote that this is a HTML-interpreted value, so you can add links as e.g. '<a href='{website}'>{website}</a>' or include images such as `This is of type A <br><img src='typeA-icon.svg' />`"
        },
        "question": {
          "anyOf": [
            {
              "type": "string"
            },
            {}
          ],
          "description": "If it turns out that this tagRendering doesn't match _any_ value, then we show this question. If undefined, the question is never asked and this tagrendering is read-only"
        },
        "condition": {
          "anyOf": [
            {
              "$ref": "#/definitions/AndOrTagConfigJson"
            },
            {
              "type": "string"
            }
          ],
          "description": "Only show this question if the object also matches the following tags.\n\nThis is useful to ask a follow-up question. E.g. if there is a diaper table, then ask a follow-up question on diaper tables..."
        },
        "freeform": {
          "type": "object",
          "properties": {
            "key": {
              "type": "string",
              "description": "If this key is present, then 'render' is used to display the value. If this is undefined, the rendering is _always_ shown"
            },
            "type": {
              "type": "string",
              "description": "The type of the text-field, e.g. 'string', 'nat', 'float', 'date',... See Docs/SpecialInputElements.md and UI/Input/ValidatedTextField.ts for supported values"
            },
            "helperArgs": {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "number"
                  },
                  {
                    "type": "boolean"
                  },
                  {}
                ]
              },
              "description": "Extra parameters to initialize the input helper arguments. For semantics, see the 'SpecialInputElements.md'"
            },
            "addExtraTags": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "If a value is added with the textfield, these extra tag is addded. Useful to add a 'fixme=freeform textfield used - to be checked'"
            },
            "inline": {
              "type": "boolean",
              "description": "When set, influences the way a question is asked. Instead of showing a full-widht text field, the text field will be shown within the rendering of the question.\n\nThis combines badly with special input elements, as it'll distort the layout."
            },
            "default": {
              "type": "string",
              "description": "default value to enter if no previous tagging is present. Normally undefined (aka do not enter anything)"
            }
          },
          "required": [
            "key"
          ],
          "description": "Allow freeform text input from the user"
        },
        "multiAnswer": {
          "type": "boolean",
          "description": "If true, use checkboxes instead of radio buttons when asking the question"
        },
        "mappings": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "if": {
                "anyOf": [
                  {
                    "$ref": "#/definitions/AndOrTagConfigJson"
                  },
                  {
                    "type": "string"
                  }
                ],
                "description": "If this condition is met, then the text under `then` will be shown. If no value matches, and the user selects this mapping as an option, then these tags will be uploaded to OSM.\n\nFor example: {'if': 'diet:vegetarion=yes', 'then':'A vegetarian option is offered here'}\n\nThis can be an substituting-tag as well, e.g. {'if': 'addr:street:={_calculated_nearby_streetname}', 'then': '{_calculated_nearby_streetname}'}"
              },
              "then": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {}
                ],
                "description": "If the condition `if` is met, the text `then` will be rendered. If not known yet, the user will be presented with `then` as an option"
              },
              "hideInAnswer": {
                "anyOf": [
                  {
                    "type": "boolean"
                  },
                  {
                    "type": "string"
                  },
                  {
                    "$ref": "#/definitions/AndOrTagConfigJson"
                  }
                ],
                "description": "In some cases, multiple taggings exist (e.g. a default assumption, or a commonly mapped abbreviation and a fully written variation).\n\nIn the latter case, a correct text should be shown, but only a single, canonical tagging should be selectable by the user. In this case, one of the mappings can be hiden by setting this flag.\n\nTo demonstrate an example making a default assumption:\n\nmappings: [  {      if: \"access=\", -- no access tag present, we assume accessible      then: \"Accessible to the general public\",      hideInAnswer: true  },  {      if: \"access=yes\",      then: \"Accessible to the general public\", -- the user selected this, we add that to OSM  },  {      if: \"access=no\",      then: \"Not accessible to the public\"  } ]\n\n\nFor example, for an operator, we have `operator=Agentschap Natuur en Bos`, which is often abbreviated to `operator=ANB`. Then, we would add two mappings: {     if: \"operator=Agentschap Natuur en Bos\" -- the non-abbreviated version which should be uploaded     then: \"Maintained by Agentschap Natuur en Bos\" }, {     if: \"operator=ANB\", -- we don't want to upload abbreviations     then: \"Maintained by Agentschap Natuur en Bos\"     hideInAnswer: true }\n\nHide in answer can also be a tagsfilter, e.g. to make sure an option is only shown when appropriate. Keep in mind that this is reverse logic: it will be hidden in the answer if the condition is true, it will thus only show in the case of a mismatch\n\ne.g., for toilets: if \"wheelchair=no\", we know there is no wheelchair dedicated room. For the location of the changing table, the option \"in the wheelchair accessible toilet is weird\", so we write:\n\n{     \"question\": \"Where is the changing table located?\"     \"mappings\": [         {\"if\":\"changing_table:location=female\",\"then\":\"In the female restroom\"},        {\"if\":\"changing_table:location=male\",\"then\":\"In the male restroom\"},        {\"if\":\"changing_table:location=wheelchair\",\"then\":\"In the wheelchair accessible restroom\", \"hideInAnswer\": \"wheelchair=no\"},              ] }\n\nAlso have a look for the meta-tags {     if: \"operator=Agentschap Natuur en Bos\",     then: \"Maintained by Agentschap Natuur en Bos\",     hideInAnswer: \"_country!=be\" }"
              },
              "ifnot": {
                "anyOf": [
                  {
                    "$ref": "#/definitions/AndOrTagConfigJson"
                  },
                  {
                    "type": "string"
                  }
                ],
                "description": "Only applicable if 'multiAnswer' is set. This is for situations such as: `accepts:coins=no` where one can select all the possible payment methods. However, we want to make explicit that some options _were not_ selected. This can be done with `ifnot` Note that we can not explicitly render this negative case to the user, we cannot show `does _not_ accept coins`. If this is important to your usecase, consider using multiple radiobutton-fields without `multiAnswer`"
              },
              "addExtraTags": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "If chosen as answer, these tags will be applied as well onto the object. Not compatible with multiAnswer"
              }
            },
            "required": [
              "if",
              "then"
            ]
          },
          "description": "Allows fixed-tag inputs, shown either as radiobuttons or as checkboxes"
        }
      },
      "description": "A TagRenderingConfigJson is a single piece of code which converts one ore more tags into a HTML-snippet. If the desired tags are missing and a question is defined, a question will be shown instead."
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