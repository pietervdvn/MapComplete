import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import Svg from "../../Svg";
import BaseUIElement from "../BaseUIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import {Utils} from "../../Utils";
import Loc from "../../Models/Loc";


/**
 * Selects a direction in degrees
 */
export default class DirectionInput extends InputElement<string> {
    public static constructMinimap: ((any) => BaseUIElement);
    private readonly _location: UIEventSource<Loc>;

    public readonly IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly value: UIEventSource<string>;
    private background;

    constructor(mapBackground: UIEventSource<any>, 
                location: UIEventSource<Loc>,
                value?: UIEventSource<string>) {
        super();
        this._location = location;
        this.value = value ?? new UIEventSource<string>(undefined);
        this.background = mapBackground;
    }

    GetValue(): UIEventSource<string> {
        return this.value;
    }

    IsValid(str: string): boolean {
        const t = Number(str);
        return !isNaN(t) && t >= 0 && t <= 360;
    }

    protected InnerConstructElement(): HTMLElement {

        let map: BaseUIElement = new FixedUiElement("")
        if (!Utils.runningFromConsole) {
            map = DirectionInput.constructMinimap({
                background: this.background,
                allowMoving: false,
                location: this._location
            })
        }

        const element = new Combine([
             Svg.direction_stroke_svg().SetStyle(
                `position: absolute;top: 0;left: 0;width: 100%;height: 100%;transform:rotate(${this.value.data ?? 0}deg);`)
                .SetClass("direction-svg relative")
                 .SetStyle("z-index: 1000"),
            map.SetClass("w-full h-full absolute top-0 left-O rounded-full overflow-hidden"),
        ])
            .SetStyle("position:relative;display:block;width: min(100%, 25em); height: min(100% , 25em); background:white; border: 1px solid black; border-radius: 999em")
            .ConstructElement()


        this.value.addCallbackAndRunD(rotation => {
            const cone = element.getElementsByClassName("direction-svg")[0] as HTMLElement
            cone.style.transform = `rotate(${rotation}deg)`;

        })

        this.RegisterTriggers(element)

        return element;
    }

    private RegisterTriggers(htmlElement: HTMLElement) {
        const self = this;

        function onPosChange(x: number, y: number) {
            const rect = htmlElement.getBoundingClientRect();
            const dx = -(rect.left + rect.right) / 2 + x;
            const dy = (rect.top + rect.bottom) / 2 - y;
            const angle = 180 * Math.atan2(dy, dx) / Math.PI;
            const angleGeo = Math.floor((450 - angle) % 360);
            self.value.setData("" + angleGeo)
        }


        htmlElement.ontouchmove = (ev: TouchEvent) => {
            onPosChange(ev.touches[0].clientX, ev.touches[0].clientY);
            ev.preventDefault();
        }

        htmlElement.ontouchstart = (ev: TouchEvent) => {
            onPosChange(ev.touches[0].clientX, ev.touches[0].clientY);
        }

        let isDown = false;

        htmlElement.onmousedown = (ev: MouseEvent) => {
            isDown = true;
            onPosChange(ev.clientX, ev.clientY);
            ev.preventDefault();
        }

        htmlElement.onmouseup = (ev) => {
            isDown = false;
            ev.preventDefault();
        }

        htmlElement.onmousemove = (ev: MouseEvent) => {
            if (isDown) {
                onPosChange(ev.clientX, ev.clientY);
            }
            ev.preventDefault();
        }
    }

}