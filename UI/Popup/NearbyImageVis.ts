import FeaturePipelineState from "../../Logic/State/FeaturePipelineState";
import {UIEventSource} from "../../Logic/UIEventSource";
import {DefaultGuiState} from "../DefaultGuiState";
import BaseUIElement from "../BaseUIElement";
import Translations from "../i18n/Translations";
import {GeoOperations} from "../../Logic/GeoOperations";
import NearbyImages, {NearbyImageOptions, P4CPicture, SelectOneNearbyImage} from "./NearbyImages";
import {SubstitutedTranslation} from "../SubstitutedTranslation";
import {Tag} from "../../Logic/Tags/Tag";
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction";
import {And} from "../../Logic/Tags/And";
import {SaveButton} from "./SaveButton";
import Lazy from "../Base/Lazy";
import {CheckBox} from "../Input/Checkboxes";
import Slider from "../Input/Slider";
import AllImageProviders from "../../Logic/ImageProviders/AllImageProviders";
import Combine from "../Base/Combine";
import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";
import Title from "../Base/Title";
import {MapillaryLinkVis} from "./MapillaryLinkVis";
import {SpecialVisualization} from "../SpecialVisualization";

export class NearbyImageVis implements SpecialVisualization {
    args: { name: string; defaultValue?: string; doc: string; required?: boolean }[] = [
        {
            name: "mode",
            defaultValue: "expandable",
            doc: "Indicates how this component is initialized. Options are: \n\n- `open`: always show and load the pictures\n- `collapsable`: show the pictures, but a user can collapse them\n- `expandable`: shown by default; but a user can collapse them.",
        },
        {
            name: "mapillary",
            defaultValue: "true",
            doc: "If 'true', includes a link to mapillary on this location.",
        },
    ]
    docs =
        "A component showing nearby images loaded from various online services such as Mapillary. In edit mode and when used on a feature, the user can select an image to add to the feature"
    funcName = "nearby_images"

    constr(
        state: FeaturePipelineState,
        tagSource: UIEventSource<any>,
        args: string[],
        guistate: DefaultGuiState
    ): BaseUIElement {
        const t = Translations.t.image.nearbyPictures
        const mode: "open" | "expandable" | "collapsable" = <any>args[0]
        const feature = state.allElements.ContainingFeatures.get(tagSource.data.id)
        const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
        const id: string = tagSource.data["id"]
        const canBeEdited: boolean = !!id?.match("(node|way|relation)/-?[0-9]+")
        const selectedImage = new UIEventSource<P4CPicture>(undefined)

        let saveButton: BaseUIElement = undefined
        if (canBeEdited) {
            const confirmText: BaseUIElement = new SubstitutedTranslation(
                t.confirm,
                tagSource,
                state
            )

            const onSave = async () => {
                console.log("Selected a picture...", selectedImage.data)
                const osmTags = selectedImage.data.osmTags
                const tags: Tag[] = []
                for (const key in osmTags) {
                    tags.push(new Tag(key, osmTags[key]))
                }
                await state?.changes?.applyAction(
                    new ChangeTagAction(id, new And(tags), tagSource.data, {
                        theme: state?.layoutToUse.id,
                        changeType: "link-image",
                    })
                )
            }
            saveButton = new SaveButton(
                selectedImage,
                state.osmConnection,
                confirmText,
                t.noImageSelected
            )
                .onClick(onSave)
                .SetClass("flex justify-end")
        }

        const nearby = new Lazy(() => {
            const towardsCenter = new CheckBox(t.onlyTowards, false)

            const radiusValue =
                state?.osmConnection?.GetPreference("nearby-images-radius", "300").sync(
                    (s) => Number(s),
                    [],
                    (i) => "" + i
                ) ?? new UIEventSource(300)

            const radius = new Slider(25, 500, {
                value: radiusValue,
                step: 25,
            })
            const alreadyInTheImage = AllImageProviders.LoadImagesFor(tagSource)
            const options: NearbyImageOptions & { value } = {
                lon,
                lat,
                searchRadius: 500,
                shownRadius: radius.GetValue(),
                value: selectedImage,
                blacklist: alreadyInTheImage,
                towardscenter: towardsCenter.GetValue(),
                maxDaysOld: 365 * 5,
            }
            const slideshow = canBeEdited
                ? new SelectOneNearbyImage(options, state)
                : new NearbyImages(options, state)
            const controls = new Combine([
                towardsCenter,
                new Combine([
                    new VariableUiElement(
                        radius.GetValue().map((radius) => t.withinRadius.Subs({radius}))
                    ),
                    radius,
                ]).SetClass("flex justify-between"),
            ]).SetClass("flex flex-col")
            return new Combine([
                slideshow,
                controls,
                saveButton,
                new MapillaryLinkVis().constr(state, tagSource, []).SetClass("mt-6"),
            ])
        })

        let withEdit: BaseUIElement = nearby
        if (canBeEdited) {
            withEdit = new Combine([t.hasMatchingPicture, nearby]).SetClass("flex flex-col")
        }

        if (mode === "open") {
            return withEdit
        }
        const toggleState = new UIEventSource<boolean>(mode === "collapsable")
        return new Toggle(
            new Combine([new Title(t.title), withEdit]),
            new Title(t.browseNearby).onClick(() => toggleState.setData(true)),
            toggleState
        )
    }
}
