/**
 * Various tools and types to work with the community index (https://openstreetmap.community/; https://github.com/osmlab/osm-community-index)
 */

export interface CommunityResource {
    /**
     * A unique identifier for the resource
     * "pattern": "^[-_.A-Za-z0-9]+$"
     */
    id: string
    /**
     * Type of community resource (thus: platform)
     */
    type: string
    /**
     * included and excluded locations for this item
     * See location-conflation documentation for compatible values: https://github.com/rapideditor/location-conflation#readme
     */
    locationSet?

    /** Array of ISO-639-1 (2 letter) or ISO-639-3 (3 letter) codes in lowercase
     * */
    languageCodes?: string[]
    /**
     * Resource account string, required for some resource types
     */
    account?: string

    resolved?: { url: string; name: string; description: string } & Record<string, string>
}
