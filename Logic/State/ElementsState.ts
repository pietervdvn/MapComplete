import FeatureSwitchState from "./FeatureSwitchState";
import {ElementStorage} from "../ElementStorage";
import {Changes} from "../Osm/Changes";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {UIEventSource} from "../UIEventSource";
import Loc from "../../Models/Loc";
import {BBox} from "../BBox";
import {QueryParameters} from "../Web/QueryParameters";
import {LocalStorageSource} from "../Web/LocalStorageSource";
import {Utils} from "../../Utils";
import ChangeToElementsActor from "../Actors/ChangeToElementsActor";
import PendingChangesUploader from "../Actors/PendingChangesUploader";
import TitleHandler from "../Actors/TitleHandler";

/**
 * The part of the state keeping track of where the elements, loading them, configuring the feature pipeline etc
 */
export default class ElementsState extends FeatureSwitchState{

    /**
     The mapping from id -> UIEventSource<properties>
     */
    public allElements: ElementStorage = new ElementStorage();
    /**
     THe change handler
     */
    public changes: Changes = new Changes();

    /**
     The latest element that was selected
     */
    public readonly selectedElement = new UIEventSource<any>(
        undefined,
        "Selected element"
    );

    
    /**
     * The map location: currently centered lat, lon and zoom
     */
    public readonly locationControl = new UIEventSource<Loc>(undefined, "locationControl");

    /**
     * The current visible extent of the screen
     */
    public readonly currentBounds = new UIEventSource<BBox>(undefined)


    constructor(layoutToUse: LayoutConfig) {
        super(layoutToUse);
        {
            // -- Location control initialization
            const zoom = UIEventSource.asFloat(
                QueryParameters.GetQueryParameter(
                    "z",
                    "" + (layoutToUse?.startZoom ?? 1),
                    "The initial/current zoom level"
                ).syncWith(LocalStorageSource.Get("zoom"))
            );
            const lat = UIEventSource.asFloat(
                QueryParameters.GetQueryParameter(
                    "lat",
                    "" + (layoutToUse?.startLat ?? 0),
                    "The initial/current latitude"
                ).syncWith(LocalStorageSource.Get("lat"))
            );
            const lon = UIEventSource.asFloat(
                QueryParameters.GetQueryParameter(
                    "lon",
                    "" + (layoutToUse?.startLon ?? 0),
                    "The initial/current longitude of the app"
                ).syncWith(LocalStorageSource.Get("lon"))
            );

            this.locationControl.setData({
                zoom: Utils.asFloat(zoom.data),
                lat: Utils.asFloat(lat.data),
                lon: Utils.asFloat(lon.data),
            })
            this.locationControl.addCallback((latlonz) => {
                // Sync th location controls
                zoom.setData(latlonz.zoom);
                lat.setData(latlonz.lat);
                lon.setData(latlonz.lon);
            });
        }
        
        new ChangeToElementsActor(this.changes, this.allElements)
        new PendingChangesUploader(this.changes, this.selectedElement);
        new TitleHandler(this);
    
    }
}