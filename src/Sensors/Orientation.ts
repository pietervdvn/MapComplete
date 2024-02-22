import { UIEventSource, Stores } from "../Logic/UIEventSource"

/**
 * Exports the device orientation as UIEventSources and detects 'shakes'
 */
export class Orientation {
    public static singleton = new Orientation()

    public gotMeasurement: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    /**
     * The direction wrt to the magnetic north, with clockwise = positive.
     * 0 degrees is pointing towards the north
     * 90° is east,
     * 180° is south
     * 270° is west
     *
     * Note that this is the opposite of what the DeviceOrientationEvent uses!
     * */
    public alpha: UIEventSource<number> = new UIEventSource<number>(undefined)
    public beta: UIEventSource<number> = new UIEventSource<number>(undefined)
    public gamma: UIEventSource<number> = new UIEventSource<number>(undefined)
    /**
     * Indicates if 'alpha' is with the actual magnetic field or just mimicks that
     */
    public absolute: UIEventSource<boolean> = new UIEventSource<boolean>(undefined)
    /**
     * A derivate of beta and gamma
     * An arrow pointing up, rotated with this amount should more or less point towards the sky
     * Used in the slope input
     */
    public arrowDirection: UIEventSource<number> = new UIEventSource(undefined)
    private _measurementsStarted = false
    private _animateFakeMeasurements = false

    constructor() {
        //        this.fakeMeasurements()
    }

    // noinspection JSUnusedGlobalSymbols
    public fakeMeasurements(rotateAlpha: boolean = true) {
        console.log("Starting fake measurements of orientation sensors", {
            alpha: this.alpha,
            beta: this.beta,
            gamma: this.gamma,
            absolute: this.absolute,
        })
        this.alpha.setData(45)

        if (rotateAlpha) {
            this._animateFakeMeasurements = true
            Stores.Chronic(25).addCallback((date) => {
                this.alpha.setData((date.getTime() / 50) % 360)
                if (!this._animateFakeMeasurements) {
                    return true
                }
            })
        }
        this.beta.setData(20)
        this.gamma.setData(30)
        this.absolute.setData(true)
        this.gotMeasurement.setData(true)
    }

    public startMeasurements() {
        if (this._measurementsStarted) {
            return
        }
        this._measurementsStarted = true
        console.log("Starting device orientation listener")
        try {
            window.addEventListener("deviceorientationabsolute", (e: DeviceOrientationEvent) =>
                this.update(e)
            )
        } catch (e) {
            console.log("Could not init device orientation api due to", e)
        }
    }

    private update(event: DeviceOrientationEvent) {
        if (event.alpha === null || event.beta === null || event.gamma === null) {
            return
        }
        this.gotMeasurement.setData(true)
        // IF the phone is lying flat, then:
        // alpha is the compass direction (but not absolute)
        // beta is tilt if you would lift the phone towards you
        // gamma is rotation if you rotate the phone along the long axis

        // Note: the event uses _counterclockwise_ = positive for alpha
        // However, we use _clockwise_ = positive throughout the application, so we use '-' here!
        this.alpha.setData(Math.floor(360 - event.alpha))
        this.beta.setData(Math.floor(event.beta))
        this.gamma.setData(Math.floor(event.gamma))
        this.absolute.setData(event.absolute)
        if (this.beta.data < 0) {
            this.arrowDirection.setData(this.gamma.data + 180)
        } else {
            this.arrowDirection.setData(-this.gamma.data)
        }
    }
}
