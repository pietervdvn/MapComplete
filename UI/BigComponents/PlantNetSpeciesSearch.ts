import { VariableUiElement } from "../Base/VariableUIElement"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import PlantNet from "../../Logic/Web/PlantNet"
import Loading from "../Base/Loading"
import Wikidata from "../../Logic/Web/Wikidata"
import WikidataPreviewBox from "../Wikipedia/WikidataPreviewBox"
import { Button } from "../Base/Button"
import Combine from "../Base/Combine"
import Title from "../Base/Title"
import Translations from "../i18n/Translations"
import List from "../Base/List"
import Svg from "../../Svg"

export default class PlantNetSpeciesSearch extends VariableUiElement {
    /***
     * Given images, queries plantnet to search a species matching those images.
     * A list of species will be presented to the user, after which they can confirm an item.
     * The wikidata-url is returned in the callback when the user selects one
     */
    constructor(images: Store<string[]>, onConfirm: (wikidataUrl: string) => Promise<void>) {
        const t = Translations.t.plantDetection
        super(
            images
                .bind((images) => {
                    if (images.length === 0) {
                        return null
                    }
                    return UIEventSource.FromPromiseWithErr(PlantNet.query(images.slice(0, 5)))
                })
                .map((result) => {
                    if (images.data.length === 0) {
                        return new Combine([
                            t.takeImages,
                            t.howTo.intro,
                            new List([t.howTo.li0, t.howTo.li1, t.howTo.li2, t.howTo.li3]),
                        ]).SetClass("flex flex-col")
                    }
                    if (result === undefined) {
                        return new Loading(t.querying.Subs(images.data))
                    }

                    if (result["error"] !== undefined) {
                        return t.error.Subs(<any>result).SetClass("alert")
                    }
                    console.log(result)
                    const success = result["success"]

                    const selectedSpecies = new UIEventSource<string>(undefined)
                    const speciesInformation = success.results
                        .filter((species) => species.score >= 0.005)
                        .map((species) => {
                            const wikidata = UIEventSource.FromPromise(
                                Wikidata.Sparql<{ species }>(
                                    ["?species", "?speciesLabel"],
                                    ['?species wdt:P846 "' + species.gbif.id + '"']
                                )
                            )

                            const confirmButton = new Button(t.seeInfo, async () => {
                                await selectedSpecies.setData(wikidata.data[0].species?.value)
                            }).SetClass("btn")

                            const match = t.matchPercentage
                                .Subs({ match: Math.round(species.score * 100) })
                                .SetClass("font-bold")

                            const extraItems = new Combine([match, confirmButton]).SetClass(
                                "flex flex-col"
                            )

                            return new WikidataPreviewBox(
                                wikidata.map((wd) =>
                                    wd == undefined ? undefined : wd[0]?.species?.value
                                ),
                                {
                                    whileLoading: new Loading(
                                        t.loadingWikidata.Subs({
                                            species: species.species.scientificNameWithoutAuthor,
                                        })
                                    ),
                                    extraItems: [new Combine([extraItems])],

                                    imageStyle: "max-width: 8rem; width: unset; height: 8rem",
                                }
                            ).SetClass("border-2 border-subtle rounded-xl block mb-2")
                        })
                    const plantOverview = new Combine([
                        new Title(t.overviewTitle),
                        t.overviewIntro,
                        t.overviewVerify.SetClass("font-bold"),
                        ...speciesInformation,
                    ]).SetClass("flex flex-col")

                    return new VariableUiElement(
                        selectedSpecies.map((wikidataSpecies) => {
                            if (wikidataSpecies === undefined) {
                                return plantOverview
                            }
                            return new Combine([
                                new Button(
                                    new Combine([
                                        Svg.back_svg().SetClass(
                                            "w-6 mr-1 bg-white rounded-full p-1"
                                        ),
                                        t.back,
                                    ]).SetClass("flex"),
                                    () => {
                                        selectedSpecies.setData(undefined)
                                    }
                                ).SetClass("btn btn-secondary"),

                                new Button(
                                    new Combine([
                                        Svg.confirm_svg().SetClass("w-6 mr-1"),
                                        t.confirm,
                                    ]).SetClass("flex"),
                                    () => {
                                        onConfirm(wikidataSpecies)
                                    }
                                ).SetClass("btn"),
                            ]).SetClass("flex justify-between")
                        })
                    )
                })
        )
    }
}
