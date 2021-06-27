import Link from "../Base/Link";
import Svg from "../../Svg";
import Combine from "../Base/Combine";
import {UIEventSource} from "../../Logic/UIEventSource";
import UserDetails from "../../Logic/Osm/OsmConnection";
import Constants from "../../Models/Constants";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import Loc from "../../Models/Loc";
import * as L from "leaflet"
import {VariableUiElement} from "../Base/VariableUIElement";

/**
 * The bottom right attribution panel in the leaflet map
 */
export default class Attribution extends Combine {

    constructor(location: UIEventSource<Loc>,
                userDetails: UIEventSource<UserDetails>,
                layoutToUse: UIEventSource<LayoutConfig>,
                leafletMap: UIEventSource<L.Map>) {
       
        const mapComplete = new Link(`Mapcomplete ${Constants.vNumber}`, 'https://github.com/pietervdvn/MapComplete', true);
        const reportBug = new Link(Svg.bug_ui().SetClass("small-image"), "https://github.com/pietervdvn/MapComplete/issues", true);

        const layoutId = layoutToUse?.data?.id;
        const osmChaLink = `https://osmcha.org/?filters=%7B%22comment%22%3A%5B%7B%22label%22%3A%22%23${layoutId}%22%2C%22value%22%3A%22%23${layoutId}%22%7D%5D%2C%22date__gte%22%3A%5B%7B%22label%22%3A%222020-07-05%22%2C%22value%22%3A%222020-07-05%22%7D%5D%2C%22editor%22%3A%5B%7B%22label%22%3A%22MapComplete%22%2C%22value%22%3A%22MapComplete%22%7D%5D%7D`
        const stats = new Link(Svg.statistics_ui().SetClass("small-image"), osmChaLink, true)


        const idLink = location.map(location =>  `https://www.openstreetmap.org/edit?editor=id#map=${location?.zoom ?? 0}/${location?.lat ?? 0}/${location?.lon ?? 0}`)
        const editHere = new Link(Svg.pencil_ui().SetClass("small-image"), idLink, true)

        const mapillaryLink = location.map(location => `https://www.mapillary.com/app/?focus=map&lat=${location?.lat ?? 0}&lng=${location?.lon ?? 0}&z=${Math.max((location?.zoom ?? 2) - 1, 1)}`)
        const mapillary = new Link(Svg.mapillary_black_ui().SetClass("small-image"), mapillaryLink, true);



        let editWithJosm = new VariableUiElement(
            userDetails.map(userDetails => {

                    if (userDetails.csCount < Constants.userJourney.tagsVisibleAndWikiLinked) {
                        return undefined;
                    }
                    const bounds: any = leafletMap?.data?.getBounds();
                    if(bounds === undefined){
                        return undefined
                    }
                    const top = bounds.getNorth();
                    const bottom = bounds.getSouth();
                    const right = bounds.getEast();
                    const left = bounds.getWest();

                    const josmLink = `http://127.0.0.1:8111/load_and_zoom?left=${left}&right=${right}&top=${top}&bottom=${bottom}`
                    return new Link(Svg.josm_logo_ui().SetClass("small-image"), josmLink, true);
                },
                [location, leafletMap]
            )
        )
        super([mapComplete, reportBug, stats, editHere, editWithJosm, mapillary]);

    }


}