import { Translation } from "../UI/i18n/Translation"

export function placeholder(htmlElement: HTMLInputElement | HTMLTextAreaElement, t: Translation) {
    let destroy: () => void = undefined

    t.current.map(
        (label) => {
            htmlElement.setAttribute("placeholder", label)
        },
        [],
        (f) => {
            destroy = f
        }
    )

    return { destroy }
}
