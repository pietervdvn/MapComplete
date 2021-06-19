/**
 * Wraps the query parameters into UIEventSources
 */
import {UIEventSource} from "../UIEventSource";
import Hash from "./Hash";
import {Utils} from "../../Utils";
import Title from "../../UI/Base/Title";
import Combine from "../../UI/Base/Combine";

export class QueryParameters {

    private static order: string [] = ["layout", "test", "z", "lat", "lon"];
    private static knownSources = {};
    private static initialized = false;
    private static defaults = {}

    private static documentation = {}
    private static QueryParamDocsIntro = "\n" +
        "URL-parameters and URL-hash\n" +
        "============================\n" +
        "\n" +
        "This document gives an overview of which URL-parameters can be used to influence MapComplete.\n" +
        "\n" +
        "What is a URL parameter?\n" +
        "------------------------\n" +
        "\n" +
        "URL-parameters are extra parts of the URL used to set the state.\n" +
        "\n" +
        "For example, if the url is `https://mapcomplete.osm.be/cyclofix?lat=51.0&lon=4.3&z=5&test=true#node/1234`,\n" +
        "the URL-parameters are stated in the part between the `?` and the `#`. There are multiple, all seperated by `&`, namely:\n" +
        "\n" +
        "- The url-parameter `lat` is `51.0` in this instance\n" +
        "- The url-parameter `lon` is `4.3` in this instance\n" +
        "- The url-parameter `z` is `5` in this instance\n" +
        "- The url-parameter `test` is `true` in this instance\n" +
        "\n" +
        "Finally, the URL-hash is the part after the `#`. It is `node/1234` in this case."

    public static GetQueryParameter(key: string, deflt: string, documentation?: string): UIEventSource<string> {
        if (!this.initialized) {
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
        const source = new UIEventSource<string>(deflt, "&" + key);
        QueryParameters.knownSources[key] = source;
        source.addCallback(() => QueryParameters.Serialize())
        return source;
    }

    public static GenerateQueryParameterDocs(): string {
        const docs = [QueryParameters.QueryParamDocsIntro];
        for (const key in QueryParameters.documentation) {
            const c = new Combine([
                new Title(key, 2),
                QueryParameters.documentation[key],
                QueryParameters.defaults[key] === undefined ? "No default value set" : `The default value is _${QueryParameters.defaults[key]}_`

            ])
            docs.push(c.AsMarkdown())
        }
        return docs.join("\n\n");
    }

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

        if (Utils.runningFromConsole) {
            return;
        }

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

        window["mapcomplete_query_parameter_overview"] = () => {
            console.log(QueryParameters.GenerateQueryParameterDocs())
        }
    }

    private static Serialize() {
        const parts = []
        for (const key of QueryParameters.order) {
            if (QueryParameters.knownSources[key]?.data === undefined) {
                continue;
            }

            if (QueryParameters.knownSources[key].data === "undefined") {
                continue;
            }

            if (QueryParameters.knownSources[key].data === QueryParameters.defaults[key]) {
                continue;
            }

            parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(QueryParameters.knownSources[key].data))
        }
        // Don't pollute the history every time a parameter changes

        history.replaceState(null, "", "?" + parts.join("&") + Hash.Current());

    }
}