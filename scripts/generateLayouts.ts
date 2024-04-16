import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFile, writeFileSync } from "fs"
import Locale from "../src/UI/i18n/Locale"
import Translations from "../src/UI/i18n/Translations"
import { Translation } from "../src/UI/i18n/Translation"
import all_known_layouts from "../src/assets/generated/known_themes.json"
import { LayoutConfigJson } from "../src/Models/ThemeConfig/Json/LayoutConfigJson"
import LayoutConfig from "../src/Models/ThemeConfig/LayoutConfig"
import xml2js from "xml2js"
import ScriptUtils from "./ScriptUtils"
import { Utils } from "../src/Utils"
import SpecialVisualizations from "../src/UI/SpecialVisualizations"
import Constants from "../src/Models/Constants"
import { AvailableRasterLayers, RasterLayerPolygon } from "../src/Models/RasterLayers"
import { ImmutableStore } from "../src/Logic/UIEventSource"
import * as eli from "../src/assets/editor-layer-index.json"
import * as eli_global from "../src/assets/global-raster-layers.json"
import ValidationUtils from "../src/Models/ThemeConfig/Conversion/ValidationUtils"
import { LayerConfigJson } from "../src/Models/ThemeConfig/Json/LayerConfigJson"
import { QuestionableTagRenderingConfigJson } from "../src/Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
import Script from "./Script"
import crypto from "crypto"

const sharp = require("sharp")

class GenerateLayouts extends Script {
    private readonly template = readFileSync("theme.html", "utf8")
    private readonly codeTemplate = readFileSync("src/index_theme.ts.template", "utf8")
    private readonly removeOtherLanguages = readFileSync("src/UI/RemoveOtherLanguages.ts", "utf8")
        .split("\n")
        .slice(1)
        .map((s) => s.trim())
        .filter((s) => s !== "")
        .join("\n")
    private readonly removeOtherLanguagesHash =
        "sha256-" + crypto.createHash("sha256").update(this.removeOtherLanguages).digest("base64")
    private previousSrc: Set<string> = new Set<string>()
    private eliUrlsCached: string[]
    private date = new Date().toISOString()
    private branchName: string = undefined

    constructor() {
        super("Generates an '<theme>.html' and 'index_<theme>.ts' for every theme")
    }

    enc(str: string): string {
        return encodeURIComponent(str.toLowerCase())
    }

    getBranchName(): Promise<string> {
        if (this.branchName) {
            return Promise.resolve(this.branchName)
        }
        const { exec } = require("child_process")
        return new Promise<string>((resolve, reject) => {
            exec("git rev-parse --abbrev-ref HEAD", (err, stdout, stderr) => {
                if (err) {
                    reject(err)
                    return
                }

                if (typeof stdout === "string") {
                    this.branchName = stdout.trim()
                    resolve(stdout.trim())
                }
                reject("Did not get output")
            })
        })
    }

    async createIcon(iconPath: string, size: number, alreadyWritten: string[]) {
        let name = iconPath.split(".").slice(0, -1).join(".") // drop svg suffix
        if (name.startsWith("./")) {
            name = name.substring(2)
        }

        const newname = `assets/generated/images/${name.replace(/\//g, "_")}${size}.png`
        const targetpath = `public/${newname}`
        if (alreadyWritten.indexOf(newname) >= 0) {
            return newname
        }
        alreadyWritten.push(newname)
        if (existsSync(targetpath)) {
            return newname
        }

        if (!existsSync(iconPath)) {
            throw "No file at " + iconPath
        }

        try {
            // We already read to file, in order to crash here if the file is not found
            let img = await sharp(iconPath)
            let resized = await img.resize(size)
            await resized.toFile(targetpath)
            console.log("Created png version at ", newname)
        } catch (e) {
            console.error("Could not read icon", iconPath, " to create a PNG due to", e)
        }

        return newname
    }

    async createSocialImage(layout: LayoutConfig, template: "" | "Wide"): Promise<string> {
        if (!layout.icon.endsWith(".svg")) {
            console.warn(
                "Not creating a social image for " +
                    layout.id +
                    " as it is _not_ a .svg: " +
                    layout.icon
            )
            return undefined
        }
        const path = `./public/assets/generated/images/social_image_${layout.id}_${template}.svg`
        if (existsSync(path)) {
            return path
        }
        const svg = await ScriptUtils.ReadSvg(layout.icon)
        let width: string = svg.$.width
        if (width === undefined) {
            throw "The logo at " + layout.icon + " does not have a defined width"
        }
        if (width?.endsWith("px")) {
            width = width.substring(0, width.length - 2)
        }
        if (width?.endsWith("%")) {
            throw "The logo at " + layout.icon + " has a relative width; this is not supported"
        }
        delete svg["defs"]
        delete svg["$"]
        let templateSvg = await ScriptUtils.ReadSvg(
            "./public/assets/SocialImageTemplate" + template + ".svg"
        )
        templateSvg = Utils.WalkJson(
            templateSvg,
            (leaf) => {
                const { cx, cy, r } = leaf["circle"][0].$
                return {
                    $: {
                        id: "icon",
                        transform: `translate(${cx - r},${cy - r}) scale(${
                            (r * 2) / Number(width)
                        }) `,
                    },
                    g: [svg],
                }
            },
            (mightBeTokenToReplace) => {
                if (mightBeTokenToReplace?.circle === undefined) {
                    return false
                }
                return mightBeTokenToReplace.circle[0]?.$?.style?.indexOf("fill:#ff00ff") >= 0
            }
        )

        const builder = new xml2js.Builder()
        const xml = builder.buildObject({ svg: templateSvg })
        writeFileSync(path, xml)
        console.log("Created social image at ", path)
        return path
    }

    async createManifest(
        layout: LayoutConfig,
        alreadyWritten: string[]
    ): Promise<{
        manifest: any
        whiteIcons: string[]
    }> {
        Translation.forcedLanguage = "en"
        const icons = []

        const whiteIcons: string[] = []
        let icon = layout.icon
        if (icon.endsWith(".svg") || icon.startsWith("<svg") || icon.startsWith("<?xml")) {
            // This is an svg. Lets create the needed pngs and do some checkes!

            const whiteBackgroundPath =
                "./public/assets/generated/images/theme_" + layout.id + "_white_background.svg"
            {
                const svg = await ScriptUtils.ReadSvg(icon)
                const width: string = svg.$.width
                const height: string = svg.$.height

                const builder = new xml2js.Builder()
                const withRect = { rect: { $: { width, height, style: "fill:#ffffff;" } }, ...svg }
                const xml = builder.buildObject({ svg: withRect })
                writeFileSync(whiteBackgroundPath, xml)
            }

            let path = layout.icon
            if (layout.icon.startsWith("<")) {
                // THis is already the svg
                path = "./public/assets/generated/images/" + layout.id + "_logo.svg"
                writeFileSync(path, layout.icon)
            }

            const sizes = [72, 96, 120, 128, 144, 152, 180, 192, 384, 512]
            for (const size of sizes) {
                const name = await this.createIcon(path, size, alreadyWritten)
                const whiteIcon = await this.createIcon(whiteBackgroundPath, size, alreadyWritten)
                whiteIcons.push(whiteIcon)
                icons.push({
                    src: name,
                    sizes: size + "x" + size,
                    type: "image/png",
                })
            }
            icons.push({
                src: path,
                sizes: "513x513",
                type: "image/svg",
            })
        } else if (icon.endsWith(".png")) {
            icons.push({
                src: icon,
                sizes: "513x513",
                type: "image/png",
            })
        } else {
            console.log(icon)
            throw "Icon is not an svg for " + layout.id
        }
        const ogTitle = Translations.T(layout.title).txt
        const ogDescr = Translations.T(layout.description ?? "").txt

        const manifest = {
            name: ogTitle,
            short_name: ogTitle,
            start_url: `${layout.id.toLowerCase()}.html`,
            lang: "en",
            display: "standalone",
            background_color: "#fff",
            description: ogDescr,
            orientation: "portrait-primary, landscape-primary",
            icons: icons,
            categories: ["map", "navigation"],
        }
        return {
            manifest,
            whiteIcons,
        }
    }

    asLangSpan(t: Translation, tag = "span"): string {
        const values: string[] = []
        for (const lang in t.translations) {
            if (lang === "_context") {
                continue
            }
            values.push(`<${tag} lang="${lang}">${t.translations[lang]}</${tag}>`)
        }
        return values.join("\n")
    }

    async eliUrls(): Promise<string[]> {
        if (this.eliUrlsCached) {
            return this.eliUrlsCached
        }
        const urls: string[] = []
        const regex = /{switch:([^}]+)}/
        const rasterLayers = [
            AvailableRasterLayers.defaultBackgroundLayer,
            ...eli.features,
            ...eli_global.layers.map((properties) => ({ properties })),
        ]
        for (const feature of rasterLayers) {
            const f = <RasterLayerPolygon>feature
            const url = f.properties.url
            const match = url.match(regex)
            if (match) {
                const domains = match[1].split(",")
                const subpart = match[0]
                urls.push(...domains.map((d) => url.replace(subpart, d)))
            } else {
                urls.push(url)
            }

            if (f.properties.type === "vector") {
                // We also need to whitelist eventual sources
                let url = f.properties.url
                if (url.startsWith("pmtiles://")) {
                    url = url.substring("pmtiles://".length)
                }
                const styleSpec = await Utils.downloadJsonCached(url, 1000 * 120, {
                    Origin: "https://mapcomplete.org",
                })
                urls.push(...(f.properties["connect-src"] ?? []))
                for (const key of Object.keys(styleSpec?.sources ?? {})) {
                    const url = styleSpec.sources[key].url
                    if (!url) {
                        continue
                    }
                    let urlClipped = url
                    if (url.indexOf("?") > 0) {
                        urlClipped = url?.substring(0, url.indexOf("?"))
                    }
                    console.log("Source url ", key, url)
                    urls.push(url)
                    if (urlClipped.endsWith(".json")) {
                        const tileInfo = await Utils.downloadJsonCached(url, 1000 * 120, {
                            Origin: "https://mapcomplete.org",
                        })
                        urls.push(tileInfo["tiles"] ?? [])
                    }
                }
                urls.push(...(styleSpec["tiles"] ?? []))
                urls.push(styleSpec["sprite"])
                urls.push(styleSpec["glyphs"])
            }
        }
        this.eliUrlsCached = urls
        return Utils.NoNull(urls).sort()
    }

    async generateCsp(
        layout: LayoutConfig,
        layoutJson: LayoutConfigJson,
        options: {
            scriptSrcs: string[]
        }
    ): Promise<string> {
        const apiUrls: string[] = [
            ...Constants.defaultOverpassUrls,
            Constants.countryCoderEndpoint,
            Constants.nominatimEndpoint,
            "https://www.openstreetmap.org",
            "https://api.openstreetmap.org",
            "https://pietervdvn.goatcounter.com",
            "https://cache.mapcomplete.org",
        ].concat(...(await this.eliUrls()))

        SpecialVisualizations.specialVisualizations.forEach((sv) => {
            if (typeof sv.needsUrls === "function") {
                // Handled below
                return
            }
            apiUrls.push(...(sv.needsUrls ?? []))
        })

        const usedSpecialVisualisations = [].concat(
            ...layoutJson.layers.map((l) =>
                ValidationUtils.getAllSpecialVisualisations(
                    <QuestionableTagRenderingConfigJson[]>(<LayerConfigJson>l).tagRenderings ?? []
                )
            )
        )
        for (const usedSpecialVisualisation of usedSpecialVisualisations) {
            if (typeof usedSpecialVisualisation === "string") {
                continue
            }
            const neededUrls = usedSpecialVisualisation.func.needsUrls ?? []
            if (typeof neededUrls === "function") {
                let needed: string | string[] = neededUrls(usedSpecialVisualisation.args)
                if (typeof needed === "string") {
                    needed = [needed]
                }
                apiUrls.push(...needed)
            }
        }

        const geojsonSources: string[] = layout.layers.map((l) => l.source?.geojsonSource)
        const hosts = new Set<string>()
        hosts.add("https://schema.org")
        const eliLayers: RasterLayerPolygon[] = AvailableRasterLayers.layersAvailableAt(
            new ImmutableStore({ lon: 0, lat: 0 })
        ).data
        {
            const vectorLayers = eliLayers.filter((l) => l.properties.type === "vector")
            const vectorSources = vectorLayers.map((l) => l.properties.url)
            vectorSources.push(...vectorLayers.map((l) => l.properties.style))
            apiUrls.push(
                ...vectorSources.map((url) => {
                    if (url?.startsWith("pmtiles://")) {
                        return url.substring("pmtiles://".length)
                    }
                    return url
                })
            )
        }
        for (let connectSource of apiUrls.concat(geojsonSources)) {
            if (!connectSource) {
                continue
            }
            try {
                if (!connectSource.startsWith("http")) {
                    connectSource = "https://" + connectSource
                }
                const url = new URL(connectSource)
                hosts.add("https://" + url.host)
            } catch (e) {
                hosts.add(connectSource)
            }
        }

        if (hosts.has("*")) {
            throw "* is not allowed as connect-src"
        }

        const connectSrc = Array.from(hosts).sort()

        const newSrcs = connectSrc.filter((newItem) => !this.previousSrc.has(newItem))

        console.log(
            "Got",
            hosts.size,
            "connect-src items for theme",
            layout.id,
            newSrcs.length > 0 ? "(extra sources: " + newSrcs.join(" ") + ")" : ""
        )
        this.previousSrc = hosts

        const csp: Record<string, string> = {
            "default-src": "'self'",
            "child-src": "'self' blob: ",
            "img-src": "* data:", // maplibre depends on 'data:' to load
            "connect-src": "'self' " + connectSrc.join(" "),
            "report-to": "https://report.mapcomplete.org/csp",
            "worker-src": "'self' blob:", // Vite somehow loads the worker via a 'blob'
            "style-src": "'self' 'unsafe-inline'", // unsafe-inline is needed to change the default background pin colours
            "script-src": [
                "'self'",
                "https://gc.zgo.at/count.js",
                ...(options?.scriptSrcs?.map((s) => "'" + s + "'") ?? []),
            ].join(" "),
        }
        const content = Object.keys(csp)
            .map((k) => k + " " + csp[k])
            .join(" ; ")

        return [
            `<meta http-equiv ="Report-To" content='{"group":"csp-endpoint", "max_age": 86400,"endpoints": [\{"url": "https://report.mapcomplete.org/csp"}], "include_subdomains": true}'>`,
            `<meta http-equiv="Content-Security-Policy" content="${content}">`,
        ].join("\n")
    }

    async createLandingPage(
        layout: LayoutConfig,
        layoutJson: LayoutConfigJson,
        whiteIcons,
        alreadyWritten
    ) {
        Locale.language.setData(layout.language[0])
        const targetLanguage = layout.language[0]
        const ogTitle = Translations.T(layout.title).textFor(targetLanguage).replace(/"/g, '\\"')
        const ogDescr = Translations.T(
            layout.shortDescription ?? "Easily add and edit geodata with OpenStreetMap"
        )
            .textFor(targetLanguage)
            .replace(/"/g, '\\"')
        let ogImage = layout.socialImage
        let twitterImage = ogImage
        if (ogImage === LayoutConfig.defaultSocialImage && layout.official) {
            ogImage = (await this.createSocialImage(layout, "")) ?? layout.socialImage
            twitterImage = (await this.createSocialImage(layout, "Wide")) ?? layout.socialImage
        }
        if (twitterImage.endsWith(".svg")) {
            // svgs are badly supported as social image, we use a generated svg instead
            twitterImage = await this.createIcon(twitterImage, 512, alreadyWritten)
        }

        if (ogImage.endsWith(".svg")) {
            ogImage = await this.createIcon(ogImage, 512, alreadyWritten)
        }

        let customCss = ""
        if (layout.customCss !== undefined && layout.customCss !== "") {
            try {
                const cssContent = readFileSync(layout.customCss)
                customCss = "<style>" + cssContent + "</style>"
            } catch (e) {
                customCss = `<link rel="stylesheet" href="${layout.customCss}"/>`
            }
        }

        const og = `
    <meta property="og:image" content="${ogImage ?? "assets/SocialImage.png"}">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDescr}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@mapcomplete.org">
    <meta name="twitter:creator" content="@pietervdvn">
    <meta name="twitter:title" content="${ogTitle}">
    <meta name="twitter:description" content="${ogDescr}">
    <meta name="twitter:image" content="${twitterImage}">`

        let icon = layout.icon
        if (icon.startsWith("<?xml") || icon.startsWith("<svg")) {
            // This already is an svg
            icon = `./public/assets/generated/images/${layout.id}_icon.svg`
            writeFileSync(icon, layout.icon)
        }

        const apple_icons = []
        for (const icon of whiteIcons) {
            if (!existsSync(icon)) {
                continue
            }
            const size = icon.replace(/[^0-9]/g, "")
            apple_icons.push(`<link rel="apple-touch-icon" sizes="${size}x${size}" href="${icon}">`)
        }

        let themeSpecific = [
            `<title>${ogTitle}</title>`,
            `<link rel="manifest" href="${this.enc(layout.id)}.webmanifest">`,
            og,
            customCss,
            `<link rel="icon" href="${icon}" sizes="any" type="image/svg+xml">`,
            ...apple_icons,
        ].join("\n")

        let branchname = await this.getBranchName()
        if (branchname === "master" || branchname === "main") {
            branchname = ""
        } else {
            branchname = "<div class='text-xs'>" + branchname + "</div>"
        }

        const loadingText = Translations.t.general.loadingTheme.Subs({ theme: layout.title })
        // const templateLines: string[] = this.template.split("\n").slice(1) // Slice to remove the 'export {}'-line

        return this.template
            .replace("Loading MapComplete, hang on...", this.asLangSpan(loadingText, "h1"))
            .replace(
                "Made with OpenStreetMap",
                Translations.t.general.poweredByOsm.textFor(targetLanguage)
            )
            .replace(/<!-- THEME-SPECIFIC -->.*<!-- THEME-SPECIFIC-END-->/s, themeSpecific)
            .replace(
                /<!-- CSP -->/,
                await this.generateCsp(layout, layoutJson, {
                    scriptSrcs: [this.removeOtherLanguagesHash],
                })
            )
            .replace(
                /<!-- DESCRIPTION START -->.*<!-- DESCRIPTION END -->/s,
                this.asLangSpan(layout.shortDescription)
            )
            .replace(
                /<!-- IMAGE-START -->.*<!-- IMAGE-END -->/s,
                "<img class='p-0 h-32 w-32 self-start' src='" + icon + "' />"
            )
            .replace(
                /.*\/src\/index\.ts.*/,
                `<script type="module" src="./index_${layout.id}.ts"></script>`
            )

            .replace(
                /\n.*RemoveOtherLanguages.*\n/i,
                "\n<script>" + this.removeOtherLanguages + "</script>\n"
            )
            .replace(
                "Version",
                `${Constants.vNumber} <div class='text-xs'>${this.date}</div>${branchname}`
            )
    }

    async createIndexFor(theme: LayoutConfig) {
        const filename = "index_" + theme.id + ".ts"

        const imports = [
            `import layout from "./src/assets/generated/themes/${theme.id}.json"`,
            `import { ThemeMetaTagging } from "./src/assets/generated/metatagging/${theme.id}"`,
        ]
        for (const layerName of Constants.added_by_default) {
            imports.push(
                `import ${layerName} from "./src/assets/generated/layers/${layerName}.json"`
            )
        }
        writeFileSync(filename, imports.join("\n") + "\n")

        const addLayers = []

        for (const layerName of Constants.added_by_default) {
            addLayers.push(`    layout.layers.push(<any> ${layerName})`)
        }

        let codeTemplate = this.codeTemplate.replace(
            "    // LAYOUT.ADD_LAYERS",
            addLayers.join("\n")
        )

        appendFileSync(filename, codeTemplate)
    }

    createDir(path) {
        if (!existsSync(path)) {
            mkdirSync(path)
        }
    }

    async main(): Promise<void> {
        const alreadyWritten = []
        this.createDir("./public/assets/")
        this.createDir("./public/assets/generated")
        this.createDir("./public/assets/generated/images")

        const blacklist = [
            "",
            "test",
            ".",
            "..",
            "manifest",
            "index",
            "land",
            "preferences",
            "account",
            "openstreetmap",
            "custom",
            "theme",
        ]
        // @ts-ignore
        const all: LayoutConfigJson[] = all_known_layouts.themes
        const args = process.argv
        const theme = args[2]
        if (theme !== undefined) {
            console.warn("Only generating layout " + theme)
        }
        for (const i in all) {
            const layoutConfigJson: LayoutConfigJson = all[i]
            if (theme !== undefined && layoutConfigJson.id !== theme) {
                continue
            }
            const layout = new LayoutConfig(layoutConfigJson, true)
            const layoutName = layout.id
            if (blacklist.indexOf(layoutName.toLowerCase()) >= 0) {
                console.log(`Skipping a layout with name${layoutName}, it is on the blacklist`)
                continue
            }
            const err = (err) => {
                if (err !== null) {
                    console.log("Could not write manifest for ", layoutName, " because ", err)
                }
            }
            const { manifest, whiteIcons } = await this.createManifest(layout, alreadyWritten)
            const manif = JSON.stringify(manifest, undefined, 2)
            const manifestLocation = encodeURIComponent(layout.id.toLowerCase()) + ".webmanifest"
            writeFile("public/" + manifestLocation, manif, err)

            // Create a landing page for the given theme
            const landing = await this.createLandingPage(
                layout,
                layoutConfigJson,
                whiteIcons,
                alreadyWritten
            )

            writeFile(this.enc(layout.id) + ".html", landing, err)
            await this.createIndexFor(layout)
        }

        const { manifest } = await this.createManifest(
            new LayoutConfig({
                icon: "./assets/svg/mapcomplete_logo.svg",
                id: "index",
                layers: [],
                socialImage: "assets/SocialImage.png",
                startLat: 0,
                startLon: 0,
                startZoom: 0,
                title: { en: "MapComplete" },
                description: { en: "A thematic map viewer and editor based on OpenStreetMap" },
            }),
            alreadyWritten
        )

        const manif = JSON.stringify(manifest, undefined, 2)
        writeFileSync("public/index.webmanifest", manif)
    }
}

new GenerateLayouts().run()
