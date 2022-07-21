import BaseUIElement from "../BaseUIElement";
import {Chart, ChartConfiguration, ChartType, DefaultDataPoint, registerables} from 'chart.js';
Chart.register(...registerables);


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
        new Chart(canvas, this._config);
        return canvas;
    }
    
}