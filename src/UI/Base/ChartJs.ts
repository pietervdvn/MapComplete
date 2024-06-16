import BaseUIElement from "../BaseUIElement"
import { Chart, ChartConfiguration, ChartType, DefaultDataPoint, registerables } from "chart.js"

Chart?.register(...(registerables ?? []))

export class ChartJsColours {
    public static readonly unknownColor = "rgba(128, 128, 128, 0.2)"
    public static readonly unknownBorderColor = "rgba(128, 128, 128, 0.2)"

    public static readonly otherColor = "rgba(128, 128, 128, 0.2)"
    public static readonly otherBorderColor = "rgba(128, 128, 255)"
    public static readonly notApplicableColor = "rgba(128, 128, 128, 0.2)"
    public static readonly notApplicableBorderColor = "rgba(255, 0, 0)"

    public static readonly backgroundColors = [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
    ]

    public static readonly borderColors = [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
    ]
}
export default class ChartJs<
    TType extends ChartType = ChartType,
    TData = DefaultDataPoint<TType>,
    TLabel = unknown
> extends BaseUIElement {
    private readonly _config: ChartConfiguration<TType, TData, TLabel>

    constructor(config: ChartConfiguration<TType, TData, TLabel>) {
        super()
        this._config = config
    }

    public static ConstructDoughnut(data: Record<string, number>) {
        const borderColor = [
            // ChartJsColours.unkownBorderColor,
            //  ChartJsColours.otherBorderColor,
            //  ChartJsColours.notApplicableBorderColor,
        ]
        const backgroundColor = [
            //   ChartJsColours.unkownColor,
            //   ChartJsColours.otherColor,
            //   ChartJsColours.notApplicableColor,
        ]

        let i = 0
        const borders = ChartJsColours.borderColors
        const bg = ChartJsColours.backgroundColors

        for (const key in data) {
            if (key === "") {
                borderColor.push(ChartJsColours.unknownBorderColor)
                backgroundColor.push(ChartJsColours.unknownColor)
            } else {
                borderColor.push(borders[i % borders.length])
                backgroundColor.push(bg[i % bg.length])
                i++
            }
        }

        const config = <ChartConfiguration>{
            type: "doughnut",
            data: {
                labels: Object.keys(data),
                datasets: [
                    {
                        data: Object.values(data),
                        backgroundColor,
                        borderColor,
                        borderWidth: 1,
                        label: undefined,
                    },
                ],
            },
            options: {
                plugins: {
                    legend: {
                        display: false,
                    },
                },
            },
        }
        return new ChartJs(config)
    }

    protected InnerConstructElement(): HTMLElement {
        const canvas = document.createElement("canvas")
        // A bit exceptional: we apply the styles before giving them to 'chartJS'
        if (this.style !== undefined) {
            canvas.style.cssText = this.style
        }
        if (this.clss?.size > 0) {
            try {
                canvas.classList.add(...Array.from(this.clss))
            } catch (e) {
                console.error(
                    "Invalid class name detected in:",
                    Array.from(this.clss).join(" "),
                    "\nErr msg is ",
                    e
                )
            }
        }
        new Chart(canvas, this._config)
        return canvas
    }
}
