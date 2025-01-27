import { SpecialVisualizationState, SpecialVisualizationSvelte } from "../SpecialVisualization"
import { UIEventSource } from "../../Logic/UIEventSource"
import { Feature } from "geojson"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import SvelteUIElement from "../Base/SvelteUIElement"
import MarkAsFavourite from "../Popup/MarkAsFavourite.svelte"
import MarkAsFavouriteMini from "../Popup/MarkAsFavouriteMini.svelte"

export class FavouriteVisualisations {
    public static initList(): SpecialVisualizationSvelte[] {
        return [{
            funcName: "favourite_status",

            docs: "A button that allows a (logged in) contributor to mark a location as a favourite location",
            args: [],
            group: "favourites",
            constr(
                state: SpecialVisualizationState,
                tagSource: UIEventSource<Record<string, string>>,
                argument: string[],
                feature: Feature,
                layer: LayerConfig
            ): SvelteUIElement {
                return new SvelteUIElement(MarkAsFavourite, {
                    tags: tagSource,
                    state,
                    layer,
                    feature
                })
            }
        },
            {
                funcName: "favourite_icon",
                group: "favourites",
                docs: "A small button that allows a (logged in) contributor to mark a location as a favourite location, sized to fit a title-icon",
                args: [],
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): SvelteUIElement {
                    return new SvelteUIElement(MarkAsFavouriteMini, {
                        tags: tagSource,
                        state,
                        layer,
                        feature
                    })
                }
            }]
    }
}
