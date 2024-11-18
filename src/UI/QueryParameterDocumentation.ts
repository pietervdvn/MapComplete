import BaseUIElement from "./BaseUIElement"
import Combine from "./Base/Combine"
import Title from "./Base/Title"
import List from "./Base/List"
import Translations from "./i18n/Translations"
import { QueryParameters } from "../Logic/Web/QueryParameters"
import FeatureSwitchState from "../Logic/State/FeatureSwitchState"
import ThemeConfig from "../Models/ThemeConfig/ThemeConfig"
import ThemeViewStateHashActor from "../Logic/Web/ThemeViewStateHashActor"
import MarkdownUtils from "../Utils/MarkdownUtils"

export default class QueryParameterDocumentation {
    private static QueryParamDocsIntro: string[] = [
        "# URL-parameters and URL-hash",
        "This document gives an overview of which URL-parameters can be used to influence MapComplete.",
        "## What is a URL parameter?",
        '"URL-parameters are extra parts of the URL used to set the state.',
        "For example, if the url is `https://mapcomplete.org/cyclofix?lat=51.0&lon=4.3&z=5&test=true#node/1234`, " +
            "the URL-parameters are stated in the part between the `?` and the `#`. There are multiple, all separated by `&`, namely: ",
        MarkdownUtils.list([
            "The url-parameter `lat` is `51.0` in this instance",
            "The url-parameter `lon` is `4.3` in this instance",
            "The url-parameter `z` is `5` in this instance",
            "The url-parameter `test` is `true` in this instance",
        ]),
        "Finally, the URL-hash is the part after the `#`. It is `node/1234` in this case.",
    ]

    public static UrlParamDocs(): Map<string, string> {
        const dummyLayout = new ThemeConfig(<any>{
            id: "&gt;theme&lt;",
            title: { en: "<theme>" },
            description: "A theme to generate docs with",
            socialImage: "./assets/SocialImage.png",
            startLat: 0,
            startLon: 0,
            startZoom: 0,
            icon: undefined,
            layers: [
                {
                    name: "<layer>",
                    id: "&lt;layer&gt;",
                    source: {
                        osmTags: "id~*",
                    },
                    lineRendering: [
                        {
                            color: "#000000",
                            width: 5,
                        },
                    ],
                    pointRendering: null,
                },
            ],
        })
        new FeatureSwitchState(dummyLayout)

        QueryParameters.GetQueryParameter(
            "layer-&lt;layer-id&gt;",
            "true",
            "Whether the layer with id <layer-id> is shown"
        )
        return QueryParameters.documentation
    }

    public static GenerateQueryParameterDocs(): string {
        const docs: string[] = [
            ...QueryParameterDocumentation.QueryParamDocsIntro,
            ...ThemeViewStateHashActor.documentation,
        ]
        this.UrlParamDocs().forEach((value, key) => {
            const c = [
                "## " + key,
                value,
                QueryParameters.defaults[key] === undefined
                    ? "No default value set"
                    : `The default value is _${QueryParameters.defaults[key]}_`,
            ].join("\n\n")
            docs.push(c)
        })
        return docs.join("\n\n")
    }
}
