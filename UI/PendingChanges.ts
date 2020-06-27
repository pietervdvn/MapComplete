import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";

export class PendingChanges extends UIElement {
    private _pendingChangesCount: UIEventSource<number>;
    private _countdown: UIEventSource<number>;
    private _isSaving: UIEventSource<boolean>;

    constructor(pendingChangesCount: UIEventSource<number>,
                countdown: UIEventSource<number>,
                isSaving: UIEventSource<boolean>) {
        super(pendingChangesCount);
        this.ListenTo(isSaving);
        this.ListenTo(countdown);
        this._pendingChangesCount = pendingChangesCount;
        this._countdown = countdown;
        this._isSaving = isSaving;
    }

    protected InnerRender(): string {
        if (this._isSaving.data) {
            return "<span class='alert'>Saving</span>";
        }
        if (this._pendingChangesCount.data == 0) {
            return "";
        }

        var restingSeconds = this._countdown.data / 1000;
        var dots = "";
        while (restingSeconds > 0) {
            dots += ".";
            restingSeconds = restingSeconds - 1;
        }
        return "Saving "+this._pendingChangesCount.data;
    }  
    
}