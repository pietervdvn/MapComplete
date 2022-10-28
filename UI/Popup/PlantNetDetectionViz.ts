import {Store, UIEventSource} from "../../Logic/UIEventSource";
import Toggle from "../Input/Toggle";
import Lazy from "../Base/Lazy";
import {ProvidedImage} from "../../Logic/ImageProviders/ImageProvider";
import PlantNetSpeciesSearch from "../BigComponents/PlantNetSpeciesSearch";
import Wikidata from "../../Logic/Web/Wikidata";
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction";
import {And} from "../../Logic/Tags/And";
import {Tag} from "../../Logic/Tags/Tag";
import {SubtleButton} from "../Base/SubtleButton";
import Combine from "../Base/Combine";
import Svg from "../../Svg";
import Translations from "../i18n/Translations";
import AllImageProviders from "../../Logic/ImageProviders/AllImageProviders";
import {SpecialVisualization} from "../SpecialVisualization";

export class PlantNetDetectionViz implements SpecialVisualization {
    funcName = "plantnet_detection"

    docs = "Sends the images linked to the current object to plantnet.org and asks it what plant species is shown on it. The user can then select the correct species; the corresponding wikidata-identifier will then be added to the object (together with `source:species:wikidata=plantnet.org AI`). "
    args = [
        {
            name: "image_key",
            defaultValue: AllImageProviders.defaultKeys.join(","),
            doc: "The keys given to the images, e.g. if <span class='literal-code'>image</span> is given, the first picture URL will be added as <span class='literal-code'>image</span>, the second as <span class='literal-code'>image:0</span>, the third as <span class='literal-code'>image:1</span>, etc... Multiple values are allowed if ';'-separated ",
        }
    ]

    public constr(state, tags, args) {
        let imagePrefixes: string[] = undefined
        if (args.length > 0) {
            imagePrefixes = [].concat(...args.map((a) => a.split(",")))
        }

        const detect = new UIEventSource(false)
        const toggle = new Toggle(
            new Lazy(() => {
                const allProvidedImages: Store<ProvidedImage[]> =
                    AllImageProviders.LoadImagesFor(tags, imagePrefixes)
                const allImages: Store<string[]> = allProvidedImages.map((pi) =>
                    pi.map((pi) => pi.url)
                )
                return new PlantNetSpeciesSearch(
                    allImages,
                    async (selectedWikidata) => {
                        selectedWikidata = Wikidata.ExtractKey(selectedWikidata)
                        const change = new ChangeTagAction(
                            tags.data.id,
                            new And([
                                new Tag("species:wikidata", selectedWikidata),
                                new Tag("source:species:wikidata", "PlantNet.org AI"),
                            ]),
                            tags.data,
                            {
                                theme: state.layoutToUse.id,
                                changeType: "plantnet-ai-detection",
                            }
                        )
                        await state.changes.applyAction(change)
                    }
                )
            }),
            new SubtleButton(
                undefined,
                "Detect plant species with plantnet.org"
            ).onClick(() => detect.setData(true)),
            detect
        )

        return new Combine([
            toggle,
            new Combine([
                Svg.plantnet_logo_svg().SetClass(
                    "w-10 h-10 p-1 mr-1 bg-white rounded-full"
                ),
                Translations.t.plantDetection.poweredByPlantnet,
            ]).SetClass("flex p-2 bg-gray-200 rounded-xl self-end"),
        ]).SetClass("flex flex-col")
    }
}
