export function focusWithArrows(htmlElement: HTMLDivElement, classname: string) {
    const destroy: () => void = undefined
    htmlElement.addEventListener("keyup", (e) => {
        const currentElement = document.activeElement
        const canBeSelected = <HTMLElement[]>(
            Array.from(htmlElement.getElementsByClassName(classname))
        )

        const i = canBeSelected.findIndex(
            (el) => el.contains(currentElement) || el === currentElement
        )
        const l = canBeSelected.length
        if (e.key === "ArrowDown") {
            canBeSelected.at((i + 1) % l).focus()
            return
        }

        if (e.key === "ArrowUp") {
            canBeSelected.at(i - 1).focus()
            return
        }
    })
    return { destroy }
}
