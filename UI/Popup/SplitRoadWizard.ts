import Toggle from "../Input/Toggle";
import Svg from "../../Svg";
import {UIEventSource} from "../../Logic/UIEventSource";
import {SubtleButton} from "../Base/SubtleButton";
import Minimap from "../Base/Minimap";
import State from "../../State";
import ShowDataLayer from "../ShowDataLayer";
import {GeoOperations} from "../../Logic/GeoOperations";
import {LeafletMouseEvent} from "leaflet";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import Combine from "../Base/Combine";
import {Button} from "../Base/Button";
import Translations from "../i18n/Translations";
import {splitRoad} from "../../Logic/Osm/SplitAction";

export default class SplitRoadWizard extends Toggle {
    /**
     * A UI Element used for splitting roads
     *
     * @param id: The id of the road to remove
     */
    constructor(id: string) {

        const t = Translations.t.split;

        // Contains the points on the road that are selected to split on
        const splitPositions = new UIEventSource([]);

        // Toggle variable between show split button and map
        const splitClicked = new UIEventSource<boolean>(true); // todo: -> false

        // Minimap on which you can select the points to be splitted
        const miniMap = new Minimap({background: State.state.backgroundLayer});
        miniMap.SetStyle("width: 100%; height: 50rem;");

        // Define how a cut is displayed on the map
        const layoutConfigJson = {id: "splitpositions", source: {osmTags: "_cutposition=yes"}, icon: "./assets/svg/plus.svg"}
        State.state.layoutToUse.data.layers.push(new LayerConfig(layoutConfigJson,undefined,"Split Road Wizard"))

        // Load the road with given id on the minimap
        const roadElement = State.state.allElements.ContainingFeatures.get(id)
        const roadEventSource = new UIEventSource([{feature: roadElement, freshness: new Date()}]);
        // Datalayer displaying the road and the cut points (if any)
        const dataLayer = new ShowDataLayer(roadEventSource, miniMap.leafletMap, State.state.layoutToUse, false, true);

        /**
         * Handles a click on the overleaf map.
         * Finds the closest intersection with the road and adds a point there, ready to confirm the cut.
         * @param coordinates Clicked location, [lon, lat]
         */
        function onMapClick(coordinates) {
            // Get nearest point on the road
            const pointOnRoad = GeoOperations.nearestPoint(roadElement, coordinates); // pointOnRoad is a geojson

            // Update point properties to let it match the layer
            pointOnRoad.properties._cutposition = "yes";
            pointOnRoad._matching_layer_id = "splitpositions";

            // Add it to the list of all points and notify observers
            splitPositions.data.push(pointOnRoad);
            splitPositions.ping();

            // let the state remember the point, to be able to retrieve it later by id
            State.state.allElements.addOrGetElement(pointOnRoad);

            roadEventSource.data.push({feature: pointOnRoad, freshness: new Date()}); // show the point on the data layer
            roadEventSource.ping(); // not updated using .setData, so manually ping observers
        }

        // When clicked, pass clicked location coordinates to onMapClick function
        miniMap.leafletMap.addCallbackAndRunD(
            (leafletMap) => leafletMap.on("click", (mouseEvent: LeafletMouseEvent) => {
                onMapClick([mouseEvent.latlng.lng, mouseEvent.latlng.lat])
            }))

        // Toggle between splitmap
        const splitButton = new SubtleButton(Svg.scissors_ui(), "Split road");
        splitButton.onClick(
            () => {
                splitClicked.setData(true)
            }
        )

        // Only show the splitButton if logged in, else show login prompt
        const splitToggle = new Toggle(
            splitButton,
            t.loginToSplit.Clone().onClick(State.state.osmConnection.AttemptLogin),
            State.state.osmConnection.isLoggedIn)

        // Save button
        const saveButton =  new Button("Split here", () => splitRoad(id, splitPositions.data));
        saveButton.SetClass("block btn btn-primary");
        const disabledSaveButton = new Button("Split here", undefined);
        disabledSaveButton.SetClass("block btn btn-disabled");
        // Only show the save button if there are split points defined
        const saveToggle = new Toggle(disabledSaveButton, saveButton, splitPositions.map((data) => data.length === 0))

        const cancelButton = new Button("Cancel", () => {
            splitClicked.setData(false);

            splitPositions.setData([]);
            // Only keep showing the road, the cutpoints must be removed from the map
            roadEventSource.setData([roadEventSource.data[0]])
        });

        cancelButton.SetClass("block btn btn-secondary");

        const splitTitle = t.splitTitle;

        const mapView = new Combine([splitTitle, miniMap, cancelButton, saveToggle]);
        super(mapView, splitToggle, splitClicked);

    }
}