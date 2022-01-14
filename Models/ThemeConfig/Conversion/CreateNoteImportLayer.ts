import {Conversion, DesugaringContext} from "./LegacyJsonConvert";
import LayerConfig from "../LayerConfig";
import {LayerConfigJson} from "../Json/LayerConfigJson";
import Translations from "../../../UI/i18n/Translations";
import {TagsFilter} from "../../../Logic/Tags/TagsFilter";
import {Tag} from "../../../Logic/Tags/Tag";
import {And} from "../../../Logic/Tags/And";

export default class CreateNoteImportLayer extends Conversion<LayerConfig, LayerConfigJson> {

    constructor() {
        super([
            "Advanced conversion which deducts a layer showing all notes that are 'importable' (i.e. a note that contains a link to some MapComplete theme, with hash '#import').",
            "The import buttons and matches will be based on the presets of the given theme",
        ].join("\n\n"), [])
    }

    convert(state: DesugaringContext, layer: LayerConfig, context: string): { result: LayerConfigJson; errors: string[]; warnings: string[] } {
        const errors = []
        const warnings = []
        const t = Translations.t.importLayer;
        
        const possibleTags: TagsFilter[] = layer.presets.map(p => new And(p.tags))
        
        const result : LayerConfigJson = {
            "id": "note_import_"+layer.id,
            "name": t.layerName.Subs({title: layer.title.render}).translations,
            "description": t.description.Subs({title: layer.title.render}).translations,
            "source": {
                "osmTags": {
                    "and": [
                        "id~*"
                    ]
                },
                "geoJson": "https://api.openstreetmap.org/api/0.6/notes.json?closed=0&bbox={x_min},{y_min},{x_max},{y_max}",
                "geoJsonZoomLevel": 12,
                "maxCacheAge": 0
            },
            "minzoom": 10,
            "title": {
                "render": t.popupTitle.Subs({title: layer.presets[0].title}).translations
            },
            "calculatedTags": [
                "_first_comment:=feat.get('comments')[0].text.toLowerCase()",
                "_trigger_index:=(() => {const lines = feat.properties['_first_comment'].split('\\n'); const matchesMapCompleteURL = lines.map(l => l.match(\".*https://mapcomplete.osm.be/\\([a-zA-Z_-]+\\)\\(.html\\).*#import\")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })()",
                "_intro:=(() => {const lines = feat.properties['_first_comment'].split('\\n'); lines.splice(feat.get('_trigger_index')-1, lines.length); return lines.map(l => l == '' ? '<br/>' : l).join('');})()",
                "_tags:=(() => {let lines = feat.properties['_first_comment'].split('\\n').map(l => l.trim()); lines.splice(0, feat.get('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})()"
            ],
            "isShown": {
                "render": "no",
                "mappings": [
                    {
                        "if": {and: 
                                ["_trigger_index~*",
                                    {or: possibleTags.map(tf => tf.AsJson())}
                                ]},
                        "then": "yes"
                    }
                ]
            },
            "titleIcons": [
                {
                    "render": "<a href='https://openstreetmap.org/note/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'></a>"
                }
            ],
            "tagRenderings": [
                {
                    "id": "conversation",
                    "render": "{visualize_note_comments(comments,1)}"
                },
                {
                    "id": "Intro",
                    "render": "{_intro}"
                },
                {
                    "id": "import",
                    "render": "{import_button(public_bookcase, _tags, There might be a public bookcase here,./assets/svg/addSmall.svg,,,id)}"
                },
                {
                    "id": "close_note_",
                    "render": "{close_note(Does not exist<br/>, ./assets/svg/close.svg, id, This feature does not exist)}"
                },
                {
                    "id": "close_note_mapped",
                    "render": "{close_note(Already mapped, ./assets/svg/checkmark.svg, id, Already mapped)}"
                },
                {
                    "id": "comment",
                    "render": "{add_note_comment()}"
                },
                {
                    "id": "add_image",
                    "render": "{add_image_to_note()}"
                }
            ],
            "mapRendering": [
                {
                    "location": [
                        "point",
                        "centroid"
                    ],
                    "icon": {
                        "render": "teardrop:#3333cc"
                    },
                    "iconSize": "40,40,bottom"
                }
            ]
        }
        
        
        return {
            result,
            errors, warnings
        };
    }


}