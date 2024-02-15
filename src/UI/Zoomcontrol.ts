import { UIEventSource } from "../Logic/UIEventSource"
import { Utils } from "../Utils"

/**
 * Utilities to (re)set user zoom (this is when the user enlarges HTML-elements by pinching out a non-map element).
 * If the user zooms in and goes back to the map, it should reset to 1.0
 */
export default class Zoomcontrol {
    private static readonly singleton = new Zoomcontrol()
    private static readonly initialValue =
        "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=1"
    private static readonly noZoom =
        "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=1"

    private readonly viewportElement: HTMLMetaElement

    private readonly _allowZooming: UIEventSource<boolean>
    private readonly _lockTokens: Set<any> = new Set<any>()

    private constructor() {
        if (Utils.runningFromConsole) {
            return
        }
        const metaElems = document.getElementsByTagName("head")[0].getElementsByTagName("meta")
        this.viewportElement = Array.from(metaElems).find(
            (meta) => meta.getAttribute("name") === "viewport"
        )
        this._allowZooming = new UIEventSource<boolean>(true)
        this._allowZooming.addCallback((allowed) => {
            this.apply(allowed ? Zoomcontrol.initialValue : Zoomcontrol.noZoom)
        })
    }

    public static createLock(): () => void {
        return Zoomcontrol.singleton._createLock()
    }

    public static resetzoom() {
        this.singleton._resetZoom()
    }

    private _resetZoom() {
        this.apply(Zoomcontrol.noZoom)
        requestAnimationFrame(() => {
            // Does not work on firefox, see https://bugzilla.mozilla.org/show_bug.cgi?id=1873934
            this.allowZoomIfUnlocked()
        })
    }

    private apply(fullSpec: string) {
        this.viewportElement?.setAttribute("content", fullSpec)
    }

    private allowZoomIfUnlocked() {
        if (this._lockTokens.size > 0) {
            return
        }
        this.apply(Zoomcontrol.initialValue)
    }

    private _createLock(): () => void {
        const token = {}
        const lockTokens = this._lockTokens
        lockTokens.add(token)
        this._resetZoom()
        return () => {
            lockTokens.delete(token)
            this.allowZoomIfUnlocked()
        }
    }
}
