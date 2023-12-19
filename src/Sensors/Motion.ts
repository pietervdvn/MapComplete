import { UIEventSource } from "../Logic/UIEventSource"

export default class Motion {
    public static singleton = new Motion()
    /**
     * In m/s²
     */
    public maxAcc = new UIEventSource<number>(0)

    public lastShakeEvent = new UIEventSource<Date>(undefined)

    private isListening = false
    private constructor() {
        this.startListening()
    }

    private onUpdate(eventData: DeviceMotionEvent) {
        const acc = eventData.acceleration
        this.maxAcc.setData(Math.max(acc.x, acc.y, acc.z))
        if (this.maxAcc.data > 22) {
            this.lastShakeEvent.setData(new Date())
        }
    }

    startListening() {
        if (this.isListening) {
            return
        }
        this.isListening = true
        console.log("Listening to motion events", this)
        window.addEventListener("devicemotion", (e) => this.onUpdate(e))
    }
}
