import Toggle from "../Input/Toggle"
import { UIEventSource } from "../../Logic/UIEventSource"
import { SubtleButton } from "../Base/SubtleButton"
import Combine from "../Base/Combine"
import { Button } from "../Base/Button"
import Translations from "../i18n/Translations"
import SplitAction from "../../Logic/Osm/Actions/SplitAction"
import Title from "../Base/Title"
import BaseUIElement from "../BaseUIElement"
import { VariableUiElement } from "../Base/VariableUIElement"
import { LoginToggle } from "./LoginButton"
import SvelteUIElement from "../Base/SvelteUIElement"
import WaySplitMap from "../BigComponents/WaySplitMap.svelte"
import { Feature, Point } from "geojson"
import { WayId } from "../../Models/OsmFeature"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import { Changes } from "../../Logic/Osm/Changes"
import { IndexedFeatureSource } from "../../Logic/FeatureSource/FeatureSource"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import OsmObjectDownloader from "../../Logic/Osm/OsmObjectDownloader"
import Scissors from "../../assets/svg/Scissors.svelte"

export default class SplitRoadWizard extends Combine {
    public dialogIsOpened: UIEventSource<boolean>

    /**
     * A UI Element used for splitting roads
     *
     * @param id The id of the road to remove
     * @param state the state of the application
     */
    constructor(
        id: WayId,
        state: {
            layout?: LayoutConfig
            osmConnection?: OsmConnection
            osmObjectDownloader?: OsmObjectDownloader
            changes?: Changes
            indexedFeatures?: IndexedFeatureSource
            selectedElement?: UIEventSource<Feature>
        }
    ) {
        const t = Translations.t.split

        // Contains the points on the road that are selected to split on - contains geojson points with extra properties such as 'location' with the distance along the linestring
        const splitPoints = new UIEventSource<Feature<Point>[]>([])

        const hasBeenSplit = new UIEventSource(false)

        // Toggle variable between show split button and map
        const splitClicked = new UIEventSource<boolean>(false)

        const leafletMap = new UIEventSource<BaseUIElement>(undefined)

        function initMap() {
            ;(async function (
                id: WayId,
                splitPoints: UIEventSource<Feature[]>
            ): Promise<BaseUIElement> {
                return new SvelteUIElement(WaySplitMap, {
                    osmWay: await state.osmObjectDownloader.DownloadObjectAsync(id),
                    splitPoints,
                })
            })(id, splitPoints).then((mapComponent) =>
                leafletMap.setData(mapComponent.SetClass("w-full h-80"))
            )
        }

        // Toggle between splitmap
        const splitButton = new SubtleButton(
            new SvelteUIElement(Scissors).SetClass("h-6 w-6"),
            new Toggle(
                t.splitAgain.Clone().SetClass("text-lg font-bold"),
                t.inviteToSplit.Clone().SetClass("text-lg font-bold"),
                hasBeenSplit
            )
        )

        const splitToggle = new LoginToggle(splitButton, t.loginToSplit.Clone(), state)

        // Save button
        const saveButton = new Button(t.split.Clone(), async () => {
            hasBeenSplit.setData(true)
            splitClicked.setData(false)
            const splitAction = new SplitAction(
                id,
                splitPoints.data.map((ff) => <[number, number]>(<Point>ff.geometry).coordinates),
                {
                    theme: state?.layout?.id,
                },
                5
            )
            await state.changes?.applyAction(splitAction)
            // We throw away the old map and splitpoints, and create a new map from scratch
            splitPoints.setData([])

            // Close the popup. The contributor has to select a segment again to make sure they continue editing the correct segment; see #1219
            state.selectedElement?.setData(undefined)
        })

        saveButton.SetClass("btn btn-primary mr-3")
        const disabledSaveButton = new Button(t.split.Clone(), undefined)
        disabledSaveButton.SetClass("btn btn-disabled mr-3")
        // Only show the save button if there are split points defined
        const saveToggle = new Toggle(
            disabledSaveButton,
            saveButton,
            splitPoints.map((data) => data.length === 0)
        )

        const cancelButton = Translations.t.general.cancel
            .Clone() // Not using Button() element to prevent full width button
            .SetClass("btn btn-secondary mr-3")
            .onClick(() => {
                splitPoints.setData([])
                splitClicked.setData(false)
            })

        cancelButton.SetClass("btn btn-secondary block")

        const splitTitle = new Title(t.splitTitle)

        const mapView = new Combine([
            splitTitle,
            new VariableUiElement(leafletMap),
            new Combine([cancelButton, saveToggle]).SetClass("flex flex-row"),
        ])
        mapView.SetClass("question")
        super([
            Toggle.If(hasBeenSplit, () =>
                t.hasBeenSplit.Clone().SetClass("font-bold thanks block w-full")
            ),
            new Toggle(mapView, splitToggle, splitClicked),
        ])
        splitClicked.addCallback((view) => {
            if (view) {
                initMap()
            }
        })
        this.dialogIsOpened = splitClicked
        const self = this
        splitButton.onClick(() => {
            splitClicked.setData(true)
            self.ScrollIntoView()
        })
    }
}
