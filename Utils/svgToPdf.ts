import jsPDF, {Matrix} from "jspdf";
import Translations from "../UI/i18n/Translations";
import {Translation, TypedTranslation} from "../UI/i18n/Translation";
import FeaturePipelineState from "../Logic/State/FeaturePipelineState";
import {PngMapCreator} from "./pngMapCreator";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import {Store, UIEventSource} from "../Logic/UIEventSource";
import "../assets/templates/Ubuntu-M-normal.js"
import "../assets/templates/Ubuntu-L-normal.js"
import "../assets/templates/UbuntuMono-B-bold.js"
import {parseSVG, makeAbsolute} from 'svg-path-parser';

class SvgToPdfInternals {
    private readonly doc: jsPDF;
    private static readonly dummyDoc: jsPDF = new jsPDF()
    private readonly textSubstitutions: Record<string, string>;
    private readonly matrices: Matrix[] = []
    private readonly matricesInverted: Matrix[] = []

    private currentMatrix: Matrix;
    private currentMatrixInverted: Matrix;

    private readonly _images: Record<string, HTMLImageElement>;
    private readonly _rects: Record<string, SVGRectElement>;

    constructor(advancedApi: jsPDF, textSubstitutions: Record<string, string>, images: Record<string, HTMLImageElement>, rects: Record<string, SVGRectElement>) {
        this.textSubstitutions = textSubstitutions;
        this.doc = advancedApi;
        this._images = images;
        this._rects = rects;
        this.currentMatrix = this.doc.unitMatrix;
        this.currentMatrixInverted = this.doc.unitMatrix;
    }

    applyMatrices(): void {
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

    addMatrix(m: Matrix) {
        this.matrices.push(m)
        this.matricesInverted.push(m.inversed())
        this.doc.setCurrentTransformationMatrix(m);
        this.applyMatrices()

    }

    public static extractMatrix(element: Element): Matrix {

        const t = element.getAttribute("transform")
        if (t === null) {
            return null;
        }
        const scaleMatch = t.match(/scale\(([-0-9.]*)\)/)
        if (scaleMatch !== null) {
            const s = Number(scaleMatch[1])
            return SvgToPdfInternals.dummyDoc.Matrix(1 / s, 0, 0, 1 / s, 0, 0);
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
            return SvgToPdfInternals.dummyDoc.Matrix(vals[0], vals[1], vals[2], vals[3], vals[4], vals[5]);
        }

        return null;
    }

    public setTransform(element: Element): boolean {

        const m = SvgToPdfInternals.extractMatrix(element)
        if (m === null) {
            return false;
        }
        this.addMatrix(m)
        return true;
    }

    public undoTransform(): void {
        this.matrices.pop()
        const i = this.matricesInverted.pop()
        this.doc.setCurrentTransformationMatrix(i)
        this.applyMatrices()

    }

    public static parseCss(styleContent: string, separator: string = ";"): Record<string, string> {
        if (styleContent === undefined || styleContent === null) {
            return {}
        }
        const r: Record<string, string> = {}

        for (const rule of styleContent.split(separator)) {
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
        if (css["fill-opacity"] !== "0") {
            this.doc.setFillColor(css["fill"] ?? "black")
            this.doc.rect(x, y, width, height, "F")
        }
        if (css["stroke"]) {
            this.doc.setLineWidth(Number(css["stroke-width"] ?? 1))
            this.doc.setDrawColor(css["stroke"] ?? "black")
            this.doc.rect(x, y, width, height, "S")
        }
        return
    }

    private static attr(element: Element, name: string, recurseup: boolean = true): string | undefined {
        if (element === null || element === undefined) {
            return undefined
        }
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

    static attrNumber(element: Element, name: string, recurseup: boolean = true): number {
        const a = SvgToPdfInternals.attr(element, name, recurseup)
        const n = parseFloat(a)
        if (!isNaN(n)) {
            return n
        }
        return undefined
    }

    private extractTranslation(text: string) {
        const pathPart = text.match(/\$(([_a-zA-Z0-9]+\.)+[_a-zA-Z0-9]+)(.*)/)
        if (pathPart === null) {
            return text
        }
        const path = pathPart[1].split(".")
        const rest = pathPart[3] ?? ""
        let t: any = Translations.t
        for (const crumb of path) {
            t = t[crumb]
            if (t === undefined) {
                console.error("No value found to substitute " + text)
                return undefined
            }
        }
        if (t instanceof TypedTranslation) {
            return (<TypedTranslation<any>>t).Subs(this.textSubstitutions).txt + rest
        } else {
            return (<Translation>t).txt + rest
        }
    }

    private drawTspan(tspan: Element) {
        if (tspan.textContent == "") {
            return
        }
        const x = SvgToPdfInternals.attrNumber(tspan, "x")
        const y = SvgToPdfInternals.attrNumber(tspan, "y")

        const css = SvgToPdfInternals.css(tspan)
        let maxWidth: number = undefined
        if (css["shape-inside"]) {
            const matched = css["shape-inside"].match(/url\(#([a-zA-Z0-9-]+)\)/)
            if (matched !== null) {
                const rectId = matched[1]
                const rect = this._rects[rectId]
                maxWidth = SvgToPdfInternals.attrNumber(rect, "width", false)
            }
        }

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

        this.doc.setFontSize(fontsize * 2.5)

        let textTemplate = tspan.textContent.split(" ")
        let result: string[] = []
        for (let text of textTemplate) {


            if (!text.startsWith("$")) {
                result.push(text)
                continue
            }
            if (text.startsWith("$list(")) {
                text = text.substring("$list(".length, text.length - ")".length)
                result.push("\n")
                let r = this.extractTranslation("$" + text + "0");
                let i = 0
                while (r !== undefined && i < 100) {
                    result.push("• " + r + "\n")
                    i++
                    r = this.extractTranslation("$" + text + i);
                }
            } else {
                const found = this.extractTranslation(text) ?? text
                result.push(found)
            }

        }
        this.doc.text(result.join(" "), x, y, {
            maxWidth,
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
        } else {
            const x = SvgToPdfInternals.attrNumber(element, "x")
            const y = SvgToPdfInternals.attrNumber(element, "y")
            const width = SvgToPdfInternals.attrNumber(element, "width")
            const height = SvgToPdfInternals.attrNumber(element, "height")
            const base64src = SvgToPdfInternals.attr(element, "xlink:href")

            this.doc.addImage(base64src, x, y, width, height)
        }
    }

    private drawPath(element: SVGPathElement): void {
        const path = element.getAttribute("d")
        const parsed: { code: string, x: number, y: number, x2?, y2?, x1?, y1? }[] = parseSVG(path)
        makeAbsolute(parsed)

        for (const c of parsed) {
            if (c.code === "C" || c.code === "c") {
                const command = {op: "c", c: [c.x1, c.y1, c.x2, c.y2, c.x, c.y]}
                this.doc.path([command])
                continue
            }

            this.doc.path([{op: c.code.toLowerCase(), c: [c.x, c.y]}])
        }


        const css = SvgToPdfInternals.css(element)
        this.doc.setDrawColor(css["color"])
        this.doc.setFillColor(css["fill"])
        if (css["stroke-width"]) {
            this.doc.setLineWidth(Number(css["stroke-width"]))
        }
        if (css["stroke-linejoin"] !== undefined) {
            this.doc.setLineJoin(css["stroke-linejoin"])
        }
        if (css["fill-rule"] === "evenodd") {
            this.doc.fillEvenOdd()
        } else {
            this.doc.fill()
        }
    }

    public handleElement(element: SVGSVGElement | Element): void {
        const isTransformed = this.setTransform(element)
        if (element.tagName === "tspan") {
            if (element.childElementCount == 0) {
                this.drawTspan(element)
            } else {
                for (let child of Array.from(element.children)) {
                    this.handleElement(child)
                }
            }
        }

        if (element.tagName === "image") {
            this.drawImage(element)
        }

        if (element.tagName === "path") {
            this.drawPath(<any>element)
        }

        if (element.tagName === "g" || element.tagName === "text") {

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

    /**
     * Helper function to calculate where the given point will end up.
     * ALl the transforms of the parent elements are taking into account
     * @param mapSpec
     * @constructor
     */
    static GetActualXY(mapSpec: SVGTSpanElement): { x: number, y: number } {
        let runningM = SvgToPdfInternals.dummyDoc.unitMatrix

        let e: Element = mapSpec
        do {
            const m = SvgToPdfInternals.extractMatrix(e)
            if (m !== null) {
                runningM = SvgToPdfInternals.dummyDoc.matrixMult(runningM, m)
            }
            e = e.parentElement
        } while (e !== null && e.parentElement != e)

        const x = SvgToPdfInternals.attrNumber(mapSpec, "x")
        const y = SvgToPdfInternals.attrNumber(mapSpec, "y")
        return runningM.applyToPoint({x, y})
    }
}

export interface SvgToPdfOptions {
    getFreeDiv: () => string,
    disableMaps?: false | true
    textSubstitutions?: Record<string, string>, beforePage?: (i: number) => void

}

export class SvgToPdf {

    private images: Record<string, HTMLImageElement> = {}
    private rects: Record<string, SVGRectElement> = {}
    private readonly _svgRoots: SVGSVGElement[] = [];
    private readonly _textSubstitutions: Record<string, string>;
    private readonly _beforePage: ((i: number) => void) | undefined;
    public readonly _usedTranslations: Set<string> = new Set<string>()
    private readonly _freeDivId: () => string;
    private readonly _currentState = new UIEventSource<string>("Initing")
    public readonly currentState: Store<string>
    private readonly _disableMaps: boolean ;

    constructor(pages: string[], options?:SvgToPdfOptions) {
        this.currentState = this._currentState
        this._textSubstitutions = options?.textSubstitutions ?? {};
        this._beforePage = options?.beforePage;
        this._freeDivId = options?.getFreeDiv
        this._disableMaps = options.disableMaps ?? false
        const parser = new DOMParser();
        for (const page of pages) {
            const xmlDoc = parser.parseFromString(page, "image/svg+xml");
            const svgRoot = xmlDoc.getElementsByTagName("svg")[0];
            this._svgRoots.push(svgRoot)
        }

    }

    private loadImage(element: Element): Promise<void> {
        const xlink = element.getAttribute("xlink:href")
        let img = document.createElement("img")

        if (xlink.startsWith("data:image/svg+xml;")) {
            const base64src = xlink;
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
            img.src = "data:image/svg+xml;base64," + btoa(svgRoot.outerHTML)
        } else {
            img.src = xlink
        }

        this.images[xlink] = img
        this.setState("Preparing: loading image " + Object.keys(this.images).length + ": " + img.src.substring(0, 30))
        return new Promise((resolve) => {
            img.onload = _ => {
                resolve()
            }

        })
    }


    public async prepareElement(element: SVGSVGElement | Element, mapTextSpecs: SVGTSpanElement[]): Promise<void> {
        if (element.tagName === "rect") {
            this.rects[element.id] = <SVGRectElement>element;
        }

        if (element.tagName === "image") {
            await this.loadImage(element)
        }

        if (element.tagName === "tspan" && element.childElementCount == 0) {
            const specialValues = element.textContent.split(" ").filter(t => t.startsWith("$"))
            for (let specialValue of specialValues) {
                const translationMatch = specialValue.match(/\$([a-zA-Z0-9._-]+)(.*)/)
                if (translationMatch !== null) {
                    this._usedTranslations.add(translationMatch[1])
                }
                if (element.textContent.startsWith("$map(")) {
                    mapTextSpecs.push(<any>element)

                }
            }
        }

        if (element.tagName === "g" || element.tagName === "text" || element.tagName === "tspan" || element.tagName === "defs") {

            for (let child of Array.from(element.children)) {
                await this.prepareElement(child, mapTextSpecs)
            }
        }

    }

    private _isPrepared = false;

    private setState(message: string) {
        this._currentState.setData(message)
    }

    private async prepareMap(mapSpec: SVGTSpanElement,): Promise<void> {
        // Upper left point of the tspan
        const {x, y} = SvgToPdfInternals.GetActualXY(mapSpec)

        let textElement: Element = mapSpec
        // We recurse up to get the actual, full specification
        while (textElement.tagName !== "text") {
            textElement = textElement.parentElement
        }
        const spec = textElement.textContent
        const match = spec.match(/\$map\(([^)]+)\)$/)
        if (match === null) {
            throw "Invalid mapspec:" + spec
        }
        const params = SvgToPdfInternals.parseCss(match[1], ",")
        const ctx = `Preparing map (theme ${params["theme"]})`
        this.setState(ctx + "...")

        let smallestRect: SVGRectElement = undefined
        let smallestSurface: number = undefined;
        // We iterate over all the rectangles and pick the smallest (by surface area) that contains the upper left point of the tspan
        for (const id in this.rects) {
            const rect = this.rects[id]
            const rx = SvgToPdfInternals.attrNumber(rect, "x")
            const ry = SvgToPdfInternals.attrNumber(rect, "y")
            const w = SvgToPdfInternals.attrNumber(rect, "width")
            const h = SvgToPdfInternals.attrNumber(rect, "height")
            const inBounds = rx <= x && x <= rx + w && ry <= y && y <= ry + h
            if (!inBounds) {
                continue
            }
            const surface = w * h
            if (smallestSurface === undefined || smallestSurface > surface) {
                smallestSurface = surface
                smallestRect = rect
            }

        }

        if (smallestRect === undefined) {
            throw "No rectangle found around " + spec + ". Draw a rectangle around it, the map will be projected on that one"
        }

        const svgImage = document.createElement('image')
        svgImage.setAttribute("x", smallestRect.getAttribute("x"))
        svgImage.setAttribute("y", smallestRect.getAttribute("y"))
        const width = SvgToPdfInternals.attrNumber(smallestRect, "width")
        const height = SvgToPdfInternals.attrNumber(smallestRect, "height")
        svgImage.setAttribute("width", "" + width)
        svgImage.setAttribute("height", "" + height)

        let layout = AllKnownLayouts.allKnownLayouts.get(params["theme"])
        if (layout === undefined) {
            console.error("Could not show map with parameters", params)
            throw "Theme not found:" + params["theme"] + ". Use theme: to define which theme to use. "
        }
        layout.widenFactor = 0
        layout.overpassTimeout = 180
        layout.defaultBackgroundId = params["background"] ?? layout.defaultBackgroundId
        const zoom = Number(params["zoom"] ?? params["z"] ?? 14);

        const state = new FeaturePipelineState(layout)
        state.locationControl.setData({
            zoom,
            lat: Number(params["lat"] ?? 51.05016),
            lon: Number(params["lon"] ?? 3.717842)
        })

        const fl = state.filteredLayers.data
        for (const filteredLayer of fl) {
            if (params["layers"] === "none") {
                filteredLayer.isDisplayed.setData(false)
            } else if (filteredLayer.layerDef.id.startsWith("note_import")) {
                filteredLayer.isDisplayed.setData(false)
            }
        }

        for (const paramsKey in params) {
            if (paramsKey.startsWith("layer-")) {
                const layerName = paramsKey.substring("layer-".length)
                const key = params[paramsKey].toLowerCase().trim()
                const isDisplayed = key === "true" || key === "force";
                const layer = state.filteredLayers.data.find(l => l.layerDef.id === layerName)
                layer.isDisplayed.setData(
                    isDisplayed
                )
                if (key === "force") {
                    layer.layerDef.minzoom = zoom
                }
            }
        }

        this.setState(ctx + ": loading map data...")
        const pngCreator = new PngMapCreator(
            state,
            {
                width,
                height,
                scaling: Number(params["scaling"] ?? 1.5),
                divId: this._freeDivId(),
                dummyMode : this._disableMaps
            }
        )
        this.setState(ctx + ": rendering png")
        const png = await pngCreator.CreatePng("image")

        svgImage.setAttribute('xlink:href', png)
        smallestRect.parentElement.insertBefore(svgImage, smallestRect)
        await this.prepareElement(svgImage, [])


        const smallestRectCss = SvgToPdfInternals.parseCss(smallestRect.getAttribute("style"))
        smallestRectCss["fill-opacity"] = "0"
        smallestRect.setAttribute("style", Object.keys(smallestRectCss).map(k => k + ":" + smallestRectCss[k]).join(";"))


        textElement.parentElement.removeChild(textElement)
    }

    public async Prepare() {
        if (this._isPrepared) {
            return
        }
        this._isPrepared = true;
        this.setState("Preparing...")
        const mapSpecs: SVGTSpanElement[] = []
        for (const svgRoot of this._svgRoots) {
            for (let child of Array.from(svgRoot.children)) {
                await this.prepareElement(<any>child, mapSpecs)
            }
        }

        const self = this;
        await Promise.all(mapSpecs.map(ms => self.prepareMap(ms)))


    }

    public async ConvertSvg(saveAs: string): Promise<void> {
        await this.Prepare()
        const ctx = "Rendering PDF"
        this.setState(ctx + "...")
        const firstPage = this._svgRoots[0]
        const width = SvgToPdfInternals.attrNumber(firstPage, "width")
        const height = SvgToPdfInternals.attrNumber(firstPage, "height")
        const mode = width > height ? "landscape" : "portrait"

        const doc = new jsPDF(mode)
        const beforePage = this._beforePage ?? (_ => {
        });
        const svgRoots = this._svgRoots;
        doc.advancedAPI(advancedApi => {
            const internal = new SvgToPdfInternals(advancedApi, this._textSubstitutions, this.images, this.rects);
            for (let i = 0; i < this._svgRoots.length; i++) {
                this.setState(ctx + ": page " + i + "/" + this._svgRoots.length)
                beforePage(i)
                const svgRoot = svgRoots[i];
                for (let child of Array.from(svgRoot.children)) {
                    internal.handleElement(<any>child)
                }
                if (i > 0) {
                    advancedApi.addPage()
                }
            }
        })
        this.setState("Serving PDF...")
        await doc.save(saveAs);
        this.setState("Done")
    }


}
