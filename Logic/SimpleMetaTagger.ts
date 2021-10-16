import {GeoOperations} from "./GeoOperations";
import State from "../State";
import {Utils} from "../Utils";
import opening_hours from "opening_hours";
import Combine from "../UI/Base/Combine";
import BaseUIElement from "../UI/BaseUIElement";
import Title from "../UI/Base/Title";
import {FixedUiElement} from "../UI/Base/FixedUiElement";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";


const cardinalDirections = {
    N: 0, NNE: 22.5, NE: 45, ENE: 67.5,
    E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
    S: 180, SSW: 202.5, SW: 225, WSW: 247.5,
    W: 270, WNW: 292.5, NW: 315, NNW: 337.5
}


export default class SimpleMetaTagger {
    public static coder: any;
    public static readonly objectMetaInfo = new SimpleMetaTagger(
        {
            keys: ["_last_edit:contributor",
                "_last_edit:contributor:uid",
                "_last_edit:changeset",
                "_last_edit:timestamp",
                "_version_number",
            "_backend"],
            doc: "Information about the last edit of this object."
        },
        (feature) => {/*Note: also called by 'UpdateTagsFromOsmAPI'*/

            const tgs = feature.properties;

            function move(src: string, target: string) {
                if (tgs[src] === undefined) {
                    return;
                }
                tgs[target] = tgs[src]
                delete tgs[src]
            }

            move("user", "_last_edit:contributor")
            move("uid", "_last_edit:contributor:uid")
            move("changeset", "_last_edit:changeset")
            move("timestamp", "_last_edit:timestamp")
            move("version", "_version_number")
            return true;
        }
    )
    private static latlon = new SimpleMetaTagger({
            keys: ["_lat", "_lon"],
            doc: "The latitude and longitude of the point (or centerpoint in the case of a way/area)"
        },
        (feature => {
            const centerPoint = GeoOperations.centerpoint(feature);
            const lat = centerPoint.geometry.coordinates[1];
            const lon = centerPoint.geometry.coordinates[0];
            feature.properties["_lat"] = "" + lat;
            feature.properties["_lon"] = "" + lon;
            feature._lon = lon; // This is dirty, I know
            feature._lat = lat;
            return true;
        })
    );
    private static layerInfo = new SimpleMetaTagger(
        {
            doc: "The layer-id to which this feature belongs. Note that this might be return any applicable if `passAllFeatures` is defined.",
            keys:["_layer"],
            includesDates: false,
        },
        (feature, freshness, layer) => {
            if(feature.properties._layer === layer.id){
                return false;
            }
            feature.properties._layer = layer.id
            return true;
        }
    )
    private static surfaceArea = new SimpleMetaTagger(
        {
            keys: ["_surface", "_surface:ha"],
            doc: "The surface area of the feature, in square meters and in hectare. Not set on points and ways",
            isLazy: true
        },
        (feature => {
            
            Object.defineProperty(feature.properties, "_surface", {
                enumerable: false,
                configurable: true,
                get: () => {
                    const sqMeters = ""+ GeoOperations.surfaceAreaInSqMeters(feature);
                    delete feature.properties["_surface"]
                    feature.properties["_surface"] = sqMeters;
                    return sqMeters
                }
            })

            Object.defineProperty(feature.properties, "_surface:ha", {
                enumerable: false,
                configurable: true,
                get: () => {
                    const sqMeters = GeoOperations.surfaceAreaInSqMeters(feature);
                    const sqMetersHa = "" + Math.floor(sqMeters / 1000) / 10;
                    delete feature.properties["_surface:ha"]
                    feature.properties["_surface:ha"] = sqMetersHa;
                    return sqMetersHa
                }
            })
            
            return true;
        })
    );

    private static canonicalize = new SimpleMetaTagger(
        {
            doc: "If 'units' is defined in the layoutConfig, then this metatagger will rewrite the specified keys to have the canonical form (e.g. `1meter` will be rewritten to `1m`)",
            keys: ["Theme-defined keys"],

        },
        (feature => {
            const units = Utils.NoNull([].concat(...State.state?.layoutToUse?.layers?.map(layer => layer.units ?? [])));
            if (units.length == 0) {
                return;
            }
            let rewritten = false;
            for (const key in feature.properties) {
                if (!feature.properties.hasOwnProperty(key)) {
                    continue;
                }
                for (const unit of units) {
                    if (unit === undefined) {
                        continue
                    }
                    if (unit.appliesToKeys === undefined) {
                        console.error("The unit ", unit, "has no appliesToKey defined")
                        continue
                    }
                    if (!unit.appliesToKeys.has(key)) {
                        continue;
                    }
                    const value = feature.properties[key]
                    const denom = unit.findDenomination(value)
                    if (denom === undefined) {
                        // no valid value found
                        break;
                    }
                    const [, denomination] = denom;
                    let canonical = denomination?.canonicalValue(value) ?? undefined;
                    if (canonical === value) {
                        break;
                    }
                    console.log("Rewritten ", key, ` from '${value}' into '${canonical}'`)
                    if (canonical === undefined && !unit.eraseInvalid) {
                        break;
                    }

                    feature.properties[key] = canonical;
                    rewritten = true;
                    break;
                }

            }
            return rewritten
        })
    )

    private static lngth = new SimpleMetaTagger(
        {
            keys: ["_length", "_length:km"],
            doc: "The total length of a feature in meters (and in kilometers, rounded to one decimal for '_length:km'). For a surface, the length of the perimeter"
        },
        (feature => {
            const l = GeoOperations.lengthInMeters(feature)
            feature.properties["_length"] = "" + l
            const km = Math.floor(l / 1000)
            const kmRest = Math.round((l - km * 1000) / 100)
            feature.properties["_length:km"] = "" + km + "." + kmRest
            return true;
        })
    )
    private static country = new SimpleMetaTagger(
        {
            keys: ["_country"],
            doc: "The country code of the property (with latlon2country)",
            includesDates: false
        },
        ((feature, _) => {
            let centerPoint: any = GeoOperations.centerpoint(feature);
            const lat = centerPoint.geometry.coordinates[1];
            const lon = centerPoint.geometry.coordinates[0];

            SimpleMetaTagger.coder?.GetCountryCodeFor(lon, lat, (countries: string[]) => {
                try {
                    const oldCountry = feature.properties["_country"];
                    feature.properties["_country"] = countries[0].trim().toLowerCase();
                    if (oldCountry !== feature.properties["_country"]) {
                        const tagsSource = State.state.allElements.getEventSourceById(feature.properties.id);
                        tagsSource.ping();
                    }
                } catch (e) {
                    console.warn(e)
                }
            })
            return false;
        })
    )
    private static isOpen = new SimpleMetaTagger(
        {
            keys: ["_isOpen", "_isOpen:description"],
            doc: "If 'opening_hours' is present, it will add the current state of the feature (being 'yes' or 'no')",
            includesDates: true,
            isLazy: true
        },
        (feature => {
            if (Utils.runningFromConsole) {
                // We are running from console, thus probably creating a cache
                // isOpen is irrelevant
                return false
            }
            
            Object.defineProperty(feature.properties, "_isOpen",{
                enumerable: false,
                configurable: true,
                get: () => {
                    delete feature.properties._isOpen
                    feature.properties._isOpen = undefined
                    const tagsSource = State.state.allElements.getEventSourceById(feature.properties.id);
                    tagsSource.addCallbackAndRunD(tags => {
                        if (tags.opening_hours === undefined || tags._country === undefined) {
                            return;
                        }
                        try {
                            const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
                            const oh = new opening_hours(tags["opening_hours"], {
                                lat: lat,
                                lon: lon,
                                address: {
                                    country_code: tags._country.toLowerCase()
                                }
                            }, {tag_key: "opening_hours"});
                            // AUtomatically triggered on the next change
                            const updateTags = () => {
                                const oldValueIsOpen = tags["_isOpen"];
                                const oldNextChange = tags["_isOpen:nextTrigger"] ?? 0;

                                if (oldNextChange > (new Date()).getTime() &&
                                    tags["_isOpen:oldvalue"] === tags["opening_hours"]
                                && tags["_isOpen"] !== undefined) {
                                    // Already calculated and should not yet be triggered
                                    return false;
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
                            return true; // Our job is done, lets unregister!
                        } catch (e) {
                            console.warn("Error while parsing opening hours of ", tags.id, e);
                            delete tags._isOpen
                            tags["_isOpen"] = "parse_error";
                        }

                    })
                    return undefined
                }
            })

        })
    )
    private static directionSimplified = new SimpleMetaTagger(
        {
            keys: ["_direction:numerical", "_direction:leftright"],
            doc: "_direction:numerical is a normalized, numerical direction based on 'camera:direction' or on 'direction'; it is only present if a valid direction is found (e.g. 38.5 or NE). _direction:leftright is either 'left' or 'right', which is left-looking on the map or 'right-looking' on the map"
        },
        (feature => {
            const tags = feature.properties;
            const direction = tags["camera:direction"] ?? tags["direction"];
            if (direction === undefined) {
                return false;
            }
            const n = cardinalDirections[direction] ?? Number(direction);
            if (isNaN(n)) {
                return false;
            }

            // The % operator has range (-360, 360). We apply a trick to get [0, 360).
            const normalized = ((n % 360) + 360) % 360;

            tags["_direction:numerical"] = normalized;
            tags["_direction:leftright"] = normalized <= 180 ? "right" : "left";
            return true;
        })
    )

    private static currentTime = new SimpleMetaTagger(
        {
            keys: ["_now:date", "_now:datetime", "_loaded:date", "_loaded:_datetime"],
            doc: "Adds the time that the data got loaded - pretty much the time of downloading from overpass. The format is YYYY-MM-DD hh:mm, aka 'sortable' aka ISO-8601-but-not-entirely",
            includesDates: true
        },
        (feature, freshness) => {
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
            return true;
        }
    )
    public static metatags = [
        SimpleMetaTagger.latlon,
        SimpleMetaTagger.layerInfo,
        SimpleMetaTagger.surfaceArea,
        SimpleMetaTagger.lngth,
        SimpleMetaTagger.canonicalize,
        SimpleMetaTagger.country,
        SimpleMetaTagger.isOpen,
        SimpleMetaTagger.directionSimplified,
        SimpleMetaTagger.currentTime,
        SimpleMetaTagger.objectMetaInfo

    ];
    public static readonly lazyTags: string[] = [].concat(...SimpleMetaTagger.metatags.filter(tagger => tagger.isLazy)
        .map(tagger => tagger.keys));

    public readonly keys: string[];
    public readonly doc: string;
    public readonly isLazy: boolean;
    public readonly includesDates: boolean
    public readonly applyMetaTagsOnFeature: (feature: any, freshness: Date, layer: LayerConfig) => boolean;
    
    /***
     * A function that adds some extra data to a feature
     * @param docs: what does this extra data do?
     * @param f: apply the changes. Returns true if something changed
     */
    constructor(docs: { keys: string[], doc: string, includesDates?: boolean, isLazy?: boolean },
                f: ((feature: any, freshness: Date, layer: LayerConfig) => boolean)) {
        this.keys = docs.keys;
        this.doc = docs.doc;
        this.isLazy = docs.isLazy
        this.applyMetaTagsOnFeature = f;
        this.includesDates = docs.includesDates ?? false;
        for (const key of docs.keys) {
            if (!key.startsWith('_') && key.toLowerCase().indexOf("theme") < 0) {
                throw `Incorrect metakey ${key}: it should start with underscore (_)`
            }
        }
    }

    public static HelpText(): BaseUIElement {
        const subElements: (string | BaseUIElement)[] = [
            new Combine([
                new Title("Metatags", 1),
                "Metatags are extra tags available, in order to display more data or to give better questions.",
                "The are calculated automatically on every feature when the data arrives in the webbrowser. This document gives an overview of the available metatags.",
                "**Hint:** when using metatags, add the [query parameter](URL_Parameters.md) `debug=true` to the URL. This will include a box in the popup for features which shows all the properties of the object"
            ]).SetClass("flex-col")

        ];

        subElements.push(new Title("Metatags calculated by MapComplete", 2))
        subElements.push(new FixedUiElement("The following values are always calculated, by default, by MapComplete and are available automatically on all elements in every theme"))
        for (const metatag of SimpleMetaTagger.metatags) {
            subElements.push(
                new Title(metatag.keys.join(", "), 3),
                metatag.doc,
                metatag.isLazy ? "This is a lazy metatag and is only calculated when needed" : ""
            )
        }

        return new Combine(subElements).SetClass("flex-col")
    }

}
