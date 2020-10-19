import {GeoOperations} from "./GeoOperations";
import CodeGrid from "./Web/CodeGrid";
import State from "../State";
import opening_hours from "opening_hours";


class SimpleMetaTagger {
    private _f: (feature: any) => void;
    public readonly keys: string[];
    public readonly doc: string;


    constructor(keys: string[], doc: string, f: ((feature: any) => void)) {
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
        for (const feature of features) {
            this._f(feature);
        }
    }


}


/**
 * Metatagging adds various tags to the elements, e.g. lat, lon, surface area, ...
 *
 * All metatags start with an underscore
 */
export default class MetaTagging {


    public static metatags = [
        new SimpleMetaTagger(["_lat", "_lon"], "The latitude and longitude of the point (or centerpoint in the case of a way/area)",
            (feature => {
                const centerPoint = GeoOperations.centerpoint(feature);
                const lat = centerPoint.geometry.coordinates[1];
                const lon = centerPoint.geometry.coordinates[0];
                feature.properties["_lat"] = "" + lat;
                feature.properties["_lon"] = "" + lon;
            })
        ),
        new SimpleMetaTagger(
            ["_surface", "_surface:ha"], "The surface area of the feature, in square meters and in hectare. Not set on points and ways",
            (feature => {
                const sqMeters = GeoOperations.surfaceAreaInSqMeters(feature);
                feature.properties["_surface"] = "" + sqMeters;
                feature.properties["_surface:ha"] = "" + Math.floor(sqMeters / 1000) / 10;

            })
        ),


        new SimpleMetaTagger(
            ["_country"], "The country code of the point",
            (feature => {
                const centerPoint = GeoOperations.centerpoint(feature);
                const lat = centerPoint.geometry.coordinates[1];
                const lon = centerPoint.geometry.coordinates[0]
                // But the codegrid SHOULD be a number!
                CodeGrid.getCode(lat, lon, (error, code) => {
                    if (error === null) {
                        feature.properties["_country"] = code;
                        State.state.allElements.addOrGetElement(feature).ping();
                    } else {
                        console.warn("Could not determine country for", feature.properties.id, error);
                    }
                });
            })
        ),
        new SimpleMetaTagger(
            ["_isOpen", "_isOpen:description"], "If 'opening_hours' is present, it will add the current state of the feature (being 'yes' or 'no",
            (feature => {
                const tagsSource = State.state.allElements.addOrGetElement(feature);
                tagsSource.addCallback(tags => {

                    if (tags["opening_hours"] !== undefined && tags["_country"] !== undefined) {

                        const oh = new opening_hours(tags["opening_hours"], {
                            lat: tags._lat,
                            lon: tags._lon,
                            address: {
                                country_code: tags._country
                            }
                        }, {tag_key: "opening_hours"});

                        const updateTags = () => {
                            tags["_isOpen"] = oh.getState() ? "yes" : "no";
                            const comment = oh.getComment();
                            if (comment) {
                                tags["_isOpen:description"] = comment;
                            }
                            const nextChange = oh.getNextChange() as Date;
                            window.setTimeout(
                                updateTags,
                                (nextChange.getTime() - (new Date()).getTime())
                            )
                        }
                        updateTags();
                    }

                })

            })
        )
    ];

    static addMetatags(features: any[]) {

        for (const metatag of MetaTagging.metatags) {
            metatag.addMetaTags(features);
        }

    }
}
