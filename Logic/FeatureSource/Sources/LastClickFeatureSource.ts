import LayoutConfig from "../../../Models/ThemeConfig/LayoutConfig"
import FeatureSource from "../FeatureSource"
import { ImmutableStore, Store } from "../../UIEventSource"
import { Feature, Point } from "geojson"
import { TagUtils } from "../../Tags/TagUtils"
import BaseUIElement from "../../../UI/BaseUIElement"
import { Utils } from "../../../Utils"
import { regex_not_newline_characters } from "svelte/types/compiler/utils/patterns"
import { render } from "sass"

/**
 * Highly specialized feature source.
 * Based on a lon/lat UIEVentSource, will generate the corresponding feature with the correct properties
 */
export class LastClickFeatureSource implements FeatureSource {
    features: Store<Feature[]>

    public properties: Record<string, string>
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

        const renderings = Utils.Dedup(
            allPresets.map((uiElem) => uiElem.ConstructElement().innerHTML)
        )

        const properties = {
            lastclick: "yes",
            id: "last_click",
            has_note_layer: layout.layers.some((l) => l.id === "note") ? "yes" : "no",
            has_presets: layout.layers.some((l) => l.presets?.length > 0) ? "yes" : "no",
            renderings: renderings.join(""),
            number_of_presets: "" + renderings.length,
            first_preset: renderings[0],
        }
        this.properties = properties
        this.features = location.mapD(({ lon, lat }) => [
            <Feature<Point>>{
                type: "Feature",
                properties,
                geometry: {
                    type: "Point",
                    coordinates: [lon, lat],
                },
            },
        ])
    }
}
