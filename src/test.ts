import { Utils } from "./Utils"
import SvelteUIElement from "./UI/Base/SvelteUIElement"
import PointRenderingConfig from "./Models/ThemeConfig/PointRenderingConfig"
import { UIEventSource } from "./Logic/UIEventSource"
import Marker from "./UI/Map/Marker.svelte"
import Qrcode from "qrcode-generator"
import { FixedUiElement } from "./UI/Base/FixedUiElement"
function generateQr(message: string, attachTo: string) {
    const typeNumber = 0
    const errorCorrectionLevel = "L"
    const qr = Qrcode(typeNumber, errorCorrectionLevel)
    qr.addData(message)
    qr.make()
    document.getElementById(attachTo).innerHTML = qr.createImgTag()
}
generateQr(
    "http://127.0.0.1:1234/theme.html?layout=cyclofix&z=14&lat=51.21571770000094&lon=3.219866599996749&layer-range=true&layer-gps_location=false#theme-menu:download",
    "qr"
)
