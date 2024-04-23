import { MinimalTagRenderingConfigJson, TagRenderingConfigJson } from "./TagRenderingConfigJson"
import { TagConfigJson } from "./TagConfigJson"

export interface IconConfigJson {
    /**
     * question: What icon should be used?
     * type: icon
     * suggestions: return Constants.defaultPinIcons.map(i => ({if: "value="+i, then: i, icon: i}))
     */
    icon: string | MinimalTagRenderingConfigJson | { builtin: string; override: any }
    /**
     * question: What colour should the icon be?
     * This will only work for the default icons such as `pin`,`circle`,...
     * type: color
     */
    color?: string | MinimalTagRenderingConfigJson | { builtin: string; override: any }
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
     * suggestions: return [{if: "value=point",then: "Show an icon for point (node) objects"},{if: "value=centroid",then: "Show an icon for line or polygon (way) objects at their centroid location"}, {if: "value=start",then: "Show an icon for line (way) objects at the start"},{if: "value=end",then: "Show an icon for line (way) object at the end"},{if: "value=projected_centerpoint",then: "Show an icon for line (way) object near the centroid location, but moved onto the line. Does not show an item on polygons"}, {if: "value=polygon_centroid",then: "Show an icon at a polygon centroid (but not if it is a way)"}]
     */
    location: (
        | "point"
        | "centroid"
        | "start"
        | "end"
        | "projected_centerpoint"
        | "polygon_centroid"
        | string
    )[]

    /**
     * The marker for an element.
     * Note that this also defines the icon for this layer (rendered with the overpass-tags) <i>and</i> the icon in the presets.
     *
     * The result of the icon is rendered as follows:
     * - The first icon is rendered on the map
     * - The second entry is overlayed on top of it
     * - ...
     *
     * As a result, on could use a generic icon (`pin`, `circle`, `square`) with a color, then overlay it with a specific icon.
     */
    marker?: IconConfigJson[]

    /**
     * A list of extra badges to show next to the icon as small badge
     * They will be added as a 25% height icon at the bottom right of the icon, with all the badges in a flex layout.
     *
     * Note: strings are interpreted as icons, so layering and substituting is supported. You can use `circle:white;./my_icon.svg` to add a background circle
     * group: hidden
     */
    iconBadges?: {
        if: TagConfigJson
        /**
         * Badge to show
         * Type: icon
         */
        then: string | MinimalTagRenderingConfigJson
    }[]

    /**
     * question: What size should the marker be on the map?
     * A string containing "<width>,<height>" in pixels
     * ifunset: Use the default size (<b>40,40</b> px)
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
     * question: What rotation should be applied on the icon?
     * This is mostly useful for items that face a specific direction, such as surveillance cameras
     * This is interpreted as css property for 'rotate', thus has to end with 'deg', e.g. `90deg`, `{direction}deg`, `calc(90deg - {camera:direction}deg)``
     * ifunset: Do not rotate
     */
    rotation?: string | TagRenderingConfigJson
    /**
     * question: What label should be shown beneath the marker?
     * For example: `&LT;div style="background: white">{name}&LT;/div>`
     *
     * If the icon is undefined, then the label is shown in the center of the feature.
     * types: Dynamic value based on the attributes ; string
     * inline: Always show label <b>{value}</b> beneath the marker
     * ifunset: Do not show a label beneath the marker
     */
    label?: string | TagRenderingConfigJson

    /**
     * question: What CSS should be applied to the label?
     * You can set the css-properties here, e.g. `background: red; font-size: 12px; `
     * inline: Apply CSS-style <b>{value}</b> to the label
     * types: Dynamic value ; string
     * ifunset: Do not apply extra CSS-labels to the label
     * group: expert
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
     * ifunset: Do not apply extra CSS-classes to the label
     * suggestions: return [{if: "value=bg-white rounded px-2", then: "Draw on a white background"}]
     */
    labelCssClasses?: string | TagRenderingConfigJson

    /**
     * question: What CSS should be applied to the entire marker?
     * You can set the css-properties here, e.g. `background: red; font-size: 12px; `
     * This will be applied to the _container_ containing both the marker and the label
     * inline: Apply CSS-style <b>{value}</b> to the _entire marker_
     * types: Dynamic value ; string
     * ifunset: Do not apply extra CSS element to the entire marker
     * group: expert
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
     * ifunset: Do not apply extra CSS-classes to the label
     * types: Dynamic value ; string
     * ifunset: Do not apply extra CSS-classes to the entire marker
     * group: expert
     */
    cssClasses?: string | TagRenderingConfigJson

    /**
     * question: If the map is pitched, should the icon stay parallel to the screen or to the groundplane?
     * suggestions: return [{if: "value=canvas", then: "The icon will stay upward and not be transformed as if it sticks to the screen"}, {if: "value=map", then: "The icon will be transformed as if it were painted onto the ground. (Automatically sets rotationAlignment)"}]
     * group: expert
     */
    pitchAlignment?: "canvas" | "map" | TagRenderingConfigJson

    /**
     * question: Should the icon be rotated if the map is rotated?
     * ifunset: Do not rotate or tilt icons. Always keep the icons straight
     * suggestions: return [{if: "value=canvas", then: "Never rotate the icon"}, {if: "value=map", then: "If the map is rotated, rotate the icon as well. This gives the impression of an icon that floats perpendicular above the ground."}]
     * group: expert
     */
    rotationAlignment?: "map" | "canvas" | TagRenderingConfigJson
}
