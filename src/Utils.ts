import colors from "./assets/colors.json"
import DOMPurify from "dompurify"

export class Utils {
    /**
     * In the 'deploy'-step, some code needs to be run by ts-node.
     * However, ts-node crashes when it sees 'document'. When running from console, we flag this and disable all code where document is needed.
     * This is a workaround and yet another hack
     */
    public static runningFromConsole = typeof window === "undefined"
    public static readonly assets_path = "./assets/svg/"
    public static externalDownloadFunction: (
        url: string,
        headers?: any
    ) => Promise<{ content: string } | { redirect: string }>
    public static Special_visualizations_tagsToApplyHelpText = `These can either be a tag to add, such as \`amenity=fast_food\` or can use a substitution, e.g. \`addr:housenumber=$number\`.
This new point will then have the tags \`amenity=fast_food\` and \`addr:housenumber\` with the value that was saved in \`number\` in the original feature.

If a value to substitute is undefined, empty string will be used instead.

This supports multiple values, e.g. \`ref=$source:geometry:type/$source:geometry:ref\`

Remark that the syntax is slightly different then expected; it uses '$' to note a value to copy, followed by a name (matched with \`[a-zA-Z0-9_:]*\`). Sadly, delimiting with \`{}\` as these already mark the boundaries of the special rendering...

Note that these values can be prepare with javascript in the theme by using a [calculatedTag](calculatedTags.md#calculating-tags-with-javascript)
 `
    public static readonly imageExtensions = new Set(["jpg", "png", "svg", "jpeg", ".gif"])
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
    private static knownKeys = [
        "addExtraTags",
        "and",
        "calculatedTags",
        "changesetmessage",
        "clustering",
        "color",
        "condition",
        "customCss",
        "dashArray",
        "defaultBackgroundId",
        "description",
        "descriptionTail",
        "doNotDownload",
        "enableAddNewPoints",
        "enableBackgroundLayerSelection",
        "enableGeolocation",
        "enableLayers",
        "enableMoreQuests",
        "enableSearch",
        "enableShareScreen",
        "enableUserBadge",
        "freeform",
        "hideFromOverview",
        "hideInAnswer",
        "icon",
        "iconOverlays",
        "iconSize",
        "id",
        "if",
        "ifnot",
        "isShown",
        "key",
        "language",
        "layers",
        "lockLocation",
        "maintainer",
        "mappings",
        "maxzoom",
        "maxZoom",
        "minNeededElements",
        "minzoom",
        "multiAnswer",
        "name",
        "or",
        "osmTags",
        "passAllFeatures",
        "presets",
        "question",
        "render",
        "roaming",
        "roamingRenderings",
        "rotation",
        "shortDescription",
        "socialImage",
        "source",
        "startLat",
        "startLon",
        "startZoom",
        "tagRenderings",
        "tags",
        "then",
        "title",
        "titleIcons",
        "type",
        "version",
        "wayHandling",
        "widenFactor",
        "width",
    ]
    private static extraKeys = [
        "nl",
        "en",
        "fr",
        "de",
        "pt",
        "es",
        "name",
        "phone",
        "email",
        "amenity",
        "leisure",
        "highway",
        "building",
        "yes",
        "no",
        "true",
        "false",
    ]
    private static injectedDownloads = {}
    private static _download_cache = new Map<
        string,
        {
            promise: Promise<any | { error: string; url: string; statuscode?: number }>
            timestamp: number
        }
    >()

    public static initDomPurify() {
        if (Utils.runningFromConsole) {
            return
        }
        DOMPurify.addHook("afterSanitizeAttributes", function (node) {
            // set all elements owning target to target=_blank + add noopener noreferrer
            const target = node.getAttribute("target")
            if (target) {
                node.setAttribute("target", "_blank")
                node.setAttribute("rel", "noopener noreferrer")
            }
        })
    }

    public static purify(src: string): string {
        return DOMPurify.sanitize(src, {
            USE_PROFILES: { html: true },
            ADD_ATTR: ["target"], // Don't remove target='_blank'. Note that Utils.initDomPurify does add a hook which automatically adds 'rel=noopener'
        })
    }

    /**
     * Parses the arguments for special visualisations
     */
    public static ParseVisArgs(
        specs: { name: string; defaultValue?: string }[],
        args: string[]
    ): Record<string, string> {
        const parsed: Record<string, string> = {}
        if (args.length > specs.length) {
            throw (
                "To much arguments for special visualization: got " +
                args.join(",") +
                " but expected only " +
                args.length +
                " arguments"
            )
        }
        for (let i = 0; i < specs.length; i++) {
            const spec = specs[i]
            let arg = args[i]?.trim()
            if (arg === undefined || arg === "") {
                arg = spec.defaultValue
            }
            parsed[spec.name] = arg
        }

        return parsed
    }

    static EncodeXmlValue(str) {
        if (typeof str !== "string") {
            str = "" + str
        }

        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;")
    }

    /**
     * Gives a clean float, or undefined if parsing fails
     * @param str
     */
    static asFloat(str): number {
        if (str) {
            const i = parseFloat(str)
            if (isNaN(i)) {
                return undefined
            }
            return i
        }
        return undefined
    }

    public static Upper(str: string) {
        return str.substr(0, 1).toUpperCase() + str.substr(1)
    }

    public static TwoDigits(i: number) {
        if (i < 10) {
            return "0" + i
        }
        return "" + i
    }

    /**
     * Converts a number to a number with precisely 7 decimals
     *
     * Utils.Round7(12.123456789) // => 12.1234568
     */
    public static Round7(i: number): number {
        if (i == undefined) {
            return undefined
        }
        return Math.round(i * 10000000) / 10000000
    }

    public static Times(f: (i: number) => string, count: number): string {
        let res = ""
        for (let i = 0; i < count; i++) {
            res += f(i)
        }
        return res
    }

    public static TimesT<T>(count: number, f: (i: number) => T): T[] {
        const res: T[] = []
        for (let i = 0; i < count; i++) {
            res.push(f(i))
        }
        return res
    }

    public static NoNull<T>(array: T[] | undefined): (T[] | undefined)
    public static NoNull<T>(array: undefined): undefined
    public static NoNull<T>(array: T[]): T[]
    public static NoNull<T>(array: T[]): NonNullable<T>[] {
        return <any>array?.filter((o) => o !== undefined && o !== null)
    }

    public static Hist(array: string[]): Map<string, number> {
        const hist = new Map<string, number>()
        for (const s of array) {
            hist.set(s, 1 + (hist.get(s) ?? 0))
        }
        return hist
    }

    /**
     * Removes all empty strings from this list
     * If undefined or null is given, an empty list is returned
     *
     * Utils.NoEmpty(undefined) // => []
     * Utils.NoEmpty(["abc","","def", null]) // => ["abc","def", null]
     *
     */
    public static NoEmpty(array: string[]): string[] {
        const ls: string[] = []
        if (!array) {
            return ls
        }
        for (const t of array) {
            if (t === "") {
                continue
            }
            ls.push(t)
        }
        return ls
    }

    public static EllipsesAfter(str: string, l: number = 100) {
        if (str === undefined || str === null) {
            return undefined
        }
        if (typeof str !== "string") {
            console.error("Not a string:", str)
            return undefined
        }
        if (str.length <= l) {
            return str
        }
        return str.substr(0, l - 1) + "…"
    }

    /**
     * Adds a property to the given object, but the value will _only_ be calculated when it is actually requested.
     * This calculation will run once
     * @param object
     * @param name
     * @param init
     * @param whenDone: called when the value is updated. Note that this will be called at most once
     * @constructor
     */
    public static AddLazyProperty(
        object: any,
        name: string,
        init: () => any,
        whenDone?: () => void
    ) {
        Object.defineProperty(object, name, {
            enumerable: false,
            configurable: true,
            get: () => {
                delete object[name]
                try{
                    object[name] = init()
                    if (whenDone) {
                        whenDone()
                    }
                    return object[name]
                }catch (e) {
                    console.error("Error while calculating a lazy property", e)
                    return undefined
                }
            },
        })
    }

    /**
     * Adds a property to the given object, but the value will _only_ be calculated when it is actually requested
     */
    public static AddLazyPropertyAsync(
        object: any,
        name: string,
        init: () => Promise<any>,
        whenDone?: () => void
    ) {
        Object.defineProperty(object, name, {
            enumerable: false,
            configurable: true,
            get: () => {
                init().then((r) => {
                    delete object[name]
                    object[name] = r
                    if (whenDone) {
                        whenDone()
                    }
                })
            },
        })
    }

    public static FixedLength(str: string, l: number) {
        str = Utils.EllipsesAfter(str, l)
        while (str.length < l) {
            str = " " + str
        }
        return str
    }

    /**
     * Creates a new array with all elements from 'arr' in such a way that every element will be kept only once
     * Elements are returned in the same order as they appear in the lists
     * @param arr
     * @constructor
     */
    public static Dedup(arr: string[]): string[] {
        if (arr === undefined) {
            return undefined
        }
        const newArr = []
        for (const string of arr) {
            if (newArr.indexOf(string) < 0) {
                newArr.push(string)
            }
        }
        return newArr
    }

    /**
     * Finds all duplicates in a list of strings
     *
     * Utils.Duplicates(["a", "b", "c"]) // => []
     * Utils.Duplicates(["a", "b","c","b"] // => ["b"]
     * Utils.Duplicates(["a", "b","c","b","b"] // => ["b"]
     *
     */
    public static Duplicates(arr: string[]): string[] {
        if (arr === undefined) {
            return undefined
        }
        const seen = new Set<string>()
        const duplicates = new Set<string>()
        for (const string of arr) {
            if (seen.has(string)) {
                duplicates.add(string)
            }
            seen.add(string)
        }
        return Array.from(duplicates)
    }

    /**
     * In the given list, all values which are lists will be merged with the values, e.g.
     *
     * Utils.Flatten([ [1,2], 3, [4, [5 ,6]] ]) // => [1, 2, 3, 4, [5, 6]]
     */
    public static Flatten<T>(list: (T | T[])[]): T[] {
        const result = []
        for (const value of list) {
            if (Array.isArray(value)) {
                result.push(...value)
            } else {
                result.push(value)
            }
        }
        return result
    }

    /**
     * Utils.Identical([1,2], [1,2]) // => true
     * Utils.Identical([1,2,3], [1,2,4}]) // => false
     * Utils.Identical([1,2], [1,2,3]) // => false
     */
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
        return true
    }

    /**
     * Utils.MergeTags({k0:"v0","common":"0"},{k1:"v1", common: "1"}) // => {k0: "v0", k1:"v1", common: "1"}
     */
    public static MergeTags(a: any, b: any) {
        const t = {}
        for (const k in a) {
            t[k] = a[k]
        }
        for (const k in b) {
            t[k] = b[k]
        }
        return t
    }

    public static SplitFirst(a: string, sep: string): string[] {
        const index = a.indexOf(sep)
        if (index < 0) {
            return [a]
        }
        return [a.substr(0, index), a.substr(index + sep.length)]
    }

    /**
     * Given a piece of text, will replace any key occuring in 'tags' by the corresponding value
     *
     * Utils.SubstituteKeys("abc{def}ghi", {def: 'XYZ'}) // => "abcXYZghi"
     * Utils.SubstituteKeys("abc{def}{def}ghi", {def: 'XYZ'}) // => "abcXYZXYZghi"
     * Utils.SubstituteKeys("abc{def}ghi", {def: '{XYZ}'}) // => "abc{XYZ}ghi"
     * Utils.SubstituteKeys("abc\n\n{def}ghi", {def: '{XYZ}'}) // => "abc\n\n{XYZ}ghi"
     *
     * @param txt
     * @param tags
     * @param useLang
     * @constructor
     */
    public static SubstituteKeys(
        txt: string | undefined,
        tags: Record<string, any> | undefined,
        useLang?: string
    ): string | undefined {
        if (txt === undefined) {
            return undefined
        }
        const regex = /(.*?){([^}]*)}(.*)/s

        let match = txt.match(regex)

        if (!match) {
            return txt
        }
        let result = ""
        while (match) {
            const [_, normal, key, leftover] = match
            let v = tags?.[key]
            if (v !== undefined && v !== null) {
                if (v["toISOString"] != undefined) {
                    // This is a date, probably the timestamp of the object
                    // @ts-ignore
                    const date: Date = el
                    v = date.toISOString()
                }

                if (useLang !== undefined && v?.translations !== undefined) {
                    v =
                        v.translations[useLang] ??
                        v.translations["*"] ??
                        (v.textFor !== undefined ? v.textFor(useLang) : v)
                }

                if (v.InnerConstructElement !== undefined) {
                    console.warn(
                        "SubstituteKeys received a BaseUIElement to substitute in - this is probably a bug and will be downcast to a string\nThe key is",
                        key,
                        "\nThe value is",
                        v
                    )
                    v = v.InnerConstructElement()?.textContent
                }

                if (typeof v !== "string") {
                    v = "" + v
                }
                v = v.replace(/\n/g, "<br/>")
            } else {
                // v === undefined
                v = ""
            }

            result += normal + v
            match = leftover.match(regex)
            if (!match) {
                result += leftover
            }
        }
        return result
    }

    public static LoadCustomCss(location: string) {
        const head = document.getElementsByTagName("head")[0]
        const link = document.createElement("link")
        link.id = "customCss"
        link.rel = "stylesheet"
        link.type = "text/css"
        link.href = location
        link.media = "all"
        head.appendChild(link)
        console.log("Added custom css file ", location)
    }

    public static PushList<T>(target: T[], source?: T[]) {
        if (source === undefined) {
            return
        }
        target.push(...source)
    }

    /**
     * Copies all key-value pairs of the source into the target. This will change the target
     * If the key starts with a '+', the values of the list will be appended to the target instead of overwritten
     * If the key starts with `=`, the property will be overwritten.
     *
     * 'Source' will not be modified, but 'Target' will be
     *
     * const obj = {someValue: 42};
     * const override = {someValue: null};
     * Utils.Merge(override, obj);
     * obj.someValue // => null
     *
     * const obj = {someValue: 42};
     * const override = {someValue: null};
     * const returned = Utils.Merge(override, obj);
     * returned == obj // => true
     *
     *  const source = {
     *                abc: "def",
     *                foo: "bar",
     *                list0: ["overwritten"],
     *                "list1+": ["appended"]
     *            }
     * const target = {
     *                "xyz": "omega",
     *                "list0": ["should-be-gone"],
     *                "list1": ["should-be-kept"],
     *                "list2": ["should-be-untouched"]
     *            }
     * const result = Utils.Merge(source, target)
     * result.abc // => "def"
     * result.foo // => "bar"
     * result.xyz // => "omega"
     * result.list0.length // =>  1
     * result.list0[0] // =>  "overwritten"
     * result.list1.length // =>  2
     * result.list1[0] // =>  "should-be-kept"
     * result.list1[1] // =>  "appended"
     * result.list2.length // =>  1
     * result.list2[0] // => "should-be-untouched"
     *
     * const source = {"condition":{"+and":["xyz"]}}
     * const target = {"id":"test"}
     * const result = Utils.Merge(source, target)
     * result // =>  {"id":"test","condition":{"and":["xyz"]}}
     *
     * const source = {"=name": {"en": "XYZ"}}
     * const target = {"name":null, "x":"y"}
     * const result = Utils.Merge(source, target)
     * result // => {"name": {"en": "XYZ"}, "x": "y"}
     */
    static Merge<T, S>(source: Readonly<S>, target: T): T & S {
        if (target === null) {
            return <T & S>Utils.CleanMergeObject(source)
        }

        for (const key in source) {
            if (key.startsWith("=")) {
                const trimmedKey = key.substr(1)
                target[trimmedKey] = source[key]
                continue
            }

            if (key.startsWith("+") || key.endsWith("+")) {
                const trimmedKey = key.replace("+", "")
                const sourceV = source[key]
                const targetV = target[trimmedKey] ?? []

                let newList: any[]
                if (key.startsWith("+")) {
                    if (!Array.isArray(targetV)) {
                        throw new Error(
                            "Cannot concatenate: value to add is not an array: " +
                                JSON.stringify(targetV)
                        )
                    }
                    if (Array.isArray(sourceV)) {
                        newList = sourceV.concat(targetV) ?? targetV
                    } else {
                        throw new Error(
                            "Could not merge concatenate " +
                                JSON.stringify(sourceV) +
                                " and " +
                                JSON.stringify(targetV)
                        )
                    }
                } else {
                    newList = targetV.concat(sourceV ?? [])
                }

                target[trimmedKey] = newList
                continue
            }

            const sourceV = source[key]
            // @ts-ignore
            const targetV = target[key]
            if (typeof sourceV === "object") {
                if (sourceV === null) {
                    // @ts-ignore
                    target[key] = null
                } else if (targetV === undefined) {
                    // @ts-ignore
                    target[key] = Utils.CleanMergeObject(sourceV)
                } else {
                    Utils.Merge(sourceV, targetV)
                }
            } else {
                // @ts-ignore
                target[key] = Utils.CleanMergeObject(sourceV)
            }
        }
        // @ts-ignore
        return target
    }

    /**
     * Walks the specified path into the object till the end.
     *
     * If a list is encountered, this is transparently walked recursively on every object.
     * If 'null' or 'undefined' is encountered, this method stops
     *
     * The leaf objects are replaced in the object itself by the specified function.
     */
    public static WalkPath(
        path: string[],
        object: any,
        replaceLeaf: (leaf: any, travelledPath: string[]) => any,
        travelledPath: string[] = []
    ): void {
        if (object == null) {
            return
        }

        const head = path[0]
        if (path.length === 1) {
            // We have reached the leaf
            const leaf = object[head]
            if (leaf !== undefined) {
                if (Array.isArray(leaf)) {
                    object[head] = leaf.map((o) => replaceLeaf(o, travelledPath))
                } else {
                    object[head] = replaceLeaf(leaf, travelledPath)
                    if (object[head] === undefined) {
                        delete object[head]
                    }
                }
            }
            return
        }
        const sub = object[head]
        if (sub === undefined) {
            return
        }
        if (typeof sub !== "object") {
            return
        }
        if (Array.isArray(sub)) {
            sub.forEach((el, i) =>
                Utils.WalkPath(path.slice(1), el, replaceLeaf, [...travelledPath, head, "" + i])
            )
            return
        }
        Utils.WalkPath(path.slice(1), sub, replaceLeaf, [...travelledPath, head])
    }

    /**
     * Walks the specified path into the object till the end.
     * If a list is encountered, this is tranparently walked recursively on every object.
     *
     * The leaf objects are collected in the list
     */
    public static CollectPath(
        path: string[],
        object: any,
        collectedList: { leaf: any; path: string[] }[] = [],
        travelledPath: string[] = []
    ): { leaf: any; path: string[] }[] {
        if (object === undefined || object === null) {
            return collectedList
        }
        const head = path[0]
        travelledPath = [...travelledPath, head]
        if (path.length === 1) {
            // We have reached the leaf
            const leaf = object[head]
            if (leaf === undefined || leaf === null) {
                return collectedList
            }
            if (Array.isArray(leaf)) {
                for (let i = 0; i < (<any[]>leaf).length; i++) {
                    const l = (<any[]>leaf)[i]
                    collectedList.push({ leaf: l, path: [...travelledPath, "" + i] })
                }
            } else {
                collectedList.push({ leaf, path: travelledPath })
            }
            return collectedList
        }
        const sub = object[head]
        if (sub === undefined || sub === null) {
            return collectedList
        }

        if (Array.isArray(sub)) {
            sub.forEach((el, i) =>
                Utils.CollectPath(path.slice(1), el, collectedList, [...travelledPath, "" + i])
            )
            return collectedList
        }
        if (typeof sub !== "object") {
            return collectedList
        }
        return Utils.CollectPath(path.slice(1), sub, collectedList, travelledPath)
    }

    /**
     * Apply a function on every leaf of the JSON; used to rewrite parts of the JSON.
     * Returns a modified copy of the original object.
     *
     * 'null' and 'undefined' are _always_ considered a leaf, even if 'isLeaf' says it isn't
     *
     * Hangs if the object contains a loop
     *
     * // should walk a json
     * const walked = Utils.WalkJson({
     *     key: "value"
     * }, (x: string) => x + "!")
     * walked // => {key: "value!"}
     *
     * // should preserve undefined and null:
     * const walked = Utils.WalkJson({
     *   u: undefined,
     *   n: null,
     *   v: "value"
     * }, (x) => {if(x !== undefined && x !== null){return x+"!}; return x})
     * walked // => {v: "value!", u: undefined, n: null}
     *
     * // should preserve undefined and null, also with a negative isLeaf:
     * const walked = Utils.WalkJson({
     *   u: undefined,
     *   n: null,
     *   v: "value"
     * }, (x) => return x}, _ => false)
     * walked // => {v: "value", u: undefined, n: null}
     */
    static WalkJson(
        json: any,
        f: (v: object | number | string | boolean | undefined, path: string[]) => any,
        isLeaf: (object) => boolean = undefined,
        path: string[] = []
    ) {
        if (json === undefined || json === null) {
            return f(json, path)
        }
        const jtp = typeof json
        if (isLeaf !== undefined) {
            if (jtp === "object") {
                if (isLeaf(json)) {
                    return f(json, path)
                }
            } else {
                return json
            }
        } else if (jtp === "boolean" || jtp === "string" || jtp === "number") {
            return f(json, path)
        }
        if (Array.isArray(json)) {
            return json.map((sub, i) => {
                return Utils.WalkJson(sub, f, isLeaf, [...path, "" + i])
            })
        }

        const cp = { ...json }
        for (const key in json) {
            cp[key] = Utils.WalkJson(json[key], f, isLeaf, [...path, key])
        }
        return cp
    }

    /**
     * Walks an object recursively, will execute the 'collect'-callback on every leaf.
     *
     * Will hang on objects with loops
     */
    static WalkObject(
        json: any,
        collect: (v: number | string | boolean | undefined, path: string[]) => any,
        isLeaf: (object) => boolean = undefined,
        path = []
    ): void {
        if (json === undefined) {
            return
        }
        const jtp = typeof json
        if (isLeaf !== undefined) {
            if (jtp !== "object") {
                return
            }

            if (isLeaf(json)) {
                return collect(json, path)
            }
        } else if (jtp === "boolean" || jtp === "string" || jtp === "number") {
            collect(json, path)
            return
        }
        if (Array.isArray(json)) {
            json.map((sub, i) => {
                return Utils.WalkObject(sub, collect, isLeaf, [...path, i])
            })
            return
        }

        for (const key in json) {
            Utils.WalkObject(json[key], collect, isLeaf, [...path, key])
        }
    }

    static getOrSetDefault<K, V>(dict: Map<K, V>, k: K, v: () => V) {
        const found = dict.get(k)
        if (found !== undefined) {
            return found
        }
        dict.set(k, v())
        return dict.get(k)
    }

    public static UnMinify(minified: string): string {
        if (minified === undefined || minified === null) {
            return undefined
        }

        const parts = minified.split("|")
        let result = parts.shift()
        const keys = Utils.knownKeys.concat(Utils.extraKeys)

        for (const part of parts) {
            if (part == "") {
                // Empty string => this was a || originally
                result += "|"
                continue
            }
            const i = part.charCodeAt(0)
            result += '"' + keys[i] + '":' + part.substring(1)
        }

        return result
    }

    public static injectJsonDownloadForTests(url: string, data) {
        Utils.injectedDownloads[url] = data
    }

    public static async download(
        url: string,
        headers?: Record<string, string>
    ): Promise<string | undefined> {
        const result = await Utils.downloadAdvanced(url, headers)
        if (result["error"] !== undefined) {
            throw result["error"]
        }
        return result["content"]
    }

    /**
     * Download function which also indicates advanced options, such as redirects
     */
    public static downloadAdvanced(
        url: string,
        headers?: Record<string, string>,
        method: "POST" | "GET" | "PUT" | "UPDATE" | "DELETE" | "OPTIONS" = "GET",
        content?: string
    ): Promise<
        | { content: string }
        | { redirect: string }
        | { error: string; url: string; statuscode?: number }
    > {
        if (this.externalDownloadFunction !== undefined) {
            return this.externalDownloadFunction(url, headers)
        }

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.onload = () => {
                if (xhr.status == 200) {
                    resolve({ content: xhr.response })
                } else if (xhr.status === 302) {
                    resolve({ redirect: xhr.getResponseHeader("location") })
                } else if (xhr.status === 509 || xhr.status === 429) {
                    resolve({ error: "rate limited", url, statuscode: xhr.status })
                } else {
                    resolve({
                        error: "other error: " + xhr.statusText + ", " + xhr.responseText,
                        url,
                        statuscode: xhr.status,
                    })
                }
            }
            xhr.open(method, url)
            if (headers !== undefined) {
                for (const key in headers) {
                    xhr.setRequestHeader(key, headers[key])
                }
            }
            xhr.send(content)
            xhr.onerror = reject
        })
    }

    public static upload(
        url: string,
        data: string | Blob,
        headers?: Record<string, string>
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.onload = () => {
                if (xhr.status == 200) {
                    resolve(xhr.response)
                } else if (xhr.status === 509 || xhr.status === 429) {
                    reject("rate limited")
                } else {
                    reject(xhr.statusText)
                }
            }
            xhr.open("POST", url)
            if (headers !== undefined) {
                for (const key in headers) {
                    xhr.setRequestHeader(key, headers[key])
                }
            }

            xhr.send(data)
            xhr.onerror = reject
        })
    }

    public static async downloadJsonCached<T = object | []>(
        url: string,
        maxCacheTimeMs: number,
        headers?: Record<string, string>
    ): Promise<T> {
        const result = await Utils.downloadJsonCachedAdvanced(url, maxCacheTimeMs, headers)
        if (result["content"]) {
            return result["content"]
        }
        throw result["error"]
    }

    public static async downloadJsonCachedAdvanced<T = object | []>(
        url: string,
        maxCacheTimeMs: number,
        headers?: Record<string, string>
    ): Promise<{ content: T } | { error: string; url: string; statuscode?: number }> {
        const cached = Utils._download_cache.get(url)
        if (cached !== undefined) {
            if (new Date().getTime() - cached.timestamp <= maxCacheTimeMs) {
                return cached.promise
            }
        }
        const promise =
            /*NO AWAIT as we work with the promise directly */ Utils.downloadJsonAdvanced(
                url,
                headers
            )
        Utils._download_cache.set(url, { promise, timestamp: new Date().getTime() })
        return await promise
    }
    public static async downloadJson<T = object | []>(
        url: string,
        headers?: Record<string, string>
    ): Promise<T>
    public static async downloadJson<T>(
        url: string,
        headers?: Record<string, string>
    ): Promise<T>
    public static async downloadJson(
        url: string,
        headers?: Record<string, string>
    ): Promise<object | []> {
        const result = await Utils.downloadJsonAdvanced(url, headers)
        if (result["content"]) {
            return result["content"]
        }
        throw result["error"]
    }

    public static awaitAnimationFrame(): Promise<void> {
        return new Promise<void>((resolve) => {
            window.requestAnimationFrame(() => {
                resolve()
            })
        })
    }

    public static async downloadJsonAdvanced(
        url: string,
        headers?: Record<string, string>
    ): Promise<
        { content: object | object[] } | { error: string; url: string; statuscode?: number }
    > {
        const injected = Utils.injectedDownloads[url]
        if (injected !== undefined) {
            console.log("Using injected resource for test for URL", url)
            return new Promise((resolve) => resolve({ content: injected }))
        }
        const result = await Utils.downloadAdvanced(
            url,
            Utils.Merge({ accept: "application/json" }, headers ?? {})
        )
        if (result["error"] !== undefined) {
            return <{ error: string; url: string; statuscode?: number }>result
        }
        const data = result["content"]
        try {
            if (typeof data === "string") {
                if (data === "") {
                    return { content: {} }
                }
                return { content: JSON.parse(data) }
            }
            return { content: data }
        } catch (e) {
            console.error(
                "Could not parse the response of",
                url,
                "which contains",
                data,
                "due to",
                e,
                "\n",
                e.stack
            )
            return { error: "malformed", url }
        }
    }

    /**
     * Triggers a 'download file' popup which will download the contents
     */
    public static offerContentsAsDownloadableFile(
        contents: string | Blob,
        fileName: string = "download.txt",
        options?: {
            mimetype:
                | string
                | "text/plain"
                | "text/csv"
                | "application/vnd.geo+json"
                | "{gpx=application/gpx+xml}"
                | "application/json"
                | "image/png"
        }
    ) {
        const element = document.createElement("a")
        let file
        if (typeof contents === "string") {
            file = new Blob([contents], { type: options?.mimetype ?? "text/plain" })
        } else {
            file = contents
        }
        element.href = URL.createObjectURL(file)
        element.download = fileName
        document.body.appendChild(element) // Required for this to work in FireFox
        element.click()
    }

    public static async waitFor(timeMillis: number): Promise<void> {
        return new Promise((resolve) => {
            window.setTimeout(resolve, timeMillis)
        })
    }

    public static toHumanTime(seconds): string {
        seconds = Math.floor(seconds)
        let minutes = Math.floor(seconds / 60)
        seconds = seconds % 60
        let hours = Math.floor(minutes / 60)
        minutes = minutes % 60
        const days = Math.floor(hours / 24)
        hours = hours % 24
        if (days > 0) {
            return days + "days" + " " + hours + "h"
        }
        return hours + ":" + Utils.TwoDigits(minutes) + ":" + Utils.TwoDigits(seconds)
    }

    public static HomepageLink(): string {
        if (typeof window === "undefined") {
            return "https://mapcomplete.org"
        }
        const path = (
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname
        ).split("/")
        path.pop()
        path.push("index.html")
        return path.join("/")
    }

    public static OsmChaLinkFor(daysInThePast, theme = undefined): string {
        const now = new Date()
        const lastWeek = new Date(now.getTime() - daysInThePast * 24 * 60 * 60 * 1000)
        const date =
            lastWeek.getFullYear() +
            "-" +
            Utils.TwoDigits(lastWeek.getMonth() + 1) +
            "-" +
            Utils.TwoDigits(lastWeek.getDate())
        let osmcha_link = `"date__gte":[{"label":"${date}","value":"${date}"}],"editor":[{"label":"mapcomplete","value":"mapcomplete"}]`
        if (theme !== undefined) {
            osmcha_link =
                osmcha_link + "," + `"comment":[{"label":"#${theme}","value":"#${theme}"}]`
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
            return undefined
        }
        return JSON.parse(JSON.stringify(x))
    }

    public static ParseDate(str: string): Date {
        if (str.endsWith(" UTC")) {
            str = str.replace(" UTC", "+00")
        }
        return new Date(str)
    }

    public static selectTextIn(node) {
        if (document.body["createTextRange"]) {
            const range = document.body["createTextRange"]()
            range.moveToElementText(node)
            range.select()
        } else if (window.getSelection) {
            const selection = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(node)
            selection.removeAllRanges()
            selection.addRange(range)
        } else {
            console.warn("Could not select text in node: Unsupported browser.")
        }
    }

    public static sortedByLevenshteinDistance<T>(
        reference: string,
        ts: T[],
        getName: (t: T) => string
    ): T[] {
        const withDistance: [T, number][] = ts.map((t) => [
            t,
            Utils.levenshteinDistance(getName(t), reference),
        ])
        withDistance.sort(([_, a], [__, b]) => a - b)
        return withDistance.map((n) => n[0])
    }

    public static levenshteinDistance(str1: string, str2: string) {
        const track = Array(str2.length + 1)
            .fill(null)
            .map(() => Array(str1.length + 1).fill(null))
        for (let i = 0; i <= str1.length; i += 1) {
            track[0][i] = i
        }
        for (let j = 0; j <= str2.length; j += 1) {
            track[j][0] = j
        }
        for (let j = 1; j <= str2.length; j += 1) {
            for (let i = 1; i <= str1.length; i += 1) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
                track[j][i] = Math.min(
                    track[j][i - 1] + 1, // deletion
                    track[j - 1][i] + 1, // insertion
                    track[j - 1][i - 1] + indicator // substitution
                )
            }
        }
        return track[str2.length][str1.length]
    }

    public static MapToObj<V, T>(
        d: Map<string, V>,
        onValue: (t: V, key: string) => T
    ): Record<string, T> {
        const o = {}
        const keys = Array.from(d.keys())
        keys.sort()
        for (const key of keys) {
            o[key] = onValue(d.get(key), key)
        }
        return o
    }

    /**
     * Switches keys and values around
     *
     * Utils.TransposeMap({"a" : ["b", "c"], "x" : ["b", "y"]}) // => {"b" : ["a", "x"], "c" : ["a"], "y" : ["x"]}
     */
    public static TransposeMap<K extends string, V extends string>(
        d: Record<K, V[]>
    ): Record<V, K[]> {
        const newD: Record<V, K[]> = <any> {}

        for (const k in d) {
            const vs = d[k]
            for (const v of vs) {
                const list = newD[v]
                if (list === undefined) {
                    newD[v] = [k] // Left: indexing; right: list with one element
                } else {
                    list.push(k)
                }
            }
        }
        return newD
    }

    /**
     * Utils.colorAsHex({r: 255, g: 128, b: 0}) // => "#ff8000"
     * Utils.colorAsHex(undefined) // => undefined
     */
    public static colorAsHex(c: { r: number; g: number; b: number }) {
        if (c === undefined) {
            return undefined
        }

        function componentToHex(n) {
            const hex = n.toString(16)
            return hex.length == 1 ? "0" + hex : hex
        }

        return "#" + componentToHex(c.r) + componentToHex(c.g) + componentToHex(c.b)
    }

    /**
     *
     * Utils.color("#ff8000") // => {r: 255, g:128, b: 0}
     * Utils.color(" rgba  (12,34,56) ") // => {r: 12, g:34, b: 56}
     * Utils.color(" rgba  (12,34,56,0.5) ") // => {r: 12, g:34, b: 56}
     * Utils.color(undefined) // => undefined
     */
    public static color(hex: string): { r: number; g: number; b: number } {
        if (hex === undefined) {
            return undefined
        }
        hex = hex.replace(/[ \t]/g, "")
        if (hex.startsWith("rgba(")) {
            const match = hex.match(/rgba\(([0-9.]+),([0-9.]+),([0-9.]+)(,[0-9.]*)?\)/)
            if (match == undefined) {
                return undefined
            }
            return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) }
        }

        if (!hex.startsWith("#")) {
            return undefined
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

    public static asDict(
        tags: { key: string; value: string | number }[]
    ): Map<string, string | number> {
        const d = new Map<string, string | number>()

        for (const tag of tags) {
            d.set(tag.key, tag.value)
        }

        return d
    }

    static toIdRecord<T extends { id: string }>(ts: T[]): Record<string, T> {
        const result: Record<string, T> = {}
        for (const t of ts) {
            result[t.id] = t
        }
        return result
    }

    public static SetMidnight(d: Date): void {
        d.setUTCHours(0)
        d.setUTCSeconds(0)
        d.setUTCMilliseconds(0)
        d.setUTCMinutes(0)
    }

    public static scrollIntoView(element: HTMLBaseElement | HTMLDivElement): void {
        if (!element) {
            return
        }
        // Is the element completely in the view?
        const parentRect = Utils.findParentWithScrolling(element)?.getBoundingClientRect()
        if (!parentRect) {
            return
        }
        const elementRect = element.getBoundingClientRect()

        // Check if the element is within the vertical bounds of the parent element
        const topIsVisible = elementRect.top >= parentRect.top
        const bottomIsVisible = elementRect.bottom <= parentRect.bottom
        const inView = topIsVisible && bottomIsVisible
        if (inView) {
            return
        }
        element.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }

    /**
     * Returns true if the contents of `a` are the same (and in the same order) as `b`.
     * Might have false negatives in some cases
     * @param a
     * @param b
     */
    public static sameList<T>(a: ReadonlyArray<T>, b: ReadonlyArray<T>) {
        if (a == b) {
            return true
        }
        if (a === undefined || a === null || b === undefined || b === null) {
            return false
        }
        if (a.length !== b.length) {
            return false
        }
        for (let i = 0; i < a.length; i++) {
            const ai = a[i]
            const bi = b[i]
            if (ai == bi) {
                continue
            }
            if (ai === bi) {
                continue
            }
            return false
        }
        return true
    }

    public static SameObject(a: any, b: any) {
        if (a === b) {
            return true
        }
        if (a === undefined || a === null || b === null || b === undefined) {
            return false
        }
        if (typeof a === "object" && typeof b === "object") {
            for (const aKey in a) {
                if (!(aKey in b)) {
                    return false
                }
            }

            for (const bKey in b) {
                if (!(bKey in a)) {
                    return false
                }
            }
            for (const k in a) {
                if (!Utils.SameObject(a[k], b[k])) {
                    return false
                }
            }
            return true
        }
        return false
    }

    /**
     *
     * Utils.splitIntoSubstitutionParts("abc") // => [{message: "abc"}]
     * Utils.splitIntoSubstitutionParts("abc {search} def") // => [{message: "abc "}, {subs: "search"}, {message: " def"}]
     *
     */
    public static splitIntoSubstitutionParts(
        template: string
    ): ({ message: string } | { subs: string })[] {
        const preparts = template.split("{")
        const spec: ({ message: string } | { subs: string })[] = []
        for (const prepart of preparts) {
            const postParts = prepart.split("}")
            if (postParts.length === 1) {
                // This was a normal part
                spec.push({ message: postParts[0] })
            } else {
                const [subs, message] = postParts
                spec.push({ subs })
                if (message !== "") {
                    spec.push({ message })
                }
            }
        }
        return spec
    }

    /**
     * Returns the file and line number of the code calling this
     */
    public static getLocationInCode(offset: number = 0): {
        path: string
        line: number
        column: number
        markdownLocation: string
        filename: string
        functionName: string
    } {
        const error = new Error("No error")
        const stack = error.stack.split("\n")
        stack.shift() // Remove "Error: No error"
        const regex = /at (.*) \(([a-zA-Z0-9/.]+):([0-9]+):([0-9]+)\)/
        const stackItem = stack[Math.abs(offset) + 1]

        let functionName: string
        let path: string
        let line: string
        let column: string
        let _: string
        const matchWithFuncName = stackItem.match(regex)
        if (matchWithFuncName) {
            ;[_, functionName, path, line, column] = matchWithFuncName
        } else {
            const regexNoFuncName: RegExp = new RegExp("at ([a-zA-Z0-9/.]+):([0-9]+):([0-9]+)")
            ;[_, path, line, column] = stackItem.match(regexNoFuncName)
        }

        const markdownLocation = path.substring(path.indexOf("MapComplete/src") + 11) + "#L" + line
        return {
            path,
            functionName,
            line: Number(line),
            column: Number(column),
            markdownLocation,
            filename: path.substring(path.lastIndexOf("/") + 1),
        }
    }

    public static RemoveDiacritics(str?: string): string {
        if (!str) {
            return str
        }
        return str.normalize("NFD").replace(/\p{Diacritic}/gu, "")
    }

    public static randomString(length: number): string {
        let result = ""
        for (let i = 0; i < length; i++) {
            const chr = Math.random().toString(36).substr(2, 3)
            result += chr
        }
        return result
    }

    /**
     * Recursively rewrites all keys from `+key`, `key+` and `=key` into `key
     *
     * Utils.CleanMergeObject({"condition":{"and+":["xyz"]}} // => {"condition":{"and":["xyz"]}}
     * @param obj
     * @constructor
     * @private
     */
    private static CleanMergeObject(obj: any) {
        if (Array.isArray(obj)) {
            const result = []
            for (const el of obj) {
                result.push(Utils.CleanMergeObject(el))
            }
            return result
        }
        if (typeof obj !== "object") {
            return obj
        }
        const newObj = {}
        for (let objKey in obj) {
            let cleanKey = objKey
            if (objKey.startsWith("+") || objKey.startsWith("=")) {
                cleanKey = objKey.substring(1)
            } else if (objKey.endsWith("+") || objKey.endsWith("=")) {
                cleanKey = objKey.substring(0, objKey.length - 1)
            }
            newObj[cleanKey] = Utils.CleanMergeObject(obj[objKey])
        }
        return newObj
    }

    public static focusOn(el: HTMLElement): void {
        if (!el) {
            return
        }
        requestAnimationFrame(() => {
            el.focus()
        })
    }

    /**
     * Searches a child that can be focused on, by first selecting a 'focusable', then a button, then a link
     *
     * Returns the focussed element
     * @param el
     */
    public static focusOnFocusableChild(el: HTMLElement): void {
        if (!el) {
            return
        }
        requestAnimationFrame(() => {
            let childs = el.getElementsByClassName("focusable")
            if (childs.length == 0) {
                childs = el.getElementsByTagName("button")
                if (childs.length === 0) {
                    childs = el.getElementsByTagName("a")
                }
            }
            const child = <HTMLElement>childs.item(0)
            if (child === null) {
                return undefined
            }
            if (
                child.tagName !== "button" &&
                child.tagName !== "a" &&
                child.hasAttribute("tabindex")
            ) {
                child.setAttribute("tabindex", "-1")
            }
            child?.focus()
        })
    }

    private static findParentWithScrolling(
        element: HTMLBaseElement | HTMLDivElement
    ): HTMLBaseElement | HTMLDivElement {
        // Check if the element itself has scrolling
        if (element.scrollHeight > element.clientHeight) {
            return element
        }

        // If the element does not have scrolling, check if it has a parent element
        if (!element.parentElement) {
            return null
        }

        // If the element has a parent, repeat the process for the parent element
        return Utils.findParentWithScrolling(<HTMLBaseElement>element.parentElement)
    }

    private static colorDiff(
        c0: { r: number; g: number; b: number },
        c1: { r: number; g: number; b: number }
    ) {
        return Math.abs(c0.r - c1.r) + Math.abs(c0.g - c1.g) + Math.abs(c0.b - c1.b)
    }

    private static readonly _metrixPrefixes = ["", "k", "M", "G", "T", "P", "E"]
    /**
     * Converts a big number (e.g. 1000000) into a rounded postfixed verion (e.g. 1M)
     *
     * Supported metric prefixes are: [k, M, G, T, P, E]
     */
    public static numberWithMetrixPrefix(n: number) {
        let index = 0
        while (n > 1000) {
            n = Math.round(n / 1000)
            index++
        }
        return n + Utils._metrixPrefixes[index]
    }

    static NoNullInplace(layers: any[]):void {
        for (let i = layers.length - 1; i >= 0; i--) {
            if(layers[i] === null || layers[i] === undefined){
                layers.splice(i, 1)
            }
        }
    }
}
