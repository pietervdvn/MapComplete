import Toggle from "../Input/Toggle";
import Svg from "../../Svg";
import {UIEventSource} from "../../Logic/UIEventSource";
import {SubtleButton} from "../Base/SubtleButton";
import Minimap from "../Base/Minimap";
import State from "../../State";
import ShowDataLayer from "../ShowDataLayer";
import {GeoOperations} from "../../Logic/GeoOperations";
import {LeafletMouseEvent} from "leaflet";
import Combine from "../Base/Combine";
import {Button} from "../Base/Button";
import Translations from "../i18n/Translations";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import SplitAction from "../../Logic/Osm/Actions/SplitAction";
import {OsmObject, OsmWay} from "../../Logic/Osm/OsmObject";
import Title from "../Base/Title";

export default class SplitRoadWizard extends Toggle {
    private static splitLayout = new UIEventSource(SplitRoadWizard.GetSplitLayout())

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

        // Minimap on which you can select the points to be splitted
        const miniMap = new Minimap({background: State.state.backgroundLayer, allowMoving: false});
        miniMap.SetStyle("width: 100%; height: 24rem;");

        // Define how a cut is displayed on the map

        // Load the road with given id on the minimap
        const roadElement = State.state.allElements.ContainingFeatures.get(id)
        const roadEventSource = new UIEventSource([{feature: roadElement, freshness: new Date()}]);
        // Datalayer displaying the road and the cut points (if any)
        new ShowDataLayer(roadEventSource, miniMap.leafletMap, State.state.layoutToUse, false, true);
        new ShowDataLayer(splitPoints, miniMap.leafletMap, SplitRoadWizard.splitLayout, false, false)

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
            pointOnRoad["_matching_layer_id"] = "splitpositions";

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
        const splitButton = new SubtleButton(Svg.scissors_ui(), t.inviteToSplit.Clone());
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
            const way = OsmObject.DownloadObject(id)
            const partOfSrc = OsmObject.DownloadReferencingRelations(id);
            let hasRun = false
            way.map(way => {
                const partOf = partOfSrc.data
                if(way === undefined || partOf === undefined){
                    return;
                }
                if(hasRun){
                    return
                }
                hasRun = true
                const splitAction = new SplitAction(
                    <OsmWay>way, way.asGeoJson(), partOf, splitPoints.data.map(ff => ff.feature)
                )
                State.state.changes.applyAction(splitAction)
                
            }, [partOfSrc])


        });
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
    }

    private static GetSplitLayout(): LayoutConfig {
        return new LayoutConfig({
            maintainer: "mapcomplete",
            language: ["en"],
            startLon: 0,
            startLat: 0,
            description: "Split points visualisations - built in at SplitRoadWizard.ts",
            icon: "", startZoom: 0,
            title: "Split locations",
            version: "",

            id: "splitpositions",
            layers: [{id: "splitpositions", source: {osmTags: "_cutposition=yes"}, icon: "./assets/svg/plus.svg"}]
        }, true, "(BUILTIN) SplitRoadWizard.ts")

    }
}