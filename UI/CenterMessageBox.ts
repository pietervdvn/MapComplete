import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";
import {OsmConnection} from "../Logic/Osm/OsmConnection";
import Translations from "./i18n/Translations";
import {State} from "../State";

export class CenterMessageBox extends UIElement {

    private readonly _queryRunning: UIEventSource<boolean>;
    private startZoom: number;

    constructor(
        startZoom: number,
        queryRunning: UIEventSource<boolean>
    ) {
        super(State.state.centerMessage);
        this.startZoom = startZoom;

        this.ListenTo(State.state.locationControl);
        this.ListenTo(queryRunning);

        this._queryRunning = queryRunning;


    }

    private prep(): { innerHtml: string, done: boolean } {
        if (State.state.centerMessage.data != "") {
            return {innerHtml: State.state.centerMessage.data, done: false};
        }
        if (this._queryRunning.data) {
            return {innerHtml: Translations.t.centerMessage.loadingData.Render(), done: false};
        } else if (State.state.locationControl.data.zoom < this.startZoom) {
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
            State.state.osmConnection.registerActivateOsmAUthenticationClass();
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


