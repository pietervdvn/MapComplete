import BaseUIElement from "./BaseUIElement"

/**
 * @deprecated
 */
export abstract class UIElement extends BaseUIElement {
    /**
     * Should be overridden for specific HTML functionality
     */
    protected InnerConstructElement(): HTMLElement {
        // Uses the old fashioned way to construct an element using 'InnerRender'
        const innerRender = this.InnerRender()
        if (innerRender === undefined || innerRender === "") {
            return undefined
        }
        const el = document.createElement("span")
        if (typeof innerRender === "string") {
            el.innerHTML = innerRender
        } else {
            const subElement = innerRender.ConstructElement()
            if (subElement === undefined) {
                return undefined
            }
            el.appendChild(subElement)
        }
        return el
    }

    protected abstract InnerRender(): string | BaseUIElement
}
