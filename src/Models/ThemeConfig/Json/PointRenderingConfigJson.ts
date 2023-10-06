import { TagRenderingConfigJson } from "./TagRenderingConfigJson"
import { TagConfigJson } from "./TagConfigJson"

export interface IconConfigJson {
    icon: string | TagRenderingConfigJson | { builtin: string; override: any }
    color?: string | TagRenderingConfigJson | { builtin: string; override: any }
}

/**
 * The PointRenderingConfig gives all details onto how to render a single point of a feature.
 *
 * This can be used if:
 *
 * - The feature is a point
 * - To render something at the centroid of an area, or at the start, end or projected centroid of a way
 */
export default interface PointRenderingConfigJson {
    /**
     * question: At what location should this icon be shown?
     * multianswer: true
     * suggestions: return [{if: "value=point",then: "Show an icon for point (node) objects"},{if: "value=centroid",then: "Show an icon for line or polygon (way) objects at their centroid location"}, {if: "value=start",then: "Show an icon for line (way) objects at the start"},{if: "value=end",then: "Show an icon for line (way) object at the end"},{if: "value=projected_centerpoint",then: "Show an icon for line (way) object near the centroid location, but moved onto the line"}]
     */
    location: ("point" | "centroid" | "start" | "end" | "projected_centerpoint" | string)[]

    /**
   * question: What marker should be used to
   * The icon for an element.
   * Note that this also doubles as the icon for this layer (rendered with the overpass-tags) ánd the icon in the presets.
   *
   * The result of the icon is rendered as follows:
   * the resulting string is interpreted as a _list_ of items, separated by ";". The bottommost layer is the first layer.
   * As a result, on could use a generic pin, then overlay it with a specific icon.
   * To make things even more practical, one c    an use all SVG's from the folder "assets/svg" and _substitute the color_ in it.
   * E.g. to draw a red pin, use "pin:#f00", to have a green circle with your icon on top, use `circle:#0f0;<path to my icon.svg>`

   * Type: icon
   */
    marker?: IconConfigJson[]

    /**
     * A list of extra badges to show next to the icon as small badge
     * They will be added as a 25% height icon at the bottom right of the icon, with all the badges in a flex layout.
     *
     * Note: strings are interpreted as icons, so layering and substituting is supported. You can use `circle:white;./my_icon.svg` to add a background circle
     */
    iconBadges?: {
        if: TagConfigJson
        /**
         * Badge to show
         * Type: icon
         */
        then: string | TagRenderingConfigJson
    }[]

    /**
     * A string containing "width,height" or "width,height,anchorpoint" where anchorpoint is any of 'center', 'top', 'bottom', 'left', 'right', 'bottomleft','topright', ...
     * Default is '40,40,center'
     */
    iconSize?: string | TagRenderingConfigJson

    /**
     * question: What is the anchorpoint of the icon?
     *
     * This matches the geographical point with a location on the icon.
     *
     * ifunset: Use MapComplete-default (<b>center</b>)
     * suggestions: return [{if: "value=center", then: "Place the <b>center</b> of the icon on the geographical location"},{if: "value=top", then: "Place the <b>top</b> of the icon on the geographical location"},{if: "value=bottom", then: "Place the <b>bottom</b> of the icon on the geographical location"},{if: "value=left", then: "Place the <b>left</b> of the icon on the geographical location"},{if: "value=right", then: "Place the <b>right</b> of the icon on the geographical location"}]
     */
    anchor?: "center" | "top" | "bottom" | "left" | "right" | string | TagRenderingConfigJson

    /**
     * The rotation of an icon, useful for e.g. directions.
     * Usage: as if it were a css property for 'rotate', thus has to end with 'deg', e.g. `90deg`, `{direction}deg`, `calc(90deg - {camera:direction}deg)``
     */
    rotation?: string | TagRenderingConfigJson
    /**
     * question: What label should be shown beneath the marker?
     * For example: <div style="background: white">{name}</div>
     *
     * If the icon is undefined, then the label is shown in the center of the feature.
     * types: Dynamic value | string
     * inline: Always show label <b>{value}</b> beneath the marker
     */
    label?: string | TagRenderingConfigJson

    /**
     * question: What CSS should be applied to the entire marker?
     * You can set the css-properties here, e.g. `background: red; font-size: 12px; `
     * This will be applied to the _container_ containing both the marker and the label
     * inline: Apply CSS-style <b>{value}</b> to the _entire marker_
     * types: Dynamic value ; string
     */
    css?: string | TagRenderingConfigJson

    /**
     * question: Which CSS-classes should be applied to the entire marker?
     * This will be applied to the _container_ containing both the marker and the label
     *
     * The classes should be separated by a space (` `)
     * You can use most Tailwind-css classes, see https://tailwindcss.com/ for more information
     * For example: `center bg-gray-500 mx-2 my-1 rounded-full`
     * inline: Apply CSS-classes <b>{value}</b> to the entire container
     * types: Dynamic value ; string
     */
    cssClasses?: string | TagRenderingConfigJson

    /**
     * question: What CSS should be applied to the label?
     * You can set the css-properties here, e.g. `background: red; font-size: 12px; `
     * inline: Apply CSS-style <b>{value}</b> to the label
     * types: Dynamic value ; string
     */
    labelCss?: TagRenderingConfigJson | string

    /**
     * question: Which CSS-classes should be applied to the label?
     *
     * The classes should be separated by a space (` `)
     * You can use most Tailwind-css classes, see https://tailwindcss.com/ for more information
     * For example: `center bg-gray-500 mx-2 my-1 rounded-full`
     * inline: Apply CSS-classes <b>{value}</b> to the label
     * types: Dynamic value ; string
     */
    labelCssClasses?: string | TagRenderingConfigJson

    /**
     * If the map is pitched, the marker will stay parallel to the screen.
     * Set to 'map' if you want to put it flattened on the map
     */
    pitchAlignment?: "canvas" | "map" | TagRenderingConfigJson

    /**
     * question: Should the icon be rotated or tilted if the map is rotated or tilted?
     * ifunset: Do not rotate or tilt icons. Always keep the icons straight
     * suggestions: return [{if: "value=canvas", then: "If the map is tilted, tilt the icon as well. This gives the impression of an icon that is glued to the ground."}, {if: "value=map", then: "If the map is rotated, rotate the icon as well. This gives the impression of an icon that floats perpendicular above the ground."}]
     */
    rotationAlignment?: "map" | "canvas" | TagRenderingConfigJson
}
