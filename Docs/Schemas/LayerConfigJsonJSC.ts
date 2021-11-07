export default {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/LayerConfigJson",
  "definitions": {
    "LayerConfigJson": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The id of this layer. This should be a simple, lowercase, human readable string that is used to identify the layer."
        },
        "name": {
          "anyOf": [
            {
              "type": "string"
            },
            {}
          ],
          "description": "The name of this layer Used in the layer control panel and the 'Personal theme'.\n\nIf not given, will be hidden (and thus not toggable) in the layer control"
        },
        "description": {
          "anyOf": [
            {
              "type": "string"
            },
            {}
          ],
          "description": "A description for this layer. Shown in the layer selections and in the personel theme"
        },
        "source": {
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "maxCacheAge": {
                  "type": "number",
                  "description": "The maximum amount of seconds that a tile is allowed to linger in the cache"
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
                },
                "overpassScript": {
                  "type": "string"
                }
              },
              "required": [
                "osmTags"
              ]
            },
            {
              "type": "object",
              "properties": {
                "maxCacheAge": {
                  "type": "number",
                  "description": "The maximum amount of seconds that a tile is allowed to linger in the cache"
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
                },
                "geoJson": {
                  "type": "string"
                },
                "geoJsonZoomLevel": {
                  "type": "number"
                },
                "isOsmCache": {
                  "type": "boolean"
                },
                "mercatorCrs": {
                  "type": "boolean"
                }
              },
              "required": [
                "geoJson",
                "osmTags"
              ]
            }
          ],
          "description": "This determines where the data for the layer is fetched. There are some options:\n\n# Query OSM directly source: {osmTags: \"key=value\"}  will fetch all objects with given tags from OSM.  Currently, this will create a query to overpass and fetch the data - in the future this might fetch from the OSM API\n\n# Query OSM Via the overpass API with a custom script source: {overpassScript: \"<custom overpass tags>\"} when you want to do special things. _This should be really rare_.      This means that the data will be pulled from overpass with this script, and will ignore the osmTags for the query      However, for the rest of the pipeline, the OsmTags will _still_ be used. This is important to enable layers etc...\n\n\n# A single geojson-file source: {geoJson: \"https://my.source.net/some-geo-data.geojson\"}  fetches a geojson from a third party source\n\n# A tiled geojson source source: {geoJson: \"https://my.source.net/some-tile-geojson-{layer}-{z}-{x}-{y}.geojson\", geoJsonZoomLevel: 14}  to use a tiled geojson source. The web server must offer multiple geojsons. {z}, {x} and {y} are substituted by the location; {layer} is substituted with the id of the loaded layer\n\nSome API's use a BBOX instead of a tile, this can be used by specifying {y_min}, {y_max}, {x_min} and {x_max} Some API's use a mercator-projection (EPSG:900913) instead of WGS84. Set the flag `mercatorCrs: true`  in the source for this\n\nNote that both geojson-options might set a flag 'isOsmCache' indicating that the data originally comes from OSM too\n\n\nNOTE: the previous format was 'overpassTags: AndOrTagConfigJson | string', which is interpreted as a shorthand for source: {osmTags: \"key=value\"}  While still supported, this is considered deprecated"
        },
        "calculatedTags": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "A list of extra tags to calculate, specified as \"keyToAssignTo=javascript-expression\". There are a few extra functions available. Refer to <a>Docs/CalculatedTags.md</a> for more information The functions will be run in order, e.g. [  \"_max_overlap_m2=Math.max(...feat.overlapsWith(\"someOtherLayer\").map(o => o.overlap))  \"_max_overlap_ratio=Number(feat._max_overlap_m2)/feat.area ]"
        },
        "doNotDownload": {
          "type": "boolean",
          "description": "If set, this layer will not query overpass; but it'll still match the tags above which are by chance returned by other layers. Works well together with 'passAllFeatures', to add decoration"
        },
        "isShown": {
          "$ref": "#/definitions/TagRenderingConfigJson",
          "description": "This tag rendering should either be 'yes' or 'no'. If 'no' is returned, then the feature will be hidden from view. This is useful to hide certain features from view.\n\nImportant: hiding features does not work dynamically, but is only calculated when the data is first renders. This implies that it is not possible to hide a feature after a tagging change\n\nThe default value is 'yes'"
        },
        "minzoom": {
          "type": "number",
          "description": "The minimum needed zoomlevel required before loading of the data start Default: 0"
        },
        "minzoomVisible": {
          "type": "number",
          "description": "The zoom level at which point the data is hidden again Default: 100 (thus: always visible"
        },
        "title": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            }
          ],
          "description": "The title shown in a popup for elements of this layer."
        },
        "titleIcons": {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "$ref": "#/definitions/TagRenderingConfigJson"
              }
            ]
          },
          "description": "Small icons shown next to the title. If not specified, the OsmLink and wikipedia links will be used by default. Use an empty array to hide them. Note that \"defaults\" will insert all the default titleIcons"
        },
        "mapRendering": {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "$ref": "#/definitions/PointRenderingConfigJson"
              },
              {
                "$ref": "#/definitions/LineRenderingConfigJson"
              }
            ]
          }
        },
        "passAllFeatures": {
          "type": "boolean",
          "description": "If set, this layer will pass all the features it receives onto the next layer. This is ideal for decoration, e.g. directionss on cameras"
        },
        "presets": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {}
                ],
                "description": "The title - shown on the 'add-new'-button."
              },
              "tags": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "The tags to add. It determines the icon too"
              },
              "description": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {}
                ],
                "description": "The _first sentence_ of the description is shown on the button of the `add` menu. The full description is shown in the confirmation dialog.\n\n(The first sentence is until the first '.'-character in the description)"
              },
              "preciseInput": {
                "anyOf": [
                  {
                    "type": "boolean",
                    "const": true
                  },
                  {
                    "type": "object",
                    "properties": {
                      "preferredBackground": {
                        "anyOf": [
                          {
                            "type": "string",
                            "const": "osmbasedmap"
                          },
                          {
                            "type": "string",
                            "const": "photo"
                          },
                          {
                            "type": "string",
                            "const": "historicphoto"
                          },
                          {
                            "type": "string",
                            "const": "map"
                          },
                          {
                            "type": "string"
                          },
                          {
                            "type": "array",
                            "items": {
                              "type": "string"
                            }
                          }
                        ],
                        "description": "The type of background picture"
                      },
                      "snapToLayer": {
                        "anyOf": [
                          {
                            "type": "string"
                          },
                          {
                            "type": "array",
                            "items": {
                              "type": "string"
                            }
                          }
                        ],
                        "description": "If specified, these layers will be shown to and the new point will be snapped towards it"
                      },
                      "maxSnapDistance": {
                        "type": "number",
                        "description": "If specified, a new point will only be snapped if it is within this range. Distance in meter\n\nDefault: 10"
                      }
                    },
                    "required": [
                      "preferredBackground"
                    ]
                  }
                ],
                "description": "If set, the user will prompted to confirm the location before actually adding the data. This will be with a 'drag crosshair'-method.\n\nIf 'preferredBackgroundCategory' is set, the element will attempt to pick a background layer of that category."
              }
            },
            "required": [
              "title",
              "tags"
            ]
          },
          "description": "Presets for this layer. A preset shows up when clicking the map on a without data (or when right-clicking/long-pressing); it will prompt the user to add a new point.\n\nThe most important aspect are the tags, which define which tags the new point will have; The title is shown in the dialog, along with the first sentence of the description.\n\nUpon confirmation, the full description is shown beneath the buttons - perfect to add pictures and examples.\n\nNote: the icon of the preset is determined automatically based on the tags and the icon above. Don't worry about that! NB: if no presets are defined, the popup to add new points doesn't show up at all"
        },
        "tagRenderings": {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "type": "string"
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
                "$ref": "#/definitions/TagRenderingConfigJson"
              },
              {
                "type": "object",
                "properties": {
                  "rewrite": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "sourceString": {
                          "type": "string"
                        },
                        "into": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        }
                      },
                      "required": [
                        "sourceString",
                        "into"
                      ]
                    }
                  },
                  "renderings": {
                    "type": "array",
                    "items": {
                      "anyOf": [
                        {
                          "type": "string"
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
                          "$ref": "#/definitions/TagRenderingConfigJson"
                        }
                      ]
                    }
                  }
                },
                "required": [
                  "rewrite",
                  "renderings"
                ]
              }
            ]
          },
          "description": "All the tag renderings. A tag rendering is a block that either shows the known value or asks a question.\n\nRefer to the class `TagRenderingConfigJson` to see the possibilities.\n\nNote that we can also use a string here - where the string refers to a tag rendering defined in `assets/questions/questions.json`, where a few very general questions are defined e.g. website, phone number, ...\n\nA special value is 'questions', which indicates the location of the questions box. If not specified, it'll be appended to the bottom of the featureInfobox.\n\nAt last, one can define a group of renderings where parts of all strings will be replaced by multiple other strings. This is mainly create questions for a 'left' and a 'right' side of the road. These will be grouped and questions will be asked together"
        },
        "filter": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/FilterConfigJson"
          },
          "description": "All the extra questions for filtering"
        },
        "deletion": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "$ref": "#/definitions/DeleteConfigJson"
            }
          ],
          "description": "This block defines under what circumstances the delete dialog is shown for objects of this layer. If set, a dialog is shown to the user to (soft) delete the point. The dialog is built to be user friendly and to prevent mistakes. If deletion is not possible, the dialog will hide itself and show the reason of non-deletability instead.\n\nTo configure, the following values are possible:\n\n- false: never ever show the delete button\n- true: show the default delete button\n- undefined: use the mapcomplete default to show deletion or not. Currently, this is the same as 'false' but this will change in the future\n- or: a hash with options (see below)\n\n The delete dialog  =================\n\n\n\n#### Hard deletion if enough experience\n\nA feature can only be deleted from OpenStreetMap by mapcomplete if:\n\n- It is a node\n- No ways or relations use the node\n- The logged-in user has enough experience OR the user is the only one to have edited the point previously\n- The logged-in user has no unread messages (or has a ton of experience)\n- The user did not select one of the 'non-delete-options' (see below)\n\nIn all other cases, a 'soft deletion' is used.\n\n#### Soft deletion\n\nA 'soft deletion' is when the point isn't deleted from OSM but retagged so that it'll won't how up in the mapcomplete theme anymore. This makes it look like it was deleted, without doing damage. A fixme will be added to the point.\n\nNote that a soft deletion is _only_ possible if these tags are provided by the theme creator, as they'll be different for every theme\n\n#### No-delete options\n\nIn some cases, the contributor might want to delete something for the wrong reason (e.g. someone who wants to have a path removed \"because the path is on their private property\"). However, the path exists in reality and should thus be on OSM - otherwise the next contributor will pass by and notice \"hey, there is a path missing here! Let me redraw it in OSM!)\n\nThe correct approach is to retag the feature in such a way that it is semantically correct *and* that it doesn't show up on the theme anymore. A no-delete option is offered as 'reason to delete it', but secretly retags."
        },
        "allowMove": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "$ref": "#/definitions/MoveConfigJson"
            }
          ],
          "description": "Indicates if a point can be moved and configures the modalities.\n\nA feature can be moved by MapComplete if:\n\n- It is a point\n- The point is _not_ part of a way or a a relation.\n\nOff by default. Can be enabled by setting this flag or by configuring."
        },
        "allowSplit": {
          "type": "boolean",
          "description": "IF set, a 'split this road' button is shown"
        },
        "units": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/UnitConfigJson"
          },
          "description": "In some cases, a value is represented in a certain unit (such as meters for heigt/distance/..., km/h for speed, ...)\n\nSometimes, multiple denominations are possible (e.g. km/h vs mile/h; megawatt vs kilowatt vs gigawatt for power generators, ...)\n\nThis brings in some troubles, as there are multiple ways to write it (no denomitation, 'm' vs 'meter' 'metre', ...)\n\nNot only do we want to write consistent data to OSM, we also want to present this consistently to the user. This is handled by defining units.\n\n# Rendering\n\nTo render a value with long (human) denomination, use {canonical(key)}\n\n# Usage\n\nFirst of all, you define which keys have units applied, for example:\n\n``` units: [  appliesTo: [\"maxspeed\", \"maxspeed:hgv\", \"maxspeed:bus\"]  applicableUnits: [      ...  ] ] ```\n\nApplicableUnits defines which is the canonical extension, how it is presented to the user, ...:\n\n``` applicableUnits: [ {     canonicalDenomination: \"km/h\",     alternativeDenomination: [\"km/u\", \"kmh\", \"kph\"]     default: true,     human: {         en: \"kilometer/hour\",         nl: \"kilometer/uur\"     },     humanShort: {         en: \"km/h\",         nl: \"km/u\"     } }, {     canoncialDenomination: \"mph\",     ... similar for miles an hour ... } ] ```\n\n\nIf this is defined, then every key which the denominations apply to (`maxspeed`, `maxspeed:hgv` and `maxspeed:bus`) will be rewritten at the metatagging stage: every value will be parsed and the canonical extension will be added add presented to the other parts of the code.\n\nAlso, if a freeform text field is used, an extra dropdown with applicable denominations will be given"
        }
      },
      "required": [
        "id",
        "source",
        "mapRendering"
      ],
      "description": "Configuration for a single layer"
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
    "LineRenderingConfigJson": {
      "type": "object",
      "properties": {
        "color": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            }
          ],
          "description": "The color for way-elements and SVG-elements. If the value starts with \"--\", the style of the body element will be queried for the corresponding variable instead"
        },
        "width": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            }
          ],
          "description": "The stroke-width for way-elements"
        },
        "dashArray": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            }
          ],
          "description": "A dasharray, e.g. \"5 6\" The dasharray defines 'pixels of line, pixels of gap, pixels of line, pixels of gap', Default value: \"\" (empty string == full line)"
        },
        "offset": {
          "anyOf": [
            {
              "type": "number"
            },
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            }
          ],
          "description": "The number of pixels this line should be moved. Use a positive numbe to move to the right, a negative to move to the left (left/right as defined by the drawing direction of the line).\n\nIMPORTANT: MapComplete will already normalize 'key:both:property' and 'key:both' into the corresponding 'key:left' and 'key:right' tagging (same for 'sidewalk=left/right/both' which is rewritten to 'sidewalk:left' and 'sidewalk:right') This simplifies programming. Refer to the CalculatedTags.md-documentation for more details"
        }
      },
      "description": "The LineRenderingConfig gives all details onto how to render a single line of a feature.\n\nThis can be used if:\n\n- The feature is a line\n- The feature is an area"
    },
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
    "DeleteConfigJson": {
      "type": "object",
      "properties": {
        "extraDeleteReasons": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "explanation": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {}
                ],
                "description": "The text that will be shown to the user - translatable"
              },
              "changesetMessage": {
                "type": "string",
                "description": "The text that will be uploaded into the changeset or will be used in the fixme in case of a soft deletion Should be a few words, in english"
              }
            },
            "required": [
              "explanation",
              "changesetMessage"
            ]
          },
          "description": "* By default, three reasons to delete a point are shown:\n\n- The point does not exist anymore\n- The point was a testing point\n- THe point could not be found\n\nHowever, for some layers, there might be different or more specific reasons for deletion which can be user friendly to set, e.g.:\n\n- the shop has closed\n- the climbing route has been closed of for nature conservation reasons\n- ...\n\nThese reasons can be stated here and will be shown in the list of options the user can choose from"
        },
        "nonDeleteMappings": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "if": {
                "$ref": "#/definitions/AndOrTagConfigJson"
              },
              "then": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {}
                ]
              }
            },
            "required": [
              "if",
              "then"
            ]
          },
          "description": "In some cases, a (starting) contributor might wish to delete a feature even though deletion is not appropriate. (The most relevant case are small paths running over private property. These should be marked as 'private' instead of deleted, as the community might trace the path again from aerial imagery, gettting us back to the original situation).\n\nBy adding a 'nonDeleteMapping', an option can be added into the list which will retag the feature. It is important that the feature will be retagged in such a way that it won't be picked up by the layer anymore!"
        },
        "softDeletionTags": {
          "anyOf": [
            {
              "$ref": "#/definitions/AndOrTagConfigJson"
            },
            {
              "type": "string"
            }
          ],
          "description": "In some cases, the contributor is not allowed to delete the current feature (e.g. because it isn't a point, the point is referenced by a relation or the user isn't experienced enough). To still offer the user a 'delete'-option, the feature is retagged with these tags. This is a soft deletion, as the point isn't actually removed from OSM but rather marked as 'disused' It is important that the feature will be retagged in such a way that it won't be picked up by the layer anymore!\n\nExample (note that \"amenity=\" erases the 'amenity'-key alltogether): ``` {     \"and\": [\"disussed:amenity=public_bookcase\", \"amenity=\"] } ```\n\nor (notice the use of the ':='-tag to copy the old value of 'shop=*' into 'disused:shop='): ``` {     \"and\": [\"disused:shop:={shop}\", \"shop=\"] } ```"
        },
        "neededChangesets": {
          "type": "number",
          "description": "* By default, the contributor needs 20 previous changesets to delete points edited by others. For some small features (e.g. bicycle racks) this is too much and this requirement can be lowered or dropped, which can be done here."
        }
      }
    },
    "MoveConfigJson": {
      "type": "object",
      "properties": {
        "enableImproveAccuracy": {
          "anyOf": [
            {
              "type": "boolean",
              "const": true
            },
            {
              "type": "boolean"
            }
          ],
          "description": "One default reason to move a point is to improve accuracy. Set to false to disable this reason"
        },
        "enableRelocation": {
          "anyOf": [
            {
              "type": "boolean",
              "const": true
            },
            {
              "type": "boolean"
            }
          ],
          "description": "One default reason to move a point is because it has relocated Set to false to disable this reason"
        }
      }
    },
    "UnitConfigJson": {
      "type": "object",
      "properties": {
        "appliesToKey": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Every key from this list will be normalized"
        },
        "eraseInvalidValues": {
          "type": "boolean",
          "description": "If set, invalid values will be erased in the MC application (but not in OSM of course!) Be careful with setting this"
        },
        "applicableUnits": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/ApplicableUnitJson"
          },
          "description": "The possible denominations"
        }
      },
      "required": [
        "appliesToKey",
        "applicableUnits"
      ]
    },
    "ApplicableUnitJson": {
      "type": "object",
      "properties": {
        "canonicalDenomination": {
          "type": "string",
          "description": "The canonical value which will be added to the text. e.g. \"m\" for meters If the user inputs '42', the canonical value will be added and it'll become '42m'"
        },
        "canonicalDenominationSingular": {
          "type": "string",
          "description": "The canonical denomination in the case that the unit is precisely '1'"
        },
        "alternativeDenomination": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "A list of alternative values which can occur in the OSM database - used for parsing."
        },
        "human": {
          "anyOf": [
            {
              "type": "string"
            },
            {}
          ],
          "description": "The value for humans in the dropdown. This should not use abbreviations and should be translated, e.g. {     \"en\": \"meter\",     \"fr\": \"metre\" }"
        },
        "humanSingular": {
          "anyOf": [
            {
              "type": "string"
            },
            {}
          ],
          "description": "The value for humans in the dropdown. This should not use abbreviations and should be translated, e.g. {     \"en\": \"minute\",     \"nl\": \"minuut\"x² }"
        },
        "prefix": {
          "type": "boolean",
          "description": "If set, then the canonical value will be prefixed instead, e.g. for '€' Note that if all values use 'prefix', the dropdown might move to before the text field"
        },
        "default": {
          "type": "boolean",
          "description": "The default interpretation - only one can be set. If none is set, the first unit will be considered the default interpretation of a value without a unit"
        }
      },
      "required": [
        "canonicalDenomination"
      ]
    }
  }
}