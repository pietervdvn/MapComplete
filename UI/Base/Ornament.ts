import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Svg from "../../Svg";

export default class Ornament extends UIElement {
    private static readonly ornamentsCount = Ornament.countOrnaments();
    private readonly _index = new UIEventSource<number>(0)

    constructor(index = new UIEventSource<number>(0)) {
        super(index);
        this._index = index;
        this.SetClass("ornament")
        const self = this;
        this.onClick(() => {
            self._index.setData((self._index.data + 1) % (Ornament.ornamentsCount + 1));

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
        if(this._index.data == 0){
            return "<svg></svg>"
        }
        return Svg.All[`Ornament-Horiz-${this._index.data - 1}.svg`]
    }

}