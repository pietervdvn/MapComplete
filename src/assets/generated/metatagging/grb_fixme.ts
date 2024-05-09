import { Feature } from "geojson"
import { ExtraFuncType } from "../../../Logic/ExtraFunctions"
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
    public static readonly themeName = "grb_fixme"

    public metaTaggging_for_named_streets(
        feat: Feature,
        helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>
    ) {
        const {
            distanceTo,
            overlapWith,
            enclosingFeatures,
            intersectionsWith,
            closest,
            closestn,
            get,
        } = helperFunctions
    }
    public metaTaggging_for_osm_buildings_fixme(
        feat: Feature,
        helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>
    ) {
        const {
            distanceTo,
            overlapWith,
            enclosingFeatures,
            intersectionsWith,
            closest,
            closestn,
            get,
        } = helperFunctions
        Utils.AddLazyProperty(
            feat.properties,
            "_grbNumber",
            () =>
                (feat.properties.fixme?.match(
                    /GRB thinks that this has number ([0-9a-zA-Z;]+)/
                ) ?? ["", "none"])[1]
        )
    }
    public metaTaggging_for_address(
        feat: Feature,
        helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>
    ) {
        const {
            distanceTo,
            overlapWith,
            enclosingFeatures,
            intersectionsWith,
            closest,
            closestn,
            get,
        } = helperFunctions
        Utils.AddLazyProperty(feat.properties, "_closest_3_street_names", () =>
            closestn(feat)("named_streets", 3, "name").map((f) => f.feat.properties.name)
        )
        Utils.AddLazyProperty(
            feat.properties,
            "_closest_street:0:name",
            () => JSON.parse(feat.properties._closest_3_street_names)[0]
        )
        Utils.AddLazyProperty(
            feat.properties,
            "_closest_street:1:name",
            () => JSON.parse(feat.properties._closest_3_street_names)[1]
        )
        Utils.AddLazyProperty(
            feat.properties,
            "_closest_street:2:name",
            () => JSON.parse(feat.properties._closest_3_street_names)[2]
        )
    }
    public metaTaggging_for_crab_address(
        feat: Feature,
        helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>
    ) {
        const {
            distanceTo,
            overlapWith,
            enclosingFeatures,
            intersectionsWith,
            closest,
            closestn,
            get,
        } = helperFunctions
        Utils.AddLazyProperty(feat.properties, "_HNRLABEL", () =>
            (() => {
                const lbl = feat.properties.HNRLABEL?.split("-")
                    ?.map((l) => Number(l))
                    ?.filter((i) => !isNaN(i))
                if (lbl?.length != 2) {
                    return feat.properties.HNRLABEL
                }
                const addresses = []
                for (let i = lbl[0]; i <= lbl[1]; i += 1) {
                    addresses.push("" + i)
                }
                return addresses.join(";")
            })()
        )
    }
    public metaTaggging_for_selected_element(
        feat: Feature,
        helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>
    ) {
        const {
            distanceTo,
            overlapWith,
            enclosingFeatures,
            intersectionsWith,
            closest,
            closestn,
            get,
        } = helperFunctions
    }
    public metaTaggging_for_gps_location(
        feat: Feature,
        helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>
    ) {
        const {
            distanceTo,
            overlapWith,
            enclosingFeatures,
            intersectionsWith,
            closest,
            closestn,
            get,
        } = helperFunctions
    }
    public metaTaggging_for_gps_location_history(
        feat: Feature,
        helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>
    ) {
        const {
            distanceTo,
            overlapWith,
            enclosingFeatures,
            intersectionsWith,
            closest,
            closestn,
            get,
        } = helperFunctions
    }
    public metaTaggging_for_home_location(
        feat: Feature,
        helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>
    ) {
        const {
            distanceTo,
            overlapWith,
            enclosingFeatures,
            intersectionsWith,
            closest,
            closestn,
            get,
        } = helperFunctions
    }
    public metaTaggging_for_gps_track(
        feat: Feature,
        helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>
    ) {
        const {
            distanceTo,
            overlapWith,
            enclosingFeatures,
            intersectionsWith,
            closest,
            closestn,
            get,
        } = helperFunctions
    }
    public metaTaggging_for_range(
        feat: Feature,
        helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>
    ) {
        const {
            distanceTo,
            overlapWith,
            enclosingFeatures,
            intersectionsWith,
            closest,
            closestn,
            get,
        } = helperFunctions
    }
    public metaTaggging_for_last_click(
        feat: Feature,
        helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>
    ) {
        const {
            distanceTo,
            overlapWith,
            enclosingFeatures,
            intersectionsWith,
            closest,
            closestn,
            get,
        } = helperFunctions
    }
}
