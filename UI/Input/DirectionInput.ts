import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import Svg from "../../Svg";
import {FixedUiElement} from "../Base/FixedUiElement";


/**
 * Selects a direction in degrees
 */
export default class DirectionInput extends InputElement<string> {

    private readonly value: UIEventSource<string>;
    public readonly IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    constructor(value?: UIEventSource<string>) {
        super();
        this.value = value ?? new UIEventSource<string>(undefined);

    }
    

    protected InnerConstructElement(): HTMLElement {


        const element =       new Combine([
            new FixedUiElement("").SetClass("w-full h-full absolute top-0 left-O rounded-full"),
            Svg.direction_svg().SetStyle(
                `position: absolute;top: 0;left: 0;width: 100%;height: 100%;transform:rotate(${this.value.data ?? 0}deg);`)
                .SetClass("direction-svg"),
            Svg.compass_svg().SetStyle(
                "position: absolute;top: 0;left: 0;width: 100%;height: 100%;")
        ])
            .SetStyle("position:relative;display:block;width: min(100%, 25em); padding-top: min(100% , 25em); background:white; border: 1px solid black; border-radius: 999em")
            .ConstructElement()


        this.value.addCallbackAndRun(rotation => {
            const cone = element.getElementsByClassName("direction-svg")[0] as HTMLElement
            cone.style.transform = `rotate(${rotation}deg)`;

        })
        
        this.RegisterTriggers(element)
        
        return element;
    }


    GetValue(): UIEventSource<string> {
        return this.value;
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
            isDown = false; ev.preventDefault();
        }

        htmlElement.onmousemove = (ev: MouseEvent) => {
            if (isDown) {
                onPosChange(ev.clientX, ev.clientY);
            } ev.preventDefault();
        }
    }

    IsValid(str: string): boolean {
        const t = Number(str);
        return !isNaN(t) && t >= 0 && t <= 360;
    }

}