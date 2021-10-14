/**
 * Configuration for a tilesource config
 */
export default interface TilesourceConfigJson {


    /**
     * The path, where {x}, {y} and {z} will be substituted
     */
    source: string,
    
    isOverlay?: boolean,

    /**
     * How this will be shown in the selection menu.
     * Make undefined if this may not be toggled
     */
    name?: any | string

    /**
     * Only visible at this or a higher zoom level
     */
    minZoom?: number

    /**
     * Only visible at this or a lower zoom level
     */
    maxZoom?: number


    /**
     * The default state, set to false to hide by default
     */
    defaultState: boolean;

}