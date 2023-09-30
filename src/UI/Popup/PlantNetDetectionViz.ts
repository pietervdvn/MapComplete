import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
import Wikidata from "../../Logic/Web/Wikidata"
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
import { And } from "../../Logic/Tags/And"
import { Tag } from "../../Logic/Tags/Tag"
import AllImageProviders from "../../Logic/ImageProviders/AllImageProviders"
import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import SvelteUIElement from "../Base/SvelteUIElement"
import PlantNet from "../PlantNet/PlantNet.svelte"
import { default as PlantNetCode } from "../../Logic/Web/PlantNet"
export class PlantNetDetectionViz implements SpecialVisualization {
    funcName = "plantnet_detection"
    needsUrls = [PlantNetCode.baseUrl]

    docs =
        "Sends the images linked to the current object to plantnet.org and asks it what plant species is shown on it. The user can then select the correct species; the corresponding wikidata-identifier will then be added to the object (together with `source:species:wikidata=plantnet.org AI`). "
    args = [
        {
            name: "image_key",
            defaultValue: AllImageProviders.defaultKeys.join(","),
            doc: "The keys given to the images, e.g. if <span class='literal-code'>image</span> is given, the first picture URL will be added as <span class='literal-code'>image</span>, the second as <span class='literal-code'>image:0</span>, the third as <span class='literal-code'>image:1</span>, etc... Multiple values are allowed if ';'-separated ",
        },
    ]

    public constr(
        state: SpecialVisualizationState,
        tags: UIEventSource<Record<string, string>>,
        args: string[]
    ) {
        let imagePrefixes: string[] = undefined
        if (args.length > 0) {
            imagePrefixes = [].concat(...args.map((a) => a.split(",")))
        }

        const allProvidedImages: Store<ProvidedImage[]> = AllImageProviders.LoadImagesFor(
            tags,
            imagePrefixes
        )
        const imageUrls: Store<string[]> = allProvidedImages.map((pi) => pi.map((pi) => pi.url))

        async function applySpecies(selectedWikidata) {
            selectedWikidata = Wikidata.ExtractKey(selectedWikidata)
            const change = new ChangeTagAction(
                tags.data.id,
                new And([
                    new Tag("species:wikidata", selectedWikidata),
                    new Tag("source:species:wikidata", "PlantNet.org AI"),
                ]),
                tags.data,
                {
                    theme: state.layout.id,
                    changeType: "plantnet-ai-detection",
                }
            )
            await state.changes.applyAction(change)
        }

        return new SvelteUIElement(PlantNet, { imageUrls, onConfirm: applySpecies })
    }
}
