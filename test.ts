import PlantNet from "./Logic/Web/PlantNet";
import {UIEventSource} from "./Logic/UIEventSource";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import List from "./UI/Base/List";
import Combine from "./UI/Base/Combine";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import Wikidata from "./Logic/Web/Wikidata";
import WikidataPreviewBox from "./UI/Wikipedia/WikidataPreviewBox";
import Loading from "./UI/Base/Loading";

function build(images: UIEventSource<string[]>) {
    return new VariableUiElement(images
        .bind(images => {
            if (images.length === 0) {
                return null
            }
            return new UIEventSource({success: PlantNet.exampleResultPrunus}) /*/ UIEventSource.FromPromiseWithErr(PlantNet.query(images.slice(0,5))); //*/
        })
        .map(result => {
                if (result === undefined) {
                    return new Loading()
                }
                if (result === null) {
                    return "Take images of the tree to automatically detect the tree type"
                }
                if (result["error"] !== undefined) {
                    return result["error"]
                }
                console.log(result)
                const success = result["success"]
                return new Combine(success.results
                    .filter(species => species.score >= 0.005)
                    .map(species => {
                            const wikidata = UIEventSource.FromPromise(Wikidata.Sparql<{ species }>(["?species", "?speciesLabel"],
                                ["?species wdt:P846 \"" + species.gbif.id + "\""]));

                            return new WikidataPreviewBox(wikidata.map(wd => wd == undefined ? undefined : wd[0]?.species?.value),
                                {
                                    whileLoading: new Loading("Loading information about " + species.species.scientificNameWithoutAuthor),
                                    extraItems: [Math.round(species.score * 100) + "% match"]
                                })
                                .SetClass("border-2 border-subtle rounded-xl block mb-2")
                        }
                    )).SetClass("flex flex-col")
            }
        ))


}

const images = ["https://i.imgur.com/VJp1qG1.jpg"]

build(new UIEventSource(images)).AttachTo("maindiv")