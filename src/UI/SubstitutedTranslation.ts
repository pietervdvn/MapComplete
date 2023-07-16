import { UIEventSource } from "../Logic/UIEventSource"
import { Translation } from "./i18n/Translation"
import Locale from "./i18n/Locale"
import { FixedUiElement } from "./Base/FixedUiElement"
import { Utils } from "../Utils"
import { VariableUiElement } from "./Base/VariableUIElement"
import Combine from "./Base/Combine"
import BaseUIElement from "./BaseUIElement"
import LinkToWeblate from "./Base/LinkToWeblate"
import { SpecialVisualization, SpecialVisualizationState } from "./SpecialVisualization"
import SpecialVisualizations from "./SpecialVisualizations"
import { Feature } from "geojson"
import LayerConfig from "../Models/ThemeConfig/LayerConfig"

export class SubstitutedTranslation extends VariableUiElement {
    public constructor(
        translation: Translation,
        tagsSource: UIEventSource<Record<string, string>>,
        state: SpecialVisualizationState,
        mapping: Map<
            string,
            | BaseUIElement
            | ((
                  state: SpecialVisualizationState,
                  tagSource: UIEventSource<Record<string, string>>,
                  argument: string[],
                  feature: Feature,
                  layer: LayerConfig
              ) => BaseUIElement)
        > = undefined
    ) {
        const extraMappings: SpecialVisualization[] = []

        mapping?.forEach((value, key) => {
            extraMappings.push({
                funcName: key,
                constr: typeof value === "function" ? value : () => value,
                docs: "Dynamically injected input element",
                args: [],
                example: "",
            })
        })

        const linkToWeblate =
            translation !== undefined
                ? new LinkToWeblate(translation.context, translation.translations)
                : undefined

        super(
            Locale.language.map((language) => {
                let txt = translation?.textFor(language)
                if (txt === undefined) {
                    return undefined
                }
                mapping?.forEach((_, key) => {
                    txt = txt.replace(new RegExp(`{${key}}`, "g"), `{${key}()}`)
                })

                const allElements = SpecialVisualizations.constructSpecification(
                    txt,
                    extraMappings
                ).map((proto) => {
                    if (typeof proto === "string") {
                        if (tagsSource === undefined) {
                            return Utils.SubstituteKeys(proto, undefined)
                        }
                        return new VariableUiElement(
                            tagsSource.map((tags) => Utils.SubstituteKeys(proto, tags))
                        )
                    }
                    const viz: {
                        func: SpecialVisualization
                        args: string[]
                        style: string
                    } = proto
                    if (viz === undefined) {
                        console.error(
                            "SPECIALRENDERING UNDEFINED for",
                            tagsSource.data?.id,
                            "THIS IS REALLY WEIRD"
                        )
                        return undefined
                    }
                    try {
                        const feature = state.indexedFeatures.featuresById.data.get(
                            tagsSource.data.id
                        )
                        return viz.func
                            .constr(
                                state,
                                tagsSource,
                                proto.args.map((t) => SpecialVisualizations.undoEncoding(t)),
                                feature,
                                undefined
                            )
                            ?.SetStyle(proto.style)
                    } catch (e) {
                        console.error("SPECIALRENDERING FAILED for", tagsSource.data?.id, e)
                        return new FixedUiElement(
                            `Could not generate special rendering for ${
                                viz.func.funcName
                            }(${viz.args.join(", ")}) ${e}`
                        ).SetStyle("alert")
                    }
                })
                allElements.push(linkToWeblate)

                return new Combine(allElements)
            })
        )

        this.SetClass("w-full")
    }
}
