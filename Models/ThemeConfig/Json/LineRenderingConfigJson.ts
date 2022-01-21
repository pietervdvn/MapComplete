import {TagRenderingConfigJson} from "./TagRenderingConfigJson";

/**
 * The LineRenderingConfig gives all details onto how to render a single line of a feature.
 *
 * This can be used if:
 *
 * - The feature is a line
 * - The feature is an area
 */
export default interface LineRenderingConfigJson {

    /**
     * The color for way-elements and SVG-elements.
     * If the value starts with "--", the style of the body element will be queried for the corresponding variable instead
     */
    color?: string | TagRenderingConfigJson;
    /**
     * The stroke-width for way-elements
     */
    width?: string | number | TagRenderingConfigJson;

    /**
     * A dasharray, e.g. "5 6"
     * The dasharray defines 'pixels of line, pixels of gap, pixels of line, pixels of gap',
     * Default value: "" (empty string == full line)
     */
    dashArray?: string | TagRenderingConfigJson

    /**
     * The form at the end of a line
     */
    lineCap?: "round" | "square" | "butt" | string | TagRenderingConfigJson

    /**
     * Wehter or not to fill polygons
     */
    fill?: "yes" | "no" | TagRenderingConfigJson

    /**
     * The color to fill a polygon with.
     * If undefined, this will be slightly more opaque version of the stroke line
     */
    fillColor?: string | TagRenderingConfigJson

    /**
     * The number of pixels this line should be moved.
     * Use a positive numbe to move to the right, a negative to move to the left (left/right as defined by the drawing direction of the line).
     *
     * IMPORTANT: MapComplete will already normalize 'key:both:property' and 'key:both' into the corresponding 'key:left' and 'key:right' tagging (same for 'sidewalk=left/right/both' which is rewritten to 'sidewalk:left' and 'sidewalk:right')
     * This simplifies programming. Refer to the CalculatedTags.md-documentation for more details
     */
    offset?: number | TagRenderingConfigJson
}