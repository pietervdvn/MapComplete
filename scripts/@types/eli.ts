import { Feature, FeatureCollection } from "geojson"

export interface Eli extends FeatureCollection {
    features: EliEntry[]
}

export interface EliEntry extends Feature {
    properties: {
        /**
         * The name of the imagery source
         */
        name: string

        /**
         * Whether the imagery name should be translated
         */
        i18n?: boolean

        /**
         * Type of layer
         */
        type: "tms" | "wms" | "bing" | "scanex" | "wms_endpoint" | "wmts"

        /**
         * A rough categorisation of different types of layers.
         * @see https://github.com/osmlab/editor-layer-index/blob/gh-pages/CONTRIBUTING.md#categories
         */
        category?:
            | "photo"
            | "map"
            | "historicmap"
            | "osmbasedmap"
            | "historicphoto"
            | "qa"
            | "elevation"
            | "other"

        /**
         * A URL template for imagery tiles
         */
        url: string

        /**
         * The minimum zoom level
         */
        min_zoom?: number

        /**
         * The maximum zoom level
         */
        max_zoom?: number

        /**
         * explicit/implicit permission by the owner for use in OSM
         */
        permission_osm?: "explicit" | "implicit" | "no"

        /**
         * A URL for the license or permissions for the imagery
         */
        license_url?: string

        /**
         * A URL for the privacy policy of the operator or false if there is no existing privacy policy for tis imagery.
         */
        privacy_policy_url?: string | boolean

        /**
         * A unique identifier for the source; used in imagery_used changeset tag
         */
        id: string

        /**
         * A short English-language description of the source
         */
        description?: string

        /**
         * The ISO 3166-1 alpha-2 two letter country code in upper case. Use ZZ for unknown or multiple.
         */
        country_code?: string

        /**
         * Whether this imagery should be shown in the default world-wide menu
         */
        default?: boolean

        /**
         * Whether this imagery is the best source for the region
         */
        best?: boolean

        /**
         * The age of the oldest imagery or data in the source, as an RFC3339 date or leading portion of one
         */
        start_date?: string

        /**
         * The age of the newest imagery or data in the source, as an RFC3339 date or leading portion of one
         */
        end_date?: string

        /**
         * HTTP header to check for information if the tile is invalid
         */
        no_tile_header?: { [header: string]: string[] } | null

        /**
         * 'true' if tiles are transparent and can be overlaid on another source
         */
        overlay?: boolean

        /**
         * Available projections
         */
        available_projections?: string[]

        /**
         * Attribution
         */
        attribution?: {
            /**
             * URL
             */
            url?: string

            /**
             * Text
             */
            text?: string

            /**
             * HTML formatted attribution
             */
            html?: string

            /**
             * Whether attribution is required
             */
            required?: boolean
        }

        /**
         * A URL for an image, that can be displayed in the list of imagery layers next to the name
         */
        icon?: string

        /**
         * A link to an EULA text that has to be accepted by the user, before the imagery source is added. Can contain {lang} to be replaced by a current user language wiki code (like FR:) or an empty string for the default English text.
         */
        eula?: string

        /**
         * A URL for an image, that is displayed in the mapview for attribution
         */
        "logo-image"?: string

        /**
         * Customized text for the terms of use link (default is "Background Terms of Use")
         */
        "terms-of-use-text"?: string

        /**
         * Specify a checksum for tiles, which aren't real tiles. `type` is the digest type and can be MD5, SHA-1, SHA-256, SHA-384 and SHA-512, value is the hex encoded checksum in lower case. To create a checksum save the tile as file and upload it to e.g. https://defuse.ca/checksums.htm.
         */
        "no-tile-checksum"?: string

        /**
         * header-name attribute specifies a header returned by tile server, that will be shown as `metadata-key` attribute in Show Tile Info dialog
         */
        "metadata-header"?: string

        /**
         * Set to `true` if imagery source is properly aligned and does not need imagery offset adjustments. This is used for OSM based sources too.
         */
        "valid-georeference"?: boolean

        /**
         * Size of individual tiles delivered by a TMS service
         */
        "tile-size"?: number

        /**
         * Whether tiles status can be accessed by appending /status to the tile URL and can be submitted for re-rendering by appending /dirty.
         */
        "mod-tile-features"?: string

        /**
         * HTTP headers to be sent to server. It has two attributes header-name and header-value. May be specified multiple times.
         */
        "custom-http-headers"?: { "header-name": string; "header-value": string }[]

        /**
         * Default layer to open (when using WMS_ENDPOINT type). Contains list of layer tag with two attributes - name and style, e.g. `\"default-layers\": [\"layer\": { name=\"Basisdata_NP_Basiskart_JanMayen_WMTS_25829\" \"style\":\"default\" } ]` (not allowed in `mirror` attribute)
         */
        "default-layers"?: { layer: { "layer-name": string; "layer-style": string } }[]

        /**
         * format to use when connecting tile server (when using WMS_ENDPOINT type)
         */
        format?: string

        /**
         * If `true` transparent tiles will be requested from WMS server
         */
        transparent?: boolean

        /**
         * minimum expiry time for tiles in seconds. The larger the value, the longer entry in cache will be considered valid
         */
        "minimum-tile-expire"?: number
    }
}
