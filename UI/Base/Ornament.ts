import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Svg from "../../Svg";
import State from "../../State";

export default class Ornament extends UIElement {
    private static readonly ornamentsCount = Ornament.countOrnaments();
    private readonly _index = new UIEventSource<string>("0")

    constructor(index = undefined) {
        super();
        index = index ?? State.state.osmConnection.GetPreference("ornament");
        this.ListenTo(index);
        this._index = index;
        this.SetClass("ornament")
        const self = this;
        this.onClick(() => {
            let c = Number(index.data);
            if (isNaN(c)) {
                c = 0;
            }
            self._index.setData("" + ((c + 1) % (Ornament.ornamentsCount + 1)));

        })
    }

    private static countOrnaments() {
        let ornamentCount = 0;
        for (const key in Svg.All) {
            if (key.startsWith("Ornament-Horiz-")) {
                ornamentCount++;
            }
        }
        return ornamentCount;
    }

    InnerRender(): string {
        const svg = Svg.All[`Ornament-Horiz-${Number(this._index.data) - 1}.svg`];
        if (this._index.data == "0" || svg === undefined) {
            return "<svg></svg>"
        }
        return svg;
    }

}