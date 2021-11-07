import Link from "../Base/Link";
import Svg from "../../Svg";
import Combine from "../Base/Combine";
import {UIEventSource} from "../../Logic/UIEventSource";
import UserDetails from "../../Logic/Osm/OsmConnection";
import Constants from "../../Models/Constants";
import Loc from "../../Models/Loc";
import {VariableUiElement} from "../Base/VariableUIElement";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {BBox} from "../../Logic/BBox";
import {Utils} from "../../Utils";

/**
 * The bottom right attribution panel in the leaflet map
 */
export default class Attribution extends Combine {

     constructor(location: UIEventSource<Loc>,
                userDetails: UIEventSource<UserDetails>,
                layoutToUse: LayoutConfig,
                currentBounds: UIEventSource<BBox>) {

        const mapComplete = new Link(`Mapcomplete ${Constants.vNumber}`, 'https://github.com/pietervdvn/MapComplete', true);
        const reportBug = new Link(Svg.bug_ui().SetClass("small-image"), "https://github.com/pietervdvn/MapComplete/issues", true);

        const layoutId = layoutToUse?.id;
        const stats = new Link(Svg.statistics_ui().SetClass("small-image"), Utils.OsmChaLinkFor(31, layoutId), true)


        const idLink = location.map(location => `https://www.openstreetmap.org/edit?editor=id#map=${location?.zoom ?? 0}/${location?.lat ?? 0}/${location?.lon ?? 0}`)
        const editHere = new Link(Svg.pencil_ui().SetClass("small-image"), idLink, true)

        const mapillaryLink = location.map(location => `https://www.mapillary.com/app/?focus=map&lat=${location?.lat ?? 0}&lng=${location?.lon ?? 0}&z=${Math.max((location?.zoom ?? 2) - 1, 1)}`)
        const mapillary = new Link(Svg.mapillary_black_ui().SetClass("small-image"), mapillaryLink, true);


        let editWithJosm = new VariableUiElement(
            userDetails.map(userDetails => {

                    if (userDetails.csCount < Constants.userJourney.tagsVisibleAndWikiLinked) {
                        return undefined;
                    }
                    const bounds: any = currentBounds.data;
                    if (bounds === undefined) {
                        return undefined
                    }
                    const top = bounds.getNorth();
                    const bottom = bounds.getSouth();
                    const right = bounds.getEast();
                    const left = bounds.getWest();

                    const josmLink = `http://127.0.0.1:8111/load_and_zoom?left=${left}&right=${right}&top=${top}&bottom=${bottom}`
                    return new Link(Svg.josm_logo_ui().SetClass("small-image"), josmLink, true);
                },
                [location, currentBounds]
            )
        )
        super([mapComplete, reportBug, stats, editHere, editWithJosm, mapillary]);
        this.SetClass("flex")

    }


}