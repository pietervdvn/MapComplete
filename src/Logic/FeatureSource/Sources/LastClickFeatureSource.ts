import LayoutConfig from "../../../Models/ThemeConfig/LayoutConfig"
import { WritableFeatureSource } from "../FeatureSource"
import { ImmutableStore, Store, UIEventSource } from "../../UIEventSource"
import { Feature, Point } from "geojson"
import { TagUtils } from "../../Tags/TagUtils"
import BaseUIElement from "../../../UI/BaseUIElement"
import { Utils } from "../../../Utils"

/**
 * Highly specialized feature source.
 * Based on a lon/lat UIEVentSource, will generate the corresponding feature with the correct properties
 */
export class LastClickFeatureSource implements WritableFeatureSource {
    public readonly features: UIEventSource<Feature[]> = new UIEventSource<Feature[]>([])

    private i: number = 0
    private readonly renderings: string[]
    private readonly has_note_layer: string
    private readonly has_presets: string

    constructor(location: Store<{ lon: number; lat: number }>, layout: LayoutConfig) {
        const allPresets: BaseUIElement[] = []
        for (const layer of layout.layers)
            for (let i = 0; i < (layer.presets ?? []).length; i++) {
                const preset = layer.presets[i]
                const tags = new ImmutableStore(TagUtils.KVtoProperties(preset.tags))
                const { html } = layer.mapRendering[0].RenderIcon(tags, false, {
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

        this.has_note_layer = layout.layers.some((l) => l.id === "note") ? "yes" : "no"

        this.has_presets = layout.layers.some((l) => l.presets?.length > 0) ? "yes" : "no"

        location.addCallbackAndRunD(({ lon, lat }) => {
            this.features.setData([this.createFeature(lon, lat)])
        })
    }

    public createFeature(lon: number, lat: number): Feature<Point> {
        const properties = {
            lastclick: "yes",
            id: "last_click_" + this.i,
            has_note_layer: this.has_note_layer,
            has_presets: this.has_presets,
            renderings: this.renderings.join(""),
            number_of_presets: "" + this.renderings.length,
            first_preset: this.renderings[0],
        }
        this.i++
        return <Feature<Point>>{
            type: "Feature",
            properties,
            geometry: {
                type: "Point",
                coordinates: [lon, lat],
            },
        }
    }
}
