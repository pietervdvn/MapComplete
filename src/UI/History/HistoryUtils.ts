import * as all_layers from "../../assets/generated/themes/personal.json"
import ThemeConfig from "../../Models/ThemeConfig/ThemeConfig"
import { OsmObject } from "../../Logic/Osm/OsmObject"

export class HistoryUtils {

    private static personalTheme = new ThemeConfig(<any> all_layers, true)
    private static ignoredLayers = new Set<string>(["fixme"])
    public static determineLayer(properties: Record<string, string>){
        return this.personalTheme.getMatchingLayer(properties, this.ignoredLayers)
    }

    public static tagHistoryDiff(step: OsmObject, history: OsmObject[]): {
        key: string,
        value?: string,
        oldValue?: string
    }[] {
        const previous = history[step.version - 2]
        if (!previous) {
            return Object.keys(step.tags).filter(key => !key.startsWith("_") && key !== "id").map(key => ({
                key, value: step.tags[key]
            }))
        }
        const previousTags = previous.tags
        return Object.keys(step.tags).filter(key => !key.startsWith("_") )
            .map(key => {
                const value = step.tags[key]
                const oldValue = previousTags[key]
                return {
                    key, value, oldValue
                }
            }).filter(ch => ch.oldValue !== ch.value)
    }

}
