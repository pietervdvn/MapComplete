import Translations from "./i18n/Translations";
import State from "../State";
import {VariableUiElement} from "./Base/VariableUIElement";

export default class CenterMessageBox extends VariableUiElement {

    constructor() {
        const state = State.state;
        const updater = State.state.layerUpdater;
        const t = Translations.t.centerMessage;
        const message = updater.runningQuery.map(
            isRunning => {
                if (isRunning) {
                    return {el: t.loadingData};
                }
                if (!updater.sufficientlyZoomed.data) {
                    return {el: t.zoomIn}
                }
                if (updater.timeout.data > 0) {
                    return {el: t.retrying.Subs({count: "" + updater.timeout.data})}
                }
                return {el: t.ready, isDone: true}

            },
            [updater.timeout, updater.sufficientlyZoomed, state.locationControl]
        )
        
        super(message.map(toShow => toShow.el))
        
        this.SetClass("block " +
            "rounded-3xl bg-white text-xl font-bold text-center pointer-events-none p-4")
        this.SetStyle("transition: opacity 750ms linear")

        message.addCallbackAndRun(toShow => {
            const isDone = toShow.isDone ?? false;
            if (isDone) {
                this.SetStyle("transition: opacity 750ms linear; opacity: 0")
            } else {
                this.SetStyle("transition: opacity 750ms linear; opacity: 0.75")

            }
        })

    }

}


