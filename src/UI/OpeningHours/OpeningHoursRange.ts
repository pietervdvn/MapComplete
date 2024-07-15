/**
 * A single opening hours range, shown on top of the OH-picker table
 */
import { Utils } from "../../Utils"
import Combine from "../Base/Combine"
import { OH, OpeningHour } from "./OpeningHours"
import BaseUIElement from "../BaseUIElement"
import { FixedUiElement } from "../Base/FixedUiElement"
import SvelteUIElement from "../Base/SvelteUIElement"
import Delete_icon from "../../assets/svg/Delete_icon.svelte"

export default class OpeningHoursRange extends BaseUIElement {
    private _oh: OpeningHour

    private readonly _onDelete: () => void

    constructor(oh: OpeningHour, onDelete: () => void) {
        super()
        this._oh = oh
        this._onDelete = onDelete
        this.SetClass("oh-timerange")
    }

    InnerConstructElement(): HTMLElement {
        const height = this.getHeight()
        const oh = this._oh
        const startTime = new FixedUiElement(
            Utils.TwoDigits(oh.startHour) + ":" + Utils.TwoDigits(oh.startMinutes)
        )
        const endTime = new FixedUiElement(
            Utils.TwoDigits(oh.endHour) + ":" + Utils.TwoDigits(oh.endMinutes)
        )

        const deleteRange = new SvelteUIElement(Delete_icon)
            .SetClass("rounded-full w-6 h-6 block bg-black pointer-events-auto  ")
            .onClick(() => {
                this._onDelete()
            })

        let content: BaseUIElement
        if (height > 2) {
            content = new Combine([startTime, deleteRange, endTime]).SetClass(
                "flex flex-col h-full justify-between"
            )
        } else {
            content = new Combine([deleteRange])
                .SetClass("flex flex-col h-full")
                .SetStyle("flex-content: center; overflow-x: unset;")
        }

        const el = new Combine([content]).ConstructElement()

        el.style.top = `${(100 * OH.startTime(oh)) / 24}%`
        el.style.height = `${(100 * this.getHeight()) / 24}%`
        return el
    }

    private getHeight(): number {
        const oh = this._oh

        let endhour = oh.endHour
        if (oh.endHour == 0 && oh.endMinutes == 0) {
            endhour = 24
        }
        return endhour - oh.startHour + (oh.endMinutes - oh.startMinutes) / 60
    }
}
