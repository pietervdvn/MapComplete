import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";


export class CollapseButton extends UIElement {
    public isCollapsed = new UIEventSource(false);

    constructor(idToCollapse: string) {
        super(undefined);
        this.ListenTo(this.isCollapsed);
        this.isCollapsed.addCallback((collapse) => {
            const el = document.getElementById(idToCollapse);
            if (el === undefined || el === null) {
                console.log("Element not found")
                return;
            }
            if (collapse) {
                el.style.height = "3.5em";
                el.style.width = "15em";
            } else {
                el.style.height = "auto";
                el.style.width = "auto";
            }
        });

        const self = this;
        this.onClick(() => {
            self.isCollapsed.setData(!self.isCollapsed.data);
        })

    }

    protected InnerRender(): string {
        const up = './assets/arrow-up.svg';
        const down = './assets/arrow-down.svg';
        let arrow = up;
        if (this.isCollapsed.data) {
            arrow = down;
        }
        return `<img class='collapse-button' src='${arrow}' alt='collapse'>`;
    }

}