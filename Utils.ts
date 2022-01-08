import * as colors from "./assets/colors.json"

export class Utils {

    /**
     * In the 'deploy'-step, some code needs to be run by ts-node.
     * However, ts-node crashes when it sees 'document'. When running from console, we flag this and disable all code where document is needed.
     * This is a workaround and yet another hack
     */
    public static runningFromConsole = typeof window === "undefined";
    public static readonly assets_path = "./assets/svg/";
    public static externalDownloadFunction: (url: string, headers?: any) => Promise<any>;
    public static Special_visualizations_tagsToApplyHelpText = `These can either be a tag to add, such as \`amenity=fast_food\` or can use a substitution, e.g. \`addr:housenumber=$number\`. 
This new point will then have the tags \`amenity=fast_food\` and \`addr:housenumber\` with the value that was saved in \`number\` in the original feature. 

If a value to substitute is undefined, empty string will be used instead.

This supports multiple values, e.g. \`ref=$source:geometry:type/$source:geometry:ref\`

Remark that the syntax is slightly different then expected; it uses '$' to note a value to copy, followed by a name (matched with \`[a-zA-Z0-9_:]*\`). Sadly, delimiting with \`{}\` as these already mark the boundaries of the special rendering...

Note that these values can be prepare with javascript in the theme by using a [calculatedTag](calculatedTags.md#calculating-tags-with-javascript)
 `
    public static readonly imageExtensions = new Set(["jpg","png","svg","jpeg",".gif"])

    public static readonly special_visualizations_importRequirementDocs = `#### Importing a dataset into OpenStreetMap: requirements

If you want to import a dataset, make sure that:

1. The dataset to import has a suitable license
2. The community has been informed of the import
3. All other requirements of the [import guidelines](https://wiki.openstreetmap.org/wiki/Import/Guidelines) have been followed

There are also some technicalities in your theme to keep in mind:

1. The new feature will be added and will flow through the program as any other new point as if it came from OSM.
    This means that there should be a layer which will match the new tags and which will display it.
2. The original feature from your geojson layer will gain the tag '_imported=yes'.
    This should be used to change the appearance or even to hide it (eg by changing the icon size to zero)
3. There should be a way for the theme to detect previously imported points, even after reloading.
    A reference number to the original dataset is an excellent way to do this
4. When importing ways, the theme creator is also responsible of avoiding overlapping ways. 
    
#### Disabled in unofficial themes

The import button can be tested in an unofficial theme by adding \`test=true\` or \`backend=osm-test\` as [URL-paramter](URL_Parameters.md). 
The import button will show up then. If in testmode, you can read the changeset-XML directly in the web console.
In the case that MapComplete is pointed to the testing grounds, the edit will be made on https://master.apis.dev.openstreetmap.org`
    private static knownKeys = ["addExtraTags", "and", "calculatedTags", "changesetmessage", "clustering", "color", "condition", "customCss", "dashArray", "defaultBackgroundId", "description", "descriptionTail", "doNotDownload", "enableAddNewPoints", "enableBackgroundLayerSelection", "enableGeolocation", "enableLayers", "enableMoreQuests", "enableSearch", "enableShareScreen", "enableUserBadge", "freeform", "hideFromOverview", "hideInAnswer", "icon", "iconOverlays", "iconSize", "id", "if", "ifnot", "isShown", "key", "language", "layers", "lockLocation", "maintainer", "mappings", "maxzoom", "maxZoom", "minNeededElements", "minzoom", "multiAnswer", "name", "or", "osmTags", "passAllFeatures", "presets", "question", "render", "roaming", "roamingRenderings", "rotation", "shortDescription", "socialImage", "source", "startLat", "startLon", "startZoom", "tagRenderings", "tags", "then", "title", "titleIcons", "type", "version", "wayHandling", "widenFactor", "width"]
    private static extraKeys = ["nl", "en", "fr", "de", "pt", "es", "name", "phone", "email", "amenity", "leisure", "highway", "building", "yes", "no", "true", "false"]
    private static injectedDownloads = {}
    private static _download_cache = new Map<string, { promise: Promise<any>, timestamp: number }>()

    /**
     * Parses the arguments for special visualisations
     */
    public static ParseVisArgs(specs: { name: string, defaultValue?: string }[], args: string[]): any {
        const parsed = {};
        if (args.length > specs.length) {
            throw "To much arguments for special visualization: got " + args.join(",") + " but expected only " + args.length + " arguments"
        }
        for (let i = 0; i < specs.length; i++) {
            const spec = specs[i];
            let arg = args[i]?.trim();
            if (arg === undefined || arg === "") {
                arg = spec.defaultValue
            }
            parsed[spec.name] = arg
        }

        return parsed;
    }

    static EncodeXmlValue(str) {
        if (typeof str !== "string") {
            str = "" + str
        }

        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
    }

    /**
     * Gives a clean float, or undefined if parsing fails
     * @param str
     */
    static asFloat(str): number {
        if (str) {
            const i = parseFloat(str);
            if (isNaN(i)) {
                return undefined;
            }
            return i;
        }
        return undefined;
    }

    public static Upper(str: string) {
        return str.substr(0, 1).toUpperCase() + str.substr(1);
    }

    public static TwoDigits(i: number) {
        if (i < 10) {
            return "0" + i;
        }
        return "" + i;
    }

    public static Round(i: number) {
        if (i < 0) {
            return "-" + Utils.Round(-i);
        }
        const j = "" + Math.floor(i * 10);
        if (j.length == 1) {
            return "0." + j;
        }
        return j.substr(0, j.length - 1) + "." + j.substr(j.length - 1, j.length);
    }

    public static Times(f: ((i: number) => string), count: number): string {
        let res = "";
        for (let i = 0; i < count; i++) {
            res += f(i);
        }
        return res;
    }

    public static TimesT<T>(count: number, f: ((i: number) => T)): T[] {
        let res: T[] = [];
        for (let i = 0; i < count; i++) {
            res.push(f(i));
        }
        return res;
    }

    public static NoNull<T>(array: T[]): T[] {
        const ls: T[] = [];
        for (const t of array) {
            if (t === undefined || t === null) {
                continue;
            }
            ls.push(t);
        }
        return ls;
    }

    public static Hist(array: string[]): Map<string, number> {
        const hist = new Map<string, number>();
        for (const s of array) {
            hist.set(s, 1 + (hist.get(s) ?? 0))
        }
        return hist;
    }

    public static NoEmpty(array: string[]): string[] {
        const ls: string[] = [];
        for (const t of array) {
            if (t === "") {
                continue;
            }
            ls.push(t);
        }
        return ls;
    }

    public static EllipsesAfter(str: string, l: number = 100) {
        if (str === undefined || str === null) {
            return undefined;
        }
        if (str.length <= l) {
            return str;
        }
        return str.substr(0, l - 3) + "...";
    }

    public static Dedup(arr: string[]): string[] {
        if (arr === undefined) {
            return undefined;
        }
        const newArr = [];
        for (const string of arr) {
            if (newArr.indexOf(string) < 0) {
                newArr.push(string);
            }
        }
        return newArr;
    }

    public static Dupiclates(arr: string[]): string[] {
        if (arr === undefined) {
            return undefined;
        }
        const newArr = [];
        const seen = new Set<string>();
        for (const string of arr) {
            if (seen.has(string)) {
                newArr.push(string)
            }
            seen.add(string)
        }
        return newArr;
    }

    public static Identical<T>(t1: T[], t2: T[], eq?: (t: T, t0: T) => boolean): boolean {
        if (t1.length !== t2.length) {
            return false
        }
        eq = (a, b) => a === b
        for (let i = 0; i < t1.length; i++) {
            if (!eq(t1[i], t2[i])) {
                return false
            }
        }
        return true;
    }

    public static MergeTags(a: any, b: any) {
        const t = {};
        for (const k in a) {
            t[k] = a[k];
        }
        for (const k in b) {
            t[k] = b[k];
        }
        return t;
    }

    public static SplitFirst(a: string, sep: string): string[] {
        const index = a.indexOf(sep);
        if (index < 0) {
            return [a];
        }
        return [a.substr(0, index), a.substr(index + sep.length)];
    }

    /**
     * Given a piece of text, will replace any key occuring in 'tags' by the corresponding value
     * @param txt
     * @param tags
     * @param useLang
     * @constructor
     */
    public static SubstituteKeys(txt: string | undefined, tags: any, useLang?: string): string | undefined {
        if (txt === undefined) {
            return undefined
        }
        const regex = /.*{([^}]*)}.*/

        let match = txt.match(regex)

        while (match) {
            const key = match[1]
            let v = tags[key]
            if (v !== undefined) {

                if (v["toISOString"] != undefined) {
                    // This is a date, probably the timestamp of the object
                    // @ts-ignore
                    const date: Date = el;
                    v = date.toISOString()
                }

                if (useLang !== undefined && v?.translations !== undefined) {
                    v = v.translations[useLang] ?? v.translations["*"] ?? (v.textFor !== undefined ? v.textFor(useLang) : v);
                }

                if (v.InnerConstructElement !== undefined) {
                    console.warn("SubstituteKeys received a BaseUIElement to substitute in - this is probably a bug and will be downcast to a string\nThe key is", key, "\nThe value is", v)
                    v = (<HTMLElement>v.InnerConstructElement())?.innerText
                }

                if (typeof v !== "string") {
                    v = "" + v
                }
                v = v.replace(/\n/g, "<br/>")
            }
            txt = txt.replace("{" + key + "}", v ?? "")
            match = txt.match(regex)
        }

        return txt;
    }

    public static LoadCustomCss(location: string) {
        const head = document.getElementsByTagName('head')[0];
        const link = document.createElement('link');
        link.id = "customCss";
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = location;
        link.media = 'all';
        head.appendChild(link);
        console.log("Added custom css file ", location)
    }

    /**
     * Copies all key-value pairs of the source into the target. This will change the target
     * If the key starts with a '+', the values of the list will be appended to the target instead of overwritten
     * @param source
     * @param target
     * @constructor
     * @return the second parameter as is
     */
    static Merge(source: any, target: any) {
        for (const key in source) {
            if (!source.hasOwnProperty(key)) {
                continue
            }
            if (key.startsWith("+") || key.endsWith("+")) {
                const trimmedKey = key.replace("+", "");
                const sourceV = source[key];
                const targetV = (target[trimmedKey] ?? [])

                let newList: any[];
                if (key.startsWith("+")) {
                    newList = sourceV.concat(targetV)
                } else {
                    newList = targetV.concat(sourceV)
                }

                target[trimmedKey] = newList;
                continue;
            }

            const sourceV = source[key];
            if (target === null) {
                return source
            }
            const targetV = target[key]
            if (typeof sourceV === "object") {
                if (sourceV === null) {
                    target[key] = null
                } else if (targetV === undefined) {
                    target[key] = sourceV;
                } else {
                    Utils.Merge(sourceV, targetV);
                }

            } else {
                target[key] = sourceV;
            }

        }
        return target;
    }

    static WalkJson(json: any, f: (v: number | string | boolean | undefined) => any) {
        if(json === undefined){
            return f(undefined)
        }
        const jtp = typeof json
        if (jtp === "boolean" || jtp === "string" || jtp === "number"){
            return f(json)
        }
        if (json.map !== undefined) {
          return json.map(sub => {
                return Utils.WalkJson(sub, f);
            })
        }

        const cp = {...json}
        for (const key in json) {
            cp[key] = Utils.WalkJson(json[key], f)
        }
        return cp
    }

    static getOrSetDefault<K, V>(dict: Map<K, V>, k: K, v: () => V) {
        let found = dict.get(k);
        if (found !== undefined) {
            return found;
        }
        dict.set(k, v());
        return dict.get(k);
    }

    public static MinifyJSON(stringified: string): string {
        stringified = stringified.replace(/\|/g, "||");

        const keys = Utils.knownKeys.concat(Utils.extraKeys);
        for (let i = 0; i < keys.length; i++) {
            const knownKey = keys[i];
            let code = i;
            if (i >= 124) {
                code += 1; // Character 127 is our 'escape' character |
            }
            let replacement = "|" + String.fromCharCode(code)
            stringified = stringified.replace(new RegExp(`\"${knownKey}\":`, "g"), replacement);
        }

        return stringified;
    }

    public static UnMinify(minified: string): string {

        if (minified === undefined || minified === null) {
            return undefined;
        }

        const parts = minified.split("|");
        let result = parts.shift();
        const keys = Utils.knownKeys.concat(Utils.extraKeys);

        for (const part of parts) {
            if (part == "") {
                // Empty string => this was a || originally
                result += "|"
                continue
            }
            const i = part.charCodeAt(0);
            result += "\"" + keys[i] + "\":" + part.substring(1)
        }

        return result;
    }

    public static injectJsonDownloadForTests(url: string, data) {
        Utils.injectedDownloads[url] = data
    }

    public static download(url: string, headers?: any): Promise<string> {
        if (this.externalDownloadFunction !== undefined) {
            return this.externalDownloadFunction(url, headers)
        }

        return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    if (xhr.status == 200) {
                        resolve(xhr.response)
                    } else if (xhr.status === 509 || xhr.status === 429) {
                        reject("rate limited")
                    } else {
                        reject(xhr.statusText)
                    }
                };
                xhr.open('GET', url);
                if (headers !== undefined) {

                    for (const key in headers) {
                        xhr.setRequestHeader(key, headers[key])
                    }
                }

                xhr.send();
                xhr.onerror = reject
            }
        )
    }

    public static upload(url: string, data, headers?: any): Promise<string> {

        return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    if (xhr.status == 200) {
                        resolve(xhr.response)
                    } else if (xhr.status === 509 || xhr.status === 429) {
                        reject("rate limited")
                    } else {
                        reject(xhr.statusText)
                    }
                };
                xhr.open('POST', url);
                if (headers !== undefined) {

                    for (const key in headers) {
                        xhr.setRequestHeader(key, headers[key])
                    }
                }

                xhr.send(data);
                xhr.onerror = reject
            }
        )
    }


    public static async downloadJsonCached(url: string, maxCacheTimeMs: number, headers?: any): Promise<any> {
        const cached = Utils._download_cache.get(url)
        if (cached !== undefined) {
            if ((new Date().getTime() - cached.timestamp) <= maxCacheTimeMs) {
                return cached.promise
            }
        }
        const promise = /*NO AWAIT as we work with the promise directly */Utils.downloadJson(url, headers)
        Utils._download_cache.set(url, {promise, timestamp: new Date().getTime()})
        return await promise
    }

    public static async downloadJson(url: string, headers?: any): Promise<any> {
        const injected = Utils.injectedDownloads[url]
        if (injected !== undefined) {
            console.log("Using injected resource for test for URL", url)
            return new Promise((resolve, _) => resolve(injected))
        }
        const data = await Utils.download(url, Utils.Merge({"accept": "application/json"}, headers ?? {}))
        try {
            return JSON.parse(data)
        } catch (e) {
            console.error("Could not parse ", data, "due to", e, "\n", e.stack)
            throw e;
        }
    }

    /**
     * Triggers a 'download file' popup which will download the contents
     */
    public static offerContentsAsDownloadableFile(contents: string | Blob, fileName: string = "download.txt",
                                                  options?: { mimetype: string }) {
        const element = document.createElement("a");
        let file;
        if (typeof (contents) === "string") {
            file = new Blob([contents], {type: options?.mimetype ?? 'text/plain'});
        } else {
            file = contents;
        }
        element.href = URL.createObjectURL(file);
        element.download = fileName;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    public static ColourNameToHex(color: string): string {
        return colors[color.toLowerCase()] ?? color;
    }

    public static HexToColourName(hex: string): string {
        hex = hex.toLowerCase()
        if (!hex.startsWith("#")) {
            return hex;
        }
        const c = Utils.color(hex);

        let smallestDiff = Number.MAX_VALUE;
        let bestColor = undefined;
        for (const color in colors) {
            if (!colors.hasOwnProperty(color)) {
                continue;
            }
            const foundhex = colors[color];
            if (typeof foundhex !== "string") {
                continue
            }
            if (foundhex === hex) {
                return color
            }
            const diff = this.colorDiff(Utils.color(foundhex), c)
            if (diff > 50) {
                continue;
            }
            if (diff < smallestDiff) {
                smallestDiff = diff;
                bestColor = color;
            }
        }
        return bestColor ?? hex;
    }

    static sortKeys(o: any) {
        const copy = {}
        let keys = Object.keys(o)
        keys = keys.sort()
        for (const key of keys) {
            let v = o[key]
            if (typeof v === "object") {
                v = Utils.sortKeys(v)
            }
            copy[key] = v
        }
        return copy
    }

    public static async waitFor(timeMillis: number): Promise<void> {
        return new Promise((resolve) => {
            window.setTimeout(resolve, timeMillis);
        })
    }

    public static toHumanTime(seconds): string {
        seconds = Math.floor(seconds)
        let minutes = Math.floor(seconds / 60)
        seconds = seconds % 60
        let hours = Math.floor(minutes / 60)
        minutes = minutes % 60
        let days = Math.floor(hours / 24)
        hours = hours % 24
        if (days > 0) {
            return days + "days" + " " + hours + "h"
        }
        return hours + ":" + Utils.TwoDigits(minutes) + ":" + Utils.TwoDigits(seconds)
    }

    public static DisableLongPresses() {
        // Remove all context event listeners on mobile to prevent long presses
        window.addEventListener('contextmenu', (e) => { // Not compatible with IE < 9

            if (e.target["nodeName"] === "INPUT") {
                return;
            }
            e.preventDefault();
            return false;
        }, false);

    }

    public static OsmChaLinkFor(daysInThePast, theme = undefined): string {
        const now = new Date()
        const lastWeek = new Date(now.getTime() - daysInThePast * 24 * 60 * 60 * 1000)
        const date = lastWeek.getFullYear() + "-" + Utils.TwoDigits(lastWeek.getMonth() + 1) + "-" + Utils.TwoDigits(lastWeek.getDate())
        let osmcha_link = `"date__gte":[{"label":"${date}","value":"${date}"}],"editor":[{"label":"mapcomplete","value":"mapcomplete"}]`
        if (theme !== undefined) {
            osmcha_link = osmcha_link + "," + `"comment":[{"label":"#${theme}","value":"#${theme}"}]`
        }
        return "https://osmcha.org/?filters=" + encodeURIComponent("{" + osmcha_link + "}")
    }

    /**
     * Deepclone an object by serializing and deserializing it
     * @param x
     * @constructor
     */
    static Clone<T>(x: T): T {
        if (x === undefined) {
            return undefined;
        }
        return JSON.parse(JSON.stringify(x));
    }

    private static colorDiff(c0: { r: number, g: number, b: number }, c1: { r: number, g: number, b: number }) {
        return Math.abs(c0.r - c1.r) + Math.abs(c0.g - c1.g) + Math.abs(c0.b - c1.b);
    }

    private static color(hex: string): { r: number, g: number, b: number } {
        if (hex.startsWith == undefined) {
            console.trace("WUT?", hex)
            throw "wut?"
        }
        if (!hex.startsWith("#")) {
            return undefined;
        }
        if (hex.length === 4) {
            return {
                r: parseInt(hex.substr(1, 1), 16),
                g: parseInt(hex.substr(2, 1), 16),
                b: parseInt(hex.substr(3, 1), 16),
            }
        }

        return {
            r: parseInt(hex.substr(1, 2), 16),
            g: parseInt(hex.substr(3, 2), 16),
            b: parseInt(hex.substr(5, 2), 16),
        }
    }
}

