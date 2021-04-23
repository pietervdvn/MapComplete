import {UIElement} from "../UIElement";
import Link from "../Base/Link";
import Svg from "../../Svg";
import Combine from "../Base/Combine";
import {UIEventSource} from "../../Logic/UIEventSource";
import UserDetails from "../../Logic/Osm/OsmConnection";
import Constants from "../../Models/Constants";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import Loc from "../../Models/Loc";
import * as L from "leaflet"

/**
 * The bottom right attribution panel in the leaflet map
 */
export default class Attribution extends UIElement {

    private readonly _location: UIEventSource<Loc>;
    private readonly _layoutToUse: UIEventSource<LayoutConfig>;
    private readonly _userDetails: UIEventSource<UserDetails>;
    private readonly _leafletMap: UIEventSource<L.Map>;

    constructor(location: UIEventSource<Loc>,
                userDetails: UIEventSource<UserDetails>,
                layoutToUse: UIEventSource<LayoutConfig>,
                leafletMap: UIEventSource<L.Map>) {
        super(location);
        this._layoutToUse = layoutToUse;
        this.ListenTo(layoutToUse);
        this._userDetails = userDetails;
        this._leafletMap = leafletMap;
        this.ListenTo(userDetails);
        this._location = location;
        this.SetClass("map-attribution");
    }

    InnerRender(): string {
        const location: Loc = this._location?.data;
        const userDetails = this._userDetails?.data;

        const mapComplete = new Link(`Mapcomplete ${Constants.vNumber}`, 'https://github.com/pietervdvn/MapComplete', true);
        const reportBug = new Link(Svg.bug_img, "https://github.com/pietervdvn/MapComplete/issues", true);

        const layoutId = this._layoutToUse?.data?.id;
        const osmChaLink = `https://osmcha.org/?filters=%7B%22comment%22%3A%5B%7B%22label%22%3A%22%23${layoutId}%22%2C%22value%22%3A%22%23${layoutId}%22%7D%5D%2C%22date__gte%22%3A%5B%7B%22label%22%3A%222020-07-05%22%2C%22value%22%3A%222020-07-05%22%7D%5D%2C%22editor%22%3A%5B%7B%22label%22%3A%22MapComplete%22%2C%22value%22%3A%22MapComplete%22%7D%5D%7D`
        const stats = new Link(Svg.statistics_img, osmChaLink, true)
        let editHere: (UIElement | string) = "";
        let mapillary: UIElement = undefined;
        if (location !== undefined) {
            const idLink = `https://www.openstreetmap.org/edit?editor=id#map=${location.zoom}/${location.lat}/${location.lon}`
            editHere = new Link(Svg.pencil_img, idLink, true);

            const mapillaryLink: string = `https://www.mapillary.com/app/?focus=map&lat=${location.lat}&lng=${location.lon}&z=${Math.max(location.zoom - 1, 1)}`;
            mapillary = new Link(Svg.mapillary_black_img, mapillaryLink, true);

        }


        let editWithJosm: (UIElement | string) = ""
        if (location !== undefined &&
            this._leafletMap?.data !== undefined &&
            userDetails.csCount >= Constants.userJourney.tagsVisibleAndWikiLinked) {
            const bounds: any = this._leafletMap.data.getBounds();
            const top = bounds.getNorth();
            const bottom = bounds.getSouth();
            const right = bounds.getEast();
            const left = bounds.getWest();

            const josmLink = `http://127.0.0.1:8111/load_and_zoom?left=${left}&right=${right}&top=${top}&bottom=${bottom}`
            editWithJosm = new Link(Svg.josm_logo_img, josmLink, true);
        }
        return new Combine([mapComplete, reportBug, stats, editHere, editWithJosm, mapillary]).Render();
    }


}