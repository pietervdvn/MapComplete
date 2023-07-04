// SPDX-FileCopyrightText: 2023 MapComplete  <https://mapcomplete.osm.be/>
//
// SPDX-License-Identifier: GPL-3.0-ONLY

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
            allPresets.map((uiElem) =>
                Utils.runningFromConsole ? "" : uiElem.ConstructElement().innerHTML
            )
        )

        let i = 0

        location.addCallbackAndRunD(({ lon, lat }) => {
            const properties = {
                lastclick: "yes",
                id: "last_click_" + i,
                has_note_layer: layout.layers.some((l) => l.id === "note") ? "yes" : "no",
                has_presets: layout.layers.some((l) => l.presets?.length > 0) ? "yes" : "no",
                renderings: renderings.join(""),
                number_of_presets: "" + renderings.length,
                first_preset: renderings[0],
            }
            i++

            const point = <Feature<Point>>{
                type: "Feature",
                properties,
                geometry: {
                    type: "Point",
                    coordinates: [lon, lat],
                },
            }
            this.features.setData([point])
        })
    }
}
