import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import Maproulette from "../../Logic/Maproulette"
import SvelteUIElement from "../Base/SvelteUIElement"
import MaprouletteSetStatus from "../MapRoulette/MaprouletteSetStatus.svelte"
import TagApplyButton from "../Popup/TagApplyButton"
import { PointImportButtonViz } from "../Popup/ImportButtons/PointImportButtonViz"
import WayImportButtonViz from "../Popup/ImportButtons/WayImportButtonViz"
import ConflateImportButtonViz from "../Popup/ImportButtons/ConflateImportButtonViz"
import { PlantNetDetectionViz } from "../Popup/PlantNetDetectionViz"
import Constants from "../../Models/Constants"
import { Store, Stores, UIEventSource } from "../../Logic/UIEventSource"
import { Feature, GeoJsonProperties } from "geojson"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import BaseUIElement from "../BaseUIElement"
import LinkedDataLoader from "../../Logic/Web/LinkedDataLoader"
import Toggle from "../Input/Toggle"
import ComparisonTool from "../Comparison/ComparisonTool.svelte"
import { Utils } from "../../Utils"

export class DataImportSpecialVisualisations {
    public static initList(): (SpecialVisualization & { group })[] {
    return [
        new TagApplyButton(),
        new PointImportButtonViz(),
        new WayImportButtonViz(),
        new ConflateImportButtonViz(),
        new PlantNetDetectionViz(),
        {
        funcName: "maproulette_set_status",
            group: "data_import",
        docs: "Change the status of the given MapRoulette task",
        needsUrls: [Maproulette.defaultEndpoint],
        example:
          " The following example sets the status to '2' (false positive)\n" +
          "\n" +
          "```json\n" +
          "{\n" +
          "   \"id\": \"mark_duplicate\",\n" +
          "   \"render\": {\n" +
          "      \"special\": {\n" +
          "         \"type\": \"maproulette_set_status\",\n" +
          "         \"message\": {\n" +
          "            \"en\": \"Mark as not found or false positive\"\n" +
          "         },\n" +
          "         \"status\": \"2\",\n" +
          "         \"image\": \"close\"\n" +
          "      }\n" +
          "   }\n" +
          "}\n" +
          "```",
        args: [
          {
            name: "message",
            doc: "A message to show to the user"
          },
          {
            name: "image",
            doc: "Image to show",
            defaultValue: "confirm"
          },
          {
            name: "message_confirm",
            doc: "What to show when the task is closed, either by the user or was already closed."
          },
          {
            name: "status",
            doc: "A statuscode to apply when the button is clicked. 1 = `close`, 2 = `false_positive`, 3 = `skip`, 4 = `deleted`, 5 = `already fixed` (on the map, e.g. for duplicates), 6 = `too hard`",
            defaultValue: "1"
          },
          {
            name: "maproulette_id",
            doc: "The property name containing the maproulette id",
            defaultValue: "mr_taskId"
          },
          {
            name: "ask_feedback",
            doc: "If not an empty string, this will be used as question to ask some additional feedback. A text field will be added",
            defaultValue: ""
          }
        ],

        constr: (state, tagsSource, args) => {
          let [
            message,
            image,
            message_closed,
            statusToSet,
            maproulette_id_key,
            askFeedback
          ] = args
          if (image === "") {
            image = "confirm"
          }
          if (maproulette_id_key === "" || maproulette_id_key === undefined) {
            maproulette_id_key = "mr_taskId"
          }
          statusToSet = statusToSet ?? "1"
          return new SvelteUIElement(MaprouletteSetStatus, {
            state,
            tags: tagsSource,
            message,
            image,
            message_closed,
            statusToSet,
            maproulette_id_key,
            askFeedback
          })
        }
        },
        {
            funcName: "linked_data_from_website",
            group: "data_import",
            docs: "Attempts to load (via a proxy) the specified website and parsed ld+json from there. Suitable data will be offered to import into OSM. Note: this element is added by default",
            args: [
                {
                    name: "key",
                    defaultValue: "website",
                    doc: "Attempt to load ld+json from the specified URL. This can be in an embedded <script type='ld+json'>"
                },
                {
                    name: "useProxy",
                    defaultValue: "yes",
                    doc: "If 'yes', uses the provided proxy server. This proxy server will scrape HTML and search for a script with `lang='ld+json'`. If `no`, the data will be downloaded and expects a linked-data-json directly"
                },
                {
                    name: "host",
                    doc: "If not using a proxy, define what host the website is allowed to connect to"
                },
                {
                    name: "mode",
                    doc: "If `display`, only show the data in tabular and readonly form, ignoring already existing tags. This is used to explicitly show all the tags. If unset or anything else, allow to apply/import on OSM"
                },
                {
                    name: "collapsed",
                    defaultValue: "yes",
                    doc: "If the containing accordion should be closed"
                }
            ],
            needsUrls: [Constants.linkedDataProxy, "http://www.schema.org"],
            constr(
                state: SpecialVisualizationState,
                tags: UIEventSource<Record<string, string>>,
                argument: string[],
                feature: Feature,
                layer: LayerConfig
            ): BaseUIElement {
                const key = argument[0] ?? "website"
                const useProxy = argument[1] !== "no"
                const readonly = argument[3] === "readonly"
                const isClosed = (argument[4] ?? "yes") === "yes"

                const countryStore: Store<string | undefined> = tags.mapD(
                    (tags) => tags._country
                )
                const sourceUrl: Store<string | undefined> = tags.mapD((tags) => {
                    if (!tags[key] || tags[key] === "undefined") {
                        return null
                    }
                    return tags[key]
                })
                const externalData: Store<{ success: GeoJsonProperties } | { error }> =
                    sourceUrl.bindD(
                        (url) => {
                            const country = countryStore.data
                            if (url.startsWith("https://data.velopark.be/")) {
                                return Stores.FromPromiseWithErr(
                                    (async () => {
                                        try {
                                            const loadAll =
                                                layer.id.toLowerCase().indexOf("maproulette") >=
                                                0 // Dirty hack
                                            const features =
                                                await LinkedDataLoader.fetchVeloparkEntry(
                                                    url,
                                                    loadAll
                                                )
                                            const feature =
                                                features.find(
                                                    (f) => f.properties["ref:velopark"] === url
                                                ) ?? features[0]
                                            const properties = feature.properties
                                            properties["ref:velopark"] = url
                                            console.log(
                                                "Got properties from velopark:",
                                                properties
                                            )
                                            return properties
                                        } catch (e) {
                                            console.error(e)
                                            throw e
                                        }
                                    })()
                                )
                            }
                            if (country === undefined) {
                                return undefined
                            }
                            return Stores.FromPromiseWithErr(
                                (async () => {
                                    try {
                                        return await LinkedDataLoader.fetchJsonLd(
                                            url,
                                            { country },
                                            useProxy ? "proxy" : "fetch-lod"
                                        )
                                    } catch (e) {
                                        console.log(
                                            "Could not get with proxy/download LOD, attempting to download directly. Error for ",
                                            url,
                                            "is",
                                            e
                                        )
                                        return await LinkedDataLoader.fetchJsonLd(
                                            url,
                                            { country },
                                            "fetch-raw"
                                        )
                                    }
                                })()
                            )
                        },
                        [countryStore]
                    )

                externalData.addCallbackAndRunD((lod) =>
                    console.log("linked_data_from_website received the following data:", lod)
                )

                return new Toggle(
                    new SvelteUIElement(ComparisonTool, {
                        feature,
                        state,
                        tags,
                        layer,
                        externalData,
                        sourceUrl,
                        readonly,
                        collapsed: isClosed
                    }),
                    undefined,
                    sourceUrl.map((url) => !!url)
                )
            }
        },
        {
            funcName: "compare_data",
            group: "data_import",
            needsUrls: (args) => args[1].split(";"),
            args: [
                {
                    name: "url",
                    required: true,
                    doc: "The attribute containing the url where to fetch more data"
                },
                {
                    name: "host",
                    required: true,
                    doc: "The domain name(s) where data might be fetched from - this is needed to set the CSP. A domain must include 'https', e.g. 'https://example.com'. For multiple domains, separate them with ';'. If you don't know the possible domains, use '*'. "
                },
                {
                    name: "readonly",
                    required: false,
                    doc: "If 'yes', will not show 'apply'-buttons"
                }
            ],
            docs: "Gives an interactive element which shows a tag comparison between the OSM-object and the upstream object. This allows to copy some or all tags into OSM",
            constr(
                state: SpecialVisualizationState,
                tagSource: UIEventSource<Record<string, string>>,
                args: string[],
                feature: Feature,
                layer: LayerConfig
            ): BaseUIElement {
                const url = args[0]
                const readonly = args[3] === "yes"
                const externalData = Stores.FromPromiseWithErr(Utils.downloadJson(url))
                return new SvelteUIElement(ComparisonTool, {
                    url,
                    state,
                    tags: tagSource,
                    layer,
                    feature,
                    readonly,
                    externalData
                })
            }
        }

    ]
  }
}
