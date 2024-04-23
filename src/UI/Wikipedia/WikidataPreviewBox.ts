import { VariableUiElement } from "../Base/VariableUIElement"
import { Store } from "../../Logic/UIEventSource"
import Wikidata, { WikidataResponse } from "../../Logic/Web/Wikidata"
import { Translation, TypedTranslation } from "../i18n/Translation"
import { FixedUiElement } from "../Base/FixedUiElement"
import Loading from "../Base/Loading"
import Translations from "../i18n/Translations"
import Combine from "../Base/Combine"
import Img from "../Base/Img"
import { WikimediaImageProvider } from "../../Logic/ImageProviders/WikimediaImageProvider"
import Link from "../Base/Link"
import BaseUIElement from "../BaseUIElement"
import { Utils } from "../../Utils"
import SvelteUIElement from "../Base/SvelteUIElement"
import {default as Wikidata_icon} from "../../assets/svg/Wikidata.svelte"
import Gender_male from "../../assets/svg/Gender_male.svelte"
import Gender_female from "../../assets/svg/Gender_female.svelte"
import Gender_inter from "../../assets/svg/Gender_inter.svelte"
import Gender_trans from "../../assets/svg/Gender_trans.svelte"
import Gender_queer from "../../assets/svg/Gender_queer.svelte"

export default class WikidataPreviewBox extends VariableUiElement {
    private static isHuman = [{ p: 31 /*is a*/, q: 5 /* human */ }]
    // @ts-ignore
    private static extraProperties: {
        requires?: { p: number; q?: number }[]
        property: string
        display:
            | TypedTranslation<{ value }>
            | Map<string, string | (() => BaseUIElement) /*If translation: Subs({value: * })  */>
        textMode?: Map<string, string>
    }[] = [
        {
            requires: WikidataPreviewBox.isHuman,
            property: "P21",
            display: new Map([
                [
                    "Q6581097",
                    () => new SvelteUIElement(Gender_male).SetStyle("width: 1rem; height: auto"),
                ],
                [
                    "Q6581072",
                    () => new SvelteUIElement(Gender_female).SetStyle("width: 1rem; height: auto"),
                ],
                [
                    "Q1097630",
                    () => new SvelteUIElement(Gender_inter).SetStyle("width: 1rem; height: auto"),
                ],
                [
                    "Q1052281",
                    () =>
                        new SvelteUIElement(Gender_trans).SetStyle(
                            "width: 1rem; height: auto"
                        ) /*'transwomen'*/,
                ],
                [
                    "Q2449503",
                    () =>
                        new SvelteUIElement(Gender_trans).SetStyle(
                            "width: 1rem; height: auto"
                        ) /*'transmen'*/,
                ],
                [
                    "Q48270",
                    () => new SvelteUIElement(Gender_queer).SetStyle("width: 1rem; height: auto"),
                ],
            ]),
            textMode: new Map([
                ["Q6581097", "♂️"],
                ["Q6581072", "♀️"],
                ["Q1097630", "⚥️"],
                ["Q1052281", "🏳️‍⚧️" /*'transwomen'*/],
                ["Q2449503", "🏳️‍⚧️" /*'transmen'*/],
                ["Q48270", "🏳️‍🌈 ⚧"],
            ]),
        },
        {
            property: "P569",
            requires: WikidataPreviewBox.isHuman,
            display: Translations.t.general.wikipedia.previewbox.born,
        },
        {
            property: "P570",
            requires: WikidataPreviewBox.isHuman,
            display: Translations.t.general.wikipedia.previewbox.died,
        },
    ]

    constructor(
        wikidataId: Store<string>,
        options?: {
            noImages?: boolean
            imageStyle?: string
            whileLoading?: BaseUIElement | string
            extraItems?: (BaseUIElement | string)[]
        }
    ) {
        let inited = false
        const wikidata = wikidataId.stabilized(250).bind((id) => {
            if (id === undefined || id === "" || id === "Q") {
                return null
            }
            inited = true
            return Wikidata.LoadWikidataEntry(id)
        })

        super(
            wikidata.map((maybeWikidata) => {
                if (maybeWikidata === null || !inited) {
                    return options?.whileLoading
                }

                if (maybeWikidata === undefined) {
                    return new Loading(Translations.t.general.loading)
                }

                if (maybeWikidata["error"] !== undefined) {
                    return new FixedUiElement(maybeWikidata["error"]).SetClass("alert")
                }
                const wikidata = <WikidataResponse>maybeWikidata["success"]
                return WikidataPreviewBox.WikidataResponsePreview(wikidata, options)
            })
        )
    }

    public static WikidataResponsePreview(
        wikidata: WikidataResponse,
        options?: {
            noImages?: boolean
            imageStyle?: string
            extraItems?: (BaseUIElement | string)[]
        }
    ): BaseUIElement {
        const link = new Link(
            new Combine([
                wikidata.id,
                options?.noImages
                    ? wikidata.id
                    : new SvelteUIElement(Wikidata_icon)
                          .SetStyle("width: 2.5rem")
                          .SetClass("block"),
            ]).SetClass("flex"),
            Wikidata.IdToArticle(wikidata.id),
            true
        )?.SetClass("must-link")

        let info = new Combine([
            new Combine([
                Translation.fromMap(wikidata.labels)?.SetClass("font-bold"),
                link,
            ]).SetClass("flex justify-between flex-wrap-reverse"),
            Translation.fromMap(wikidata.descriptions),
            WikidataPreviewBox.QuickFacts(wikidata, options),
            ...(options?.extraItems ?? []),
        ]).SetClass("flex flex-col link-underline")

        let imageUrl = undefined
        if (wikidata.claims.get("P18")?.size > 0) {
            imageUrl = Array.from(wikidata.claims.get("P18"))[0]
        }
        if (imageUrl && !options?.noImages) {
            imageUrl = WikimediaImageProvider.singleton.PrepUrl(imageUrl).url
            info = new Combine([
                new Img(imageUrl)
                    .SetStyle(options?.imageStyle ?? "max-width: 5rem; width: unset; height: 4rem")
                    .SetClass("rounded-xl mr-2"),
                info.SetClass("w-full"),
            ]).SetClass("flex")
        }

        info.SetClass("p-2 w-full")

        return info
    }

    public static QuickFacts(
        wikidata: WikidataResponse,
        options?: { noImages?: boolean }
    ): BaseUIElement {
        const els: BaseUIElement[] = []
        for (const extraProperty of WikidataPreviewBox.extraProperties) {
            let hasAllRequirements = true
            for (const requirement of extraProperty.requires) {
                if (!wikidata.claims?.has("P" + requirement.p)) {
                    hasAllRequirements = false
                    break
                }
                if (!wikidata.claims?.get("P" + requirement.p).has("Q" + requirement.q)) {
                    hasAllRequirements = false
                    break
                }
            }
            if (!hasAllRequirements) {
                continue
            }

            const key = extraProperty.property
            const display =
                (options?.noImages ? extraProperty.textMode : extraProperty.display) ??
                extraProperty.display
            if (wikidata.claims?.get(key) === undefined) {
                continue
            }
            const value: string[] = Array.from(wikidata.claims.get(key))

            if (display instanceof Translation) {
                els.push(display.Subs({ value: value.join(", ") }).SetClass("m-2"))
                continue
            }
            const constructors = Utils.NoNull(value.map((property) => display.get(property)))
            const elems = constructors.map((v) => {
                if (typeof v === "string") {
                    return new FixedUiElement(v)
                } else {
                    return v()
                }
            })
            els.push(new Combine(elems).SetClass("flex m-2"))
        }
        if (els.length === 0) {
            return undefined
        }

        return new Combine(els).SetClass("flex")
    }
}
