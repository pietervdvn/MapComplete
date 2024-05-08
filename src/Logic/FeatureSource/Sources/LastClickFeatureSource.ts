import LayoutConfig from "../../../Models/ThemeConfig/LayoutConfig"
import { WritableFeatureSource } from "../FeatureSource"
import { ImmutableStore, Store, UIEventSource } from "../../UIEventSource"
import { Feature, Point } from "geojson"
import { TagUtils } from "../../Tags/TagUtils"
import BaseUIElement from "../../../UI/BaseUIElement"
import { Utils } from "../../../Utils"
import { OsmTags } from "../../../Models/OsmFeature"

/**
 * Highly specialized feature source.
 * Based on a lon/lat UIEVentSource, will generate the corresponding feature with the correct properties
 */
export class LastClickFeatureSource {
    public readonly renderings: string[]
    private i: number = 0
    private readonly hasPresets: boolean
    private readonly hasNoteLayer: boolean
    public static readonly newPointElementId=  "new_point_dialog"

    constructor(layout: LayoutConfig) {
        this.hasNoteLayer = layout.hasNoteLayer()
        this.hasPresets = layout.hasPresets()
        const allPresets: BaseUIElement[] = []
        for (const layer of layout.layers)
            for (let i = 0; i < (layer.presets ?? []).length; i++) {
                const preset = layer.presets[i]
                const tags = new ImmutableStore(TagUtils.KVtoProperties(preset.tags))
                const rendering = layer.mapRendering[0]
                if (!rendering) {
                    console.error("NO rendering for preset", layer.id)
                    continue
                }
                const { html } = rendering.RenderIcon(tags, {
                    noSize: true,
                    includeBadges: false,
                })
                allPresets.push(html)
            }

        this.renderings = Utils.Dedup(
            allPresets.map((uiElem) =>
                Utils.runningFromConsole ? "" : uiElem.ConstructElement().innerHTML
            )
        )
    }

    public createFeature(lon: number, lat: number): Feature<Point, OsmTags> {
        const properties: OsmTags = {
            id: LastClickFeatureSource.newPointElementId,
            has_note_layer: this.hasNoteLayer ? "yes" : "no",
            has_presets: this.hasPresets ? "yes" : "no",
            renderings: this.renderings.join(""),
            number_of_presets: "" + this.renderings.length,
            first_preset: this.renderings[0],
        }
        this.i++

        return <Feature<Point, OsmTags>>{
            type: "Feature",
            properties,
            geometry: {
                type: "Point",
                coordinates: [lon, lat],
            },
        }
    }
}
