export default {
  "description": "Defines the entire theme.\n\nA theme is the collection of the layers that are shown; the intro text, the icon, ...\nIt more or less defines the entire experience.\n\nMost of the fields defined here are metadata about the theme, such as its name, description, supported languages, default starting location, ...\n\nThe main chunk of the json will however be the 'layers'-array, where the details of your layers are.\n\nGeneral remark: a type (string | any) indicates either a fixed or a translatable string.",
  "type": "object",
  "properties": {
    "id": {
      "description": "The id of this layout.\n\nThis is used as hashtag in the changeset message, which will read something like \"Adding data with #mapcomplete for theme #<the theme id>\"\nMake sure it is something decent and descriptive, it should be a simple, lowercase string.\n\nOn official themes, it'll become the name of the page, e.g.\n'cyclestreets' which become 'cyclestreets.html'",
      "type": "string"
    },
    "credits": {
      "description": "Who helped to create this theme and should be attributed?",
      "type": "string"
    },
    "maintainer": {
      "description": "Who does maintain this preset?",
      "type": "string"
    },
    "version": {
      "description": "A version number, either semantically or by date.\nShould be sortable, where the higher value is the later version",
      "type": "string"
    },
    "mustHaveLanguage": {
      "description": "Only used in 'generateLayerOverview': if present, every translation will be checked to make sure it is fully translated.\n\nThis must be a list of two-letter, lowercase codes which identifies the language, e.g. \"en\", \"nl\", ...",
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "title": {
      "description": "The title, as shown in the welcome message and the more-screen."
    },
    "shortDescription": {
      "description": "A short description, showed as social description and in the 'more theme'-buttons.\nNote that if this one is not defined, the first sentence of 'description' is used"
    },
    "description": {
      "description": "The description, as shown in the welcome message and the more-screen"
    },
    "descriptionTail": {
      "description": "A part of the description, shown under the login-button."
    },
    "icon": {
      "description": "The icon representing this theme.\nUsed as logo in the more-screen and (for official themes) as favicon, webmanifest logo, ...\nEither a URL or a base64 encoded value (which should include 'data:image/svg+xml;base64)\n\nType: icon",
      "type": "string"
    },
    "socialImage": {
      "description": "Link to a 'social image' which is included as og:image-tag on official themes.\nUseful to share the theme on social media.\nSee https://www.h3xed.com/web-and-internet/how-to-use-og-image-meta-tag-facebook-reddit for more information$\n\nType: image",
      "type": "string"
    },
    "startZoom": {
      "description": "Default location and zoom to start.\nNote that this is barely used. Once the user has visited mapcomplete at least once, the previous location of the user will be used",
      "type": "number"
    },
    "startLat": {
      "type": "number"
    },
    "startLon": {
      "type": "number"
    },
    "widenFactor": {
      "description": "When a query is run, the data within bounds of the visible map is loaded.\nHowever, users tend to pan and zoom a lot. It is pretty annoying if every single pan means a reloading of the data.\nFor this, the bounds are widened in order to make a small pan still within bounds of the loaded data.\n\nIF widenfactor is 1, this feature is disabled. A recommended value is between 1 and 3",
      "type": "number"
    },
    "overpassMaxZoom": {
      "description": "At low zoom levels, overpass is used to query features.\nAt high zoom level, the OSM api is used to fetch one or more BBOX aligning with a slippy tile.\nThe overpassMaxZoom controls the flipoverpoint: if the zoom is this or lower, overpass is used.",
      "type": "number"
    },
    "osmApiTileSize": {
      "description": "When the OSM-api is used to fetch features, it does so in a tiled fashion.\nThese tiles are using a ceratin zoom level, that can be controlled here\nDefault: overpassMaxZoom + 1",
      "type": "number"
    },
    "overrideAll": {
      "description": "An override applied on all layers of the theme.\n\nE.g.: if there are two layers defined:\n```\n\"layers\":[\n {\"title\": ..., \"tagRenderings\": [...], \"osmSource\":{\"tags\": ...}},\n {\"title\", ..., \"tagRenderings\", [...], \"osmSource\":{\"tags\" ...}}\n]\n```\n\nand overrideAll is specified:\n```\n\"overrideAll\": {\n    \"osmSource\":{\"geoJsonSource\":\"xyz\"}\n}\nthen the result will be that all the layers will have these properties applied and result in:\n\"layers\":[\n {\"title\": ..., \"tagRenderings\": [...], \"osmSource\":{\"tags\": ..., \"geoJsonSource\":\"xyz\"}},\n {\"title\", ..., \"tagRenderings\", [...], \"osmSource\":{\"tags\" ..., \"geoJsonSource\":\"xyz\"}}\n]\n```\n\nIf the overrideAll contains a list where the keys starts with a plus, the values will be appended (instead of discarding the old list), for example\n\n\"overrideAll\": {\n  \"+tagRenderings\": [ { ... some tagrendering ... }]\n}\n\nIn the above scenario, `sometagrendering` will be added at the beginning of the tagrenderings of every layer"
    },
    "defaultBackgroundId": {
      "description": "The id of the default background. BY default: vanilla OSM",
      "type": "string"
    },
    "tileLayerSources": {
      "description": "Define some (overlay) slippy map tilesources",
      "type": "array",
      "items": {
        "$ref": "#/definitions/default_6"
      }
    },
    "layers": {
      "description": "The layers to display.\n\nEvery layer contains a description of which feature to display - the overpassTags which are queried.\nInstead of running one query for every layer, the query is fused.\n\nAfterwards, every layer is given the list of features.\nEvery layer takes away the features that match with them*, and give the leftovers to the next layers.\n\nThis implies that the _order_ of the layers is important in the case of features with the same tags;\nas the later layers might never receive their feature.\n\n*layers can also remove 'leftover'-features if the leftovers overlap with a feature in the layer itself\n\nNote that builtin layers can be reused. Either put in the name of the layer to reuse, or use {builtin: \"layername\", override: ...}\n\nThe 'override'-object will be copied over the original values of the layer, which allows to change certain aspects of the layer\n\nFor example: If you would like to use layer nature reserves, but only from a specific operator (eg. Natuurpunt) you would use the following in your theme:\n\n```\n\"layer\": {\n \"builtin\": \"nature_reserve\",\n \"override\": {\"source\": \n {\"osmTags\": {\n \"+and\":[\"operator=Natuurpunt\"]\n   }\n  }\n }\n}\n```\n\nIt's also possible to load multiple layers at once, for example, if you would like for both drinking water and benches to start at the zoomlevel at 12, you would use the following:\n\n```\n\"layer\": {\n \"builtin\": [\"benches\", \"drinking_water\"],\n \"override\": {\"minzoom\": 12}\n}\n```",
      "type": "array",
      "items": {
        "anyOf": [
          {
            "$ref": "#/definitions/LayerConfigJson"
          },
          {
            "type": "object",
            "properties": {
              "builtin": {
                "anyOf": [
                  {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  {
                    "type": "string"
                  }
                ]
              },
              "override": {},
              "hideTagRenderingsWithLabels": {
                "description": "TagRenderings with any of these labels will be removed from the layer.\nNote that the 'id' and 'group' are considered labels too",
                "type": "array",
                "items": {
                  "type": "string"
                }
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
    },
    "clustering": {
      "description": "If defined, data will be clustered.\nDefaults to {maxZoom: 16, minNeeded: 500}",
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "maxZoom": {
              "description": "All zoom levels above 'maxzoom' are not clustered anymore.\nDefaults to 18",
              "type": "number"
            },
            "minNeededElements": {
              "description": "The number of elements per tile needed to start clustering\nIf clustering is defined, defaults to 250",
              "type": "number"
            }
          }
        },
        {
          "enum": [
            false
          ],
          "type": "boolean"
        }
      ]
    },
    "customCss": {
      "description": "The URL of a custom CSS stylesheet to modify the layout",
      "type": "string"
    },
    "hideFromOverview": {
      "description": "If set to true, this layout will not be shown in the overview with more themes",
      "type": "boolean"
    },
    "lockLocation": {
      "description": "If set to true, the basemap will not scroll outside of the area visible on initial zoom.\nIf set to [[lon, lat], [lon, lat]], the map will not scroll outside of those bounds.\nOff by default, which will enable panning to the entire world",
      "anyOf": [
        {
          "type": "array",
          "items": [
            {
              "type": "array",
              "items": [
                {
                  "type": "number"
                },
                {
                  "type": "number"
                }
              ],
              "minItems": 2,
              "maxItems": 2
            },
            {
              "type": "array",
              "items": [
                {
                  "type": "number"
                },
                {
                  "type": "number"
                }
              ],
              "minItems": 2,
              "maxItems": 2
            }
          ],
          "minItems": 2,
          "maxItems": 2
        },
        {
          "type": "array",
          "items": {
            "type": "array",
            "items": {
              "type": "number"
            }
          }
        }
      ]
    },
    "extraLink": {
      "description": "Adds an additional button on the top-left of the application.\nThis can link to an arbitrary location.\n\nNote that {lat},{lon},{zoom}, {language} and {theme} will be replaced\n\nDefault: {icon: \"./assets/svg/pop-out.svg\", href: 'https://mapcomplete.osm.be/{theme}.html?lat={lat}&lon={lon}&z={zoom}, requirements: [\"iframe\",\"no-welcome-message]},",
      "$ref": "#/definitions/default"
    },
    "enableUserBadge": {
      "description": "If set to false, disables logging in.\nThe userbadge will be hidden, all login-buttons will be hidden and editing will be disabled",
      "type": "boolean"
    },
    "enableShareScreen": {
      "description": "If false, hides the tab 'share'-tab in the welcomeMessage",
      "type": "boolean"
    },
    "enableMoreQuests": {
      "description": "Hides the tab with more themes in the welcomeMessage",
      "type": "boolean"
    },
    "enableLayers": {
      "description": "If false, the layer selection/filter view will be hidden\nThe corresponding URL-parameter is 'fs-filters' instead of 'fs-layers'",
      "type": "boolean"
    },
    "enableSearch": {
      "description": "If set to false, hides the search bar",
      "type": "boolean"
    },
    "enableAddNewPoints": {
      "description": "If set to false, the ability to add new points or nodes will be disabled.\nEditing already existing features will still be possible",
      "type": "boolean"
    },
    "enableGeolocation": {
      "description": "If set to false, the 'geolocation'-button will be hidden.",
      "type": "boolean"
    },
    "enableBackgroundLayerSelection": {
      "description": "Enable switching the backgroundlayer.\nIf false, the quickswitch-buttons are removed (bottom left) and the dropdown in the layer selection is removed as well",
      "type": "boolean"
    },
    "enableShowAllQuestions": {
      "description": "If set to true, will show _all_ unanswered questions in a popup instead of just the next one",
      "type": "boolean"
    },
    "enableDownload": {
      "description": "If set to true, download button for the data will be shown (offers downloading as geojson and csv)",
      "type": "boolean"
    },
    "enablePdfDownload": {
      "description": "If set to true, exporting a pdf is enabled",
      "type": "boolean"
    },
    "enableNoteImports": {
      "description": "If true, notes will be loaded and parsed. If a note is an import (as created by the import_helper.html-tool from mapcomplete),\nthese notes will be shown if a relevant layer is present.",
      "type": "boolean"
    },
    "overpassUrl": {
      "description": "Set one or more overpass URLs to use for this theme..",
      "anyOf": [
        {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        {
          "type": "string"
        }
      ]
    },
    "overpassTimeout": {
      "description": "Set a different timeout for overpass queries - in seconds. Default: 30s",
      "type": "number"
    }
  },
  "required": [
    "description",
    "icon",
    "id",
    "layers",
    "maintainer",
    "startLat",
    "startLon",
    "startZoom",
    "title",
    "version"
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
    },
    "ApplicableUnitJson": {
      "type": "object",
      "properties": {
        "canonicalDenomination": {
          "description": "The canonical value which will be added to the text.\ne.g. \"m\" for meters\nIf the user inputs '42', the canonical value will be added and it'll become '42m'",
          "type": "string"
        },
        "canonicalDenominationSingular": {
          "description": "The canonical denomination in the case that the unit is precisely '1'",
          "type": "string"
        },
        "alternativeDenomination": {
          "description": "A list of alternative values which can occur in the OSM database - used for parsing.",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "human": {
          "description": "The value for humans in the dropdown. This should not use abbreviations and should be translated, e.g.\n{\n    \"en\": \"meter\",\n    \"fr\": \"metre\"\n}"
        },
        "humanSingular": {
          "description": "The value for humans in the dropdown. This should not use abbreviations and should be translated, e.g.\n{\n    \"en\": \"minute\",\n    \"nl\": \"minuut\"x²\n}"
        },
        "prefix": {
          "description": "If set, then the canonical value will be prefixed instead, e.g. for '€'\nNote that if all values use 'prefix', the dropdown might move to before the text field",
          "type": "boolean"
        },
        "default": {
          "description": "The default interpretation - only one can be set.\nIf none is set, the first unit will be considered the default interpretation of a value without a unit",
          "type": "boolean"
        }
      },
      "required": [
        "canonicalDenomination"
      ]
    },
    "TagRenderingConfigJson": {
      "description": "A TagRenderingConfigJson is a single piece of code which converts one ore more tags into a HTML-snippet.\nFor an _editable_ tagRenerdering, use 'QuestionableTagRenderingConfigJson' instead, which extends this one",
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
        "render": {
          "description": "Renders this value. Note that \"{key}\"-parts are substituted by the corresponding values of the element.\nIf neither 'textFieldQuestion' nor 'mappings' are defined, this text is simply shown as default value.\n\nNote that this is a HTML-interpreted value, so you can add links as e.g. '<a href='{website}'>{website}</a>' or include images such as `This is of type A <br><img src='typeA-icon.svg' />`\ntype: rendered"
        },
        "condition": {
          "description": "Only show this tagrendering (or question) if the object also matches the following tags.\n\nThis is useful to ask a follow-up question. E.g. if there is a diaper table, then ask a follow-up question on diaper tables...",
          "anyOf": [
            {
              "$ref": "#/definitions/AndOrTagConfigJson"
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
                "description": "If this condition is met, then the text under `then` will be shown.\nIf no value matches, and the user selects this mapping as an option, then these tags will be uploaded to OSM.\n\nFor example: {'if': 'diet:vegetarion=yes', 'then':'A vegetarian option is offered here'}\n\nThis can be an substituting-tag as well, e.g. {'if': 'addr:street:={_calculated_nearby_streetname}', 'then': '{_calculated_nearby_streetname}'}",
                "anyOf": [
                  {
                    "$ref": "#/definitions/AndOrTagConfigJson"
                  },
                  {
                    "type": "string"
                  }
                ]
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
                      "class",
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
    "T": {
      "type": "object"
    },
    "default_4": {
      "description": "The PointRenderingConfig gives all details onto how to render a single point of a feature.\n\nThis can be used if:\n\n- The feature is a point\n- To render something at the centroid of an area, or at the start, end or projected centroid of a way",
      "type": "object",
      "properties": {
        "location": {
          "description": "All the locations that this point should be rendered at.\nUsing `location: [\"point\", \"centroid\"] will always render centerpoint",
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
                "anyOf": [
                  {
                    "$ref": "#/definitions/AndOrTagConfigJson"
                  },
                  {
                    "type": "string"
                  }
                ]
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
          "description": "A HTML-fragment that is shown below the icon, for example:\n<div style=\"background: white; display: block\">{name}</div>\n\nIf the icon is undefined, then the label is shown in the center of the feature.\nNote that, if the wayhandling hides the icon then no label is shown as well.",
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
          "description": "Wehter or not to fill polygons",
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
    "QuestionableTagRenderingConfigJson": {
      "description": "A QuestionableTagRenderingConfigJson is a single piece of code which converts one ore more tags into a HTML-snippet.\nIf the desired tags are missing and a question is defined, a question will be shown instead.",
      "type": "object",
      "properties": {
        "question": {
          "description": "If it turns out that this tagRendering doesn't match _any_ value, then we show this question.\nIf undefined, the question is never asked and this tagrendering is read-only"
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
                ]
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
                      "class",
                      "path"
                    ]
                  },
                  {
                    "type": "string"
                  }
                ]
              },
              "hideInAnswer": {
                "description": "In some cases, multiple taggings exist (e.g. a default assumption, or a commonly mapped abbreviation and a fully written variation).\n\nIn the latter case, a correct text should be shown, but only a single, canonical tagging should be selectable by the user.\nIn this case, one of the mappings can be hiden by setting this flag.\n\nTo demonstrate an example making a default assumption:\n\nmappings: [\n {\n     if: \"access=\", -- no access tag present, we assume accessible\n     then: \"Accessible to the general public\",\n     hideInAnswer: true\n },\n {\n     if: \"access=yes\",\n     then: \"Accessible to the general public\", -- the user selected this, we add that to OSM\n },\n {\n     if: \"access=no\",\n     then: \"Not accessible to the public\"\n }\n]\n\n\nFor example, for an operator, we have `operator=Agentschap Natuur en Bos`, which is often abbreviated to `operator=ANB`.\nThen, we would add two mappings:\n{\n    if: \"operator=Agentschap Natuur en Bos\" -- the non-abbreviated version which should be uploaded\n    then: \"Maintained by Agentschap Natuur en Bos\"\n},\n{\n    if: \"operator=ANB\", -- we don't want to upload abbreviations\n    then: \"Maintained by Agentschap Natuur en Bos\"\n    hideInAnswer: true\n}\n\nHide in answer can also be a tagsfilter, e.g. to make sure an option is only shown when appropriate.\nKeep in mind that this is reverse logic: it will be hidden in the answer if the condition is true, it will thus only show in the case of a mismatch\n\ne.g., for toilets: if \"wheelchair=no\", we know there is no wheelchair dedicated room.\nFor the location of the changing table, the option \"in the wheelchair accessible toilet is weird\", so we write:\n\n{\n    \"question\": \"Where is the changing table located?\"\n    \"mappings\": [\n        {\"if\":\"changing_table:location=female\",\"then\":\"In the female restroom\"},\n       {\"if\":\"changing_table:location=male\",\"then\":\"In the male restroom\"},\n       {\"if\":\"changing_table:location=wheelchair\",\"then\":\"In the wheelchair accessible restroom\", \"hideInAnswer\": \"wheelchair=no\"},\n        \n    ]\n}\n\nAlso have a look for the meta-tags\n{\n    if: \"operator=Agentschap Natuur en Bos\",\n    then: \"Maintained by Agentschap Natuur en Bos\",\n    hideInAnswer: \"_country!=be\"\n}",
                "anyOf": [
                  {
                    "$ref": "#/definitions/AndOrTagConfigJson"
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
                    "$ref": "#/definitions/AndOrTagConfigJson"
                  },
                  {
                    "type": "string"
                  }
                ]
              },
              "addExtraTags": {
                "description": "If chosen as answer, these tags will be applied as well onto the object.\nNot compatible with multiAnswer",
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            },
            "required": [
              "if",
              "then"
            ]
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
        "render": {
          "description": "Renders this value. Note that \"{key}\"-parts are substituted by the corresponding values of the element.\nIf neither 'textFieldQuestion' nor 'mappings' are defined, this text is simply shown as default value.\n\nNote that this is a HTML-interpreted value, so you can add links as e.g. '<a href='{website}'>{website}</a>' or include images such as `This is of type A <br><img src='typeA-icon.svg' />`\ntype: rendered"
        },
        "condition": {
          "description": "Only show this tagrendering (or question) if the object also matches the following tags.\n\nThis is useful to ask a follow-up question. E.g. if there is a diaper table, then ask a follow-up question on diaper tables...",
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
    },
    "default<(string|QuestionableTagRenderingConfigJson|{builtin:string;override:any;})[]>": {
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
          "description": "The options for a filter\nIf there are multiple options these will be a list of radio buttons\nIf there is only one option this will be a checkbox\nFiltering is done based on the given osmTags that are compared to the objects in that layer.",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "question": {},
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
              "default": {
                "type": "boolean"
              },
              "fields": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": {
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
                "$ref": "#/definitions/AndOrTagConfigJson"
              },
              "then": {}
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
              "$ref": "#/definitions/AndOrTagConfigJson"
            },
            {
              "type": "string"
            }
          ]
        },
        "neededChangesets": {
          "description": "*\nBy default, the contributor needs 20 previous changesets to delete points edited by others.\nFor some small features (e.g. bicycle racks) this is too much and this requirement can be lowered or dropped, which can be done here.",
          "type": "number"
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
      "type": "object",
      "properties": {
        "appliesToKey": {
          "description": "Every key from this list will be normalized",
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
          "description": "The possible denominations",
          "type": "array",
          "items": {
            "$ref": "#/definitions/ApplicableUnitJson"
          }
        }
      },
      "required": [
        "applicableUnits",
        "appliesToKey"
      ]
    },
    "default_6": {
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
      ]
    },
    "LayerConfigJson": {
      "description": "Configuration for a single layer",
      "type": "object",
      "properties": {
        "id": {
          "description": "The id of this layer.\nThis should be a simple, lowercase, human readable string that is used to identify the layer.",
          "type": "string"
        },
        "name": {
          "description": "The name of this layer\nUsed in the layer control panel and the 'Personal theme'.\n\nIf not given, will be hidden (and thus not toggable) in the layer control"
        },
        "description": {
          "description": "A description for this layer.\nShown in the layer selections and in the personel theme"
        },
        "source": {
          "description": "This determines where the data for the layer is fetched: from OSM or from an external geojson dataset.\n\nIf no 'geojson' is defined, data will be fetched from overpass and the OSM-API.\n\nEvery source _must_ define which tags _must_ be present in order to be picked up.",
          "anyOf": [
            {
              "allOf": [
                {
                  "type": "object",
                  "properties": {
                    "osmTags": {
                      "description": "Every source must set which tags have to be present in order to load the given layer.",
                      "anyOf": [
                        {
                          "$ref": "#/definitions/AndOrTagConfigJson"
                        },
                        {
                          "type": "string"
                        }
                      ]
                    },
                    "maxCacheAge": {
                      "description": "The maximum amount of seconds that a tile is allowed to linger in the cache",
                      "type": "number"
                    }
                  },
                  "required": [
                    "osmTags"
                  ]
                },
                {
                  "type": "object",
                  "properties": {
                    "overpassScript": {
                      "type": "string"
                    }
                  }
                }
              ]
            },
            {
              "allOf": [
                {
                  "type": "object",
                  "properties": {
                    "osmTags": {
                      "description": "Every source must set which tags have to be present in order to load the given layer.",
                      "anyOf": [
                        {
                          "$ref": "#/definitions/AndOrTagConfigJson"
                        },
                        {
                          "type": "string"
                        }
                      ]
                    },
                    "maxCacheAge": {
                      "description": "The maximum amount of seconds that a tile is allowed to linger in the cache",
                      "type": "number"
                    }
                  },
                  "required": [
                    "osmTags"
                  ]
                },
                {
                  "type": "object",
                  "properties": {
                    "geoJson": {
                      "description": "The actual source of the data to load, if loaded via geojson.\n\n# A single geojson-file\nsource: {geoJson: \"https://my.source.net/some-geo-data.geojson\"}\n fetches a geojson from a third party source\n\n# A tiled geojson source\nsource: {geoJson: \"https://my.source.net/some-tile-geojson-{layer}-{z}-{x}-{y}.geojson\", geoJsonZoomLevel: 14}\n to use a tiled geojson source. The web server must offer multiple geojsons. {z}, {x} and {y} are substituted by the location; {layer} is substituted with the id of the loaded layer\n\nSome API's use a BBOX instead of a tile, this can be used by specifying {y_min}, {y_max}, {x_min} and {x_max}",
                      "type": "string"
                    },
                    "geoJsonZoomLevel": {
                      "description": "To load a tiled geojson layer, set the zoomlevel of the tiles",
                      "type": "number"
                    },
                    "isOsmCache": {
                      "description": "Indicates that the upstream geojson data is OSM-derived.\nUseful for e.g. merging or for scripts generating this cache",
                      "type": "boolean"
                    },
                    "mercatorCrs": {
                      "description": "Some API's use a mercator-projection (EPSG:900913) instead of WGS84. Set the flag `mercatorCrs: true`  in the source for this",
                      "type": "boolean"
                    },
                    "idKey": {
                      "description": "Some API's have an id-field, but give it a different name.\nSetting this key will rename this field into 'id'",
                      "type": "string"
                    }
                  },
                  "required": [
                    "geoJson"
                  ]
                }
              ]
            }
          ]
        },
        "calculatedTags": {
          "description": "A list of extra tags to calculate, specified as \"keyToAssignTo=javascript-expression\".\nThere are a few extra functions available. Refer to <a>Docs/CalculatedTags.md</a> for more information\nThe functions will be run in order, e.g.\n[\n \"_max_overlap_m2=Math.max(...feat.overlapsWith(\"someOtherLayer\").map(o => o.overlap))\n \"_max_overlap_ratio=Number(feat._max_overlap_m2)/feat.area\n]\n\nThe specified tags are evaluated lazily. E.g. if a calculated tag is only used in the popup (e.g. the number of nearby features),\nthe expensive calculation will only be performed then for that feature. This avoids clogging up the contributors PC when all features are loaded.\n\nIf a tag has to be evaluated strictly, use ':=' instead:\n\n[\n\"_some_key:=some_javascript_expression\"\n]",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "doNotDownload": {
          "description": "If set, this layer will not query overpass; but it'll still match the tags above which are by chance returned by other layers.\nWorks well together with 'passAllFeatures', to add decoration",
          "type": "boolean"
        },
        "isShown": {
          "description": "This tag rendering should either be 'yes' or 'no'. If 'no' is returned, then the feature will be hidden from view.\nThis is useful to hide certain features from view.\n\nImportant: hiding features does not work dynamically, but is only calculated when the data is first renders.\nThis implies that it is not possible to hide a feature after a tagging change\n\nThe default value is 'yes'",
          "$ref": "#/definitions/TagRenderingConfigJson"
        },
        "forceLoad": {
          "description": "Advanced option - might be set by the theme compiler\n\nIf true, this data will _always_ be loaded, even if the theme is disabled",
          "type": "boolean"
        },
        "minzoom": {
          "description": "The minimum needed zoomlevel required before loading of the data start\nDefault: 0",
          "type": "number"
        },
        "shownByDefault": {
          "description": "Indicates if this layer is shown by default;\ncan be used to hide a layer from start, or to load the layer but only to show it where appropriate (e.g. for snapping to it)",
          "type": "boolean"
        },
        "minzoomVisible": {
          "description": "The zoom level at which point the data is hidden again\nDefault: 100 (thus: always visible",
          "type": "number"
        },
        "title": {
          "description": "The title shown in a popup for elements of this layer.",
          "anyOf": [
            {
              "$ref": "#/definitions/TagRenderingConfigJson"
            },
            {
              "type": "string"
            }
          ]
        },
        "titleIcons": {
          "description": "Small icons shown next to the title.\nIf not specified, the OsmLink and wikipedia links will be used by default.\nUse an empty array to hide them.\nNote that \"defaults\" will insert all the default titleIcons (which are added automatically)\n\nType: icon[]",
          "anyOf": [
            {
              "type": "array",
              "items": {
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
            {
              "type": "array",
              "items": [
                {
                  "type": "string",
                  "enum": [
                    "defaults"
                  ]
                }
              ],
              "minItems": 1,
              "maxItems": 1
            }
          ]
        },
        "mapRendering": {
          "description": "Visualisation of the items on the map",
          "anyOf": [
            {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "$ref": "#/definitions/default_4"
                  },
                  {
                    "$ref": "#/definitions/default_5"
                  }
                ]
              }
            },
            {
              "type": "null"
            }
          ]
        },
        "passAllFeatures": {
          "description": "If set, this layer will pass all the features it receives onto the next layer.\nThis is ideal for decoration, e.g. directionss on cameras",
          "type": "boolean"
        },
        "presets": {
          "description": "Presets for this layer.\nA preset shows up when clicking the map on a without data (or when right-clicking/long-pressing);\nit will prompt the user to add a new point.\n\nThe most important aspect are the tags, which define which tags the new point will have;\nThe title is shown in the dialog, along with the first sentence of the description.\n\nUpon confirmation, the full description is shown beneath the buttons - perfect to add pictures and examples.\n\nNote: the icon of the preset is determined automatically based on the tags and the icon above. Don't worry about that!\nNB: if no presets are defined, the popup to add new points doesn't show up at all",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": {
                "description": "The title - shown on the 'add-new'-button."
              },
              "tags": {
                "description": "The tags to add. It determines the icon too",
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "description": {
                "description": "The _first sentence_ of the description is shown on the button of the `add` menu.\nThe full description is shown in the confirmation dialog.\n\n(The first sentence is until the first '.'-character in the description)"
              },
              "exampleImages": {
                "description": "Example images, which show real-life pictures of what such a feature might look like\n\nType: image",
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "preciseInput": {
                "description": "If set, the user will prompted to confirm the location before actually adding the data.\nThis will be with a 'drag crosshair'-method.\n\nIf 'preferredBackgroundCategory' is set, the element will attempt to pick a background layer of that category.",
                "anyOf": [
                  {
                    "type": "object",
                    "properties": {
                      "preferredBackground": {
                        "description": "The type of background picture",
                        "anyOf": [
                          {
                            "type": "array",
                            "items": {
                              "type": "string"
                            }
                          },
                          {
                            "type": "string"
                          }
                        ]
                      },
                      "snapToLayer": {
                        "description": "If specified, these layers will be shown to and the new point will be snapped towards it",
                        "anyOf": [
                          {
                            "type": "array",
                            "items": {
                              "type": "string"
                            }
                          },
                          {
                            "type": "string"
                          }
                        ]
                      },
                      "maxSnapDistance": {
                        "description": "If specified, a new point will only be snapped if it is within this range.\nDistance in meter\n\nDefault: 10",
                        "type": "number"
                      }
                    },
                    "required": [
                      "preferredBackground"
                    ]
                  },
                  {
                    "enum": [
                      true
                    ],
                    "type": "boolean"
                  }
                ]
              }
            },
            "required": [
              "tags",
              "title"
            ]
          }
        },
        "tagRenderings": {
          "description": "All the tag renderings.\nA tag rendering is a block that either shows the known value or asks a question.\n\nRefer to the class `TagRenderingConfigJson` to see the possibilities.\n\nNote that we can also use a string here - where the string refers to a tag rendering defined in `assets/questions/questions.json`,\nwhere a few very general questions are defined e.g. website, phone number, ...\n\nA special value is 'questions', which indicates the location of the questions box. If not specified, it'll be appended to the bottom of the featureInfobox.\n\nAt last, one can define a group of renderings where parts of all strings will be replaced by multiple other strings.\nThis is mainly create questions for a 'left' and a 'right' side of the road.\nThese will be grouped and questions will be asked together",
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
                  "override": {}
                },
                "required": [
                  "builtin",
                  "override"
                ]
              },
              {
                "$ref": "#/definitions/default<(string|QuestionableTagRenderingConfigJson|{builtin:string;override:any;})[]>"
              },
              {
                "type": "string"
              }
            ]
          }
        },
        "filter": {
          "description": "All the extra questions for filtering",
          "anyOf": [
            {
              "type": "array",
              "items": {
                "$ref": "#/definitions/default_1"
              }
            },
            {
              "type": "object",
              "properties": {
                "sameAs": {
                  "type": "string"
                }
              },
              "required": [
                "sameAs"
              ]
            }
          ]
        },
        "deletion": {
          "description": "This block defines under what circumstances the delete dialog is shown for objects of this layer.\nIf set, a dialog is shown to the user to (soft) delete the point.\nThe dialog is built to be user friendly and to prevent mistakes.\nIf deletion is not possible, the dialog will hide itself and show the reason of non-deletability instead.\n\nTo configure, the following values are possible:\n\n- false: never ever show the delete button\n- true: show the default delete button\n- undefined: use the mapcomplete default to show deletion or not. Currently, this is the same as 'false' but this will change in the future\n- or: a hash with options (see below)\n\n The delete dialog\n =================\n\n\n\n#### Hard deletion if enough experience\n\nA feature can only be deleted from OpenStreetMap by mapcomplete if:\n\n- It is a node\n- No ways or relations use the node\n- The logged-in user has enough experience OR the user is the only one to have edited the point previously\n- The logged-in user has no unread messages (or has a ton of experience)\n- The user did not select one of the 'non-delete-options' (see below)\n\nIn all other cases, a 'soft deletion' is used.\n\n#### Soft deletion\n\nA 'soft deletion' is when the point isn't deleted from OSM but retagged so that it'll won't how up in the mapcomplete theme anymore.\nThis makes it look like it was deleted, without doing damage. A fixme will be added to the point.\n\nNote that a soft deletion is _only_ possible if these tags are provided by the theme creator, as they'll be different for every theme\n\n#### No-delete options\n\nIn some cases, the contributor might want to delete something for the wrong reason (e.g. someone who wants to have a path removed \"because the path is on their private property\").\nHowever, the path exists in reality and should thus be on OSM - otherwise the next contributor will pass by and notice \"hey, there is a path missing here! Let me redraw it in OSM!)\n\nThe correct approach is to retag the feature in such a way that it is semantically correct *and* that it doesn't show up on the theme anymore.\nA no-delete option is offered as 'reason to delete it', but secretly retags.",
          "anyOf": [
            {
              "$ref": "#/definitions/DeleteConfigJson"
            },
            {
              "type": "boolean"
            }
          ]
        },
        "allowMove": {
          "description": "Indicates if a point can be moved and configures the modalities.\n\nA feature can be moved by MapComplete if:\n\n- It is a point\n- The point is _not_ part of a way or a a relation.\n\nOff by default. Can be enabled by setting this flag or by configuring.",
          "anyOf": [
            {
              "$ref": "#/definitions/default_3"
            },
            {
              "type": "boolean"
            }
          ]
        },
        "allowSplit": {
          "description": "IF set, a 'split this road' button is shown",
          "type": "boolean"
        },
        "units": {
          "description": "In some cases, a value is represented in a certain unit (such as meters for heigt/distance/..., km/h for speed, ...)\n\nSometimes, multiple denominations are possible (e.g. km/h vs mile/h; megawatt vs kilowatt vs gigawatt for power generators, ...)\n\nThis brings in some troubles, as there are multiple ways to write it (no denomitation, 'm' vs 'meter' 'metre', ...)\n\nNot only do we want to write consistent data to OSM, we also want to present this consistently to the user.\nThis is handled by defining units.\n\n# Rendering\n\nTo render a value with long (human) denomination, use {canonical(key)}\n\n# Usage\n\nFirst of all, you define which keys have units applied, for example:\n\n```\nunits: [\n appliesTo: [\"maxspeed\", \"maxspeed:hgv\", \"maxspeed:bus\"]\n applicableUnits: [\n     ...\n ]\n]\n```\n\nApplicableUnits defines which is the canonical extension, how it is presented to the user, ...:\n\n```\napplicableUnits: [\n{\n    canonicalDenomination: \"km/h\",\n    alternativeDenomination: [\"km/u\", \"kmh\", \"kph\"]\n    default: true,\n    human: {\n        en: \"kilometer/hour\",\n        nl: \"kilometer/uur\"\n    },\n    humanShort: {\n        en: \"km/h\",\n        nl: \"km/u\"\n    }\n},\n{\n    canoncialDenomination: \"mph\",\n    ... similar for miles an hour ...\n}\n]\n```\n\n\nIf this is defined, then every key which the denominations apply to (`maxspeed`, `maxspeed:hgv` and `maxspeed:bus`) will be rewritten at the metatagging stage:\nevery value will be parsed and the canonical extension will be added add presented to the other parts of the code.\n\nAlso, if a freeform text field is used, an extra dropdown with applicable denominations will be given",
          "type": "array",
          "items": {
            "$ref": "#/definitions/default_2"
          }
        },
        "syncSelection": {
          "description": "If set, synchronizes wether or not this layer is selected.\n\nno: Do not sync at all, always revert to default\nlocal: keep selection on local storage\ntheme-only: sync via OSM, but this layer will only be toggled in this theme\nglobal: all layers with this ID will be synced accross all themes",
          "enum": [
            "global",
            "local",
            "no",
            "theme-only"
          ],
          "type": "string"
        }
      },
      "required": [
        "id",
        "mapRendering",
        "source"
      ]
    },
    "default": {
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
      ]
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}