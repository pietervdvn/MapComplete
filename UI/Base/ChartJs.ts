import BaseUIElement from "../BaseUIElement";
import {Chart, ChartConfiguration, ChartType, DefaultDataPoint, registerables} from 'chart.js';
Chart?.register(...(registerables ?? []));


export default class ChartJs<
    TType extends ChartType = ChartType,
    TData = DefaultDataPoint<TType>,
    TLabel = unknown
    > extends BaseUIElement{
    private readonly _config: ChartConfiguration<TType, TData, TLabel>;
    
    constructor(config: ChartConfiguration<TType, TData, TLabel>) {
        super();
        this._config = config;
    }
    
    protected InnerConstructElement(): HTMLElement {
        const canvas = document.createElement("canvas");
        // A bit exceptional: we apply the styles before giving them to 'chartJS'
        if(this.style !== undefined){
            canvas.style.cssText = this.style
        }
        if (this.clss?.size > 0) {
            try {
                canvas.classList.add(...Array.from(this.clss))
            } catch (e) {
                console.error("Invalid class name detected in:", Array.from(this.clss).join(" "), "\nErr msg is ", e)
            }
        }
        new Chart(canvas, this._config);
        return canvas;
    }
    
}