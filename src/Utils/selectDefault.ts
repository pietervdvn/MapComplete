import { Store } from "../Logic/UIEventSource"

export function selectDefault(htmlElement: HTMLInputElement, value: Store<string>) {
    if (!document.body.contains(htmlElement) || value?.data === undefined) {
        return
    }
    if (value.data === htmlElement.value) {
        htmlElement.checked = true
    }
}
