import Toggle from "../Input/Toggle";
import Svg from "../../Svg";
import {UIEventSource} from "../../Logic/UIEventSource";
import {SubtleButton} from "../Base/SubtleButton";
import Minimap from "../Base/Minimap";
import State from "../../State";
import ShowDataLayer from "../ShowDataLayer/ShowDataLayer";
import {GeoOperations} from "../../Logic/GeoOperations";
import {LeafletMouseEvent} from "leaflet";
import Combine from "../Base/Combine";
import {Button} from "../Base/Button";
import Translations from "../i18n/Translations";
import SplitAction from "../../Logic/Osm/Actions/SplitAction";
import Title from "../Base/Title";
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource";
import ShowDataMultiLayer from "../ShowDataLayer/ShowDataMultiLayer";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import {BBox} from "../../Logic/BBox";

export default class SplitRoadWizard extends Toggle {
    private static splitLayerStyling = new LayerConfig({
        id: "splitpositions",
        source: {osmTags: "_cutposition=yes"},
        icon: {render: "circle:white;./assets/svg/scissors.svg"},
        iconSize: {render: "30,30,center"},
    }, "(BUILTIN) SplitRoadWizard.ts", true)

    public dialogIsOpened: UIEventSource<boolean>

    /**
     * A UI Element used for splitting roads
     *
     * @param id: The id of the road to remove
     */
    constructor(id: string) {

        const t = Translations.t.split;

        // Contains the points on the road that are selected to split on - contains geojson points with extra properties such as 'location' with the distance along the linestring
        const splitPoints = new UIEventSource<{ feature: any, freshness: Date }[]>([]);

        const hasBeenSplit = new UIEventSource(false)

        // Toggle variable between show split button and map
        const splitClicked = new UIEventSource<boolean>(false);
        // Load the road with given id on the minimap
        const roadElement = State.state.allElements.ContainingFeatures.get(id)

        // Minimap on which you can select the points to be splitted
        const miniMap = Minimap.createMiniMap(
            {
                background: State.state.backgroundLayer,
                allowMoving: true,
                leafletOptions: {
                    minZoom: 14
                }
            });
        miniMap.SetStyle("width: 100%; height: 24rem")
            .SetClass("rounded-xl overflow-hidden");

        miniMap.installBounds(BBox.get(roadElement))

        // Define how a cut is displayed on the map

        // Datalayer displaying the road and the cut points (if any)
        new ShowDataLayer({
            features: new StaticFeatureSource(splitPoints, true),
            leafletMap: miniMap.leafletMap,
            zoomToFeatures: false,
            enablePopups: false,
            layerToShow: SplitRoadWizard.splitLayerStyling
        })

        new ShowDataMultiLayer({
            features: new StaticFeatureSource([roadElement], false),
            layers: State.state.filteredLayers,
            leafletMap: miniMap.leafletMap,
            enablePopups: false,
            zoomToFeatures: true
        })

        /**
         * Handles a click on the overleaf map.
         * Finds the closest intersection with the road and adds a point there, ready to confirm the cut.
         * @param coordinates Clicked location, [lon, lat]
         */
        function onMapClick(coordinates) {
            // First, we check if there is another, already existing point nearby
            const points = splitPoints.data.map((f, i) => [f.feature, i])
                .filter(p => GeoOperations.distanceBetween(p[0].geometry.coordinates, coordinates) * 1000 < 5)
                .map(p => p[1])
                .sort()
                .reverse()
            if (points.length > 0) {
                for (const point of points) {
                    splitPoints.data.splice(point, 1)
                }
                splitPoints.ping()
                return;
            }

            // Get nearest point on the road
            const pointOnRoad = GeoOperations.nearestPoint(roadElement, coordinates); // pointOnRoad is a geojson

            // Update point properties to let it match the layer
            pointOnRoad.properties._cutposition = "yes";

            // let the state remember the point, to be able to retrieve it later by id
            State.state.allElements.addOrGetElement(pointOnRoad);

            // Add it to the list of all points and notify observers
            splitPoints.data.push({feature: pointOnRoad, freshness: new Date()}); // show the point on the data layer
            splitPoints.ping(); // not updated using .setData, so manually ping observers
        }

        // When clicked, pass clicked location coordinates to onMapClick function
        miniMap.leafletMap.addCallbackAndRunD(
            (leafletMap) => leafletMap.on("click", (mouseEvent: LeafletMouseEvent) => {
                onMapClick([mouseEvent.latlng.lng, mouseEvent.latlng.lat])
            }))

        // Toggle between splitmap
        const splitButton = new SubtleButton(Svg.scissors_ui(), t.inviteToSplit.Clone().SetClass("text-lg font-bold"));
        splitButton.onClick(
            () => {
                splitClicked.setData(true)
            }
        )

        // Only show the splitButton if logged in, else show login prompt
        const loginBtn = t.loginToSplit.Clone()
            .onClick(() => State.state.osmConnection.AttemptLogin())
            .SetClass("login-button-friendly");
        const splitToggle = new Toggle(splitButton, loginBtn, State.state.osmConnection.isLoggedIn)

        // Save button
        const saveButton = new Button(t.split.Clone(), () => {
            hasBeenSplit.setData(true)
            State.state.changes.applyAction(new SplitAction(id, splitPoints.data.map(ff => ff.feature.geometry.coordinates)))
        })

        saveButton.SetClass("btn btn-primary mr-3");
        const disabledSaveButton = new Button("Split", undefined);
        disabledSaveButton.SetClass("btn btn-disabled mr-3");
        // Only show the save button if there are split points defined
        const saveToggle = new Toggle(disabledSaveButton, saveButton, splitPoints.map((data) => data.length === 0))

        const cancelButton = Translations.t.general.cancel.Clone() // Not using Button() element to prevent full width button
            .SetClass("btn btn-secondary mr-3")
            .onClick(() => {
                splitPoints.setData([]);
                splitClicked.setData(false);
            });

        cancelButton.SetClass("btn btn-secondary block");

        const splitTitle = new Title(t.splitTitle);

        const mapView = new Combine([splitTitle, miniMap, new Combine([cancelButton, saveToggle]).SetClass("flex flex-row")]);
        mapView.SetClass("question")
        const confirm = new Toggle(mapView, splitToggle, splitClicked);
        super(t.hasBeenSplit.Clone(), confirm, hasBeenSplit)
        this.dialogIsOpened = splitClicked
    }
}