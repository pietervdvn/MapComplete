import {TagRenderingConfigJson} from "./TagRenderingConfigJson";
import {AndOrTagConfigJson} from "./TagConfigJson";

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
     * All the locations that this point should be rendered at.
     * Using `location: ["point", "centroid"] will always render centerpoint
     */
    location: ("point" | "centroid" | "start" | "end" | string)[]

    /**
     * The icon for an element.
     * Note that this also doubles as the icon for this layer (rendered with the overpass-tags) ánd the icon in the presets.
     *
     * The result of the icon is rendered as follows:
     * the resulting string is interpreted as a _list_ of items, separated by ";". The bottommost layer is the first layer.
     * As a result, on could use a generic pin, then overlay it with a specific icon.
     * To make things even more practical, one can use all SVG's from the folder "assets/svg" and _substitute the color_ in it.
     * E.g. to draw a red pin, use "pin:#f00", to have a green circle with your icon on top, use `circle:#0f0;<path to my icon.svg>`

     * Type: icon
     */
    icon?: string | TagRenderingConfigJson;

    /**
     * A list of extra badges to show next to the icon as small badge
     * They will be added as a 25% height icon at the bottom right of the icon, with all the badges in a flex layout.
     *
     * Note: strings are interpreted as icons, so layering and substituting is supported. You can use `circle:white;./my_icon.svg` to add a background circle
     */
    iconBadges?: { if: string | AndOrTagConfigJson, 
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
    iconSize?: string | TagRenderingConfigJson;
    /**
     * The rotation of an icon, useful for e.g. directions.
     * Usage: as if it were a css property for 'rotate', thus has to end with 'deg', e.g. `90deg`, `{direction}deg`, `calc(90deg - {camera:direction}deg)``
     */
    rotation?: string | TagRenderingConfigJson;
    /**
     * A HTML-fragment that is shown below the icon, for example:
     * <div style="background: white; display: block">{name}</div>
     *
     * If the icon is undefined, then the label is shown in the center of the feature.
     * Note that, if the wayhandling hides the icon then no label is shown as well.
     */
    label?: string | TagRenderingConfigJson;
}