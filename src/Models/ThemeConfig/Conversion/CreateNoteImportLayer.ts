import { Conversion } from "./Conversion"
import LayerConfig from "../LayerConfig"
import { LayerConfigJson } from "../Json/LayerConfigJson"
import Translations from "../../../UI/i18n/Translations"
import { Translation, TypedTranslation } from "../../../UI/i18n/Translation"
import { ConversionContext } from "./ConversionContext"

export default class CreateNoteImportLayer extends Conversion<LayerConfigJson, LayerConfigJson> {
    /**
     * A closed note is included if it is less then 'n'-days closed
     * @private
     */
    private readonly _includeClosedNotesDays: number

    constructor(includeClosedNotesDays = 0) {
        super(
            [
                "Advanced conversion which deducts a layer showing all notes that are 'importable' (i.e. a note that contains a link to some MapComplete theme, with hash '#import').",
                "The import buttons and matches will be based on the presets of the given theme",
            ].join("\n\n"),
            [],
            "CreateNoteImportLayer"
        )
        this._includeClosedNotesDays = includeClosedNotesDays
    }

    convert(layerJson: LayerConfigJson, _: ConversionContext): LayerConfigJson {
        const t = Translations.t.importLayer

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
                const condition = "_tags~(^|.*;)" + key + "=" + value + "($|;.*)"
                mustMatchAll.push(condition)
            }
            isShownIfAny.push({ and: mustMatchAll })
        }

        const title = layer.presets[0].title

        const importButton = {}
        {
            const translations = trs(t.importButton, {
                layerId: layer.id,
                title: layer.presets[0].title,
            })
            for (const key in translations) {
                if (key !== "_context") {
                    importButton[key] = "{" + translations[key] + "}"
                } else {
                    importButton[key] = translations[key]
                }
            }
        }

        function embed(prefix, translation: Translation, postfix) {
            const result = {}
            for (const language in translation.translations) {
                result[language] = prefix + translation.translations[language] + postfix
            }
            result["_context"] = translation.context
            return result
        }

        function tr(translation: Translation) {
            return { ...translation.translations, _context: translation.context }
        }

        function trs<T>(translation: TypedTranslation<T>, subs: T): Record<string, string> {
            return { ...translation.Subs(subs).translations, _context: translation.context }
        }

        return {
            id: "note_import_" + layer.id,
            // By disabling the name, the import-layers won't pollute the filter view "name": t.layerName.Subs({title: layer.title.render}).translations,
            description: trs(t.description, { title: layer.title.render }),
            source: {
                osmTags: {
                    and: ["id~[0-9]+", "comment_url~.*notes/[0-9]*/comment.json"],
                },
                geoJson:
                    "https://api.openstreetmap.org/api/0.6/notes.json?limit=10000&closed=" +
                    this._includeClosedNotesDays +
                    "&bbox={x_min},{y_min},{x_max},{y_max}",
                geoJsonZoomLevel: 10,
            },
            /* We need to set 'pass_all_features'
       There are probably many note_import-layers, and we don't want the first one to gobble up all notes and then discard them...
       */
            passAllFeatures: true,
            minzoom: Math.min(12, layerJson.minzoom - 2),
            title: {
                render: trs(t.popupTitle, { title }),
            },
            calculatedTags: [
                "_first_comment=get(feat)('comments')[0].text.toLowerCase()",
                "_trigger_index=(() => {const lines = feat.properties['_first_comment'].split('\\n'); const matchesMapCompleteURL = lines.map(l => l.match(\".*https://mapcomplete.\\(org|osm.be\\)/\\([a-zA-Z_-]+\\)\\(.html\\)?.*#import\")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })()",
                "_comments_count=get(feat)('comments').length",
                "_intro=(() => {const lines = get(feat)('comments')[0].text.split('\\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})()",
                "_tags=(() => {let lines = get(feat)('comments')[0].text.split('\\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})()",
            ],
            isShown: {
                and: ["_trigger_index~*", { or: isShownIfAny }],
            },
            titleIcons: [
                {
                    render: "<a href='https://openstreetmap.org/note/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'></a>",
                },
            ],
            tagRenderings: [
                {
                    id: "Intro",
                    render: "{_intro}",
                },
                {
                    id: "conversation",
                    render: "{visualize_note_comments(comments,1)}",
                    condition: "_comments_count>1",
                },
                {
                    id: "import",
                    render: importButton,
                    condition: "closed_at=",
                },
                {
                    id: "close_note_",
                    render: embed(
                        "{close_note(",
                        t.notFound.Subs({ title }),
                        ", ./assets/svg/close.svg, id, This feature does not exist, 18)}"
                    ),
                    condition: "closed_at=",
                },
                {
                    id: "close_note_mapped",
                    render: embed(
                        "{close_note(",
                        t.alreadyMapped.Subs({ title }),
                        ", ./assets/svg/duplicate.svg, id, Already mapped, 18)}"
                    ),
                    condition: "closed_at=",
                },
                {
                    id: "handled",
                    render: tr(t.importHandled),
                    condition: "closed_at~*",
                },
                {
                    id: "comment",
                    render: "{add_note_comment()}",
                },
                {
                    id: "add_image",
                    render: "{add_image_to_note()}",
                },
                {
                    id: "nearby_images",
                    render: tr(t.nearbyImagesIntro),
                },
                {
                    id: "all_tags",
                    render: "{all_tags()}",
                    metacondition: {
                        or: [
                            "__featureSwitchIsDebugging=true",
                            "mapcomplete-show_tags=full",
                            "mapcomplete-show_debug=yes",
                        ],
                    },
                },
            ],
            pointRendering: [
                {
                    location: ["point"],
                    marker: [
                        {
                            icon: "circle",
                            color: "#fff",
                        },
                        {
                            icon: {
                                render: "help",
                                mappings: [
                                    {
                                        if: { or: ["closed_at~*", "_imported=yes"] },
                                        then: "checkmark",
                                    },
                                ],
                            },
                            color: "#00",
                        },
                    ],
                    iconSize: "40,40",
                    anchor: "center",
                },
            ],
        }
    }
}
