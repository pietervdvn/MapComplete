import {UIElement} from "./UIElement";
import Translations from "./i18n/Translations";
import State from "../State";

export default class CenterMessageBox extends UIElement {

    constructor() {
        super(State.state.centerMessage);

        this.ListenTo(State.state.locationControl);
        this.ListenTo(State.state.layerUpdater.timeout);
        this.ListenTo(State.state.layerUpdater.runningQuery);
        this.ListenTo(State.state.layerUpdater.sufficientlyZoomed);
    }

    private static prep(): { innerHtml: string | UIElement, done: boolean } {
        if (State.state.centerMessage.data != "") {
            return {innerHtml: State.state.centerMessage.data, done: false};
        }
        const lu = State.state.layerUpdater;
        if (lu.timeout.data > 0) {
            return {
                innerHtml: Translations.t.centerMessage.retrying.Subs({count: "" + lu.timeout.data}),
                done: false
            };
        }

        if (lu.runningQuery.data) {
            return {innerHtml: Translations.t.centerMessage.loadingData, done: false};

        }
        if (!lu.sufficientlyZoomed.data) {
            return {innerHtml: Translations.t.centerMessage.zoomIn, done: false};
        } else {
            return {innerHtml: Translations.t.centerMessage.ready, done: true};
        }
    }

    InnerRender(): string | UIElement {
        return CenterMessageBox.prep().innerHtml;
    }

    InnerUpdate(htmlElement: HTMLElement) {
        if(htmlElement.parentElement === null){
            return;
        }
        const pstyle = htmlElement.parentElement.style;
        if (State.state.centerMessage.data != "") {
            pstyle.opacity = "1";
            pstyle.pointerEvents = "all";
            return;
        }
        pstyle.pointerEvents = "none";

        if (CenterMessageBox.prep().done) {
            pstyle.opacity = "0";
        } else {
            pstyle.opacity = "0.5";
        }
    }

}


