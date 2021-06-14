import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "./Combine";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "./VariableUIElement";

export class TabbedComponent extends Combine {

    constructor(elements: { header: BaseUIElement | string, content: BaseUIElement | string }[], openedTab: (UIEventSource<number> | number) = 0) {

        const openedTabSrc = typeof (openedTab) === "number" ? new UIEventSource(openedTab) : (openedTab ?? new UIEventSource<number>(0))
            
        const tabs: BaseUIElement[] = []
        const contentElements: BaseUIElement[] = [];
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            const header = Translations.W(element.header).onClick(() => openedTabSrc.setData(i))
            openedTabSrc.addCallbackAndRun(selected => {
                if(selected === i){
                    header.SetClass("tab-active")
                    header.RemoveClass("tab-non-active")
                }else{
                    header.SetClass("tab-non-active")
                    header.RemoveClass("tab-active")
                }
            })
            const content = Translations.W(element.content)
            content.SetClass("relative p-4 w-full inline-block")
            contentElements.push(content);
            const tab = header.SetClass("block tab-single-header")
            tabs.push(tab)
        }

        const header = new Combine(tabs).SetClass("block tabs-header-bar")
        const actualContent = new VariableUiElement(
            openedTabSrc.map(i => contentElements[i])
        )
        super([header, actualContent])

    }

}