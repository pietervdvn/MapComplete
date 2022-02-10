import {Conversion} from "./Conversion";
import LayerConfig from "../LayerConfig";
import {LayerConfigJson} from "../Json/LayerConfigJson";
import Translations from "../../../UI/i18n/Translations";
import PointRenderingConfigJson from "../Json/PointRenderingConfigJson";
import {Translation} from "../../../UI/i18n/Translation";

export default class CreateNoteImportLayer extends Conversion<LayerConfigJson, LayerConfigJson> {
    /**
     * A closed note is included if it is less then 'n'-days closed
     * @private
     */
    private readonly _includeClosedNotesDays: number;

    constructor(includeClosedNotesDays = 0) {
        super([
            "Advanced conversion which deducts a layer showing all notes that are 'importable' (i.e. a note that contains a link to some MapComplete theme, with hash '#import').",
            "The import buttons and matches will be based on the presets of the given theme",
        ].join("\n\n"), [])
        this._includeClosedNotesDays = includeClosedNotesDays;
    }

    convert(layerJson: LayerConfigJson, context: string): { result: LayerConfigJson } {
        const t = Translations.t.importLayer;

        /**
         * The note itself will contain `tags=k=v;k=v;k=v;...
         * This must be matched with a regex.
         * This is a simple JSON-object as how it'll be put into the layerConfigJson directly
         */
        const isShownIfAny: any[] = []
        const layer = new LayerConfig(layerJson, "while constructing a note-import layer")
        for (const preset of layer.presets) {
            const mustMatchAll = []
            for (const tag of preset.tags) {
                const key = tag.key
                const value = tag.value
                const condition = "_tags~(^|.*;)" + key + "\=" + value + "($|;.*)"
                mustMatchAll.push(condition)
            }
            isShownIfAny.push({and: mustMatchAll})
        }

        const pointRenderings = (layerJson.mapRendering ?? []).filter(r => r !== null && r["location"] !== undefined);
        const firstRender = <PointRenderingConfigJson>(pointRenderings [0])
        if(firstRender === undefined){
            throw `Layer ${layerJson.id} does not have a pointRendering: `+context
        }
        const icon = firstRender.icon
        const iconBadges = []
        const title = layer.presets[0].title
        if (icon !== undefined) {
            iconBadges.push({
                if: {and: []},
                then: icon
            })
        }

        const importButton = {}
        {
            const translations = t.importButton.Subs({layerId: layer.id, title: layer.presets[0].title}).translations
            for (const key in translations) {
                importButton[key] = "{" + translations[key] + "}"
            }
        }

        function embed(prefix, translation: Translation, postfix) {
            const result = {}
            for (const language in translation.translations) {
                result[language] = prefix + translation.translations[language] + postfix
            }
            return result
        }

        const result: LayerConfigJson = {
            "id": "note_import_" + layer.id,
            // By disabling the name, the import-layers won't pollute the filter view "name": t.layerName.Subs({title: layer.title.render}).translations,
            "description": t.description.Subs({title: layer.title.render}).translations,
            "source": {
                "osmTags": {
                    "and": [
                        "id~*"
                    ]
                },
                "geoJson": "https://api.openstreetmap.org/api/0.6/notes.json?limit=10000&closed=" + this._includeClosedNotesDays + "&bbox={x_min},{y_min},{x_max},{y_max}",
                "geoJsonZoomLevel": 10,
                "maxCacheAge": 0
            },
            "minzoom": Math.min(12, layerJson.minzoom - 2),
            "title": {
                "render": t.popupTitle.Subs({title}).translations
            },
            "calculatedTags": [
                "_first_comment=feat.get('comments')[0].text.toLowerCase()",
                "_trigger_index=(() => {const lines = feat.properties['_first_comment'].split('\\n'); const matchesMapCompleteURL = lines.map(l => l.match(\".*https://mapcomplete.osm.be/\\([a-zA-Z_-]+\\)\\(.html\\)?.*#import\")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })()",
                "_comments_count=feat.get('comments').length",
                "_intro=(() => {const lines = feat.get('comments')[0].text.split('\\n'); lines.splice(feat.get('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})()",
                "_tags=(() => {let lines = feat.properties['_first_comment'].split('\\n').map(l => l.trim()); lines.splice(0, feat.get('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})()"
            ],
            "isShown": {
                "render": "no",
                "mappings": [
                    {
                        "if": "comments!~.*https://mapcomplete.osm.be.*",
                        "then": "no"
                    },
                    {
                        "if": {
                            and:
                                ["_trigger_index~*",
                                    {or: isShownIfAny}
                                ]
                        },
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
                    "id": "Intro",
                    "render": "{_intro}"
                },
                {
                    "id": "conversation",
                    "render": "{visualize_note_comments(comments,1)}",
                    condition: "_comments_count>1"
                },
                {
                    "id": "import",
                    "render": importButton,
                    condition: "closed_at="
                },
                {
                    "id": "close_note_",
                    "render": embed(
                        "{close_note(", t.notFound.Subs({title}), ", ./assets/svg/close.svg, id, This feature does not exist)}"),
                    condition: "closed_at="
                },
                {
                    "id": "close_note_mapped",
                    "render": embed("{close_note(", t.alreadyMapped.Subs({title}), ", ./assets/svg/checkmark.svg, id, Already mapped)}"),
                    condition: "closed_at="
                },
                {
                    "id": "handled",
                    "render": t.importHandled.translations,
                    condition: "closed_at~*"
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
                        "point"
                    ],
                    "icon": {
                        "render": "circle:white;help:black",
                        mappings: [{
                            if: {or: ["closed_at~*", "_imported=yes"]},
                            then: "circle:white;checkmark:black"
                        }]
                    },
                    iconBadges,
                    "iconSize": "40,40,center"
                }
            ]
        }


        return {
            result
        };
    }


}