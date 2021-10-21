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
    width?: string | TagRenderingConfigJson;

    /**
     * A dasharray, e.g. "5 6"
     * The dasharray defines 'pixels of line, pixels of gap, pixels of line, pixels of gap',
     * Default value: "" (empty string == full line)
     */
    dashArray?: string | TagRenderingConfigJson

    /**
     * The number of pixels this line should be moved. 
     * Use a positive numbe to move to the right, a negative to move to the left (left/right as defined by the drawing direction of the line)
     */
    offset?: number | TagRenderingConfigJson
}