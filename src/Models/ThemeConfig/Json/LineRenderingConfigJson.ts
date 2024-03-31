import { MinimalTagRenderingConfigJson } from "./TagRenderingConfigJson"
import { TagConfigJson } from "./TagConfigJson"

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
     * question: What color should lines be drawn in?
     *
     * For an area, this will be the colour of the outside line.
     * If the value starts with "--", the style of the body element will be queried for the corresponding variable instead
     *
     * types: dynamic value ; string
     * title: Line Colour
     * inline: The line colour always is <b>{value}</b>
     * type: color
     *
     */
    color?: MinimalTagRenderingConfigJson | string
    /**
     * question: How wide should the line be?
     * The stroke-width for way-elements
     *
     * types: dynamic value ; string
     * title: Line width
     * inline: The line width is <b>{value} pixels</b>
     * type: pnat
     * ifunset: Use the default-linewidth of 7 pixels
     */
    width?: MinimalTagRenderingConfigJson | number | string

    /**
     * question: Should a dasharray be used to render the lines?
     * The dasharray defines 'pixels of line, pixels of gap, pixels of line, pixels of gap, ...'. For example, `5 6` will be 5 pixels of line followed by a 6 pixel gap.
     * Cannot be a dynamic property due to a MapLibre limitation (see https://github.com/maplibre/maplibre-gl-js/issues/1235)
     * ifunset: Ways are rendered with a full line
     */
    dashArray?: string

    /**
     * question: What form should the line-ending have?
     * suggestions: return [{if:"value=round",then:"Round endings"}, {if: "value=square", then: "square endings"}, {if: "value=butt", then: "no ending (square ending at the end, without padding)"}]
     * types: dynamic value ; string
     * title: Line Cap
     * ifunset: Use the default value (round ending)
     **/
    lineCap?: "round" | "square" | "butt" | string | MinimalTagRenderingConfigJson

    /**
     * question: What colour should be used as fill colour for polygons?
     * ifunset: The polygon fill colour will be a more transparent version of the stroke colour
     * suggestions: return [{if: "value=#00000000", then: "Use a transparent fill (only render the outline)"}]
     * inline: The fill colour is <b>{value}</b>
     * types: dynamic value ; string
     * type: color
     */
    fillColor?: string | MinimalTagRenderingConfigJson

    /**
     * question: Should the lines be moved (offsetted) with a number of pixels against the geographical lines?
     * The number of pixels this line should be moved.
     * Use a positive number to move to the right in the drawing direction or a negative to move to the left (left/right as defined by the drawing direction of the line).
     *
     * IMPORTANT: MapComplete will already normalize 'key:both:property' and 'key:both' into the corresponding 'key:left' and 'key:right' tagging (same for 'sidewalk=left/right/both' which is rewritten to 'sidewalk:left' and 'sidewalk:right')
     * This simplifies programming. Refer to the CalculatedTags.md-documentation for more details
     * ifunset: don't offset lines on the map
     * inline: Pixel offset by <b>{value}</b> pixels
     * types: dynamic value ; number
     * type: int
     */
    offset?: number | MinimalTagRenderingConfigJson
    /**
     * question: What PNG-image should be shown along the way?
     *
     * ifunset: no image is shown along the way
     * suggestions: [{if: "./assets/png/oneway.png", then: "Show a oneway error"}]
     * type: image
     */
    imageAlongWay?: { if: TagConfigJson; then: string }[] | string
}
