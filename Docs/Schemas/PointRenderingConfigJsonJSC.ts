export default {
  "description": "The PointRenderingConfig gives all details onto how to render a single point of a feature.\n\nThis can be used if:\n\n- The feature is a point\n- To render something at the centroid of an area, or at the start, end or projected centroid of a way",
  "type": "object",
  "properties": {
    "location": {
      "description": "question: At what location should this icon be shown?\nmultianswer: true\nsuggestions: return [{if: \"value=point\",then: \"Show an icon for point (node) objects\"},{if: \"value=centroid\",then: \"Show an icon for line or polygon (way) objects at their centroid location\"}, {if: \"value=start\",then: \"Show an icon for line (way) objects at the start\"},{if: \"value=end\",then: \"Show an icon for line (way) object at the end\"},{if: \"value=projected_centerpoint\",then: \"Show an icon for line (way) object near the centroid location, but moved onto the line. Does not show an item on polygons\"}, {if: \"value=polygon_centroid\",then: \"Show an icon at a polygon centroid (but not if it is a way)\"}]",
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "marker": {
      "description": "The marker for an element.\nNote that this also defines the icon for this layer (rendered with the overpass-tags) <i>and</i> the icon in the presets.\n\nThe result of the icon is rendered as follows:\n- The first icon is rendered on the map\n- The second entry is overlayed on top of it\n- ...\n\nAs a result, on could use a generic icon (`pin`, `circle`, `square`) with a color, then overlay it with a specific icon.",
      "type": "array",
      "items": {
        "$ref": "#/definitions/IconConfigJson"
      }
    },
    "iconBadges": {
      "description": "A list of extra badges to show next to the icon as small badge\nThey will be added as a 25% height icon at the bottom right of the icon, with all the badges in a flex layout.\n\nNote: strings are interpreted as icons, so layering and substituting is supported. You can use `circle:white;./my_icon.svg` to add a background circle\ngroup: hidden",
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "if": {
            "$ref": "#/definitions/TagConfigJson",
            "description": "The main representation of Tags.\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for more documentation\n\ntype: tag"
          },
          "then": {
            "description": "Badge to show\nType: icon",
            "anyOf": [
              {
                "$ref": "#/definitions/MinimalTagRenderingConfigJson"
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
      "description": "question: What size should the marker be on the map?\nA string containing \"<width>,<height>\" in pixels\nifunset: Use the default size (<b>40,40</b> px)",
      "anyOf": [
        {
          "$ref": "#/definitions/TagRenderingConfigJson"
        },
        {
          "type": "string"
        }
      ]
    },
    "anchor": {
      "description": "question: What is the anchorpoint of the icon?\n\nThis matches the geographical point with a location on the icon.\n\nifunset: Use MapComplete-default (<b>center</b>)\nsuggestions: return [{if: \"value=center\", then: \"Place the <b>center</b> of the icon on the geographical location\"},{if: \"value=top\", then: \"Place the <b>top</b> of the icon on the geographical location\"},{if: \"value=bottom\", then: \"Place the <b>bottom</b> of the icon on the geographical location\"},{if: \"value=left\", then: \"Place the <b>left</b> of the icon on the geographical location\"},{if: \"value=right\", then: \"Place the <b>right</b> of the icon on the geographical location\"}]",
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
      "description": "question: What rotation should be applied on the icon?\nThis is mostly useful for items that face a specific direction, such as surveillance cameras\nThis is interpreted as css property for 'rotate', thus has to end with 'deg', e.g. `90deg`, `{direction}deg`, `calc(90deg - {camera:direction}deg)``\nifunset: Do not rotate",
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
      "description": "question: What label should be shown beneath the marker?\nFor example: `&LT;div style=\"background: white\">{name}&LT;/div>`\n\nIf the icon is undefined, then the label is shown in the center of the feature.\ntypes: Dynamic value based on the attributes ; string\ninline: Always show label <b>{value}</b> beneath the marker\nifunset: Do not show a label beneath the marker",
      "anyOf": [
        {
          "$ref": "#/definitions/TagRenderingConfigJson"
        },
        {
          "type": "string"
        }
      ]
    },
    "labelCss": {
      "description": "question: What CSS should be applied to the label?\nYou can set the css-properties here, e.g. `background: red; font-size: 12px; `\ninline: Apply CSS-style <b>{value}</b> to the label\ntypes: Dynamic value ; string\nifunset: Do not apply extra CSS-labels to the label\ngroup: expert",
      "anyOf": [
        {
          "$ref": "#/definitions/TagRenderingConfigJson"
        },
        {
          "type": "string"
        }
      ]
    },
    "labelCssClasses": {
      "description": "question: Which CSS-classes should be applied to the label?\n\nThe classes should be separated by a space (` `)\nYou can use most Tailwind-css classes, see https://tailwindcss.com/ for more information\nFor example: `center bg-gray-500 mx-2 my-1 rounded-full`\ninline: Apply CSS-classes <b>{value}</b> to the label\ntypes: Dynamic value ; string\nifunset: Do not apply extra CSS-classes to the label\nsuggestions: return [{if: \"value=bg-white rounded px-2\", then: \"Draw on a white background\"}]",
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
      "description": "question: What CSS should be applied to the entire marker?\nYou can set the css-properties here, e.g. `background: red; font-size: 12px; `\nThis will be applied to the _container_ containing both the marker and the label\ninline: Apply CSS-style <b>{value}</b> to the _entire marker_\ntypes: Dynamic value ; string\nifunset: Do not apply extra CSS element to the entire marker\ngroup: expert",
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
      "description": "question: Which CSS-classes should be applied to the entire marker?\nThis will be applied to the _container_ containing both the marker and the label\n\nThe classes should be separated by a space (` `)\nYou can use most Tailwind-css classes, see https://tailwindcss.com/ for more information\nFor example: `center bg-gray-500 mx-2 my-1 rounded-full`\ninline: Apply CSS-classes <b>{value}</b> to the entire container\nifunset: Do not apply extra CSS-classes to the label\ntypes: Dynamic value ; string\nifunset: Do not apply extra CSS-classes to the entire marker\ngroup: expert",
      "anyOf": [
        {
          "$ref": "#/definitions/TagRenderingConfigJson"
        },
        {
          "type": "string"
        }
      ]
    },
    "pitchAlignment": {
      "description": "question: If the map is pitched, should the icon stay parallel to the screen or to the groundplane?\nsuggestions: return [{if: \"value=canvas\", then: \"The icon will stay upward and not be transformed as if it sticks to the screen\"}, {if: \"value=map\", then: \"The icon will be transformed as if it were painted onto the ground. (Automatically sets rotationAlignment)\"}]\ngroup: expert",
      "anyOf": [
        {
          "$ref": "#/definitions/TagRenderingConfigJson"
        },
        {
          "enum": [
            "canvas",
            "map"
          ],
          "type": "string"
        }
      ]
    },
    "rotationAlignment": {
      "description": "question: Should the icon be rotated if the map is rotated?\nifunset: Do not rotate or tilt icons. Always keep the icons straight\nsuggestions: return [{if: \"value=canvas\", then: \"Never rotate the icon\"}, {if: \"value=map\", then: \"If the map is rotated, rotate the icon as well. This gives the impression of an icon that floats perpendicular above the ground.\"}]\ngroup: expert",
      "anyOf": [
        {
          "$ref": "#/definitions/TagRenderingConfigJson"
        },
        {
          "enum": [
            "canvas",
            "map"
          ],
          "type": "string"
        }
      ]
    }
  },
  "required": [
    "location"
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
    },
    "Record<string,string|Record<string,string>>": {
      "type": "object"
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
        },
        "addSpace": {
          "description": "If set, add a space between the quantity and the denomination.\n\nE.g.: `50 mph` instad of `50mph`",
          "type": "boolean"
        }
      },
      "required": [
        "canonicalDenomination"
      ]
    },
    "MinimalTagRenderingConfigJson": {
      "description": "Mostly used for lineRendering and pointRendering",
      "type": "object",
      "properties": {
        "render": {
          "description": "question: What value should be shown (if no predifined option matches)?\n\nThis piece of text will be shown in the infobox.\nNote that \"&LBRACEkey&RBRACE\"-parts are substituted by the corresponding values of the element.\n\nThis value will be used if there is no mapping which matches (or there are no matches)\nNote that this is a HTML-interpreted value, so you can add links as e.g. '&lt;a href='{website}'>{website}&lt;/a>' or include images such as `This is of type A &lt;br>&lt;img src='typeA-icon.svg' />`",
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
      }
    },
    "IconConfigJson": {
      "type": "object",
      "properties": {
        "icon": {
          "description": "question: What icon should be used?\ntype: icon\nsuggestions: return Constants.defaultPinIcons.map(i => ({if: \"value=\"+i, then: i, icon: i}))",
          "anyOf": [
            {
              "$ref": "#/definitions/MinimalTagRenderingConfigJson"
            },
            {
              "type": "object",
              "properties": {
                "builtin": {
                  "type": "string"
                },
                "override": {}
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
        },
        "color": {
          "description": "question: What colour should the icon be?\nThis will only work for the default icons such as `pin`,`circle`,...\ntype: color",
          "anyOf": [
            {
              "$ref": "#/definitions/MinimalTagRenderingConfigJson"
            },
            {
              "type": "object",
              "properties": {
                "builtin": {
                  "type": "string"
                },
                "override": {}
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
      },
      "required": [
        "icon"
      ]
    },
    "TagRenderingConfigJson": {
      "description": "A TagRenderingConfigJson is a single piece of code which converts one ore more tags into a HTML-snippet.\nFor an _editable_ tagRendering, use 'QuestionableTagRenderingConfigJson' instead, which extends this one",
      "type": "object",
      "properties": {
        "render": {
          "description": "question: What text should be rendered?\n\nThis piece of text will be shown in the infobox.\nIn this text, values within braces (such as {braced(key)}) are replaced by the corresponding `value` in the object.\nFor example, if the object contains tags `amenity=school; name=Windy Hill School`, the render string `This school is named {name}` will be shown to the user as `This school is named Windy Hill School`\n\nThis text will be shown if:\n- there is no mapping which matches (or there are no matches)\n- no question, no mappings and no 'freeform' is set\n\nNote that this is a HTML-interpreted value, so you can add links as e.g. '&lt;a href='{website}'>{website}&lt;/a>' or include images such as `This is of type A &lt;br>&lt;img src='typeA-icon.svg' />`\ntype: rendered\nifunset: No text is shown if no predefined options match.",
          "anyOf": [
            {
              "$ref": "#/definitions/Record<string,string>"
            },
            {
              "type": "object",
              "properties": {
                "special": {
                  "allOf": [
                    {
                      "$ref": "#/definitions/Record<string,string|Record<string,string>>"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "type"
                      ]
                    }
                  ]
                }
              },
              "required": [
                "special"
              ]
            },
            {
              "type": "string"
            }
          ]
        },
        "icon": {
          "description": "question: what icon should be shown next to the 'render' value?\nAn icon shown next to the rendering; typically shown pretty small\nThis is only shown next to the \"render\" value\nType: icon\nifunset: No additional icon is shown next to the always shown text",
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
        },
        "condition": {
          "description": "question: When should this item be shown?\ntype: tag\nifunset: No specific condition set; always show this tagRendering or show this question if unknown\n\nOnly show this tagrendering (or ask the question) if the selected object also matches the tags specified as `condition`.\n\nThis is useful to ask a follow-up question.\nFor example, within toilets, asking _where_ the diaper changing table is is only useful _if_ there is one.\nThis can be done by adding `\"condition\": \"changing_table=yes\"`\n\nA full example would be:\n```json\n    {\n      \"question\": \"Where is the changing table located?\",\n      \"render\": \"The changing table is located at {changing_table:location}\",\n      \"condition\": \"changing_table=yes\",\n      \"freeform\": {\n        \"key\": \"changing_table:location\",\n        \"inline\": true\n      },\n      \"mappings\": [\n        {\n          \"then\": \"The changing table is in the toilet for women.\",\n          \"if\": \"changing_table:location=female_toilet\"\n        },\n        {\n          \"then\": \"The changing table is in the toilet for men.\",\n          \"if\": \"changing_table:location=male_toilet\"\n        },\n        {\n          \"if\": \"changing_table:location=wheelchair_toilet\",\n          \"then\": \"The changing table is in the toilet for wheelchair users.\",\n        },\n        {\n          \"if\": \"changing_table:location=dedicated_room\",\n          \"then\": \"The changing table is in a dedicated room. \",\n        }\n      ],\n      \"id\": \"toilet-changing_table:location\"\n    },\n```",
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
        "metacondition": {
          "description": "question: When should this item be shown (including special conditions)?\ntype: tag\nifunset: No specific metacondition set which is evaluated against the <i>usersettings/application state</i>; always show this tagRendering or show this question if unknown\n\nIf set, this tag will be evaluated against the _usersettings/application state_ table.\nEnable 'show debug info' in user settings to see available options (at the settings-tab).\nNote that values with an underscore depicts _application state_ (including metainfo about the user) whereas values without an underscore depict _user settings_",
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
        "freeform": {
          "description": "question: Should a freeform text field be shown?\nAllow freeform text input from the user\nifunset: Do not add a freeform text field",
          "type": "object",
          "properties": {
            "key": {
              "description": "What attribute should be filled out\nIf this key is present in the feature, then 'render' is used to display the value.\nIf this is undefined, the rendering is _always_ shown",
              "type": "string"
            }
          }
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
                "description": "question: What text should be shown?\n\nIf the condition `if` is met, the text `then` will be rendered.\nIf not known yet, the user will be presented with `then` as an option\nType: rendered",
                "anyOf": [
                  {
                    "$ref": "#/definitions/Record<string,string>"
                  },
                  {
                    "type": "string"
                  }
                ]
              },
              "icon": {
                "description": "question: What icon should be added to this mapping?\nifunset: Do not show an extra icon next to the render value\n\nAn icon supporting this mapping; typically shown pretty small.\nThis can be used to show a 'phone'-icon next to the phone number\ninline: <img src='{icon}' class=\"w-8 h-8\" /> {icon}\nType: icon",
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
        },
        "description": {
          "description": "A human-readable text explaining what this tagRendering does.\nMostly used for the shared tagrenderings",
          "anyOf": [
            {
              "$ref": "#/definitions/Record<string,string>"
            },
            {
              "type": "string"
            }
          ]
        },
        "classes": {
          "description": "question: What css-classes should be applied to showing this attribute?\n\nA list of css-classes to apply to the entire tagRendering.\nThese classes are applied in 'answer'-mode, not in question mode\nThis is only for advanced users.\n\nValues are split on ` `  (space)",
          "type": "string"
        }
      }
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}