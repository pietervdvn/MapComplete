import {UIElement} from "./UIElement";
import {State} from "../State";
import {UIEventSource} from "../Logic/UIEventSource";

export class PendingChanges extends UIElement {
    private _pendingChangesCount: UIEventSource<number>;
    private _isSaving: UIEventSource<boolean>;

    constructor() {
        super(State.state.changes.pendingChangesES);
        this.ListenTo(State.state.changes.isSaving);
        this.ListenTo(State.state.secondsTillChangesAreSaved);
        this._pendingChangesCount = State.state.changes.pendingChangesES;
        this._isSaving = State.state.changes.isSaving;

        this.onClick(() => {
            State.state.changes.uploadAll();
        })
    }

    InnerRender(): string {
        if (this._isSaving.data) {
            return "<span class='alert'>Saving</span>";
        }
        if (this._pendingChangesCount.data == 0) {
            return "";
        }

        var restingSeconds =State.state.secondsTillChangesAreSaved.data / 1000;
        var dots = "";
        while (restingSeconds > 0) {
            dots += ".";
            restingSeconds = restingSeconds - 1;
        }
        return "Saving "+this._pendingChangesCount.data;
    }  
    
}