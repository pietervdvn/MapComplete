import { UIEventSource } from "../../Logic/UIEventSource"
import BaseUIElement from "../BaseUIElement"
import Translations from "../i18n/Translations"
import { GeoOperations } from "../../Logic/GeoOperations"
import NearbyImages, { NearbyImageOptions, P4CPicture, SelectOneNearbyImage } from "./NearbyImages"
import { SubstitutedTranslation } from "../SubstitutedTranslation"
import { Tag } from "../../Logic/Tags/Tag"
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
import { And } from "../../Logic/Tags/And"
import { SaveButton } from "./SaveButton"
import Lazy from "../Base/Lazy"
import { CheckBox } from "../Input/Checkboxes"
import Slider from "../Input/Slider"
import AllImageProviders from "../../Logic/ImageProviders/AllImageProviders"
import Combine from "../Base/Combine"
import { VariableUiElement } from "../Base/VariableUIElement"
import Toggle from "../Input/Toggle"
import Title from "../Base/Title"
import { MapillaryLinkVis } from "./MapillaryLinkVis"
import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { Feature } from "geojson"

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
        state: SpecialVisualizationState,
        tagSource: UIEventSource<Record<string, string>>,
        args: string[],
        feature: Feature,
        layer: LayerConfig
    ): BaseUIElement {
        const t = Translations.t.image.nearbyPictures
        const mode: "open" | "expandable" | "collapsable" = <any>args[0]
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
                        theme: state?.layout.id,
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

            const maxSearchRadius = 100
            const stepSize = 10
            const defaultValue = Math.floor(maxSearchRadius / (2 * stepSize)) * stepSize
            const fromOsmPreferences = state?.osmConnection
                ?.GetPreference("nearby-images-radius", "" + defaultValue)
                .sync(
                    (s) => Number(s),
                    [],
                    (i) => "" + i
                )
            const radiusValue = new UIEventSource(fromOsmPreferences.data)
            radiusValue.addCallbackAndRunD((v) => fromOsmPreferences.setData(v))

            const radius = new Slider(stepSize, maxSearchRadius, {
                value: radiusValue,
                step: 10,
            })
            const alreadyInTheImage = AllImageProviders.LoadImagesFor(tagSource)
            const options: NearbyImageOptions & { value } = {
                lon,
                lat,
                searchRadius: maxSearchRadius,
                shownRadius: radius.GetValue(),
                value: selectedImage,
                blacklist: alreadyInTheImage,
                towardscenter: towardsCenter.GetValue(),
                maxDaysOld: 365 * 3,
            }
            const slideshow = canBeEdited
                ? new SelectOneNearbyImage(options, state.indexedFeatures)
                : new NearbyImages(options, state.indexedFeatures)
            const controls = new Combine([
                towardsCenter,
                new Combine([
                    new VariableUiElement(
                        radius.GetValue().map((radius) => t.withinRadius.Subs({ radius }))
                    ),
                    radius,
                ]).SetClass("flex justify-between"),
            ]).SetClass("flex flex-col")
            return new Combine([
                slideshow,
                controls,
                saveButton,
                new MapillaryLinkVis().constr(state, tagSource, [], feature).SetClass("mt-6"),
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
