/**
 * Wraps the query parameters into UIEventSources
 */
import { UIEventSource } from "../UIEventSource"
import Hash from "./Hash"
import { Utils } from "../../Utils"

export class QueryParameters {
    static defaults: Record<string, string> = {}
    static documentation: Map<string, string> = new Map<string, string>()
    private static order: string[] = ["layout", "test", "z", "lat", "lon"]
    protected static readonly _wasInitialized: Set<string> = new Set()
    protected static readonly knownSources: Record<string, UIEventSource<string>> = {}
    private static initialized = false

    public static GetQueryParameter(
        key: string,
        deflt: string,
        documentation?: string
    ): UIEventSource<string> {
        if (!this.initialized) {
            this.init()
        }
        QueryParameters.documentation.set(key, documentation)
        if (deflt !== undefined) {
            QueryParameters.defaults[key] = deflt
        }
        if (QueryParameters.knownSources[key] !== undefined) {
            return QueryParameters.knownSources[key]
        }
        QueryParameters.addOrder(key)
        const source = new UIEventSource<string>(deflt, "&" + key)
        QueryParameters.knownSources[key] = source
        source.addCallback(() => QueryParameters.Serialize())
        return source
    }

    public static GetBooleanQueryParameter(
        key: string,
        deflt: boolean,
        documentation?: string
    ): UIEventSource<boolean> {
        return UIEventSource.asBoolean(
            QueryParameters.GetQueryParameter(key, "" + deflt, documentation)
        )
    }

    public static wasInitialized(key: string): boolean {
        return QueryParameters._wasInitialized.has(key)
    }

    private static addOrder(key) {
        if (this.order.indexOf(key) < 0) {
            this.order.push(key)
        }
    }

    private static init() {
        if (this.initialized) {
            return
        }
        this.initialized = true

        if (Utils.runningFromConsole) {
            return
        }

        if (window?.location?.search) {
            const params = window.location.search.substr(1).split("&")
            for (const param of params) {
                const kv = param.split("=")
                const key = decodeURIComponent(kv[0])
                QueryParameters.addOrder(key)
                QueryParameters._wasInitialized.add(key)
                const v = decodeURIComponent(kv[1])
                const source = new UIEventSource<string>(v)
                source.addCallback(() => QueryParameters.Serialize())
                QueryParameters.knownSources[key] = source
            }
        }
    }

    private static Serialize() {
        const parts = []
        for (const key of QueryParameters.order) {
            if (QueryParameters.knownSources[key]?.data === undefined) {
                continue
            }

            if (QueryParameters.knownSources[key].data === "undefined") {
                continue
            }

            if (QueryParameters.knownSources[key].data === QueryParameters.defaults[key]) {
                continue
            }

            parts.push(
                encodeURIComponent(key) +
                    "=" +
                    encodeURIComponent(QueryParameters.knownSources[key].data)
            )
        }
        if (!Utils.runningFromConsole) {
            // Don't pollute the history every time a parameter changes
            try {
                history.replaceState(null, "", "?" + parts.join("&") + Hash.Current())
            } catch (e) {
                console.error(e)
            }
        }
    }

    static ClearAll() {
        for (const name in QueryParameters.knownSources) {
            QueryParameters.knownSources[name].setData(undefined)
        }
        QueryParameters._wasInitialized.clear()
        QueryParameters.order = []
    }
}
