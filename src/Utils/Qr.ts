import Qrcode from "qrcode-generator"

/**
 * Creates a QR-code as Blob
 */
export default class Qr {
    private _textToShow: string

    constructor(textToShow: string) {
        this._textToShow = textToShow
    }

    public toImageElement(totalSize: number): string {
        console.log("Creating a QR code for", this._textToShow)
        const typeNumber = 0
        const errorCorrectionLevel = "L"
        const qr = Qrcode(typeNumber, errorCorrectionLevel)
        qr.addData(this._textToShow)
        qr.make()
        const moduleCount = qr.getModuleCount()
        const img = document.createElement("img")
        const cellSize = Math.round(totalSize / moduleCount)
        console.log("Cellsize", cellSize)
        return qr.createDataURL(cellSize)
    }
}
