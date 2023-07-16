import BaseUIElement from "../BaseUIElement"
import {InputElement} from "./InputElement"
import {UIEventSource} from "../../Logic/UIEventSource"

/**
 * @deprecated
 */
export default class FileSelectorButton extends InputElement<FileList> {
    private static _nextid = 0
    private readonly _value = new UIEventSource<FileList>(undefined)
    private readonly _label: BaseUIElement
    private readonly _acceptType: string
    private readonly allowMultiple: boolean
    private readonly _labelClasses: string

    constructor(
        label: BaseUIElement,
        options?: {
            acceptType: "image/*" | string
            allowMultiple: true | boolean
            labelClasses?: string
        }
    ) {
        super()
        this._label = label
        this._acceptType = options?.acceptType ?? "image/*"
        this._labelClasses = options?.labelClasses ?? ""
        this.SetClass("block cursor-pointer")
        label.SetClass("cursor-pointer")
        this.allowMultiple = options?.allowMultiple ?? true
    }

    GetValue(): UIEventSource<FileList> {
        return this._value
    }

    IsValid(t: FileList): boolean {
        return true
    }

    protected InnerConstructElement(): HTMLElement {
        const self = this
        const el = document.createElement("form")
        const label = document.createElement("label")
        label.appendChild(this._label.ConstructElement())
        label.classList.add(...this._labelClasses.split(" ").filter((t) => t !== ""))
        el.appendChild(label)

        const actualInputElement = document.createElement("input")
        actualInputElement.style.cssText = "display:none"
        actualInputElement.type = "file"
        actualInputElement.accept = this._acceptType
        actualInputElement.name = "picField"
        actualInputElement.multiple = this.allowMultiple
        actualInputElement.id = "fileselector" + FileSelectorButton._nextid
        FileSelectorButton._nextid++

        label.htmlFor = actualInputElement.id

        actualInputElement.onchange = () => {
            if (actualInputElement.files !== null) {
                self._value.setData(actualInputElement.files)
            }
        }

        el.addEventListener("submit", (e) => {
            if (actualInputElement.files !== null) {
                self._value.setData(actualInputElement.files)
            }
            actualInputElement.classList.remove("glowing-shadow");

            e.preventDefault()
        })

        el.appendChild(actualInputElement)

        function setDrawAttention(isOn: boolean){
            if(isOn){
                label.classList.add("glowing-shadow")

            }else{
                label.classList.remove("glowing-shadow")

            }
        }

        el.addEventListener("dragover", (event) => {
            event.stopPropagation()
            event.preventDefault()
            setDrawAttention(true)
            // Style the drag-and-drop as a "copy file" operation.
            event.dataTransfer.dropEffect = "copy"

        })

        window.document.addEventListener("dragenter", () =>{
            setDrawAttention(true)
        })

        window.document.addEventListener("dragend", () => {
            setDrawAttention(false)
        })


        el.addEventListener("drop", (event) => {
            event.stopPropagation()
            event.preventDefault()
            label.classList.remove("glowing-shadow")
            const fileList = event.dataTransfer.files
            this._value.setData(fileList)
        })

        return el
    }
}
