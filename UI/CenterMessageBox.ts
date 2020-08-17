import {UIElement} from "./UIElement";
import {OsmConnection} from "../Logic/Osm/OsmConnection";
import Translations from "./i18n/Translations";
import {State} from "../State";
import {UIEventSource} from "../Logic/UIEventSource";

export class CenterMessageBox extends UIElement {

    constructor(
    ) {
        super(State.state.centerMessage);

        this.ListenTo(State.state.locationControl);
        this.ListenTo(State.state.layerUpdater.retries);
        this.ListenTo(State.state.layerUpdater.runningQuery);
        this.ListenTo(State.state.layerUpdater.sufficentlyZoomed);
    }

    private prep(): { innerHtml: string, done: boolean } {
        if (State.state.centerMessage.data != "") {
            return {innerHtml: State.state.centerMessage.data, done: false};
        }
        const lu = State.state.layerUpdater;
        if(lu.retries.data > 0) {
            return {innerHtml: Translations.t.centerMessage.retrying.Subs({count: ""+ lu.retries.data}).Render(), done: false};
        }
        
        if (lu.runningQuery.data) {
            return {innerHtml: Translations.t.centerMessage.loadingData.Render(), done: false};
            
        } 
        if (!lu.sufficentlyZoomed.data) {
            return {innerHtml: Translations.t.centerMessage.zoomIn.Render(), done: false};
        } else {
            return {innerHtml: Translations.t.centerMessage.ready.Render(), done: true};
        }
    }

    InnerRender(): string {
        return this.prep().innerHtml;
    }


    InnerUpdate(htmlElement: HTMLElement) {
        const pstyle = htmlElement.parentElement.style;
        if (State.state.centerMessage.data != "") {
            pstyle.opacity = "1";
            pstyle.pointerEvents = "all";
            return;
        }
        pstyle.pointerEvents = "none";

        if (this.prep().done) {
            pstyle.opacity = "0";
        } else {
            pstyle.opacity = "0.5";
        }
    }

}


