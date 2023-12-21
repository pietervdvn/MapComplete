import { Translation } from "../UI/i18n/Translation"
import { Store } from "../Logic/UIEventSource"

export function ariaLabel(htmlElement: Element, t: Translation) {
    ariaLabelStore(htmlElement, t?.current)
}

export function ariaLabelStore(htmlElement: Element, t: Store<string>) {
    if (!t) {
        return
    }
    let destroy: () => void = undefined

    t?.mapD(
        (label) => {
            htmlElement.setAttribute("aria-label", label)
            // Set the tooltip, which is the 'title' attribute of an html-element
            htmlElement.setAttribute("title", label)
        },
        [],
        (f) => {
            destroy = f
        }
    )

    return { destroy }
}
