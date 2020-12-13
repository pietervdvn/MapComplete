/**
 * Wraps the query parameters into UIEventSources
 */
import {UIEventSource} from "../UIEventSource";
import Hash from "./Hash";

export class QueryParameters {

    private static order: string [] = ["layout", "test", "z", "lat", "lon"];
    private static knownSources = {};
    private static initialized = false;
    private static defaults = {}

    private static documentation = {}

    private static addOrder(key) {
        if (this.order.indexOf(key) < 0) {
            this.order.push(key)
        }
    }

    private static init() {

        if (this.initialized) {
            return;
        }
        this.initialized = true;
       
        if (window?.location?.search) {
            const params = window.location.search.substr(1).split("&");
            for (const param of params) {
                const kv = param.split("=");
                const key = decodeURIComponent(kv[0]);
                QueryParameters.addOrder(key)
                const v = decodeURIComponent(kv[1]);
                const source = new UIEventSource<string>(v);
                source.addCallback(() => QueryParameters.Serialize())
                QueryParameters.knownSources[key] = source;
            }
        }
    }

    private static Serialize() {
        const parts = []
        for (const key of QueryParameters.order) {
            if (QueryParameters.knownSources[key] === undefined || QueryParameters.knownSources[key].data === undefined) {
                continue;
            }
            
            if (QueryParameters.knownSources[key].data === undefined) {
                continue;
            }

            if (QueryParameters.knownSources[key].data === "undefined") {
                continue;
            }


            if (QueryParameters.knownSources[key].data == QueryParameters.defaults[key]) {
                continue;
            }

            parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(QueryParameters.knownSources[key].data))
        }
        history.replaceState(null, "", "?" + parts.join("&") + "#" + Hash.Get().data);

    }

    public static GetQueryParameter(key: string, deflt: string, documentation?: string): UIEventSource<string> {
        if(!this.initialized){
            this.init();
        }
        QueryParameters.documentation[key] = documentation;
        if (deflt !== undefined) {
            QueryParameters.defaults[key] = deflt;
        }
        if (QueryParameters.knownSources[key] !== undefined) {
            return QueryParameters.knownSources[key];
        }
        QueryParameters.addOrder(key);
        const source = new UIEventSource<string>(deflt);
        QueryParameters.knownSources[key] = source;
        source.addCallback(() => QueryParameters.Serialize())
        return source;
    }

    public static GenerateQueryParameterDocs(): string {
        const docs = [];
        for (const key in QueryParameters.documentation) {
            docs.push("**" + key + "**: " + QueryParameters.documentation[key] + " (default value: _" + QueryParameters.defaults[key] + "_)")
        }
        return docs.join("\n\n");
    }

}