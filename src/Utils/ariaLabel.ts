import { Translation } from "../UI/i18n/Translation"

export function ariaLabel(htmlElement: Element, t: Translation) {
    let onDestroy: () => void = undefined

    t.current.map(
        (label) => {
            console.log("Setting arialabel", label, "to", htmlElement)
            htmlElement.setAttribute("aria-label", label)
        },
        [],
        (f) => {
            onDestroy = f
        }
    )

    return {
        destroy() {},
    }
}
