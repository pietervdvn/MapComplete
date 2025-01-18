export default {
  "description": "Configuration for a single layer",
  "type": "object",
  "properties": {
    "id": {
      "description": "question: What is the identifier of this layer?\n\nThis should be a simple, lowercase, human readable string that is used to identify the layer.\n A good ID is:\n - a noun\n - written in singular\n - describes the object\n - in english\n - only has lowercase letters, numbers or underscores. Do not use a space or a dash\n\ntype: id\ngroup: Basic",
      "type": "string"
    },
    "name": {
      "description": "Used in the layer control panel to toggle a layer on and of.\n\nifunset: This will hide the layer in the layer control, making it not filterable and not toggleable\n\ngroup: Basic\nquestion: What is the name of this layer?",
      "anyOf": [
        {
          "$ref": "#/definitions/Record<string,string>"
        },
        {
          "type": "string"
        }
      ]
    },
    "description": {
      "description": "question: How would you describe the features that are shown on this layer?\n\nA description for the features shown in this layer.\nThis often resembles the introduction of the wiki.osm.org-page for this feature.\n\ngroup: Basic",
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
      "description": "question: What are some other terms used to describe these objects?\n\nThis is used in the search functionality",
      "$ref": "#/definitions/Record<string,string[]>"
    },
    "source": {
      "description": "Question: Where should the data be fetched from?\ntitle: Data Source\n\nThis determines where the data for the layer is fetched: from OSM or from an external geojson dataset.\n\nIf no 'geojson' is defined, data will be fetched from overpass and the OSM-API.\n\nEvery source _must_ define which tags _must_ be present in order to be picked up.\n\nNote: a source must always be defined. 'special' is only allowed if this is a builtin-layer\n\ntypes: Load data with specific tags from OpenStreetMap ; Load data from an external geojson source ;\ntypesdefault: 0\nifunset: Determine the tags automatically based on the presets\ngroup: Basic",
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "osmTags": {
              "$ref": "#/definitions/TagConfigJson",
              "description": "question: Which tags must be present on the feature to show it in this layer?\nEvery source must set which tags have to be present in order to load the given layer."
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
              "description": "The actual source of the data to load, if loaded via geojson.\n\n# A single geojson-file\nsource: {geoJson: \"https://my.source.net/some-geo-data.geojson\"}\n fetches a geojson from a third party source\n\n# A tiled geojson source\nsource: {geoJson: \"https://my.source.net/some-tile-geojson-{layer}-{z}-{x}-{y}.geojson\", geoJsonZoomLevel: 14}\n to use a tiled geojson source. The web server must offer multiple geojsons. {z}, {x} and {y} are substituted by the location; {layer} is substituted with the id of the loaded layer\n\nSome API's use a BBOX instead of a tile, this can be used by specifying {y_min}, {y_max}, {x_min} and {x_max}\n\nquestion: What is the URL of the geojson?\ntype: url",
              "type": "string"
            },
            "geoJsonZoomLevel": {
              "description": "To load a tiled geojson layer, set the zoomlevel of the tiles\n\nquestion: If using a tiled geojson, what is the zoomlevel of the tiles?\nifunset: This is not a tiled geojson",
              "type": "number"
            },
            "mercatorCrs": {
              "description": "Some API's use a mercator-projection (EPSG:900913) instead of WGS84. Set the flag `mercatorCrs: true`  in the source for this\n\nquestion: Does this geojson use  EPSG:900913 instead of WGS84 as projection?\niftrue: This geojson uses EPSG:900913 instead of WGS84\nifunset: This geojson uses WGS84 just like most geojson (default)",
              "type": "boolean"
            },
            "idKey": {
              "description": "Some API's have an id-field, but give it a different name.\nSetting this key will rename this field into 'id'\n\nifunset: An id with key `id` will be assigned automatically if no attribute `id` is set\ninline: This geojson uses <b>{value}</b> as attribute to set the id\nquestion: What is the name of the attribute containing the ID of the object?",
              "type": "string"
            }
          },
          "required": [
            "geoJson"
          ]
        },
        {
          "enum": [
            "special",
            "special:library"
          ],
          "type": "string"
        }
      ]
    },
    "calculatedTags": {
      "description": "A list of extra tags to calculate, specified as \"keyToAssignTo=javascript-expression\".\nThere are a few extra functions available. Refer to <a>Docs/CalculatedTags.md</a> for more information\nThe functions will be run in order, e.g.\n[\n \"_max_overlap_m2=Math.max(...feat.overlapsWith(\"someOtherLayer\").map(o => o.overlap))\n \"_max_overlap_ratio=Number(feat._max_overlap_m2)/feat.area\n]\n\nThe specified tags are evaluated lazily. E.g. if a calculated tag is only used in the popup (e.g. the number of nearby features),\nthe expensive calculation will only be performed then for that feature. This avoids clogging up the contributors PC when all features are loaded.\n\nIf a tag has to be evaluated strictly, use ':=' instead:\n\n[\n\"_some_key:=some_javascript_expression\"\n]\n\nSee the full documentation on [https://github.com/pietervdvn/MapComplete/blob/master/Docs/CalculatedTags.md]\n\ngroup: expert\nquestion: What extra attributes should be calculated with javascript?",
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "isShown": {
      "description": "If set, only features matching this extra tag will be shown.\nThis is useful to hide certain features from view based on a calculated tag or if the features are provided by a different layer.\n\nquestion: What other tags should features match for being shown?\ngroup: advanced\nifunset: all features which match the 'source'-specification are shown.",
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
    "isCounted": {
      "description": "question: should this layer be included in the summary counts?\n\nThe layer server can give summary counts for a tile.\nThis should however be disabled for some layers, e.g. because there are too many features (walls_and_buildings) or because the count is irrelevant.\n\nifunset: Do count\niffalse: Do not include the counts\niftrue: Do include the count",
      "type": "boolean"
    },
    "minzoom": {
      "description": "The minimum needed zoomlevel required to start loading and displaying the data.\nThis can be used to only show common features (e.g. a bicycle parking) only when the map is zoomed in very much (17).\nThis prevents cluttering the map with thousands of parkings if one is looking to an entire city.\n\nDefault: 0\ngroup: Basic\ntype: nat\nquestion: At what zoom level should features of the layer be shown?\nifunset: Always load this layer, even if the entire world is in view.",
      "type": "number"
    },
    "shownByDefault": {
      "description": "Indicates if this layer is shown by default;\ncan be used to hide a layer from start, or to load the layer but only to show it when appropriate (e.g. for advanced users)\n\nquestion: Should this layer be enabled when opening the map for the first time?\niftrue: the layer is enabled when opening the map\niffalse: the layer is hidden until the contributor enables it. (If the filter-popup is disabled, this might never get enabled nor loaded)\ndefault: true\ngroup: advanced",
      "type": "boolean"
    },
    "minzoomVisible": {
      "description": "The zoom level at which point the data is hidden again\nDefault: 100 (thus: always visible\n\ngroup: expert",
      "type": "number"
    },
    "title": {
      "description": "question: Edit the popup title\nThe title shown in a popup for elements of this layer.\n\ngroup: title\ntypes: use a fixed translation ; Use a dynamic tagRendering ; hidden\ntypesdefault: 1\ntype: translation\ninline: {translated{value}}",
      "anyOf": [
        {
          "$ref": "#/definitions/Record<string,string>"
        },
        {
          "$ref": "#/definitions/TagRenderingConfigJson"
        },
        {
          "type": "string"
        }
      ]
    },
    "popupInFloatover": {
      "description": "Question: Should the information for this layer be shown in the sidebar or in a splash screen?\n\nIf set, open the selectedElementView in a floatOver instead of on the right.\n\niftrue: show the infobox in the splashscreen floating over the entire UI; hide the title bar\niffalse: show the infobox in a sidebar on the right\nsuggestions: return [{if: \"value=title\", then: \"Show in a floatover and show the title bar\"}]\ngroup: advanced\ndefault: sidebar",
      "type": [
        "string",
        "boolean"
      ]
    },
    "titleIcons": {
      "description": "Small icons shown next to the title.\nIf not specified, the OsmLink and wikipedia links will be used by default.\nUse an empty array to hide them.\nNote that \"defaults\" will insert all the default titleIcons (which are added automatically)\n\nUse `auto:<tagrenderingId>` to automatically create an icon based on a tagRendering which has icons\n\nType: icon[]\ngroup: infobox",
      "anyOf": [
        {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "allOf": [
                  {
                    "$ref": "#/definitions/TagRenderingConfigJson"
                  },
                  {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string"
                      }
                    }
                  }
                ]
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
    "pointRendering": {
      "description": "Creates points to render on the map.\nThis can render points for point-objects, lineobjects or areaobjects; use 'location' to indicate where it should be rendered.\n\nNote that all attributes - including [the calculated tags](https://github.com/pietervdvn/MapComplete/blob/develop/Docs/CalculatedTags.md) can be used to create the markers and lines\n\ngroup: pointrendering",
      "type": "array",
      "items": {
        "$ref": "#/definitions/default_4"
      }
    },
    "lineRendering": {
      "description": "Creates lines and areas to render on the map\ngroup: linerendering",
      "type": "array",
      "items": {
        "$ref": "#/definitions/default_5"
      }
    },
    "passAllFeatures": {
      "description": "If set, this layer will pass all the features it receives onto the next layer.\nThis is ideal for decoration, e.g. directions on cameras\niftrue: Make the features from this layer also available to the other layer; might result in this object being rendered by multiple layers\niffalse: normal behaviour: don't pass features allong\nquestion: should this layer pass features to the next layers?\ngroup: expert",
      "type": "boolean"
    },
    "doNotDownload": {
      "description": "If set, this layer will not query overpass; but it'll still match the tags above which are by chance returned by other layers.\nWorks well together with 'passAllFeatures', to add decoration\nThe opposite of `forceLoad`\n\niftrue: Do not attempt to query the data for this layer from overpass/the OSM API\niffalse: download the data as usual\ngroup: expert\nquestion: Should this layer be downloaded or is the data provided by a different layer (which has 'passAllFeatures'-set)?\ndefault: false",
      "type": "boolean"
    },
    "forceLoad": {
      "description": "Advanced option - might be set by the theme compiler\n\nIf true, this data will _always_ be loaded, even if the theme is disabled by a filter or hidden.\nThe opposite of `doNotDownload`\n\nquestion: Should this layer be forcibly loaded?\nifftrue: always download this layer, even if it is disabled\niffalse: only download data for this layer when needed (default)\ndefault: false\ngroup: expert",
      "type": "boolean"
    },
    "presets": {
      "description": "<div class='flex'>\n    <div>\nPresets for this layer.\n\nA preset consists of one or more attributes (tags), a title and optionally a description and optionally example images.\n\nWhen the contributor wishes to add a point to OpenStreetMap, they'll:\n\n1. Press the 'add new point'-button\n2. Choose a preset from the list of all presets\n3. Confirm the choice. In this step, the `description` (if set) and `exampleImages` (if given) will be shown\n4. Confirm the location\n5. A new point will be created with the attributes that were defined in the preset\n\nIf no presets are defined, the button which invites to add a new preset will not be shown.\n</div>\n<video controls autoplay muted src='https://github.com/pietervdvn/MapComplete/raw/refs/heads/master/Docs/Screenshots/AddNewItemScreencast.webm' class='w-64'/>\n</div>\n\ngroup: presets\ntitle: value.title",
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": {
            "description": "The title - shown on the 'add-new'-button.\n\nThis should include the article of the noun, e.g. 'a hydrant', 'a bicycle pump'.\nThis text will be inserted into `Add {category} here`, becoming `Add a hydrant here`.\n\nDo _not_ indicate 'new': 'add a new shop here' is incorrect, as the shop might have existed forever, it could just be unmapped!\n\nquestion: What is the word to describe this object?\ninline: Add {translated(value)::font-bold} here",
            "anyOf": [
              {
                "$ref": "#/definitions/Record<string,string>"
              },
              {
                "type": "string"
              }
            ]
          },
          "tags": {
            "description": "A single tag (encoded as <code>key=value</code>) out of all the tags to add onto the newly created point.\nNote that the icon in the UI will be chosen automatically based on the tags provided here.\n\nquestion: What tag should be added to the new object?\ntype: simple_tag\ntypeHelper: uploadableOnly",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "description": {
            "description": "An extra explanation of what the feature is, if it is not immediately clear from the title alone.\n\nThe _first sentence_ of the description is shown on the button of the `add` menu.\nThe full description is shown in the confirmation dialog.\n\n(The first sentence is until the first '.'-character in the description)\n\nquestion: How would you describe this feature?\nifunset: No extra description is given. This can be used to further explain the preset",
            "anyOf": [
              {
                "$ref": "#/definitions/Record<string,string>"
              },
              {
                "type": "string"
              }
            ]
          },
          "exampleImages": {
            "description": "The URL of an example image which shows a real-life example of what such a feature might look like.\n\nType: image\nquestion: What is the URL of an image showing such a feature?",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "snapToLayer": {
            "description": "question: Should the created point be snapped to a line layer?\n\nIf specified, these layers will be shown in the precise location picker  and the new point will be snapped towards it.\nFor example, this can be used to snap against `walls_and_buildings` (e.g. to attach a defibrillator, an entrance, an artwork, ... to the wall)\nor to snap an obstacle (such as a bollard) to the `cycleways_and_roads`.\n\nsuggestions: return Array.from(layers.keys()).map(key => ({if: \"value=\"+key, then: key+\" - \"+layers.get(key).description}))",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "maxSnapDistance": {
            "description": "question: What is the maximum distance in the location-input that a point can be moved to be snapped to a way?\n\ninline: a point is snapped if the location input is at most <b>{value}m</b> away from an object\n\nIf specified, a new point will only be snapped if it is within this range.\nIf further away, it'll be placed in the center of the location input\nDistance in meter\n\nifunset: Do not snap to a layer",
            "type": "number"
          }
        },
        "required": [
          "tags",
          "title"
        ]
      }
    },
    "tagRenderings": {
      "description": "question: Edit this way this attributed is displayed or queried\n\nA tag rendering is a block that either shows the known value or asks a question.\n\nRefer to the class `TagRenderingConfigJson` to see the possibilities.\n\nNote that we can also use a string here - where the string refers to a tag rendering defined in `assets/questions/questions.json`,\nwhere a few very general questions are defined e.g. website, phone number, ...\nFurthermore, _all_ the questions of another layer can be reused with `otherlayer.*`\nIf you need only a single of the tagRenderings, use `otherlayer.tagrenderingId`\nIf one or more questions have a 'group' or 'label' set, select all the entries with the corresponding group or label with `otherlayer.*group`\nRemark: if a tagRendering is 'lent' from another layer, the 'source'-tags are copied and added as condition.\nIf they are not wanted, remove them with an override\n\nA special value is 'questions', which indicates the location of the questions box. If not specified, it'll be appended to the bottom of the featureInfobox.\n\nAt last, one can define a group of renderings where parts of all strings will be replaced by multiple other strings.\nThis is mainly create questions for a 'left' and a 'right' side of the road.\nThese will be grouped and questions will be asked together\n\ntype: tagrendering[]\ngroup: tagrenderings",
      "type": "array",
      "items": {
        "anyOf": [
          {
            "$ref": "#/definitions/QuestionableTagRenderingConfigJson"
          },
          {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
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
            "allOf": [
              {
                "$ref": "#/definitions/default<(string|QuestionableTagRenderingConfigJson|{builtin:string;override:Partial<QuestionableTagRenderingConfigJson>;})[]>"
              },
              {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string"
                  }
                },
                "required": [
                  "id"
                ]
              }
            ]
          },
          {
            "type": "string"
          }
        ]
      }
    },
    "filter": {
      "description": "All the extra questions for filtering.\nIf a string is given, mapComplete will search in\n1. The tagrenderings for a match on ID and use the mappings as options\n2. search 'filters.json' for the appropriate filter or\n3. will try to parse it as `layername.filterid` and us that one.\n\nNote: adding \"#filter\":\"no-auto\" will disable the filters added by tagRenderings\n\ngroup: filters",
      "anyOf": [
        {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "$ref": "#/definitions/default_1"
              },
              {
                "type": "string"
              }
            ]
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
    "#filter": {
      "description": "Set this to disable the feature that tagRenderings can introduce filters",
      "enum": [
        "no-auto"
      ],
      "type": "string"
    },
    "deletion": {
      "description": "This block defines under what circumstances the delete dialog is shown for objects of this layer.\nIf set, a dialog is shown to the user to (soft) delete the point.\nThe dialog is built to be user friendly and to prevent mistakes.\nIf deletion is not possible, the dialog will hide itself and show the reason of non-deletability instead.\n\nTo configure, the following values are possible:\n\n- false: never ever show the delete button\n- true: show the default delete button\n- undefined: use the mapcomplete default to show deletion or not. Currently, this is the same as 'false' but this will change in the future\n- or: a hash with options (see below)\n\n### The delete dialog\n\n\n\n#### Hard deletion if enough experience\n\nA feature can only be deleted from OpenStreetMap by mapcomplete if:\n\n- It is a node\n- No ways or relations use the node\n- The logged-in user has enough experience OR the user is the only one to have edited the point previously\n- The logged-in user has no unread messages (or has a ton of experience)\n- The user did not select one of the 'non-delete-options' (see below)\n\nIn all other cases, a 'soft deletion' is used.\n\n#### Soft deletion\n\nA 'soft deletion' is when the point isn't deleted fromOSM but retagged so that it'll won't how up in the mapcomplete theme anymore.\nThis makes it look like it was deleted, without doing damage. A fixme will be added to the point.\n\nNote that a soft deletion is _only_ possible if these tags are provided by the theme creator, as they'll be different for every theme\n\n##### No-delete options\n\nIn some cases, the contributor might want to delete something for the wrong reason (e.g. someone who wants to have a path removed \"because the path is on their private property\").\nHowever, the path exists in reality and should thus be on OSM - otherwise the next contributor will pass by and notice \"hey, there is a path missing here! Let me redraw it in OSM!)\n\nThe correct approach is to retag the feature in such a way that it is semantically correct *and* that it doesn't show up on the theme anymore.\nA no-delete option is offered as 'reason to delete it', but secretly retags.\n\ngroup: editing\ntypes: Use an advanced delete configuration ; boolean\niftrue: Allow deletion\niffalse: Do not allow deletion\nifunset: Do not allow deletion",
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
      "description": "Indicates if a point can be moved and why.\n\nA feature can be moved by MapComplete if:\n\n- It is a point\n- The point is _not_ part of a way or a a relation.\n\ntypes: use an advanced move configuration ; boolean\ngroup: editing\nquestion: Is deleting a point allowed?\niftrue: Allow contributors to move a point (for accuracy or a relocation)\niffalse: Don't allow contributors to move points\nifunset: Don't allow contributors to move points (default)",
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
      "description": "If set, a 'split this way' button is shown on objects rendered as LineStrings, e.g. highways.\n\nIf the way is part of a relation, MapComplete will attempt to update this relation as well\nquestion: Should the contributor be able to split ways using this layer?\niftrue: enable the 'split-roads'-component\niffalse: don't enable the split-roads component\nifunset: don't enable the split-roads component\ngroup: editing",
      "type": "boolean"
    },
    "units": {
      "description": "Either a list with [{\"key\": \"unitname\", \"key2\": {\"quantity\": \"unitname\", \"denominations\": [\"denom\", \"denom\"]}}]\n\nUse `\"inverted\": true` if the amount should be _divided_ by the denomination, e.g. for charge over time (`€5/day`)",
      "type": "array",
      "items": {
        "anyOf": [
          {
            "$ref": "#/definitions/default_2"
          },
          {
            "$ref": "#/definitions/Record<string,string|{quantity:string;denominations:string[];canonical?:string|undefined;inverted?:boolean|undefined;}>"
          }
        ]
      }
    },
    "syncSelection": {
      "description": "If set, synchronizes whether this layer is enabled.\n\ngroup: advanced\nquestion: Should enabling/disabling the layer be saved (locally or in the cloud)?\nsuggestions: return [{if: \"value=no\", then: \"Don't save, always revert to the default\"}, {if: \"value=local\", then: \"Save selection in local storage\"}, {if: \"value=theme-only\", then: \"Save the state in the OSM-usersettings, but apply on this theme only (default)\"}, {if: \"value=global\", then: \"Save in OSM-usersettings and toggle on _all_ themes using this layer\"}]",
      "enum": [
        "global",
        "local",
        "no",
        "theme-only"
      ],
      "type": "string"
    },
    "#": {
      "description": "Used for comments and/or to disable some checks\n\nno-question-hint-check: disables a check in MiscTagRenderingChecks which complains about 'div', 'span' or 'class=subtle'-HTML elements in the tagRendering\n\ngroup: hidden",
      "type": "string"
    },
    "fullNodeDatabase": {
      "description": "_Set automatically by MapComplete, please ignore_\n\ngroup: hidden",
      "type": "boolean"
    },
    "enableMorePrivacy": {
      "description": "question: Should a theme using this layer leak some location info when making changes?\n\nWhen a changeset is made, a 'distance to object'-class is written to the changeset.\nFor some particular themes and layers, this might leak too much information, and we want to obfuscate this\n\nifunset: Write 'change_within_x_m' as usual and if GPS is enabled\niftrue: Do not write 'change_within_x_m' and do not indicate that this was done by survey",
      "type": "boolean"
    },
    "snapName": {
      "description": "question: When a feature is snapped to this name, how should this item be called?\n\nIn the move wizard, the option `snap object onto {snapName}` is shown\n\ngroup: hidden",
      "anyOf": [
        {
          "$ref": "#/definitions/Record<string,string>"
        },
        {
          "type": "string"
        }
      ]
    },
    "#dont-translate": {
      "description": "group: hidden",
      "enum": [
        "*"
      ],
      "type": "string"
    }
  },
  "required": [
    "id",
    "pointRendering"
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
          "description": "question: What value should be shown (if no predefined option matches)?\n\nThis piece of text will be shown in the infobox.\nNote that \"&LBRACEkey&RBRACE\"-parts are substituted by the corresponding values of the element.\n\nThis value will be used if there is no mapping which matches (or there are no matches)\nNote that this is a HTML-interpreted value, so you can add links as e.g. '&lt;a href='{website}'>{website}&lt;/a>' or include images such as `This is of type A &lt;br>&lt;img src='typeA-icon.svg' />`",
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
          "description": "question: What icon should be used?\n\nTo reuse icons from a different layer of a library:\n- The library layer has, within tagRenderings one which will output the URL of the image (e.g. mappings: {\"if\": \"shop=xyz\", then: \"./assets/icons/shop_xyz.png\"})\n- Use \"layer_id.tagrendering_id\"\n\nNote that if you reuse icons from a different icon set, you'll probably want to use `override` to set a default rendering\n\n\ntypes: <span class=\"text-lg font-bold\">Use a different icon depending on the value of some attributes</span> ; icon\nsuggestions: return [ \"nsi_brand.icon\", \"nsi_operator.icon\", \"id_presets.shop_rendering\", ...Constants.defaultPinIcons.map(i => ({if: \"value=\"+i, then: i, icon: i}))]",
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
          "description": "question: What colour should the icon be?\nThis will only work for the default icons such as `pin`,`circle`,...\ntypes: <span class=\"text-lg font-bold\">Use a different color depending on the value of some attributes</span> ; color",
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
                "description": "question: What icon should be added to this mapping?\nifunset: Do not show an extra icon next to the render value\n\nAn icon supporting this mapping; typically shown pretty small.\nThis can be used to show a e.g. 'phone'-icon next to the phone number\n\nThis supports patterns, you can e.g. have `close:red;some/other/icon.svg`\n\ninline: <img src='{icon}' class=\"w-8 h-8\" /> {icon}\nType: icon",
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
        },
        "filter": {
          "description": "This tagRendering can introduce this builtin filter",
          "anyOf": [
            {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            {
              "enum": [
                true
              ],
              "type": "boolean"
            }
          ]
        }
      }
    },
    "MappingConfigJson": {
      "type": "object",
      "properties": {
        "if": {
          "$ref": "#/definitions/TagConfigJson",
          "description": "question: What tags should be matched to show this option?\n\nIf in 'question'-mode and the contributor selects this option, these tags will be applied to the object"
        },
        "then": {
          "description": "Question: What corresponding text should be shown?\nShown if the `if` is fulfilled\nType: rendered",
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
          "description": "question: What icon should be shown next to this mapping?\n\nThis icon will only be shown if the value is known, it is not displayed in the options (but might be in the future)\n\nifunset: Show no icon\nType: icon",
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
          "description": "question: Under what circumstances should this mapping be <b>hidden</b> from the possibilities a contributor can pick?\niftrue: Never show this mapping as option to pick\nifunset: Always show this mapping as option to pick\ntype: tag\n\nIn some cases, multiple taggings exist (e.g. a default assumption, or a commonly mapped abbreviation and a fully written variation).\n\nIn the latter case, a correct text should be shown, but only a single, canonical tagging should be selectable by the user.\nIn this case, one of the mappings can be hiden by setting this flag.\n\nTo demonstrate an example making a default assumption:\n\nmappings: [\n {\n     if: \"access=\", -- no access tag present, we assume accessible\n     then: \"Accessible to the general public\",\n     hideInAnswer: true\n },\n {\n     if: \"access=yes\",\n     then: \"Accessible to the general public\", -- the user selected this, we add that to OSM\n },\n {\n     if: \"access=no\",\n     then: \"Not accessible to the public\"\n }\n]\n\n\nFor example, for an operator, we have `operator=Agentschap Natuur en Bos`, which is often abbreviated to `operator=ANB`.\nThen, we would add two mappings:\n{\n    if: \"operator=Agentschap Natuur en Bos\" -- the non-abbreviated version which should be uploaded\n    then: \"Maintained by Agentschap Natuur en Bos\"\n},\n{\n    if: \"operator=ANB\", -- we don't want to upload abbreviations\n    then: \"Maintained by Agentschap Natuur en Bos\"\n    hideInAnswer: true\n}\n\nHide in answer can also be a tagsfilter, e.g. to make sure an option is only shown when appropriate.\nKeep in mind that this is reverse logic: it will be hidden in the answer if the condition is true, it will thus only show in the case of a mismatch\n\ne.g., for toilets: if \"wheelchair=no\", we know there is no wheelchair dedicated room.\nFor the location of the changing table, the option \"in the wheelchair accessible toilet is weird\", so we write:\n\n{\n    \"question\": \"Where is the changing table located?\"\n    \"mappings\": [\n        {\"if\":\"changing_table:location=female\",\"then\":\"In the female restroom\"},\n       {\"if\":\"changing_table:location=male\",\"then\":\"In the male restroom\"},\n       {\"if\":\"changing_table:location=wheelchair\",\"then\":\"In the wheelchair accessible restroom\", \"hideInAnswer\": \"wheelchair=no\"},\n\n    ]\n}\n\nAlso have a look for the meta-tags\n{\n    if: \"operator=Agentschap Natuur en Bos\",\n    then: \"Maintained by Agentschap Natuur en Bos\",\n    hideInAnswer: \"_country!=be\"\n}",
          "anyOf": [
            {
              "$ref": "#/definitions/{and:TagConfigJson[];}"
            },
            {
              "$ref": "#/definitions/{or:TagConfigJson[];}"
            },
            {
              "type": [
                "string",
                "boolean"
              ]
            }
          ]
        },
        "alsoShowIf": {
          "description": "question: In what other cases should this item be rendered?\n\nAlso show this 'then'-option if the feature matches these tags.\nIdeal for outdated tags or default assumptions. The tags from this options will <b>not</b> be set if the option is chosen!\n\nifunset: No other cases when this text is shown",
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
        "ifnot": {
          "description": "question: What tags should be applied if this mapping is _not_ chosen?\n\nOnly applicable if 'multiAnswer' is set.\nThis is for situations such as:\n`accepts:coins=no` where one can select all the possible payment methods. However, we want to make explicit that some options _were not_ selected.\nThis can be done with `ifnot`\nNote that we can not explicitly render this negative case to the user, we cannot show `does _not_ accept coins`.\nIf this is important to your usecase, consider using multiple radiobutton-fields without `multiAnswer`\n\nifunset: Do not apply a tag if a different mapping is chosen.",
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
        "addExtraTags": {
          "description": "question: What extra tags should be added to the object if this object is chosen?\ntype: simple_tag\n\nIf chosen as answer, these tags will be applied onto the object, together with the tags from the `if`.\nNote that if the contributor picks this mapping, saves and then changes their mind and uses a different mapping,\nthe extraTags will reside.\nE.g. when picking `memorial:type=bench`, then `amenity=bench` will also be applied.\nIf someone later on changes the type to `memorial:statue`, `amenity=bench` will stay onto the object\n(which is the desired behaviour, see e.g. for https://www.openstreetmap.org/node/5620038478)\nUse 'ifNot' to explicitly remove an tag if this is important\n\nIf someone marks the question as 'unknown', the extra tags will not be erased\n\nNot compatible with multiAnswer.\n\nThis can be used e.g. to erase other keys which indicate the 'not' value:\n```json\n{\n    \"if\": \"crossing:marking=rainbow\",\n    \"then\": \"This is a rainbow crossing\",\n    \"addExtraTags\": [\"not:crossing:marking=\"]\n}\n```",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "searchTerms": {
          "description": "question: If there are many options, what search terms match too?\nIf there are many options, the mappings-radiobuttons will be replaced by an element with a searchfunction\n\nSearchterms (per language) allow to easily find an option if there are many options\ngroup: hidden",
          "$ref": "#/definitions/Record<string,string[]>"
        },
        "priorityIf": {
          "description": "If the searchable selector is picked, mappings with this item will have priority and show up even if the others are hidden\nUse this sparingly\ngroup: hidden",
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
        "#": {
          "description": "Used for comments or to disable a validation\n\ngroup: hidden\nignore-image-in-then: normally, a `then`-clause is not allowed to have an `img`-html-element as icons are preferred. In some cases (most notably title-icons), this is allowed",
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
          "description": "question: At what location should this icon be shown?\nmultianswer: true\nsuggestions: return [{if: \"value=point\",then: \"Show an icon for point (node) objects\"},{if: \"value=centroid\",then: \"Show an icon for line or polygon (way) objects at their centroid location\"}, {if: \"value=start\",then: \"Show an icon for line (way) objects at the start\"},{if: \"value=end\",then: \"Show an icon for line (way) object at the end\"},{if: \"value=projected_centerpoint\",then: \"Show an icon for line (way) object near the centroid location, but moved onto the line. Does not show an item on polygons\"}, {if: \"value=polygon_centroid\",then: \"Show an icon at a polygon centroid (but not if it is a way)\"}, {if: \"value=waypoints\", then: \"Show an icon on every intermediate point of a way\"}]",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "marker": {
          "description": "The marker for an element.\nNote that this also defines the icon for this layer (rendered with the overpass-tags) <i>and</i> the icon in the presets.\n\nThe result of the icon is rendered as follows:\n- The first icon is rendered on the map\n- The second entry is overlayed on top of it\n- ...\n\nAs a result, on could use a generic icon (`pin`, `circle`, `square`) with a color, then overlay it with a specific icon.\nicon: value\ntitle: value.icon",
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
          "description": "question: What rotation should be applied on the icon?\nThis is mostly useful for items that face a specific direction, such as surveillance cameras\nThis is interpreted as css property for 'rotate', thus has to end with 'deg', e.g. `90deg`, `{direction}deg`, `calc(90deg - {camera:direction}deg)`\n\nIf the icon is shown on the projected centerpoint of a way, one can also use `_direction:centerpoint`\n\ntypes: Dynamic value ; string\nsuggestions:  return [{if: \"value={_direction:centerpoint}deg\", then: \"Point the top of the icon towards the end of the way\"}, {if: \"value=calc( {_direction:centerpoint}deg + 90deg )\", then: \"Point the left of the icon towards the end of the way\"}, {if: \"value=calc( {_direction:centerpoint}deg - 90deg )\", then: \"Point the right of the icon towards the end of the way\"}, {if: \"value=calc( {_direction:centerpoint}deg + 180deg )\", then: \"Point the bottom of the icon towards the end of the way\"}]\nifunset: Do not rotate",
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
          "description": "question: Which CSS-classes should be applied to the entire marker?\nThis will be applied to the _container_ containing both the marker and the label\n\nThe classes should be separated by a space (` `)\nYou can use most Tailwind-css classes, see https://tailwindcss.com/ for more information\nFor example: `center bg-gray-500 mx-2 my-1 rounded-full`\ninline: Apply CSS-classes <b>{value}</b> to the entire container\ntypes: Dynamic value ; string\nifunset: Do not apply extra CSS-classes to the entire marker\ngroup: expert",
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
          "description": "question: If the map is pitched, should the icon stay parallel to the screen or to the groundplane?\nsuggestions: return [{if: \"value=canvas\", alsoShowIf: \"value=\", then: \"The icon will stay upward and not be transformed as if it sticks to the screen\"}, {if: \"value=map\", then: \"The icon will be transformed as if it were painted onto the ground. (Automatically sets rotationAlignment)\"}]\ngroup: expert",
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
      ]
    },
    "default_5": {
      "description": "The LineRenderingConfig gives all details onto how to render a single line of a feature.\n\nThis can be used if:\n\n- The feature is a line\n- The feature is an area",
      "type": "object",
      "properties": {
        "color": {
          "description": "question: What color should lines be drawn in?\n\nFor an area, this will be the colour of the outside line.\nIf the value starts with \"--\", the style of the body element will be queried for the corresponding variable instead\n\ntypes: dynamic value ; string\ntitle: Line Colour\ninline: The line colour always is <b>{value}</b>\ntype: color",
          "anyOf": [
            {
              "$ref": "#/definitions/MinimalTagRenderingConfigJson"
            },
            {
              "type": "string"
            }
          ]
        },
        "width": {
          "description": "question: How wide should the line be?\nThe stroke-width for way-elements\n\ntypes: dynamic value ; string\ntitle: Line width\ninline: The line width is <b>{value} pixels</b>\ntype: pnat\nifunset: Use the default-linewidth of 7 pixels",
          "anyOf": [
            {
              "$ref": "#/definitions/MinimalTagRenderingConfigJson"
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
          "description": "question: Should a dasharray be used to render the lines?\nThe dasharray defines 'pixels of line, pixels of gap, pixels of line, pixels of gap, ...'. For example, `5 6` will be 5 pixels of line followed by a 6 pixel gap.\nCannot be a dynamic property due to a MapLibre limitation (see https://github.com/maplibre/maplibre-gl-js/issues/1235)\nifunset: Ways are rendered with a full line",
          "type": "string"
        },
        "lineCap": {
          "description": "question: What form should the line-ending have?\nsuggestions: return [{if:\"value=round\",then:\"Round endings\"}, {if: \"value=square\", then: \"square endings\"}, {if: \"value=butt\", then: \"no ending (square ending at the end, without padding)\"}]\ntypes: dynamic value ; string\ntitle: Line Cap\nifunset: Use the default value (round ending)",
          "anyOf": [
            {
              "$ref": "#/definitions/MinimalTagRenderingConfigJson"
            },
            {
              "type": "string"
            }
          ]
        },
        "fillColor": {
          "description": "question: What colour should be used as fill colour for polygons?\nifunset: The polygon fill colour will be a more transparent version of the stroke colour\nsuggestions: return [{if: \"value=#00000000\", then: \"Use a transparent fill (only render the outline)\"}]\ninline: The fill colour is <b>{value}</b>\ntypes: dynamic value ; string\ntype: color",
          "anyOf": [
            {
              "$ref": "#/definitions/MinimalTagRenderingConfigJson"
            },
            {
              "type": "string"
            }
          ]
        },
        "offset": {
          "description": "question: Should the lines be moved (offsetted) with a number of pixels against the geographical lines?\nThe number of pixels this line should be moved.\nUse a positive number to move to the right in the drawing direction or a negative to move to the left (left/right as defined by the drawing direction of the line).\n\nIMPORTANT: MapComplete will already normalize 'key:both:property' and 'key:both' into the corresponding 'key:left' and 'key:right' tagging (same for 'sidewalk=left/right/both' which is rewritten to 'sidewalk:left' and 'sidewalk:right')\nThis simplifies programming. Refer to the CalculatedTags.md-documentation for more details\nifunset: don't offset lines on the map\ninline: Pixel offset by <b>{value}</b> pixels\ntypes: dynamic value ; number\ntype: int",
          "anyOf": [
            {
              "$ref": "#/definitions/MinimalTagRenderingConfigJson"
            },
            {
              "type": "number"
            }
          ]
        },
        "imageAlongWay": {
          "description": "question: What PNG-image should be shown along the way?\n\nifunset: no image is shown along the way\nsuggestions: [{if: \"./assets/png/oneway.png\", then: \"Show a oneway error\"}]\ntype: image",
          "anyOf": [
            {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "if": {
                    "$ref": "#/definitions/TagConfigJson",
                    "description": "The main representation of Tags.\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for more documentation\n\ntype: tag"
                  },
                  "then": {
                    "type": "string"
                  }
                },
                "required": [
                  "if",
                  "then"
                ]
              }
            },
            {
              "type": "string"
            }
          ]
        }
      }
    },
    "QuestionableTagRenderingConfigJson": {
      "description": "A QuestionableTagRenderingConfigJson is a single piece of code which converts one ore more tags into a HTML-snippet.\nIf the desired tags are missing and a question is defined, a question will be shown instead.",
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "mappings": {
          "description": "Allows fixed-tag inputs, shown either as radiobuttons or as checkboxes\n\nquestion: What are common options?",
          "type": "array",
          "items": {
            "$ref": "#/definitions/MappingConfigJson"
          }
        },
        "multiAnswer": {
          "description": "question: Should a contributor be allowed to select multiple mappings?\n\nIf true, use checkboxes instead of radio buttons when asking the question.\n\niftrue: allow to select multiple mappings (and show a freeform-value as list if ';'-separated)\niffalse: only allow to select a single mapping\nifunset: only allow to select a single mapping",
          "type": "boolean"
        },
        "freeform": {
          "description": "Allow freeform text input from the user",
          "type": "object",
          "properties": {
            "key": {
              "description": "question: What is the name of the attribute that should be written to?\nThis is the OpenStreetMap-key that that value will be written to\nifunset: do not offer a freeform textfield as answer option",
              "type": "string"
            },
            "type": {
              "description": "question: What is the input type?\nThe type of the text-field, e.g. 'string', 'nat', 'float', 'date',...\nSee Docs/SpecialInputElements.md and UI/Input/ValidatedTextField.ts for supported values\nifunset: use an unconstrained <b>string</b> as input (default)\nsuggestions: return validators.AllValidators.filter(type => !type.isMeta).map((type) => ({if: \"value=\"+type.name, then: \"<b>\"+type.name+\"</b> \"+type.explanation.split(\"\\n\")[0]}))",
              "type": "string"
            },
            "placeholder": {
              "description": "question: What placeholder text should be shown in the input-element if there is no input?\nA (translated) text that is shown (as gray text) within the textfield\ntype: translation\ngroup: expert\nifunset: No specific placeholder is set, show the type of the textfield",
              "anyOf": [
                {
                  "$ref": "#/definitions/Record<string,string>"
                },
                {
                  "type": "string"
                }
              ]
            },
            "addExtraTags": {
              "description": "If a value is added with the textfield, these extra tag is addded.\nUseful to add a 'fixme=freeform textfield used - to be checked'\ngroup: expert",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "inline": {
              "description": "question: Show the freeform as box within the question?\nInstead of showing a full-width text field, the text field will be shown within the rendering of the question.\n\nThis combines badly with special input elements, as it'll distort the layout.\nifunset: show the freeform input field full-width\niftrue: show the freeform input field as a small field within the question\ngroup: expert",
              "type": "boolean"
            },
            "default": {
              "description": "question: What value should be entered in the text field if no value is set?\nThis can help people to quickly enter the most common option\nifunset: do not prefill the textfield\ngroup: expert",
              "type": "string"
            },
            "invalidValues": {
              "description": "question: What values of the freeform key should be interpreted as 'unknown'?\nFor example, if a feature has `shop=yes`, the question 'what type of shop is this?' should still asked\nifunset: The question will be considered answered if any value is set for the key\ngroup: expert",
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
            "postfixDistinguished": {
              "description": "question: If this key shared and distinguished by a postfix, what is the postfix?\nThis option is used specifically for `charge`, where the cost is indicated with `/item`.\n\nFor example, a vending machine might sell `bicycle_tube`.\nSetting this value to `bicycle_tube`, then answering this question will set `charge= €XX/bicycle_tube`.\nIf charge did already contain another value, e.g. `charge= €YY/some_item; €ZZ/other_item`, then `€XX/bicycle_tube`will be added.\nNote: those values are sorted alphabetically\nNote: no need to add the `/`\n\nifunset: Don't distinguish by postfix\ngroup: expert",
              "type": "string"
            },
            "helperArgs": {
              "description": "Extra arguments to configure the input element\ngroup: hidden"
            }
          },
          "required": [
            "helperArgs"
          ]
        },
        "question": {
          "description": "question: What question should be shown to the contributor?\n\nA question is presented ot the user if no mapping matches and the 'freeform' key is not set as well.\n\nifunset: This tagrendering will be shown if it is known, but cannot be edited by the contributor, effectively resutling in a read-only rendering",
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
          "description": "question: Should some extra information be shown to the contributor, alongside the question?\nThis hint is shown in subtle text under the question.\nThis can give some extra information on what the answer should ook like\nifunset: No extra hint is given",
          "anyOf": [
            {
              "$ref": "#/definitions/Record<string,string>"
            },
            {
              "type": "string"
            }
          ]
        },
        "editButtonAriaLabel": {
          "description": "When using a screenreader and selecting the 'edit' button, the current rendered value is read aloud in normal circumstances.\nIn some rare cases, this is not desirable. For example, if the rendered value is a link to a website, this link can be selected (and will be read aloud).\nIf the user presses _tab_ again, they'll select the button and have the link read aloud a second time.",
          "anyOf": [
            {
              "$ref": "#/definitions/Record<string,string>"
            },
            {
              "type": "string"
            }
          ]
        },
        "labels": {
          "description": "question: What labels should be applied on this tagRendering?\n\nA list of labels. These are strings that are used for various purposes, e.g. to only include a subset of the tagRenderings when reusing a layer\n\nSpecial values:\n- \"hidden\": do not show this tagRendering. Useful in it is used by e.g. an accordion\n- \"description\": this label is a description used in the search",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "onSoftDelete": {
          "description": "question: What tags should be applied when the object is soft-deleted?",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
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
        },
        "filter": {
          "description": "This tagRendering can introduce this builtin filter",
          "anyOf": [
            {
              "type": "array",
              "items": {
                "type": "string"
              }
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
        "id"
      ]
    },
    "Partial<QuestionableTagRenderingConfigJson>": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "mappings": {
          "description": "Allows fixed-tag inputs, shown either as radiobuttons or as checkboxes\n\nquestion: What are common options?",
          "type": "array",
          "items": {
            "$ref": "#/definitions/MappingConfigJson"
          }
        },
        "multiAnswer": {
          "description": "question: Should a contributor be allowed to select multiple mappings?\n\nIf true, use checkboxes instead of radio buttons when asking the question.\n\niftrue: allow to select multiple mappings (and show a freeform-value as list if ';'-separated)\niffalse: only allow to select a single mapping\nifunset: only allow to select a single mapping",
          "type": "boolean"
        },
        "freeform": {
          "description": "Allow freeform text input from the user",
          "type": "object",
          "properties": {
            "key": {
              "description": "question: What is the name of the attribute that should be written to?\nThis is the OpenStreetMap-key that that value will be written to\nifunset: do not offer a freeform textfield as answer option",
              "type": "string"
            },
            "type": {
              "description": "question: What is the input type?\nThe type of the text-field, e.g. 'string', 'nat', 'float', 'date',...\nSee Docs/SpecialInputElements.md and UI/Input/ValidatedTextField.ts for supported values\nifunset: use an unconstrained <b>string</b> as input (default)\nsuggestions: return validators.AllValidators.filter(type => !type.isMeta).map((type) => ({if: \"value=\"+type.name, then: \"<b>\"+type.name+\"</b> \"+type.explanation.split(\"\\n\")[0]}))",
              "type": "string"
            },
            "placeholder": {
              "description": "question: What placeholder text should be shown in the input-element if there is no input?\nA (translated) text that is shown (as gray text) within the textfield\ntype: translation\ngroup: expert\nifunset: No specific placeholder is set, show the type of the textfield",
              "anyOf": [
                {
                  "$ref": "#/definitions/Record<string,string>"
                },
                {
                  "type": "string"
                }
              ]
            },
            "addExtraTags": {
              "description": "If a value is added with the textfield, these extra tag is addded.\nUseful to add a 'fixme=freeform textfield used - to be checked'\ngroup: expert",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "inline": {
              "description": "question: Show the freeform as box within the question?\nInstead of showing a full-width text field, the text field will be shown within the rendering of the question.\n\nThis combines badly with special input elements, as it'll distort the layout.\nifunset: show the freeform input field full-width\niftrue: show the freeform input field as a small field within the question\ngroup: expert",
              "type": "boolean"
            },
            "default": {
              "description": "question: What value should be entered in the text field if no value is set?\nThis can help people to quickly enter the most common option\nifunset: do not prefill the textfield\ngroup: expert",
              "type": "string"
            },
            "invalidValues": {
              "description": "question: What values of the freeform key should be interpreted as 'unknown'?\nFor example, if a feature has `shop=yes`, the question 'what type of shop is this?' should still asked\nifunset: The question will be considered answered if any value is set for the key\ngroup: expert",
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
            "postfixDistinguished": {
              "description": "question: If this key shared and distinguished by a postfix, what is the postfix?\nThis option is used specifically for `charge`, where the cost is indicated with `/item`.\n\nFor example, a vending machine might sell `bicycle_tube`.\nSetting this value to `bicycle_tube`, then answering this question will set `charge= €XX/bicycle_tube`.\nIf charge did already contain another value, e.g. `charge= €YY/some_item; €ZZ/other_item`, then `€XX/bicycle_tube`will be added.\nNote: those values are sorted alphabetically\nNote: no need to add the `/`\n\nifunset: Don't distinguish by postfix\ngroup: expert",
              "type": "string"
            },
            "helperArgs": {
              "description": "Extra arguments to configure the input element\ngroup: hidden"
            }
          },
          "required": [
            "helperArgs"
          ]
        },
        "question": {
          "description": "question: What question should be shown to the contributor?\n\nA question is presented ot the user if no mapping matches and the 'freeform' key is not set as well.\n\nifunset: This tagrendering will be shown if it is known, but cannot be edited by the contributor, effectively resutling in a read-only rendering",
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
          "description": "question: Should some extra information be shown to the contributor, alongside the question?\nThis hint is shown in subtle text under the question.\nThis can give some extra information on what the answer should ook like\nifunset: No extra hint is given",
          "anyOf": [
            {
              "$ref": "#/definitions/Record<string,string>"
            },
            {
              "type": "string"
            }
          ]
        },
        "editButtonAriaLabel": {
          "description": "When using a screenreader and selecting the 'edit' button, the current rendered value is read aloud in normal circumstances.\nIn some rare cases, this is not desirable. For example, if the rendered value is a link to a website, this link can be selected (and will be read aloud).\nIf the user presses _tab_ again, they'll select the button and have the link read aloud a second time.",
          "anyOf": [
            {
              "$ref": "#/definitions/Record<string,string>"
            },
            {
              "type": "string"
            }
          ]
        },
        "labels": {
          "description": "question: What labels should be applied on this tagRendering?\n\nA list of labels. These are strings that are used for various purposes, e.g. to only include a subset of the tagRenderings when reusing a layer\n\nSpecial values:\n- \"hidden\": do not show this tagRendering. Useful in it is used by e.g. an accordion\n- \"description\": this label is a description used in the search",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "onSoftDelete": {
          "description": "question: What tags should be applied when the object is soft-deleted?",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
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
        },
        "filter": {
          "description": "This tagRendering can introduce this builtin filter",
          "anyOf": [
            {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            {
              "enum": [
                true
              ],
              "type": "boolean"
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
        "subexpand": {
          "description": "Used to expand a sublist.\nE.g. a target `rendering` is:\n\ne.g.\n{\n    rewrite: [\"{{x}}\", \"{{y}}\"],\n    into:[\n        [\"{{x}}\": \"some X\"],\n        [\"{{y}}\", [\"option 1\", \"option 2\"]]\n    ],\n    renderings:[\n        {\n            \"question\":\"Is {{x}}\",\n            \"mappings\": [\"if={{y}}\",then: \"...\"]\n        }\n    ]\n    subExpand: {\n        // The list with the key\n        \"mappings\":\n        // will be taken and multiplied by all possible values of\n        \"{{y}}\"\n        // Note that this implies that `into.[*].[{{y}}]` should be a list of items\n    }\n}\n\nExpansion will result in:\n{\n    question: \"Is some X\",\n    mappings: [{\"if=option 1\", then: \"...\"}, {\"if=option 2\", then: \"...\"}]\n}",
          "$ref": "#/definitions/Record<string,string[]>"
        },
        "renderings": {
          "anyOf": [
            {
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
            },
            {
              "type": "array",
              "items": {
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
            }
          ]
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
      ]
    },
    "DeleteConfigJson": {
      "type": "object",
      "properties": {
        "neededChangesets": {
          "description": "*\nBy default, the contributor needs 20 previous changesets to delete points edited by others.\nFor some small features (e.g. bicycle racks) this is too much and this requirement can be lowered or dropped, which can be done here.\n\ntype: nat\nquestion: How many changesets must a contributor have before being allowed to delete a point?",
          "type": "number"
        },
        "extraDeleteReasons": {
          "description": "*\nBy default, three reasons to delete a point are shown:\n\n- The point does not exist anymore\n- The point was a testing point\n- THe point could not be found\n\nHowever, for some layers, there might be different or more specific reasons for deletion which can be user friendly to set, e.g.:\n\n- the shop has closed\n- the climbing route has been closed of for nature conservation reasons\n- ...\n\nThese reasons can be stated here and will be shown in the list of options the user can choose from",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "explanation": {
                "description": "The text that will be shown to the user as option for why this point does not exist anymore.\nNote that the most common reasons (test point, does not exist anymore, cannot be found) are already offered by default\n\nquestion: For what extra reason might this feature be removed in real-life?"
              },
              "changesetMessage": {
                "description": "The text that will be uploaded into the changeset or will be used in the fixme in case of a soft deletion\nShould be a few words, in english\n\nquestion: What should be added to the changeset as delete reason?",
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
                "description": "The tags that will be given to the object.\nThis must remove tags so that the 'source/osmTags' won't match anymore\n\nquestion: What tags should be applied to the object?"
              },
              "then": {
                "description": "The human explanation for the options\n\nquestion: What text should be shown to the contributor for this reason?",
                "anyOf": [
                  {
                    "$ref": "#/definitions/Record<string,string>"
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
        "softDeletionTags": {
          "description": "In some cases, the contributor is not allowed to delete the current feature (e.g. because it isn't a point, the point is referenced by a relation or the user isn't experienced enough).\nTo still offer the user a 'delete'-option, the feature is retagged with these tags. This is a soft deletion, as the point isn't actually removed from OSM but rather marked as 'disused'\nIt is important that the feature will be retagged in such a way that it won't be picked up by the layer anymore!\n\nExample (note that \"amenity=\" erases the 'amenity'-key alltogether):\n\n```\n{\n    \"and\": [\"disussed:amenity=public_bookcase\", \"amenity=\"]\n}\n```\n\nor (notice the use of the ':='-tag to copy the old value of 'shop=*' into 'disused:shop='):\n\n```\n{\n    \"and\": [\"disused:shop:={shop}\", \"shop=\"]\n}\n```\n\nquestion: If a hard delete is not possible, what tags should be applied to mark this feature as deleted?\ntype: tag",
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
        "omitDefaultDeleteReasons": {
          "description": "Set this flag if the default delete reasons should be omitted from the dialog.\nThis requires at least one extraDeleteReason or nonDeleteMapping\n\nquestion: Should the default delete reasons be hidden?\niftrue: Hide the default delete reasons\niffalse: Show the default delete reasons\nifunset: Show the default delete reasons (default behaviour)",
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
        }
      }
    },
    "default_3": {
      "type": "object",
      "properties": {
        "enableImproveAccuracy": {
          "description": "question: Should moving this type of point to improve the accuracy be allowed?\niftrue: This point can be moved to improve the accuracy\nifunset: (default) This point can be moved to improve the accuracy\niffalse: This point cannot be moved to improve the accuracy",
          "type": "boolean"
        },
        "enableRelocation": {
          "description": "question: Should moving this type of point due to a relocation be allowed?\n\nThis will erase the attributes `addr:street`, `addr:housenumber`, `addr:city` and `addr:postcode`\n\niftrue: This type of point can be moved due to a relocation (and will remove address information when this is done)\nifunset: (default) This type of point can be moved due to a relocation (and will remove address information when this is done)\niffalse: This type of point cannot be moved due to a relocation",
          "type": "boolean"
        }
      }
    },
    "default_2": {
      "description": "In some cases, a value is represented in a certain unit (such as meters for heigt/distance/..., km/h for speed, ...)\n\nSometimes, multiple denominations are possible (e.g. km/h vs mile/h; megawatt vs kilowatt vs gigawatt for power generators, ...)\n\nThis brings in some troubles, as there are multiple ways to write it (no denomitation, 'm' vs 'meter' 'metre', ...)\n\nNot only do we want to write consistent data to OSM, we also want to present this consistently to the user.\nThis is handled by defining units.\n\n# Rendering\n\nTo render a value with long (human) denomination, use {canonical(key)}\n\n# Usage\n\nFirst of all, you define which keys have units applied, for example:\n\n```\nunits: [\n appliesTo: [\"maxspeed\", \"maxspeed:hgv\", \"maxspeed:bus\"]\n applicableUnits: [\n     ...\n ]\n]\n```\n\nApplicableUnits defines which is the canonical extension, how it is presented to the user, ...:\n\n```\napplicableUnits: [\n{\n    canonicalDenomination: \"km/h\",\n    alternativeDenomination: [\"km/u\", \"kmh\", \"kph\"]\n    default: true,\n    human: {\n        en: \"kilometer/hour\",\n        nl: \"kilometer/uur\"\n    },\n    humanShort: {\n        en: \"km/h\",\n        nl: \"km/u\"\n    }\n},\n{\n    canoncialDenomination: \"mph\",\n    ... similar for miles an hour ...\n}\n]\n```\n\n\nIf this is defined, then every key which the denominations apply to (`maxspeed`, `maxspeed:hgv` and `maxspeed:bus`) will be rewritten at the metatagging stage:\nevery value will be parsed and the canonical extension will be added add presented to the other parts of the code.\n\nAlso, if a freeform text field is used, an extra dropdown with applicable denominations will be given",
      "type": "object",
      "properties": {
        "quantity": {
          "description": "What is quantified? E.g. 'speed', 'length' (including width, diameter, ...), 'electric tension', 'electric current', 'duration'",
          "type": "string"
        },
        "appliesToKey": {
          "description": "Every key from this list will be normalized.\n\nTo render the value properly (with a human readable denomination), use `{canonical(<key>)}`",
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
        "applicableUnits"
      ]
    },
    "Record<string,string|{quantity:string;denominations:string[];canonical?:string|undefined;inverted?:boolean|undefined;}>": {
      "type": "object"
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}