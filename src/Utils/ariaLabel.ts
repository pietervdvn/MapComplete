import { Translation } from "../UI/i18n/Translation"
import Locale from "../UI/i18n/Locale"

export function ariaLabel(htmlElement: Element, t: Translation) {
    if (!t) {
        return
    }
    let destroy: () => void = undefined

    Locale.language.map((language) => {
        if (!t.translations[language]) {
            console.log(
                "No aria label in",
                language,
                "for",
                t.context,
                "; en is",
                t.translations["en"]
            )
        }
    })

    t.current.map(
        (label) => {
            htmlElement.setAttribute("aria-label", label)
        },
        [],
        (f) => {
            destroy = f
        }
    )

    return { destroy }
}
