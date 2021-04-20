import {GeoOperations} from "./GeoOperations";
import State from "../State";
import {And} from "./Tags/And";
import {Tag} from "./Tags/Tag";
import {Or} from "./Tags/Or";
import {Utils} from "../Utils";
import opening_hours from "opening_hours";
import {UIElement} from "../UI/UIElement";
import Combine from "../UI/Base/Combine";
import UpdateTagsFromOsmAPI from "./Actors/UpdateTagsFromOsmAPI";

export default class SimpleMetaTagger {
    public readonly keys: string[];
    public readonly doc: string;
    private readonly _f: (feature: any, index: number, freshness: Date) => void;

    constructor(keys: string[], doc: string, f: ((feature: any, index: number, freshness: Date) => void)) {
        this.keys = keys;
        this.doc = doc;
        this._f = f;
        for (const key of keys) {
            if (!key.startsWith('_')) {
                throw `Incorrect metakey ${key}: it should start with underscore (_)`
            }
        }
    }

    addMetaTags(features: { feature: any, freshness: Date }[]) {
        for (let i = 0; i < features.length; i++) {
            let feature = features[i];
            this._f(feature.feature, i, feature.freshness);
        }
    }

    static coder: any;
    private static latlon = new SimpleMetaTagger(["_lat", "_lon"], "The latitude and longitude of the point (or centerpoint in the case of a way/area)",
        (feature => {
            const centerPoint = GeoOperations.centerpoint(feature);
            const lat = centerPoint.geometry.coordinates[1];
            const lon = centerPoint.geometry.coordinates[0];
            feature.properties["_lat"] = "" + lat;
            feature.properties["_lon"] = "" + lon;
            feature._lon = lon; // This is dirty, I know
            feature._lat = lat;
        })
    );
    private static surfaceArea = new SimpleMetaTagger(
        ["_surface", "_surface:ha"], "The surface area of the feature, in square meters and in hectare. Not set on points and ways",
        (feature => {
            const sqMeters = GeoOperations.surfaceAreaInSqMeters(feature);
            feature.properties["_surface"] = "" + sqMeters;
            feature.properties["_surface:ha"] = "" + Math.floor(sqMeters / 1000) / 10;
            feature.area = sqMeters;
        })
    );
    
    private static lngth = new SimpleMetaTagger(
        ["_length", "_length:km"], "The total length of a feature in meters (and in kilometers, rounded to one decimal for '_length:km'). For a surface, the length of the perimeter",
        (feature => {
            const l = GeoOperations.lengthInMeters(feature)
            feature.properties["_length"] = "" + l
            const km = Math.floor(l / 1000)
            const kmRest = Math.round((l - km * 1000) / 100)
            feature.properties["_length:km"] = "" + km+ "." + kmRest
        })
    )
    
    private static country = new SimpleMetaTagger(
        ["_country"], "The country code of the property (with latlon2country)",
        feature => {


            let centerPoint: any = GeoOperations.centerpoint(feature);
            const lat = centerPoint.geometry.coordinates[1];
            const lon = centerPoint.geometry.coordinates[0];

            SimpleMetaTagger.GetCountryCodeFor(lon, lat, (countries) => {
                try {
                    feature.properties["_country"] = countries[0].trim().toLowerCase();
                    const tagsSource = State.state.allElements.getEventSourceById(feature.properties.id);
                    tagsSource.ping();
                } catch (e) {
                    console.warn(e)
                }
            });
        }
    )
    private static isOpen = new SimpleMetaTagger(
        ["_isOpen", "_isOpen:description"],
        "If 'opening_hours' is present, it will add the current state of the feature (being 'yes' or 'no')",
        (feature => {

            const tagsSource = State.state.allElements.getEventSourceById(feature.properties.id);
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
                        const oldNextChange = tags["_isOpen:nextTrigger"] ?? 0;

                        if (oldNextChange > (new Date()).getTime() &&
                            tags["_isOpen:oldvalue"] === tags["opening_hours"]) {
                            // Already calculated and should not yet be triggered
                            return;
                        }

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
                            const timeout = nextChange.getTime() - (new Date()).getTime();
                            tags["_isOpen:nextTrigger"] = nextChange.getTime();
                            tags["_isOpen:oldvalue"] = tags.opening_hours
                            window.setTimeout(
                                () => {
                                    console.log("Updating the _isOpen tag for ", tags.id, ", it's timer expired after", timeout);
                                    updateTags();
                                },
                                timeout
                            )
                        }
                    }
                    updateTags();
                } catch (e) {
                    console.warn("Error while parsing opening hours of ", tags.id, e);
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
    private static currentTime = new SimpleMetaTagger(
        ["_now:date", "_now:datetime", "_loaded:date", "_loaded:_datetime"],
        "Adds the time that the data got loaded - pretty much the time of downloading from overpass. The format is YYYY-MM-DD hh:mm, aka 'sortable' aka ISO-8601-but-not-entirely",
        (feature, _, freshness) => {
            const now = new Date();

            if (typeof freshness === "string") {
                freshness = new Date(freshness)
            }

            function date(d: Date) {
                return d.toISOString().slice(0, 10);
            }

            function datetime(d: Date) {
                return d.toISOString().slice(0, -5).replace("T", " ");
            }

            feature.properties["_now:date"] = date(now);
            feature.properties["_now:datetime"] = datetime(now);
            feature.properties["_loaded:date"] = date(freshness);
            feature.properties["_loaded:datetime"] = datetime(freshness);

        }
    )
    public static metatags = [
        SimpleMetaTagger.latlon,
        SimpleMetaTagger.surfaceArea,
        SimpleMetaTagger.lngth,
        SimpleMetaTagger.country,
        SimpleMetaTagger.isOpen,
        SimpleMetaTagger.carriageWayWidth,
        SimpleMetaTagger.directionSimplified,
        SimpleMetaTagger.currentTime

    ];

    static GetCountryCodeFor(lon: number, lat: number, callback: (country: string) => void) {
        SimpleMetaTagger.coder.GetCountryCodeFor(lon, lat, callback)
    }

    static HelpText(): UIElement {
        const subElements: UIElement[] = [
            new Combine([
                "<h2>Metatags</h2>",
                "Metatags are extra tags available, in order to display more data or to give better questions.",
                "The are calculated automatically on every feature when the data arrives in the webbrowser. This document gives an overview of the available metatags"
            ])


        ];

        for (const metatag of SimpleMetaTagger.metatags.concat(UpdateTagsFromOsmAPI.metaTagger)) {
            subElements.push(
                new Combine([
                    "<h3>", metatag.keys.join(", "), "</h3>",
                    metatag.doc]
                )
            )
        }

        return new Combine(subElements)
    }


}