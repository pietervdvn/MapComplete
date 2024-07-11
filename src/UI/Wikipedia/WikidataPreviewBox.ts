import { TypedTranslation } from "../i18n/Translation"
import Translations from "../i18n/Translations"
import Gender_male from "../../assets/svg/Gender_male.svelte"
import Gender_female from "../../assets/svg/Gender_female.svelte"
import Gender_inter from "../../assets/svg/Gender_inter.svelte"
import Gender_trans from "../../assets/svg/Gender_trans.svelte"
import Gender_queer from "../../assets/svg/Gender_queer.svelte"


export default class WikidataPreviewBox  {
    private static isHuman = [{ p: 31 /*is a*/, q: 5 /* human */ }]
    public static extraProperties: {
        requires?: { p: number; q?: number }[]
        property: string
        textMode?: Map<string, string>
        display:
            | TypedTranslation<{ value }>
            | Map<string, any>,
    }[] = [
        {
            requires: WikidataPreviewBox.isHuman,
            property: "P21",
            display: new Map([
                [
                    "Q6581097",
                    Gender_male
                ],
                [
                    "Q6581072",
                   Gender_female
                ],
                [
                    "Q1097630",
                    Gender_inter
                ],
                [
                    "Q1052281",
                  Gender_trans /*'transwomen'*/
                ],
                [
                    "Q2449503",
                  Gender_trans /*'transmen'*/
                ],
                [
                    "Q48270",
                    Gender_queer
                ]
            ]),
            textMode: new Map([
                ["Q6581097", "♂️"],
                ["Q6581072", "♀️"],
                ["Q1097630", "⚥️"],
                ["Q1052281", "🏳️‍⚧️" /*'transwomen'*/],
                ["Q2449503", "🏳️‍⚧️" /*'transmen'*/],
                ["Q48270", "🏳️‍🌈 ⚧"]
            ])
        },
        {
            property: "P569",
            requires: WikidataPreviewBox.isHuman,
            display: Translations.t.general.wikipedia.previewbox.born
        },
        {
            property: "P570",
            requires: WikidataPreviewBox.isHuman,
            display: Translations.t.general.wikipedia.previewbox.died
        }
    ]

}
