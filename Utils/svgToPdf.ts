import jsPDF, {Matrix} from "jspdf";
import {Translation, TypedTranslation} from "../UI/i18n/Translation";
import FeaturePipelineState from "../Logic/State/FeaturePipelineState";
import {PngMapCreator} from "./pngMapCreator";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import {Store} from "../Logic/UIEventSource";
import "../assets/templates/Ubuntu-M-normal.js"
import "../assets/templates/Ubuntu-L-normal.js"
import "../assets/templates/UbuntuMono-B-bold.js"
import {makeAbsolute, parseSVG} from 'svg-path-parser';
import Translations from "../UI/i18n/Translations";
import {Utils} from "../Utils";
import Constants from "../Models/Constants";
import Hash from "../Logic/Web/Hash";

class SvgToPdfInternals {
    private readonly doc: jsPDF;
    private static readonly dummyDoc: jsPDF = new jsPDF()
    private readonly matrices: Matrix[] = []
    private readonly matricesInverted: Matrix[] = []

    private currentMatrix: Matrix;
    private currentMatrixInverted: Matrix;

    private readonly _images: Record<string, HTMLImageElement>;
    private readonly _rects: Record<string, SVGRectElement>;
    private readonly extractTranslation: (string) => string;

    constructor(advancedApi: jsPDF, images: Record<string, HTMLImageElement>, rects: Record<string, SVGRectElement>, extractTranslation: (string) => string) {
        this.doc = advancedApi;
        this._images = images;
        this._rects = rects;
        this.extractTranslation = s => extractTranslation(s)?.replace(/&nbsp;/g, " ");
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
        const scaleMatch = t.match(/scale\(([-0-9.]+)\)/)
        if (scaleMatch !== null) {
            const s = Number(scaleMatch[1])
            return SvgToPdfInternals.dummyDoc.Matrix(1 / s, 0, 0, 1 / s, 0, 0);
        }

        const translateMatch = t.match(/translate\(([-0-9.]+), ?([-0-9.]*)\)/)
        if (translateMatch !== null) {
            const dx = Number(translateMatch[1])
            const dy = Number(translateMatch[2])
            console.log("Translating", dx, dy)
            return SvgToPdfInternals.dummyDoc.Matrix(1, 0, 0, 1, dx, dy);
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

    private drawRect(element: SVGRectElement) {
        const x = Number(element.getAttribute("x"))
        const y = Number(element.getAttribute("y"))
        const width = Number(element.getAttribute("width"))
        const height = Number(element.getAttribute("height"))
        const ry = SvgToPdfInternals.attrNumber(element, "ry", false) ?? 0
        const rx = SvgToPdfInternals.attrNumber(element, "rx", false) ?? 0
        const css = SvgToPdfInternals.css(element)
        if (css["fill-opacity"] !== "0" && css["fill"] !== "none") {
            this.doc.setFillColor(css["fill"] ?? "black")
            this.doc.roundedRect(x, y, width, height, rx, ry, "F")
        }
        if (css["stroke"] && css["stroke"] !== "none") {
            this.doc.setLineWidth(Number(css["stroke-width"] ?? 1))
            this.doc.setDrawColor(css["stroke"] ?? "black")
            this.doc.roundedRect(x, y, width, height, rx, ry, "S")
        }
        return
    }

    private drawCircle(element: SVGCircleElement) {
        const x = Number(element.getAttribute("cx"))
        const y = Number(element.getAttribute("cy"))
        const r = Number(element.getAttribute("r"))
        const css = SvgToPdfInternals.css(element)
        if (css["fill-opacity"] !== "0" && css["fill"] !== "none") {
            this.doc.setFillColor(css["fill"] ?? "black")
            this.doc.circle(x, y, r, "F")

        }
        if (css["stroke"] && css["stroke"] !== "none") {
            this.doc.setLineWidth(Number(css["stroke-width"] ?? 1))
            this.doc.setDrawColor(css["stroke"] ?? "black")
            this.doc.circle(x, y, r, "S")

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
        let result: string = ""
        let addSpace = false
        for (let text of textTemplate) {
            if (text === "\\n") {
                result += "\n"
                addSpace = false
                continue
            }
            if (text === "\\n\\n") {
                result += "\n\n"
                addSpace = false
                continue
            }

            if (!text.startsWith("$")) {
                if (addSpace) {
                    result += " "
                }
                result += text
                addSpace = true
                continue
            }
            const list = text.match(/\$list\(([a-zA-Z0-9_.-]+)\)/)
            if (list) {
                const key = list[1]
                console.log("Generating a list with key" + key)
                let r = this.extractTranslation("$" + key + "0");
                let i = 0
                result += "\n"
                while (r !== undefined && i < 100) {
                    result += "• " + r + "\n"
                    i++
                    r = this.extractTranslation("$" + key + i);
                }
                result += "\n"
                addSpace = false
            } else {
                const found = this.extractTranslation(text) ?? text
                if (addSpace) {
                    result += " "
                }
                result += found
                addSpace = true
            }
        }
        this.doc.text(result, x, y, {
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

            if (c.code === "H") {
                const command = {op: "l", c: [c.x, c.y]}
                this.doc.path([command])
                continue
            }

            if (c.code === "V") {
                const command = {op: "l", c: [c.x, c.y]}
                this.doc.path([command])
                continue
            }

            this.doc.path([{op: c.code.toLowerCase(), c: [c.x, c.y]}])
        }
//"fill:#ffffff;stroke:#000000;stroke-width:0.8;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:20"

        const css = SvgToPdfInternals.css(element)
        if (css["color"] && css["color"].toLowerCase() !== "none") {
            this.doc.setDrawColor(css["color"])
        }
        if (css["stroke-width"]) {
            this.doc.setLineWidth(parseFloat(css["stroke-width"]))
        }
        if (css["stroke-linejoin"] !== undefined) {
            this.doc.setLineJoin(css["stroke-linejoin"])
        }
        let doFill = false
        if (css["fill-rule"] === "evenodd") {
            this.doc.fillEvenOdd()
        } else if (css["fill"] && css["fill"] !== "none") {
            this.doc.setFillColor(css["fill"])
            doFill = true
        }

        if (css["stroke"] && css["stroke"] !== "none") {
            this.doc.setDrawColor(css["stroke"])
            if (doFill) {
                this.doc.fillStroke()
            } else {
                this.doc.stroke()
            }
        } else if (doFill) {
            this.doc.fill()
        }
    }

    public handleElement(element: SVGSVGElement | Element): void {
        const isTransformed = this.setTransform(element)
        try {

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
                this.drawRect(<any>element)
            }

            if (element.tagName === "circle") {
                this.drawCircle(<any>element)
            }

        } catch (e) {
            console.error("Could not handle element", element, "due to", e)
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
    textSubstitutions?: Record<string, string>,
    beforePage?: (i: number) => void,
    overrideLocation?: { lat: number, lon: number }
}


export class SvgToPdfPage {

    private images: Record<string, HTMLImageElement> = {}
    private rects: Record<string, SVGRectElement> = {}
    public readonly _svgRoot: SVGSVGElement;
    public readonly currentState: Store<string>
    private readonly importedTranslations: Record<string, string> = {}
    private readonly layerTranslations: Record<string, Record<string, any>> = {}
    private readonly options: SvgToPdfOptions

    constructor(page: string, options?: SvgToPdfOptions) {
        this.options = options ?? (<SvgToPdfOptions>{})
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(page, "image/svg+xml");
        this._svgRoot = xmlDoc.getElementsByTagName("svg")[0];

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
        return new Promise((resolve) => {
            img.onload = _ => {
                resolve()
            }

        })
    }

    public extractTranslations(): Set<string> {
        const textContents: string[] = Array.from(this._svgRoot.getElementsByTagName("tspan"))
            .map(t => t.textContent)
        const translations = new Set<string>()
        console.log("Extracting translations, contents are", textContents)
        for (const tc of textContents) {
            const parts = tc.split(" ").filter(p => p.startsWith("$") && p.indexOf("(") < 0)
            for (let part of parts) {
                part = part.substring(1) // Drop the $
                let path = part.split(".")
                const importPath = this.importedTranslations[path[0]]
                if (importPath) {
                    translations.add(importPath + "." + path.slice(1).join("."))
                } else {
                    translations.add(part)
                }
            }
        }
        console.log("Translations keys are", translations)
        return translations
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
                const importMatch = element.textContent.match(/\$import ([a-zA-Z-_0-9.? ]+) as ([a-zA-Z0-9]+)/)
                if (importMatch !== null) {
                    const [, pathRaw, as] = importMatch
                    this.importedTranslations[as] = pathRaw
                }
                const setPropertyMatch = element.textContent.match(/\$set\(([a-zA-Z-_0-9.?:]+),(.+)\)/)
                if (setPropertyMatch) {
                    this.options.textSubstitutions[setPropertyMatch[1].trim()] = setPropertyMatch[2].trim()
                    console.log("Setting a property:", setPropertyMatch, this.options.textSubstitutions)
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
        layout.overpassTimeout = 600
        layout.defaultBackgroundId = params["background"] ?? layout.defaultBackgroundId
        for (const paramsKey in params) {
            if (paramsKey.startsWith("layer-")) {
                const layerName = paramsKey.substring("layer-".length)
                const key = params[paramsKey].toLowerCase().trim()
                const layer = layout.layers.find(l => l.id === layerName)
                if (layer === undefined) {
                    throw "No layer found for " + paramsKey
                }
                if (key === "force") {
                    layer.minzoom = 0
                    layer.minzoomVisible = 0
                }
            }
        }
        const zoom = Number(params["zoom"] ?? params["z"] ?? 14);

        Hash.hash.setData(undefined)
        //  QueryParameters.ClearAll()

        const state = new FeaturePipelineState(layout)
        state.locationControl.setData({
            zoom,
            lat: this.options?.overrideLocation?.lat ?? Number(params["lat"] ?? 51.05016),
            lon: this.options?.overrideLocation?.lon ?? Number(params["lon"] ?? 3.717842)
        })

        console.log("Params are", params, params["layers"] === "none")

        const fl = state.filteredLayers.data
        for (const filteredLayer of fl) {
            if (params["layer-" + filteredLayer.layerDef.id] !== undefined) {
                filteredLayer.isDisplayed.setData(params["layer-" + filteredLayer.layerDef.id].trim().toLowerCase() !== "false")
            } else if (params["layers"] === "none") {
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
                console.log("Setting ", layer?.layerDef?.id, " to visibility", isDisplayed, "(minzoom:", layer?.layerDef?.minzoomVisible, layer?.layerDef?.minzoom, ")")
                layer.isDisplayed.setData(
                    isDisplayed
                )
                if (key === "force") {
                    layer.layerDef.minzoom = 0
                    layer.layerDef.minzoomVisible = 0
                    layer.isDisplayed.addCallback(isDisplayed => {
                        if (!isDisplayed) {
                            console.warn("Forcing layer " + paramsKey + " as true")
                            layer.isDisplayed.setData(true)
                        }
                    })
                }
            }
        }

        const pngCreator = new PngMapCreator(
            state,
            {
                width,
                height,
                scaling: Number(params["scaling"] ?? 1.5),
                divId: this.options.getFreeDiv(),
                dummyMode: this.options.disableMaps
            }
        )
        const png = await pngCreator.CreatePng("image")

        svgImage.setAttribute('xlink:href', png)
        smallestRect.parentElement.insertBefore(svgImage, smallestRect)
        await this.prepareElement(svgImage, [])


        const smallestRectCss = SvgToPdfInternals.parseCss(smallestRect.getAttribute("style"))
        smallestRectCss["fill-opacity"] = "0"
        smallestRect.setAttribute("style", Object.keys(smallestRectCss).map(k => k + ":" + smallestRectCss[k]).join(";"))


        textElement.parentElement.removeChild(textElement)
    }

    public async PrepareLanguage(language: string) {
        // Always fetch the remote data - it's cached anyway
        this.layerTranslations[language] = await Utils.downloadJsonCached("https://raw.githubusercontent.com/pietervdvn/MapComplete/develop/langs/layers/" + language + ".json", 24 * 60 * 60 * 1000)
        const shared_questions = await Utils.downloadJsonCached("https://raw.githubusercontent.com/pietervdvn/MapComplete/develop/langs/shared-questions/" + language + ".json", 24 * 60 * 60 * 1000)
        this.layerTranslations[language]["shared-questions"] = shared_questions["shared_questions"]
    }

    public async Prepare() {

        if (this._isPrepared) {
            return
        }
        this._isPrepared = true;
        const mapSpecs: SVGTSpanElement[] = []
        for (let child of Array.from(this._svgRoot.children)) {
            await this.prepareElement(<any>child, mapSpecs)
        }

        for (const mapSpec of mapSpecs) {
            await this.prepareMap(mapSpec)
        }


    }

    public drawPage(advancedApi: jsPDF, i: number, language): void {
        if (!this._isPrepared) {
            throw "Run 'Prepare()' first!"
        }

        if (this.options.beforePage) {
            this.options.beforePage(i)
        }
        const self = this
        const internal = new SvgToPdfInternals(advancedApi, this.images, this.rects, key => self.extractTranslation(key, language));
        for (let child of Array.from(this._svgRoot.children)) {
            internal.handleElement(<any>child)
        }
    }


    extractTranslation(text: string, language: string, strict: boolean = false) {
        if (text === "$version") {
            return new Date().toISOString().substring(0, "2022-01-02THH:MM".length) + " - v" + Constants.vNumber
        }
        const pathPart = text.match(/\$(([_a-zA-Z0-9? ]+\.)+[_a-zA-Z0-9? ]+)(.*)/)
        if (pathPart === null) {
            return text
        }
        let t: any = Translations.t
        const path = pathPart[1].split(".")
        if (this.importedTranslations[path[0]]) {
            path.splice(0, 1, ...this.importedTranslations[path[0]].split("."))
        }
        const rest = pathPart[3] ?? ""
        if (path[0] === "layer") {
            t = this.layerTranslations[language]
            if (t === undefined) {
                console.error("No layerTranslation available for language " + language)
                return text
            }
            path.splice(0, 1)
        }
        for (const crumb of path) {
            t = t[crumb]
            if (t === undefined) {
                console.error("No value found to substitute " + text, "the path is", path)
                return undefined
            }
        }

        if (typeof t === "string") {
            t = new TypedTranslation({"*": t})
        }
        if (t instanceof TypedTranslation) {
            if (strict && t.translations[language] === undefined) {
                return undefined
            }
            return t.Subs(this.options.textSubstitutions).textFor(language) + rest
        } else if (t instanceof Translation) {
            if (strict && t.translations[language] === undefined) {
                return undefined
            }
            return (<Translation>t).textFor(language) + rest
        } else {
            console.error("Could not get textFor from ", t, "for path", text)
        }
    }

}

export class SvgToPdf {

    public static readonly templates: Record<string, { pages: string[], description: string | Translation }> = {
        flyer_a4: {
            pages: ["/assets/templates/MapComplete-flyer.svg", "/assets/templates/MapComplete-flyer.back.svg"],
            description: Translations.t.flyer.description
        },
        poster_a3: {
            pages: ["/assets/templates/MapComplete-poster-a3.svg"],
            description: "A basic A3 poster (similar to the flyer)"
        },
        poster_a2: {
            pages: ["/assets/templates/MapComplete-poster-a2.svg"],
            description: "A basic A2 poster (similar to the flyer); scaled up from the A3 poster"
        }
    }
    private readonly _title: string;

    private readonly _pages: SvgToPdfPage[]

    constructor(title: string, pages: string[], options?: SvgToPdfOptions) {
        this._title = title;
        options = options ?? <SvgToPdfOptions>{}
        options.textSubstitutions = options.textSubstitutions ?? {}
        const mapCount = "" + Array.from(AllKnownLayouts.allKnownLayouts.values()).filter(th => !th.hideFromOverview).length;
        options.textSubstitutions["mapCount"] = mapCount

        this._pages = pages.map(page => new SvgToPdfPage(page, options))
    }


    public async ConvertSvg(language: string): Promise<void> {
        const firstPage = this._pages[0]._svgRoot
        const width = SvgToPdfInternals.attrNumber(firstPage, "width")
        const height = SvgToPdfInternals.attrNumber(firstPage, "height")
        const mode = width > height ? "landscape" : "portrait"

        await this.Prepare()
        for (const page of this._pages) {
            await page.Prepare()
            await page.PrepareLanguage(language)
        }

        const doc = new jsPDF(mode, undefined, [width, height])
        doc.advancedAPI(advancedApi => {
            for (let i = 0; i < this._pages.length; i++) {
                if (i > 0) {
                    const page = this._pages[i]._svgRoot
                    const width = SvgToPdfInternals.attrNumber(page, "width")
                    const height = SvgToPdfInternals.attrNumber(page, "height")

                    advancedApi.addPage([width, height])
                    const mediabox: { bottomLeftX: number, bottomLeftY: number, topRightX: number, topRightY: number } = advancedApi.getCurrentPageInfo().pageContext.mediaBox
                    const targetWidth = 297
                    const targetHeight = 210
                    const sx = mediabox.topRightX / targetWidth
                    const sy = mediabox.topRightY / targetHeight
                    advancedApi.setCurrentTransformationMatrix(advancedApi.Matrix(sx, 0, 0, -sy, 0, mediabox.topRightY))
                }
                this._pages[i].drawPage(advancedApi, i, language)
            }
        })
        await doc.save(this._title + "." + language + ".pdf");
    }

    public translationKeys(): Set<string> {
        const allTranslations = this._pages[0].extractTranslations()
        for (let i = 1; i < this._pages.length; i++) {
            const translations = this._pages[i].extractTranslations()
            translations.forEach(t => allTranslations.add(t))
        }
        allTranslations.delete("import")
        allTranslations.delete("version")
        return allTranslations
    }

    /**
     * Prepares all the minimaps
     * @constructor
     */
    public async Prepare(): Promise<SvgToPdf> {
        for (const page of this._pages) {
            await page.Prepare()
        }
        return this
    }

    public async PrepareLanguages(languages: string[]): Promise<boolean> {
        for (const page of this._pages) {
            // Load all languages at once.
            // We don't parallelize the pages, as they'll probably reload the same languages anyway (and they are cached)
            await Promise.all(languages.map(async language => await page.PrepareLanguage(language)))
        }
        return true
    }

    getTranslation(translationKey: string, language: string, strict: boolean = false) {
        for (const page of this._pages) {
            const tr = page.extractTranslation(translationKey, language, strict)
            if (tr !== undefined && tr !== translationKey) {
                return tr
            }
        }
        return undefined
    }
}
