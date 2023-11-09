import { Translatable } from "./Translatable"

export default interface ExtraLinkConfigJson {
    /**
     * question: What icon should be shown in the link button?
     * ifunset: do not show an icon
     * type: icon
     */
    icon?: string
    /**
     * question: What text should be shown in the link icon?
     *
     * Note that {lat},{lon},{zoom}, {language} and {theme} will be replaced
     *
     * ifunset: do not show a text
     */
    text?: Translatable
    /**
     * question: if clicked, what webpage should open?
     * Note that {lat},{lon},{zoom}, {language} and {theme} will be replaced
     *
     * type: url
     */
    href: string
    /**
     * question: Should the link open in a new tab?
     * iftrue: Open in a new tab
     * iffalse: do not open in a new tab
     * ifunset: do not open in a new tab
     */
    newTab?: false | boolean
    /**
     * question: When should the extra button be shown?
     * suggestions: return [{if: "value=iframe", then: "When shown in an iframe"}, {if: "value=no-iframe", then: "When shown as stand-alone webpage"}, {if: "value=welcome-message", then: "When the welcome messages are enabled"}, {if: "value=iframe", then: "When the welcome messages are disabled"}]
     */
    requirements?: ("iframe" | "no-iframe" | "welcome-message" | "no-welcome-message")[]
}
