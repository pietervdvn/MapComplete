import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";
import {OsmConnection} from "../Logic/OsmConnection";
import Translations from "./i18n/Translations";

export class CenterMessageBox extends UIElement {

    private readonly _location: UIEventSource<{ zoom: number }>;
    private readonly _zoomInMore = new UIEventSource<boolean>(true);
    private readonly _centermessage: UIEventSource<string>;
    private readonly _osmConnection: OsmConnection;
    private readonly _queryRunning: UIEventSource<boolean>;

    constructor(
        startZoom: number,
        centermessage: UIEventSource<string>,
        osmConnection: OsmConnection,
        location: UIEventSource<{ zoom: number }>,
        queryRunning: UIEventSource<boolean>
    ) {
        super(centermessage);

        this._centermessage = centermessage;
        this._location = location;
        this._osmConnection = osmConnection;
        this._queryRunning = queryRunning;
        this.ListenTo(queryRunning);


        const self = this;
        location.addCallback(function () {
            self._zoomInMore.setData(location.data.zoom < startZoom);
        });
        this.ListenTo(this._zoomInMore);

    }

    InnerRender(): string {

        if (this._centermessage.data != "") {
            return this._centermessage.data;
        }
        if (this._queryRunning.data) {
            return Translations.t.centerMessage.loadingData.Render();
        } else if (this._zoomInMore.data) {
            return Translations.t.centerMessage.zoomIn.Render();
        }
        return Translations.t.centerMessage.ready.Render();
    }


    private ShouldShowSomething() : boolean{
        if (this._queryRunning.data) {
            return true;
        }
        return this._zoomInMore.data;
    }

    InnerUpdate(htmlElement: HTMLElement) {
        const pstyle = htmlElement.parentElement.style;
        if (this._centermessage.data != "") {
            pstyle.opacity = "1";
            pstyle.pointerEvents = "all";
            this._osmConnection.registerActivateOsmAUthenticationClass();
            return;
        }
        pstyle.pointerEvents = "none";


        if (this.ShouldShowSomething()) {
            pstyle.opacity = "0.5";
        } else {
            pstyle.opacity = "0";
        }
    }

}


