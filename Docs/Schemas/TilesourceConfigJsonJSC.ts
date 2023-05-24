export default {
  "description": "Configuration for a tilesource config",
  "type": "object",
  "properties": {
    "id": {
      "description": "Id of this overlay, used in the URL-parameters to set the state",
      "type": "string"
    },
    "source": {
      "description": "The path, where {x}, {y} and {z} will be substituted",
      "type": "string"
    },
    "isOverlay": {
      "description": "Wether or not this is an overlay. Default: true",
      "type": "boolean"
    },
    "name": {
      "description": "How this will be shown in the selection menu.\nMake undefined if this may not be toggled"
    },
    "minZoom": {
      "description": "Only visible at this or a higher zoom level",
      "type": "number"
    },
    "maxZoom": {
      "description": "Only visible at this or a lower zoom level",
      "type": "number"
    },
    "defaultState": {
      "description": "The default state, set to false to hide by default",
      "type": "boolean"
    }
  },
  "required": [
    "defaultState",
    "id",
    "source"
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
        }
      },
      "required": [
        "canonicalDenomination"
      ]
    },
    "Record<string,string>": {
      "type": "object"
    },
    "TagRenderingConfigJson": {
      "description": "A TagRenderingConfigJson is a single piece of code which converts one ore more tags into a HTML-snippet.\nFor an _editable_ tagRendering, use 'QuestionableTagRenderingConfigJson' instead, which extends this one",
      "type": "object",
      "properties": {
        "id": {
          "description": "The id of the tagrendering, should be an unique string.\nUsed to keep the translations in sync. Only used in the tagRenderings-array of a layerConfig, not requered otherwise.\n\nUse 'questions' to trigger the question box of this group (if a group is defined)",
          "type": "string"
        },
        "group": {
          "description": "If 'group' is defined on many tagRenderings, these are grouped together when shown. The questions are grouped together as well.\nThe first tagRendering of a group will always be a sticky element.",
          "type": "string"
        },
        "labels": {
          "description": "A list of labels. These are strings that are used for various purposes, e.g. to filter them away",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "description": {
          "description": "A human-readable text explaining what this tagRendering does"
        },
        "render": {
          "description": "Renders this value. Note that \"{key}\"-parts are substituted by the corresponding values of the element.\nIf neither 'textFieldQuestion' nor 'mappings' are defined, this text is simply shown as default value.\n\nNote that this is a HTML-interpreted value, so you can add links as e.g. '<a href='{website}'>{website}</a>' or include images such as `This is of type A <br><img src='typeA-icon.svg' />`\ntype: rendered"
        },
        "condition": {
          "description": "Only show this tagrendering (or ask the question) if the selected object also matches the tags specified as `condition`.\n\nThis is useful to ask a follow-up question.\nFor example, within toilets, asking _where_ the diaper changing table is is only useful _if_ there is one.\nThis can be done by adding `\"condition\": \"changing_table=yes\"`\n\nA full example would be:\n```json\n    {\n      \"question\": \"Where is the changing table located?\",\n      \"render\": \"The changing table is located at {changing_table:location}\",\n      \"condition\": \"changing_table=yes\",\n      \"freeform\": {\n        \"key\": \"changing_table:location\",\n        \"inline\": true\n      },\n      \"mappings\": [\n        {\n          \"then\": \"The changing table is in the toilet for women.\",\n          \"if\": \"changing_table:location=female_toilet\"\n        },\n        {\n          \"then\": \"The changing table is in the toilet for men.\",\n          \"if\": \"changing_table:location=male_toilet\"\n        },\n        {\n          \"if\": \"changing_table:location=wheelchair_toilet\",\n          \"then\": \"The changing table is in the toilet for wheelchair users.\",\n        },\n        {\n          \"if\": \"changing_table:location=dedicated_room\",\n          \"then\": \"The changing table is in a dedicated room. \",\n        }\n      ],\n      \"id\": \"toilet-changing_table:location\"\n    },\n```",
          "anyOf": [
            {
              "$ref": "#/definitions/AndTagConfigJson",
              "description": "Chain many tags, to match, a single of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
            },
            {
              "$ref": "#/definitions/OrTagConfigJson",
              "description": "Chain many tags, to match, all of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
            },
            {
              "type": "string"
            }
          ]
        },
        "freeform": {
          "description": "Allow freeform text input from the user",
          "type": "object",
          "properties": {
            "key": {
              "description": "If this key is present, then 'render' is used to display the value.\nIf this is undefined, the rendering is _always_ shown",
              "type": "string"
            }
          },
          "required": [
            "key"
          ]
        },
        "mappings": {
          "description": "Allows fixed-tag inputs, shown either as radiobuttons or as checkboxes",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "if": {
                "$ref": "#/definitions/TagConfigJson",
                "description": "If this condition is met, then the text under `then` will be shown.\nIf no value matches, and the user selects this mapping as an option, then these tags will be uploaded to OSM.\n\nFor example: {'if': 'diet:vegetarion=yes', 'then':'A vegetarian option is offered here'}\n\nThis can be an substituting-tag as well, e.g. {'if': 'addr:street:={_calculated_nearby_streetname}', 'then': '{_calculated_nearby_streetname}'}"
              },
              "then": {
                "description": "If the condition `if` is met, the text `then` will be rendered.\nIf not known yet, the user will be presented with `then` as an option\nType: rendered"
              },
              "icon": {
                "description": "An icon supporting this mapping; typically shown pretty small\nType: icon",
                "anyOf": [
                  {
                    "type": "object",
                    "properties": {
                      "path": {
                        "description": "The path to the icon\nType: icon",
                        "type": "string"
                      },
                      "class": {
                        "description": "A hint to mapcomplete on how to render this icon within the mapping.\nThis is translated to 'mapping-icon-<classtype>', so defining your own in combination with a custom CSS is possible (but discouraged)",
                        "type": "string"
                      }
                    },
                    "required": [
                      "path"
                    ]
                  },
                  {
                    "type": "string"
                  }
                ]
              }
            },
            "required": [
              "if",
              "then"
            ]
          }
        }
      }
    },
    "Record<string,string[]>": {
      "type": "object"
    },
    "MappingConfigJson": {
      "type": "object",
      "properties": {
        "if": {
          "$ref": "#/definitions/TagConfigJson",
          "description": "The main representation of Tags.\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for more documentation"
        },
        "then": {
          "description": "Shown if the 'if is fulfilled\nType: rendered"
        },
        "icon": {
          "description": "An extra icon supporting the choice\nType: icon",
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "path": {
                  "description": "The path to the  icon\nType: icon",
                  "type": "string"
                },
                "class": {
                  "description": "Size of the image",
                  "type": "string"
                }
              },
              "required": [
                "path"
              ]
            },
            {
              "type": "string"
            }
          ]
        },
        "hideInAnswer": {
          "description": "In some cases, multiple taggings exist (e.g. a default assumption, or a commonly mapped abbreviation and a fully written variation).\n\nIn the latter case, a correct text should be shown, but only a single, canonical tagging should be selectable by the user.\nIn this case, one of the mappings can be hiden by setting this flag.\n\nTo demonstrate an example making a default assumption:\n\nmappings: [\n {\n     if: \"access=\", -- no access tag present, we assume accessible\n     then: \"Accessible to the general public\",\n     hideInAnswer: true\n },\n {\n     if: \"access=yes\",\n     then: \"Accessible to the general public\", -- the user selected this, we add that to OSM\n },\n {\n     if: \"access=no\",\n     then: \"Not accessible to the public\"\n }\n]\n\n\nFor example, for an operator, we have `operator=Agentschap Natuur en Bos`, which is often abbreviated to `operator=ANB`.\nThen, we would add two mappings:\n{\n    if: \"operator=Agentschap Natuur en Bos\" -- the non-abbreviated version which should be uploaded\n    then: \"Maintained by Agentschap Natuur en Bos\"\n},\n{\n    if: \"operator=ANB\", -- we don't want to upload abbreviations\n    then: \"Maintained by Agentschap Natuur en Bos\"\n    hideInAnswer: true\n}\n\nHide in answer can also be a tagsfilter, e.g. to make sure an option is only shown when appropriate.\nKeep in mind that this is reverse logic: it will be hidden in the answer if the condition is true, it will thus only show in the case of a mismatch\n\ne.g., for toilets: if \"wheelchair=no\", we know there is no wheelchair dedicated room.\nFor the location of the changing table, the option \"in the wheelchair accessible toilet is weird\", so we write:\n\n{\n    \"question\": \"Where is the changing table located?\"\n    \"mappings\": [\n        {\"if\":\"changing_table:location=female\",\"then\":\"In the female restroom\"},\n       {\"if\":\"changing_table:location=male\",\"then\":\"In the male restroom\"},\n       {\"if\":\"changing_table:location=wheelchair\",\"then\":\"In the wheelchair accessible restroom\", \"hideInAnswer\": \"wheelchair=no\"},\n\n    ]\n}\n\nAlso have a look for the meta-tags\n{\n    if: \"operator=Agentschap Natuur en Bos\",\n    then: \"Maintained by Agentschap Natuur en Bos\",\n    hideInAnswer: \"_country!=be\"\n}",
          "anyOf": [
            {
              "$ref": "#/definitions/AndTagConfigJson",
              "description": "Chain many tags, to match, a single of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
            },
            {
              "$ref": "#/definitions/OrTagConfigJson",
              "description": "Chain many tags, to match, all of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
            },
            {
              "type": [
                "string",
                "boolean"
              ]
            }
          ]
        },
        "ifnot": {
          "description": "Only applicable if 'multiAnswer' is set.\nThis is for situations such as:\n`accepts:coins=no` where one can select all the possible payment methods. However, we want to make explicit that some options _were not_ selected.\nThis can be done with `ifnot`\nNote that we can not explicitly render this negative case to the user, we cannot show `does _not_ accept coins`.\nIf this is important to your usecase, consider using multiple radiobutton-fields without `multiAnswer`",
          "anyOf": [
            {
              "$ref": "#/definitions/AndTagConfigJson",
              "description": "Chain many tags, to match, a single of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
            },
            {
              "$ref": "#/definitions/OrTagConfigJson",
              "description": "Chain many tags, to match, all of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
            },
            {
              "type": "string"
            }
          ]
        },
        "addExtraTags": {
          "description": "If chosen as answer, these tags will be applied as well onto the object.\nNot compatible with multiAnswer.\n\nThis can be used e.g. to erase other keys which indicate the 'not' value:\n```json\n{\n    \"if\": \"crossing:marking=rainbow\",\n    \"then\": \"This is a rainbow crossing\",\n    \"addExtraTags\": \"not:crossing:marking=\"\n}\n```",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "searchTerms": {
          "description": "If there are many options, the mappings-radiobuttons will be replaced by an element with a searchfunction\n\nSearchterms (per language) allow to easily find an option if there are many options",
          "$ref": "#/definitions/Record<string,string[]>"
        },
        "priorityIf": {
          "description": "If the searchable selector is picked, mappings with this item will have priority and show up even if the others are hidden\nUse this sparingly",
          "anyOf": [
            {
              "$ref": "#/definitions/AndTagConfigJson",
              "description": "Chain many tags, to match, a single of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
            },
            {
              "$ref": "#/definitions/OrTagConfigJson",
              "description": "Chain many tags, to match, all of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
            },
            {
              "type": "string"
            }
          ]
        },
        "#": {
          "description": "Used for comments or to disable a validation\n\nignore-image-in-then: normally, a `then`-clause is not allowed to have an `img`-html-element as icons are preferred. In some cases (most notably title-icons), this is allowed",
          "type": "string"
        }
      },
      "required": [
        "if",
        "then"
      ]
    },
    "T": {
      "type": "object"
    },
    "default_4": {
      "description": "The PointRenderingConfig gives all details onto how to render a single point of a feature.\n\nThis can be used if:\n\n- The feature is a point\n- To render something at the centroid of an area, or at the start, end or projected centroid of a way",
      "type": "object",
      "properties": {
        "location": {
          "description": "All the locations that this point should be rendered at.\nUsing `location: [\"point\", \"centroid\"] will always render centerpoint.\n'projected_centerpoint' will show an item on the line itself, near the middle of the line. (LineStrings only)",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "icon": {
          "description": "The icon for an element.\nNote that this also doubles as the icon for this layer (rendered with the overpass-tags) ánd the icon in the presets.\n\nThe result of the icon is rendered as follows:\nthe resulting string is interpreted as a _list_ of items, separated by \";\". The bottommost layer is the first layer.\nAs a result, on could use a generic pin, then overlay it with a specific icon.\nTo make things even more practical, one can use all SVG's from the folder \"assets/svg\" and _substitute the color_ in it.\nE.g. to draw a red pin, use \"pin:#f00\", to have a green circle with your icon on top, use `circle:#0f0;<path to my icon.svg>`\n\nType: icon",
          "anyOf": [
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            },
            {
              "type": "string"
            }
          ]
        },
        "iconBadges": {
          "description": "A list of extra badges to show next to the icon as small badge\nThey will be added as a 25% height icon at the bottom right of the icon, with all the badges in a flex layout.\n\nNote: strings are interpreted as icons, so layering and substituting is supported. You can use `circle:white;./my_icon.svg` to add a background circle",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "if": {
                "$ref": "#/definitions/TagConfigJson",
                "description": "The main representation of Tags.\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for more documentation"
              },
              "then": {
                "description": "Badge to show\nType: icon",
                "anyOf": [
                  {
                    "$ref": "#/definitions/TagRenderingConfigJson"
                  },
                  {
                    "type": "string"
                  }
                ]
              }
            },
            "required": [
              "if",
              "then"
            ]
          }
        },
        "iconSize": {
          "description": "A string containing \"width,height\" or \"width,height,anchorpoint\" where anchorpoint is any of 'center', 'top', 'bottom', 'left', 'right', 'bottomleft','topright', ...\nDefault is '40,40,center'",
          "anyOf": [
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            },
            {
              "type": "string"
            }
          ]
        },
        "rotation": {
          "description": "The rotation of an icon, useful for e.g. directions.\nUsage: as if it were a css property for 'rotate', thus has to end with 'deg', e.g. `90deg`, `{direction}deg`, `calc(90deg - {camera:direction}deg)``",
          "anyOf": [
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            },
            {
              "type": "string"
            }
          ]
        },
        "label": {
          "description": "A HTML-fragment that is shown below the icon, for example:\n<div style=\"background: white\">{name}</div>\n\nIf the icon is undefined, then the label is shown in the center of the feature.\nNote that, if the wayhandling hides the icon then no label is shown as well.",
          "anyOf": [
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            },
            {
              "type": "string"
            }
          ]
        },
        "css": {
          "description": "A snippet of css code",
          "anyOf": [
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            },
            {
              "type": "string"
            }
          ]
        },
        "cssClasses": {
          "description": "A snippet of css-classes. They can be space-separated",
          "anyOf": [
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            },
            {
              "type": "string"
            }
          ]
        }
      },
      "required": [
        "location"
      ]
    },
    "default_5": {
      "description": "The LineRenderingConfig gives all details onto how to render a single line of a feature.\n\nThis can be used if:\n\n- The feature is a line\n- The feature is an area",
      "type": "object",
      "properties": {
        "color": {
          "description": "The color for way-elements and SVG-elements.\nIf the value starts with \"--\", the style of the body element will be queried for the corresponding variable instead",
          "anyOf": [
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            },
            {
              "type": "string"
            }
          ]
        },
        "width": {
          "description": "The stroke-width for way-elements",
          "anyOf": [
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            },
            {
              "type": [
                "string",
                "number"
              ]
            }
          ]
        },
        "dashArray": {
          "description": "A dasharray, e.g. \"5 6\"\nThe dasharray defines 'pixels of line, pixels of gap, pixels of line, pixels of gap',\nDefault value: \"\" (empty string == full line)",
          "anyOf": [
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            },
            {
              "type": "string"
            }
          ]
        },
        "lineCap": {
          "description": "The form at the end of a line",
          "anyOf": [
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            },
            {
              "type": "string"
            }
          ]
        },
        "fill": {
          "description": "Whether or not to fill polygons",
          "anyOf": [
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            },
            {
              "enum": [
                "no",
                "yes"
              ],
              "type": "string"
            }
          ]
        },
        "fillColor": {
          "description": "The color to fill a polygon with.\nIf undefined, this will be slightly more opaque version of the stroke line",
          "anyOf": [
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            },
            {
              "type": "string"
            }
          ]
        },
        "offset": {
          "description": "The number of pixels this line should be moved.\nUse a positive numbe to move to the right, a negative to move to the left (left/right as defined by the drawing direction of the line).\n\nIMPORTANT: MapComplete will already normalize 'key:both:property' and 'key:both' into the corresponding 'key:left' and 'key:right' tagging (same for 'sidewalk=left/right/both' which is rewritten to 'sidewalk:left' and 'sidewalk:right')\nThis simplifies programming. Refer to the CalculatedTags.md-documentation for more details",
          "anyOf": [
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            },
            {
              "type": "number"
            }
          ]
        }
      }
    },
    "default<default|default|default[]|default[]>": {
      "description": "Rewrites and multiplies the given renderings of type T.\n\nThis can be used for introducing many similar questions automatically,\nwhich also makes translations easier.\n\n(Note that the key does _not_ need to be wrapped in {}.\nHowever, we recommend to use them if the key is used in a translation, as missing keys will be picked up and warned for by the translation scripts)\n\nFor example:\n\n```\n{\n    rewrite: {\n        sourceString: [\"key\", \"a|b|c\"],\n        into: [\n            [\"X\", 0]\n            [\"Y\", 1],\n            [\"Z\", 2]\n        ],\n        renderings: [{\n            \"key\":\"a|b|c\"\n        }]\n    }\n}\n```\nwill result in _three_ copies (as the values to rewrite into have three values, namely:\n\n[\n  {\n  # The first pair: key --> X, a|b|c --> 0\n      \"X\": 0\n  },\n  {\n      \"Y\": 1\n  },\n  {\n      \"Z\": 2\n  }\n\n]",
      "type": "object",
      "properties": {
        "rewrite": {
          "type": "object",
          "properties": {
            "sourceString": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "into": {
              "type": "array",
              "items": {
                "type": "array",
                "items": {}
              }
            }
          },
          "required": [
            "into",
            "sourceString"
          ]
        },
        "renderings": {
          "anyOf": [
            {
              "$ref": "#/definitions/default_4"
            },
            {
              "$ref": "#/definitions/default_5"
            },
            {
              "type": "array",
              "items": {
                "$ref": "#/definitions/default_5"
              }
            },
            {
              "type": "array",
              "items": {
                "$ref": "#/definitions/default_4"
              }
            }
          ]
        }
      },
      "required": [
        "renderings",
        "rewrite"
      ]
    },
    "QuestionableTagRenderingConfigJson": {
      "description": "A QuestionableTagRenderingConfigJson is a single piece of code which converts one ore more tags into a HTML-snippet.\nIf the desired tags are missing and a question is defined, a question will be shown instead.",
      "type": "object",
      "properties": {
        "question": {
          "description": "If it turns out that this tagRendering doesn't match _any_ value, then we show this question.\nIf undefined, the question is never asked and this tagrendering is read-only",
          "anyOf": [
            {
              "$ref": "#/definitions/Record<string,string>"
            },
            {
              "type": "string"
            }
          ]
        },
        "questionHint": {
          "description": "A hint which is shown in subtle text under the question.\nThis can give some extra information on what the answer should ook like",
          "anyOf": [
            {
              "$ref": "#/definitions/Record<string,string>"
            },
            {
              "type": "string"
            }
          ]
        },
        "freeform": {
          "description": "Allow freeform text input from the user",
          "type": "object",
          "properties": {
            "key": {
              "type": "string"
            },
            "type": {
              "description": "The type of the text-field, e.g. 'string', 'nat', 'float', 'date',...\nSee Docs/SpecialInputElements.md and UI/Input/ValidatedTextField.ts for supported values",
              "type": "string"
            },
            "placeholder": {
              "description": "A (translated) text that is shown (as gray text) within the textfield"
            },
            "helperArgs": {
              "description": "Extra parameters to initialize the input helper arguments.\nFor semantics, see the 'SpecialInputElements.md'",
              "type": "array",
              "items": {}
            },
            "addExtraTags": {
              "description": "If a value is added with the textfield, these extra tag is addded.\nUseful to add a 'fixme=freeform textfield used - to be checked'",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "inline": {
              "description": "When set, influences the way a question is asked.\nInstead of showing a full-widht text field, the text field will be shown within the rendering of the question.\n\nThis combines badly with special input elements, as it'll distort the layout.",
              "type": "boolean"
            },
            "default": {
              "description": "default value to enter if no previous tagging is present.\nNormally undefined (aka do not enter anything)",
              "type": "string"
            }
          },
          "required": [
            "key"
          ]
        },
        "multiAnswer": {
          "description": "If true, use checkboxes instead of radio buttons when asking the question",
          "type": "boolean"
        },
        "mappings": {
          "description": "Allows fixed-tag inputs, shown either as radiobuttons or as checkboxes",
          "type": "array",
          "items": {
            "$ref": "#/definitions/MappingConfigJson"
          }
        },
        "id": {
          "description": "The id of the tagrendering, should be an unique string.\nUsed to keep the translations in sync. Only used in the tagRenderings-array of a layerConfig, not requered otherwise.\n\nUse 'questions' to trigger the question box of this group (if a group is defined)",
          "type": "string"
        },
        "group": {
          "description": "If 'group' is defined on many tagRenderings, these are grouped together when shown. The questions are grouped together as well.\nThe first tagRendering of a group will always be a sticky element.",
          "type": "string"
        },
        "labels": {
          "description": "A list of labels. These are strings that are used for various purposes, e.g. to filter them away",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "description": {
          "description": "A human-readable text explaining what this tagRendering does"
        },
        "render": {
          "description": "Renders this value. Note that \"{key}\"-parts are substituted by the corresponding values of the element.\nIf neither 'textFieldQuestion' nor 'mappings' are defined, this text is simply shown as default value.\n\nNote that this is a HTML-interpreted value, so you can add links as e.g. '<a href='{website}'>{website}</a>' or include images such as `This is of type A <br><img src='typeA-icon.svg' />`\ntype: rendered"
        },
        "condition": {
          "description": "Only show this tagrendering (or ask the question) if the selected object also matches the tags specified as `condition`.\n\nThis is useful to ask a follow-up question.\nFor example, within toilets, asking _where_ the diaper changing table is is only useful _if_ there is one.\nThis can be done by adding `\"condition\": \"changing_table=yes\"`\n\nA full example would be:\n```json\n    {\n      \"question\": \"Where is the changing table located?\",\n      \"render\": \"The changing table is located at {changing_table:location}\",\n      \"condition\": \"changing_table=yes\",\n      \"freeform\": {\n        \"key\": \"changing_table:location\",\n        \"inline\": true\n      },\n      \"mappings\": [\n        {\n          \"then\": \"The changing table is in the toilet for women.\",\n          \"if\": \"changing_table:location=female_toilet\"\n        },\n        {\n          \"then\": \"The changing table is in the toilet for men.\",\n          \"if\": \"changing_table:location=male_toilet\"\n        },\n        {\n          \"if\": \"changing_table:location=wheelchair_toilet\",\n          \"then\": \"The changing table is in the toilet for wheelchair users.\",\n        },\n        {\n          \"if\": \"changing_table:location=dedicated_room\",\n          \"then\": \"The changing table is in a dedicated room. \",\n        }\n      ],\n      \"id\": \"toilet-changing_table:location\"\n    },\n```",
          "anyOf": [
            {
              "$ref": "#/definitions/AndTagConfigJson",
              "description": "Chain many tags, to match, a single of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
            },
            {
              "$ref": "#/definitions/OrTagConfigJson",
              "description": "Chain many tags, to match, all of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
            },
            {
              "type": "string"
            }
          ]
        }
      }
    },
    "Partial<QuestionableTagRenderingConfigJson>": {
      "type": "object",
      "properties": {
        "question": {
          "description": "If it turns out that this tagRendering doesn't match _any_ value, then we show this question.\nIf undefined, the question is never asked and this tagrendering is read-only",
          "anyOf": [
            {
              "$ref": "#/definitions/Record<string,string>"
            },
            {
              "type": "string"
            }
          ]
        },
        "questionHint": {
          "description": "A hint which is shown in subtle text under the question.\nThis can give some extra information on what the answer should ook like",
          "anyOf": [
            {
              "$ref": "#/definitions/Record<string,string>"
            },
            {
              "type": "string"
            }
          ]
        },
        "freeform": {
          "description": "Allow freeform text input from the user",
          "type": "object",
          "properties": {
            "key": {
              "type": "string"
            },
            "type": {
              "description": "The type of the text-field, e.g. 'string', 'nat', 'float', 'date',...\nSee Docs/SpecialInputElements.md and UI/Input/ValidatedTextField.ts for supported values",
              "type": "string"
            },
            "placeholder": {
              "description": "A (translated) text that is shown (as gray text) within the textfield"
            },
            "helperArgs": {
              "description": "Extra parameters to initialize the input helper arguments.\nFor semantics, see the 'SpecialInputElements.md'",
              "type": "array",
              "items": {}
            },
            "addExtraTags": {
              "description": "If a value is added with the textfield, these extra tag is addded.\nUseful to add a 'fixme=freeform textfield used - to be checked'",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "inline": {
              "description": "When set, influences the way a question is asked.\nInstead of showing a full-widht text field, the text field will be shown within the rendering of the question.\n\nThis combines badly with special input elements, as it'll distort the layout.",
              "type": "boolean"
            },
            "default": {
              "description": "default value to enter if no previous tagging is present.\nNormally undefined (aka do not enter anything)",
              "type": "string"
            }
          },
          "required": [
            "key"
          ]
        },
        "multiAnswer": {
          "description": "If true, use checkboxes instead of radio buttons when asking the question",
          "type": "boolean"
        },
        "mappings": {
          "description": "Allows fixed-tag inputs, shown either as radiobuttons or as checkboxes",
          "type": "array",
          "items": {
            "$ref": "#/definitions/MappingConfigJson"
          }
        },
        "id": {
          "description": "The id of the tagrendering, should be an unique string.\nUsed to keep the translations in sync. Only used in the tagRenderings-array of a layerConfig, not requered otherwise.\n\nUse 'questions' to trigger the question box of this group (if a group is defined)",
          "type": "string"
        },
        "group": {
          "description": "If 'group' is defined on many tagRenderings, these are grouped together when shown. The questions are grouped together as well.\nThe first tagRendering of a group will always be a sticky element.",
          "type": "string"
        },
        "labels": {
          "description": "A list of labels. These are strings that are used for various purposes, e.g. to filter them away",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "description": {
          "description": "A human-readable text explaining what this tagRendering does"
        },
        "render": {
          "description": "Renders this value. Note that \"{key}\"-parts are substituted by the corresponding values of the element.\nIf neither 'textFieldQuestion' nor 'mappings' are defined, this text is simply shown as default value.\n\nNote that this is a HTML-interpreted value, so you can add links as e.g. '<a href='{website}'>{website}</a>' or include images such as `This is of type A <br><img src='typeA-icon.svg' />`\ntype: rendered"
        },
        "condition": {
          "description": "Only show this tagrendering (or ask the question) if the selected object also matches the tags specified as `condition`.\n\nThis is useful to ask a follow-up question.\nFor example, within toilets, asking _where_ the diaper changing table is is only useful _if_ there is one.\nThis can be done by adding `\"condition\": \"changing_table=yes\"`\n\nA full example would be:\n```json\n    {\n      \"question\": \"Where is the changing table located?\",\n      \"render\": \"The changing table is located at {changing_table:location}\",\n      \"condition\": \"changing_table=yes\",\n      \"freeform\": {\n        \"key\": \"changing_table:location\",\n        \"inline\": true\n      },\n      \"mappings\": [\n        {\n          \"then\": \"The changing table is in the toilet for women.\",\n          \"if\": \"changing_table:location=female_toilet\"\n        },\n        {\n          \"then\": \"The changing table is in the toilet for men.\",\n          \"if\": \"changing_table:location=male_toilet\"\n        },\n        {\n          \"if\": \"changing_table:location=wheelchair_toilet\",\n          \"then\": \"The changing table is in the toilet for wheelchair users.\",\n        },\n        {\n          \"if\": \"changing_table:location=dedicated_room\",\n          \"then\": \"The changing table is in a dedicated room. \",\n        }\n      ],\n      \"id\": \"toilet-changing_table:location\"\n    },\n```",
          "anyOf": [
            {
              "$ref": "#/definitions/AndTagConfigJson",
              "description": "Chain many tags, to match, a single of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
            },
            {
              "$ref": "#/definitions/OrTagConfigJson",
              "description": "Chain many tags, to match, all of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
            },
            {
              "type": "string"
            }
          ]
        }
      }
    },
    "default<(string|QuestionableTagRenderingConfigJson|{builtin:string;override:Partial<QuestionableTagRenderingConfigJson>;})[]>": {
      "description": "Rewrites and multiplies the given renderings of type T.\n\nThis can be used for introducing many similar questions automatically,\nwhich also makes translations easier.\n\n(Note that the key does _not_ need to be wrapped in {}.\nHowever, we recommend to use them if the key is used in a translation, as missing keys will be picked up and warned for by the translation scripts)\n\nFor example:\n\n```\n{\n    rewrite: {\n        sourceString: [\"key\", \"a|b|c\"],\n        into: [\n            [\"X\", 0]\n            [\"Y\", 1],\n            [\"Z\", 2]\n        ],\n        renderings: [{\n            \"key\":\"a|b|c\"\n        }]\n    }\n}\n```\nwill result in _three_ copies (as the values to rewrite into have three values, namely:\n\n[\n  {\n  # The first pair: key --> X, a|b|c --> 0\n      \"X\": 0\n  },\n  {\n      \"Y\": 1\n  },\n  {\n      \"Z\": 2\n  }\n\n]",
      "type": "object",
      "properties": {
        "rewrite": {
          "type": "object",
          "properties": {
            "sourceString": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "into": {
              "type": "array",
              "items": {
                "type": "array",
                "items": {}
              }
            }
          },
          "required": [
            "into",
            "sourceString"
          ]
        },
        "renderings": {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "$ref": "#/definitions/QuestionableTagRenderingConfigJson"
              },
              {
                "type": "object",
                "properties": {
                  "builtin": {
                    "type": "string"
                  },
                  "override": {
                    "$ref": "#/definitions/Partial<QuestionableTagRenderingConfigJson>"
                  }
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
        }
      },
      "required": [
        "renderings",
        "rewrite"
      ]
    },
    "default_1": {
      "type": "object",
      "properties": {
        "id": {
          "description": "An id/name for this filter, used to set the URL parameters",
          "type": "string"
        },
        "options": {
          "description": "The options for a filter\nIf there are multiple options these will be a list of radio buttons\nIf there is only one option this will be a checkbox\nFiltering is done based on the given osmTags that are compared to the objects in that layer.\n\nAn example which searches by name:\n\n```\n{\n      \"id\": \"shop-name\",\n      \"options\": [\n        {\n          \"fields\": [\n            {\n              \"name\": \"search\",\n              \"type\": \"string\"\n            }\n          ],\n          \"osmTags\": \"name~i~.*{search}.*\",\n          \"question\": {\n            \"en\": \"Only show shops with name {search}\",\n          }\n        }\n      ]\n    }\n    ```",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "question": {},
              "osmTags": {
                "description": "The main representation of Tags.\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for more documentation",
                "anyOf": [
                  {
                    "$ref": "#/definitions/AndTagConfigJson",
                    "description": "Chain many tags, to match, a single of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
                  },
                  {
                    "$ref": "#/definitions/OrTagConfigJson",
                    "description": "Chain many tags, to match, all of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
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
      ]
    },
    "DeleteConfigJson": {
      "type": "object",
      "properties": {
        "extraDeleteReasons": {
          "description": "*\nBy default, three reasons to delete a point are shown:\n\n- The point does not exist anymore\n- The point was a testing point\n- THe point could not be found\n\nHowever, for some layers, there might be different or more specific reasons for deletion which can be user friendly to set, e.g.:\n\n- the shop has closed\n- the climbing route has been closed of for nature conservation reasons\n- ...\n\nThese reasons can be stated here and will be shown in the list of options the user can choose from",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "explanation": {
                "description": "The text that will be shown to the user - translatable"
              },
              "changesetMessage": {
                "description": "The text that will be uploaded into the changeset or will be used in the fixme in case of a soft deletion\nShould be a few words, in english",
                "type": "string"
              }
            },
            "required": [
              "changesetMessage",
              "explanation"
            ]
          }
        },
        "nonDeleteMappings": {
          "description": "In some cases, a (starting) contributor might wish to delete a feature even though deletion is not appropriate.\n(The most relevant case are small paths running over private property. These should be marked as 'private' instead of deleted, as the community might trace the path again from aerial imagery, gettting us back to the original situation).\n\nBy adding a 'nonDeleteMapping', an option can be added into the list which will retag the feature.\nIt is important that the feature will be retagged in such a way that it won't be picked up by the layer anymore!",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "if": {
                "$ref": "#/definitions/TagConfigJson",
                "description": "The tags that will be given to the object.\nThis must remove tags so that the 'source/osmTags' won't match anymore"
              },
              "then": {
                "description": "The human explanation for the options"
              }
            },
            "required": [
              "if",
              "then"
            ]
          }
        },
        "softDeletionTags": {
          "description": "In some cases, the contributor is not allowed to delete the current feature (e.g. because it isn't a point, the point is referenced by a relation or the user isn't experienced enough).\nTo still offer the user a 'delete'-option, the feature is retagged with these tags. This is a soft deletion, as the point isn't actually removed from OSM but rather marked as 'disused'\nIt is important that the feature will be retagged in such a way that it won't be picked up by the layer anymore!\n\nExample (note that \"amenity=\" erases the 'amenity'-key alltogether):\n```\n{\n    \"and\": [\"disussed:amenity=public_bookcase\", \"amenity=\"]\n}\n```\n\nor (notice the use of the ':='-tag to copy the old value of 'shop=*' into 'disused:shop='):\n```\n{\n    \"and\": [\"disused:shop:={shop}\", \"shop=\"]\n}\n```",
          "anyOf": [
            {
              "$ref": "#/definitions/AndTagConfigJson",
              "description": "Chain many tags, to match, a single of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
            },
            {
              "$ref": "#/definitions/OrTagConfigJson",
              "description": "Chain many tags, to match, all of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation"
            },
            {
              "type": "string"
            }
          ]
        },
        "neededChangesets": {
          "description": "*\nBy default, the contributor needs 20 previous changesets to delete points edited by others.\nFor some small features (e.g. bicycle racks) this is too much and this requirement can be lowered or dropped, which can be done here.",
          "type": "number"
        },
        "omitDefaultDeleteReasons": {
          "description": "Set this flag if the default delete reasons should be omitted from the dialog.\nThis requires at least one extraDeleteReason or nonDeleteMapping",
          "type": "boolean"
        }
      }
    },
    "default_3": {
      "type": "object",
      "properties": {
        "enableImproveAccuracy": {
          "description": "One default reason to move a point is to improve accuracy.\nSet to false to disable this reason",
          "type": "boolean"
        },
        "enableRelocation": {
          "description": "One default reason to move a point is because it has relocated\nSet to false to disable this reason",
          "type": "boolean"
        }
      }
    },
    "default_2": {
      "description": "In some cases, a value is represented in a certain unit (such as meters for heigt/distance/..., km/h for speed, ...)\n\nSometimes, multiple denominations are possible (e.g. km/h vs mile/h; megawatt vs kilowatt vs gigawatt for power generators, ...)\n\nThis brings in some troubles, as there are multiple ways to write it (no denomitation, 'm' vs 'meter' 'metre', ...)\n\nNot only do we want to write consistent data to OSM, we also want to present this consistently to the user.\nThis is handled by defining units.\n\n# Rendering\n\nTo render a value with long (human) denomination, use {canonical(key)}\n\n# Usage\n\nFirst of all, you define which keys have units applied, for example:\n\n```\nunits: [\n appliesTo: [\"maxspeed\", \"maxspeed:hgv\", \"maxspeed:bus\"]\n applicableUnits: [\n     ...\n ]\n]\n```\n\nApplicableUnits defines which is the canonical extension, how it is presented to the user, ...:\n\n```\napplicableUnits: [\n{\n    canonicalDenomination: \"km/h\",\n    alternativeDenomination: [\"km/u\", \"kmh\", \"kph\"]\n    default: true,\n    human: {\n        en: \"kilometer/hour\",\n        nl: \"kilometer/uur\"\n    },\n    humanShort: {\n        en: \"km/h\",\n        nl: \"km/u\"\n    }\n},\n{\n    canoncialDenomination: \"mph\",\n    ... similar for miles an hour ...\n}\n]\n```\n\n\nIf this is defined, then every key which the denominations apply to (`maxspeed`, `maxspeed:hgv` and `maxspeed:bus`) will be rewritten at the metatagging stage:\nevery value will be parsed and the canonical extension will be added add presented to the other parts of the code.\n\nAlso, if a freeform text field is used, an extra dropdown with applicable denominations will be given",
      "type": "object",
      "properties": {
        "appliesToKey": {
          "description": "Every key from this list will be normalized.\n\nTo render a united value properly, use",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "eraseInvalidValues": {
          "description": "If set, invalid values will be erased in the MC application (but not in OSM of course!)\nBe careful with setting this",
          "type": "boolean"
        },
        "applicableUnits": {
          "description": "The possible denominations for this unit.\nFor length, denominations could be \"meter\", \"kilometer\", \"miles\", \"foot\"",
          "type": "array",
          "items": {
            "$ref": "#/definitions/DenominationConfigJson"
          }
        },
        "defaultInput": {
          "description": "In some cases, the default denomination is not the most user friendly to input.\nE.g., when measuring kerb heights, it is illogical to ask contributors to input an amount in meters.\n\nWhen a default input method should be used, this can be specified by setting the canonical denomination here, e.g.\n`defaultInput: \"cm\"`. This must be a denomination which appears in the applicableUnits",
          "type": "string"
        }
      },
      "required": [
        "applicableUnits",
        "appliesToKey"
      ]
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}