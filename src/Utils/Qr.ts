import Qrcode from "qrcode-generator"

/**
 * Creates a QR-code as Blob
 */
export default class Qr {
    private readonly _textToShow: string

    constructor(textToShow: string) {
        this._textToShow = textToShow
    }

    public toImageElement(totalSize: number): string {
        const typeNumber = 0
        const errorCorrectionLevel = "L"
        const qr = Qrcode(typeNumber, errorCorrectionLevel)
        qr.addData(this._textToShow)
        qr.make()
        const moduleCount = qr.getModuleCount()
        const cellSize = Math.round(totalSize / moduleCount)
        return qr.createDataURL(cellSize)
    }
}
