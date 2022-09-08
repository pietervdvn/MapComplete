import {Utils} from "./Utils";
import jsPDF, {Matrix} from "jspdf";
import "./assets/templates/Ubuntu-M-normal.js"
import "./assets/templates/Ubuntu-L-normal.js"
import "./assets/templates/UbuntuMono-B-bold.js"

class SvgToPdfInternals {
    private readonly doc: jsPDF;
    private readonly matrices: Matrix[] = []
    private readonly matricesInverted: Matrix[] = []

    private currentMatrix: Matrix;
    private currentMatrixInverted: Matrix;

    private readonly _images: Record<string, HTMLImageElement>;

    constructor(advancedApi: jsPDF, images: Record<string, HTMLImageElement>) {
        this.doc = advancedApi;
        this._images = images;
        this.currentMatrix = this.doc.unitMatrix;
        this.currentMatrixInverted = this.doc.unitMatrix;
    }

    private applyMatrices(): void {
        let multiplied = this.doc.unitMatrix;
        let multipliedInv = this.doc.unitMatrix;
        for (const matrix of this.matrices) {
            multiplied = this.doc.matrixMult(multiplied, matrix)
        }
        for (const matrix of this.matricesInverted) {
            multipliedInv = this.doc.matrixMult(multiplied, matrix)
        }
        this.currentMatrix = multiplied
        this.currentMatrixInverted = multipliedInv
    }

    private addMatrix(m: Matrix) {
        this.matrices.push(m)
        this.matricesInverted.push(m.inversed())
        this.doc.setCurrentTransformationMatrix(m);
        this.applyMatrices()

    }

    public setTransform(element: Element): boolean {

        const t = element.getAttribute("transform")
        if (t === null) {
            return false;
        }
        const scaleMatch = t.match(/scale\(([-0-9.]*)\)/)
        if (scaleMatch !== null) {
            const s = Number(scaleMatch[1])
            const m = this.doc.Matrix(1 / s, 0, 0, 1 / s, 0, 0)
            this.addMatrix(m)
            return true;
        }

        const transformMatch = t.match(/matrix\(([-0-9.]*),([-0-9.]*),([-0-9.]*),([-0-9.]*),([-0-9.]*),([-0-9.]*)\)/)
        if (transformMatch !== null) {
            const vals = [1, 0, 0, 1, 0, 0]
            const invVals = [1, 0, 0, 1, 0, 0]
            for (let i = 0; i < 6; i++) {
                const ti = Number(transformMatch[i + 1])
                if (ti == 0) {
                    vals[i] = 0
                } else {
                    invVals[i] = 1 / ti
                    vals[i] = ti
                }
            }
            const m = this.doc.Matrix(vals[0], vals[1], vals[2], vals[3], vals[4], vals[5])
            this.addMatrix(m)
            return true;
        }

        return false;
    }

    public undoTransform(): void {
        this.matrices.pop()
        const i = this.matricesInverted.pop()
        this.doc.setCurrentTransformationMatrix(i)
        this.applyMatrices()

    }

    private static parseCss(styleContent: string): Record<string, string> {
        if (styleContent === undefined || styleContent === null) {
            return {}
        }
        const r: Record<string, string> = {}

        for (const rule of styleContent.split(";")) {
            const [k, v] = rule.split(":").map(x => x.trim())
            r[k] = v
        }

        return r
    };

    private drawRect(element: Element) {
        const x = Number(element.getAttribute("x"))
        const y = Number(element.getAttribute("y"))
        const width = Number(element.getAttribute("width"))
        const height = Number(element.getAttribute("height"))
        const style = element.getAttribute("style")

        const css = SvgToPdfInternals.parseCss(style)
        this.doc.setDrawColor(css["stroke-color"] ?? "black")
        this.doc.setFillColor(css["fill"] ?? "black")
        this.doc.rect(x, y, width, height, "F")
        return
    }

    private static attr(element: Element, name: string, recurseup: boolean = true): string {
        const a = element.getAttribute(name)
        if (a !== null && a !== undefined) {
            return a
        }
        if (recurseup && element.parentElement !== undefined && element.parentElement !== element) {
            return SvgToPdfInternals.attr(element.parentElement, name, recurseup)
        }
        return undefined
    }

    /**
     * Reads the 'style'-element recursively
     * @param element
     * @private
     */
    private static css(element: Element): Record<string, string> {

        if (element.parentElement == undefined || element.parentElement == element) {
            return SvgToPdfInternals.parseCss(element.getAttribute("style"))
        }

        const css = SvgToPdfInternals.css(element.parentElement);
        const style = element.getAttribute("style")
        if (style === undefined || style == null) {
            return css
        }
        for (const rule of style.split(";")) {
            const [k, v] = rule.split(":").map(x => x.trim())
            css[k] = v
        }
        return css

    }

    private static attrNumber(element: Element, name: string, recurseup: boolean = true): number {
        const a = SvgToPdfInternals.attr(element, name, recurseup)
        const n = Number(a)
        if (!isNaN(n)) {
            return n
        }
        return undefined
    }

    private drawTspan(tspan: Element) {
        if (tspan.textContent == "") {
            return
        }
        const x = SvgToPdfInternals.attrNumber(tspan, "x")
        const y = SvgToPdfInternals.attrNumber(tspan, "y")

        const css = SvgToPdfInternals.css(tspan)
        const w = SvgToPdfInternals.attrNumber(tspan, "width")

        let fontFamily = css["font-family"] ?? "Ubuntu";
        if (fontFamily === "sans-serif") {
            fontFamily = "Ubuntu"
        }

        let fontWeight = css["font-weight"] ?? "normal";
        this.doc.setFont(fontFamily, fontWeight)


        const fontColor = css["fill"]
        if (fontColor) {
            this.doc.setTextColor(fontColor)
        } else {
            this.doc.setTextColor("black")
        }
        let fontsize = parseFloat(css["font-size"])

        console.log("Fontsize is ", fontsize, "for", tspan.textContent, this.currentMatrixInverted)
        this.doc.setFontSize(fontsize * 2.5)
        this.doc.text(tspan.textContent, x, y, {
            maxWidth: w,
        }, this.currentMatrix)
    }

    private drawSvgViaCanvas(element: Element): void {
        const x = SvgToPdfInternals.attrNumber(element, "x")
        const y = SvgToPdfInternals.attrNumber(element, "y")
        const width = SvgToPdfInternals.attrNumber(element, "width")
        const height = SvgToPdfInternals.attrNumber(element, "height")
        const base64src = SvgToPdfInternals.attr(element, "xlink:href")
        const svgXml = atob(base64src.substring(base64src.indexOf(";base64,") + ";base64,".length));
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(svgXml, "text/xml");
        const svgRoot = xmlDoc.getElementsByTagName("svg")[0];
        const svgWidth = SvgToPdfInternals.attrNumber(svgRoot, "width")
        const svgHeight = SvgToPdfInternals.attrNumber(svgRoot, "height")


        let img = this._images[base64src]
        // This is an svg image, we use the canvas to convert it to a png
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        canvas.width = svgWidth
        canvas.height = svgHeight
        img.style.width = `${(svgWidth)}px`
        img.style.height = `${(svgHeight)}px`

        ctx.drawImage(img, 0, 0, svgWidth, svgHeight)
        const base64img = canvas.toDataURL("image/png")

        this.addMatrix(this.doc.Matrix(width / svgWidth, 0, 0, height / svgHeight, 0, 0))
        const p = this.currentMatrixInverted.applyToPoint({x, y})
        this.doc.addImage(base64img, "png", p.x * svgWidth / width, p.y * svgHeight / height, svgWidth, svgHeight)
        this.undoTransform()
    }

    private drawImage(element: Element): void {
        const href = SvgToPdfInternals.attr(element, "xlink:href")
        if (href.endsWith('svg') || href.startsWith("data:image/svg")) {
            this.drawSvgViaCanvas(element);
        }
    }

    public handleElement(element: SVGSVGElement | Element): void {
        const isTransformed = this.setTransform(element)
        if (element.tagName === "tspan") {
            if(element.childElementCount == 0){
                this.drawTspan(element)
            }else{
                for (let child of Array.from(element.children)) {
                    console.log("Handling tspan child")
                    this.handleElement(child)
                }
            }
        }

        if (element.tagName === "image") {
            this.drawImage(element)
        }

        if (element.tagName === "g" || element.tagName === "text" ) {

            for (let child of Array.from(element.children)) {
                this.handleElement(child)
            }
        }

        if (element.tagName === "rect") {
            this.drawRect(element)
        }

        if (isTransformed) {
            this.undoTransform()
        }
    }

}

class SvgToPdf {

    private readonly doc
    private images: Record<string, HTMLImageElement> = {}

    constructor(mode: 'landscape' | 'portrait' = 'landscape') {
        this.doc = new jsPDF(mode)
    }

    private loadImage(element: Element): Promise<void> {
        const base64src = element.getAttribute("xlink:href")
        let svgXml = atob(base64src.substring(base64src.indexOf(";base64,") + ";base64,".length));
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(svgXml, "text/xml");
        const svgRoot = xmlDoc.getElementsByTagName("svg")[0];
        const svgWidthStr = svgRoot.getAttribute("width")
        const svgHeightStr = svgRoot.getAttribute("height")
        const svgWidth = parseFloat(svgWidthStr)
        const svgHeight = parseFloat(svgHeightStr)
        if (!svgWidthStr.endsWith("px")) {
            svgRoot.setAttribute("width", svgWidth + "px")
        }
        if (!svgHeightStr.endsWith("px")) {
            svgRoot.setAttribute("height", svgHeight + "px")
        }

        let img = document.createElement("img")
        img.src = "data:image/svg+xml;base64," + btoa(svgRoot.outerHTML)
        this.images[base64src] = img
        return new Promise((resolve) => {
            img.onload = _ => {
                resolve()
            }

        })
    }


    public async prepareElement(element: SVGSVGElement | Element): Promise<void> {
        if (element.tagName === "tspan") {
            //   this.drawTspan(element)
        }

        if (element.tagName === "image") {
            await this.loadImage(element)
        }

        if (element.tagName === "g" || element.tagName === "text" || element.tagName === "tspan") {

            for (let child of Array.from(element.children)) {
                await this.prepareElement(child)
            }
        }

    }

    public async ConvertSvg(svgSource: string): Promise<void> {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(svgSource, "text/xml");
        const svgRoot = xmlDoc.getElementsByTagName("svg")[0];
        for (let child of Array.from(svgRoot.children)) {
            await this.prepareElement(<any>child)
        }

        this.doc.advancedAPI(advancedApi => {
            this.doc.setCurrentTransformationMatrix(this.doc.unitMatrix)
            const internal = new SvgToPdfInternals(advancedApi, this.images);
            for (let child of Array.from(svgRoot.children)) {
                internal.handleElement(<any>child)
            }


        })
        await this.doc.save(`Test_flyer.pdf`);
    }


}


async function main() {

    const svg = await Utils.download(window.location.protocol + "//" + window.location.host + "/assets/templates/MapComplete-flyer.svg")
    await new SvgToPdf().ConvertSvg(svg)
    /*
        const image = await minimap.TakeScreenshot()
        // @ts-ignore
        doc.addImage(image, 'PNG', 0, 0, this.mapW, this.mapH);


        doc.setDrawColor(255, 255, 255)
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(12, 10, 145, 25, 5, 5, 'FD')

        doc.setFontSize(20)
        doc.textWithLink(layout.title.txt, 40, 18.5, {
            maxWidth: 125,
            url: window.location.href
        })
        doc.setFontSize(10)
        doc.text(t.generatedWith.txt, 40, 23, {
            maxWidth: 125
        })
        const backgroundLayer: BaseLayer = State.state.backgroundLayer.data
        const attribution = new FixedUiElement(backgroundLayer.layer().getAttribution() ?? backgroundLayer.name).ConstructElement().textContent
        doc.textWithLink(t.attr.txt, 40, 26.5, {
            maxWidth: 125,
            url: "https://www.openstreetmap.org/copyright"
        })

        doc.text(t.attrBackground.Subs({
            background: attribution
        }).txt, 40, 30)

        let date = new Date().toISOString().substr(0, 16)

        doc.setFontSize(7)
        doc.text(t.versionInfo.Subs({
            version: Constants.vNumber,
            date: date
        }).txt, 40, 34, {
            maxWidth: 125
        })

        // Add the logo of the layout
        let img = document.createElement('img');
        const imgSource = layout.icon
        const imgType = imgSource.substr(imgSource.lastIndexOf(".") + 1);
        img.src = imgSource
        if (imgType.toLowerCase() === "svg") {
            new FixedUiElement("").AttachTo(this.freeDivId)

            // This is an svg image, we use the canvas to convert it to a png
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d');
            canvas.width = 500
            canvas.height = 500
            img.style.width = "100%"
            img.style.height = "100%"
            ctx.drawImage(img, 0, 0, 500, 500);
            const base64img = canvas.toDataURL("image/png")
            doc.addImage(base64img, 'png', 15, 12, 20, 20);

        } else {
            try {
                doc.addImage(img, imgType, 15, 12, 20, 20);
            } catch (e) {
                console.error(e)
            }
        }

        doc.save(`MapComplete_${layout.title.txt}_${date}.pdf`);

        this.isRunning.setData(false)
        //*/
}

main().then(() => console.log("Done!"))
