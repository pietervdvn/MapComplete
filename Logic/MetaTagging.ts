import {GeoOperations} from "./GeoOperations";
import State from "../State";
import opening_hours from "opening_hours";
import {And, Or, Tag} from "./Tags";
import {Utils} from "../Utils";
import CountryCoder from "latlon2country"

class SimpleMetaTagger {
    public readonly keys: string[];
    public readonly doc: string;
    private _f: (feature: any, index: number) => void;

    constructor(keys: string[], doc: string, f: ((feature: any, index: number) => void)) {
        this.keys = keys;
        this.doc = doc;
        this._f = f;
        for (const key of keys) {
            if (!key.startsWith('_')) {
                throw `Incorrect metakey ${key}: it should start with underscore (_)`
            }
        }
    }

    addMetaTags(features: any[]) {
        for (let i = 0; i < features.length; i++) {
            let feature = features[i];
            this._f(feature, i);
        }
    }


}


/**
 * Metatagging adds various tags to the elements, e.g. lat, lon, surface area, ...
 *
 * All metatags start with an underscore
 */
export default class MetaTagging {


    private static latlon = new SimpleMetaTagger(["_lat", "_lon"], "The latitude and longitude of the point (or centerpoint in the case of a way/area)",
        (feature => {
            const centerPoint = GeoOperations.centerpoint(feature);
            const lat = centerPoint.geometry.coordinates[1];
            const lon = centerPoint.geometry.coordinates[0];
            feature.properties["_lat"] = "" + lat;
            feature.properties["_lon"] = "" + lon;
        })
    );
    private static surfaceArea = new SimpleMetaTagger(
        ["_surface", "_surface:ha"], "The surface area of the feature, in square meters and in hectare. Not set on points and ways",
        (feature => {
            const sqMeters = GeoOperations.surfaceAreaInSqMeters(feature);
            feature.properties["_surface"] = "" + sqMeters;
            feature.properties["_surface:ha"] = "" + Math.floor(sqMeters / 1000) / 10;

        })
    );
    private static country = new SimpleMetaTagger(
        ["_country"], "The country code of the property (with latlon2country)",
        (feature, index) => {

            const coder = new CountryCoder("https://pietervdvn.github.io/latlon2country/");

            let centerPoint: any = GeoOperations.centerpoint(feature);
            const lat = centerPoint.geometry.coordinates[1];
            const lon = centerPoint.geometry.coordinates[0];
            coder.GetCountryCodeFor(lon, lat, (countries) => {
                try {
                    feature.properties["_country"] = countries[0].trim().toLowerCase();
                    const tagsSource = State.state.allElements.getEventSourceFor(feature);
                    tagsSource.ping();
                } catch (e) {
                    console.error(e)
                }
            });
        }
    )
    private static isOpen = new SimpleMetaTagger(
        ["_isOpen", "_isOpen:description"],
        "If 'opening_hours' is present, it will add the current state of the feature (being 'yes' or 'no')",
        (feature => {

            const tagsSource = State.state.allElements.getEventSourceFor(feature);
            tagsSource.addCallbackAndRun(tags => {
                if (tags.opening_hours === undefined || tags._country === undefined) {
                    return;
                }
                try {

                    const oh = new opening_hours(tags["opening_hours"], {
                        lat: tags._lat,
                        lon: tags._lon,
                        address: {
                            country_code: tags._country.toLowerCase()
                        }
                    }, {tag_key: "opening_hours"});
                    // AUtomatically triggered on the next change
                    const updateTags = () => {
                        const oldValueIsOpen = tags["_isOpen"];
                        tags["_isOpen"] = oh.getState() ? "yes" : "no";
                        const comment = oh.getComment();
                        if (comment) {
                            tags["_isOpen:description"] = comment;
                        }

                        if (oldValueIsOpen !== tags._isOpen) {
                            tagsSource.ping();
                        }

                        const nextChange = oh.getNextChange();
                        if (nextChange !== undefined) {
                            window.setTimeout(
                                updateTags,
                                (nextChange.getTime() - (new Date()).getTime())
                            )
                        }
                    }
                    updateTags();
                } catch (e) {
                    console.error("Error while parsing opening hours of ", tags.id, e);
                    tags["_isOpen"] = "parse_error";
                }

            })
        })
    )

    private static directionSimplified = new SimpleMetaTagger(
        ["_direction:simplified", "_direction:leftright"], "_direction:simplified turns 'camera:direction' and 'direction' into either 0, 45, 90, 135, 180, 225, 270 or 315, whichever is closest. _direction:leftright is either 'left' or 'right', which is left-looking on the map or 'right-looking' on the map",
        (feature => {
            const tags = feature.properties;
            const direction = tags["camera:direction"] ?? tags["direction"];
            if (direction === undefined) {
                return;
            }
            let n = Number(direction);
            if (isNaN(n)) {
                return;
            }

            // [22.5 -> 67.5] is sector 1
            // [67.5 -> ] is sector 1
            n = (n + 22.5) % 360;
            n = Math.floor(n / 45);
            tags["_direction:simplified"] = n;
            tags["_direction:leftright"] = n <= 3 ? "right" : "left";


        })
    )

    private static carriageWayWidth = new SimpleMetaTagger(
        ["_width:needed", "_width:needed:no_pedestrians", "_width:difference"],
        "Legacy for a specific project calculating the needed width for safe traffic on a road. Only activated if 'width:carriageway' is present",
        (feature: any, index: number) => {

            const properties = feature.properties;
            if (properties["width:carriageway"] === undefined) {
                return;
            }

            const carWidth = 2;
            const cyclistWidth = 1.5;
            const pedestrianWidth = 0.75;


            const _leftSideParking =
                new And([new Tag("parking:lane:left", "parallel"), new Tag("parking:lane:right", "no_parking")]);
            const _rightSideParking =
                new And([new Tag("parking:lane:right", "parallel"), new Tag("parking:lane:left", "no_parking")]);

            const _bothSideParking = new Tag("parking:lane:both", "parallel");
            const _noSideParking = new Tag("parking:lane:both", "no_parking");
            const _otherParkingMode =
                new Or([
                    new Tag("parking:lane:both", "perpendicular"),
                    new Tag("parking:lane:left", "perpendicular"),
                    new Tag("parking:lane:right", "perpendicular"),
                    new Tag("parking:lane:both", "diagonal"),
                    new Tag("parking:lane:left", "diagonal"),
                    new Tag("parking:lane:right", "diagonal"),
                ])

            const _sidewalkBoth = new Tag("sidewalk", "both");
            const _sidewalkLeft = new Tag("sidewalk", "left");
            const _sidewalkRight = new Tag("sidewalk", "right");
            const _sidewalkNone = new Tag("sidewalk", "none");


            let parkingStateKnown = true;
            let parallelParkingCount = 0;


            const _oneSideParking = new Or([_leftSideParking, _rightSideParking]);

            if (_oneSideParking.matchesProperties(properties)) {
                parallelParkingCount = 1;
            } else if (_bothSideParking.matchesProperties(properties)) {
                parallelParkingCount = 2;
            } else if (_noSideParking.matchesProperties(properties)) {
                parallelParkingCount = 0;
            } else if (_otherParkingMode.matchesProperties(properties)) {
                parallelParkingCount = 0;
            } else {
                parkingStateKnown = false;
                console.log("No parking data for ", properties.name, properties.id, properties)
            }


            let pedestrianFlowNeeded;
            if (_sidewalkBoth.matchesProperties(properties)) {
                pedestrianFlowNeeded = 0;
            } else if (_sidewalkNone.matchesProperties(properties)) {
                pedestrianFlowNeeded = 2;
            } else if (_sidewalkLeft.matchesProperties(properties) || _sidewalkRight.matchesProperties(properties)) {
                pedestrianFlowNeeded = 1;
            } else {
                pedestrianFlowNeeded = -1;
            }


            let onewayCar = properties.oneway === "yes";
            let onewayBike = properties["oneway:bicycle"] === "yes" ||
                (onewayCar && properties["oneway:bicycle"] === undefined)

            let cyclingAllowed =
                !(properties.bicycle === "use_sidepath"
                    || properties.bicycle === "no");

            let carWidthUsed = (onewayCar ? 1 : 2) * carWidth;
            properties["_width:needed:cars"] = Utils.Round(carWidthUsed);
            properties["_width:needed:parking"] = Utils.Round(parallelParkingCount * carWidth)


            let cyclistWidthUsed = 0;
            if (cyclingAllowed) {
                cyclistWidthUsed = (onewayBike ? 1 : 2) * cyclistWidth;
            }
            properties["_width:needed:cyclists"] = Utils.Round(cyclistWidthUsed)


            const width = parseFloat(properties["width:carriageway"]);


            const targetWidthIgnoringPedestrians =
                carWidthUsed +
                cyclistWidthUsed +
                parallelParkingCount * carWidthUsed;
            properties["_width:needed:no_pedestrians"] = Utils.Round(targetWidthIgnoringPedestrians);

            const pedestriansNeed = Math.max(0, pedestrianFlowNeeded) * pedestrianWidth;
            const targetWidth = targetWidthIgnoringPedestrians + pedestriansNeed;
            properties["_width:needed"] = Utils.Round(targetWidth);
            properties["_width:needed:pedestrians"] = Utils.Round(pedestriansNeed)


            properties["_width:difference"] = Utils.Round(targetWidth - width);
            properties["_width:difference:no_pedestrians"] = Utils.Round(targetWidthIgnoringPedestrians - width);

        }
    );

    public static metatags = [
        MetaTagging.latlon,
        MetaTagging.surfaceArea,
        MetaTagging.country,
        MetaTagging.isOpen,
        MetaTagging.carriageWayWidth,
        MetaTagging.directionSimplified

    ];

    static addMetatags(features: any[]) {

        for (const metatag of MetaTagging.metatags) {
            try {
                metatag.addMetaTags(features);
            } catch (e) {
                console.error("Could not calculate metatag for ", metatag.keys.join(","), ":", e)

            }
        }

    }
}
