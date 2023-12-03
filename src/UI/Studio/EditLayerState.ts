import { ConfigMeta } from "./configMeta"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"
import {
    Conversion,
    ConversionMessage,
    DesugaringContext,
    Pipe,
} from "../../Models/ThemeConfig/Conversion/Conversion"
import { PrepareLayer } from "../../Models/ThemeConfig/Conversion/PrepareLayer"
import { ValidateLayer, ValidateTheme } from "../../Models/ThemeConfig/Conversion/Validation"
import { AllSharedLayers } from "../../Customizations/AllSharedLayers"
import { QuestionableTagRenderingConfigJson } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
import { TagUtils } from "../../Logic/Tags/TagUtils"
import StudioServer from "./StudioServer"
import { Utils } from "../../Utils"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import { OsmTags } from "../../Models/OsmFeature"
import { Feature, Point } from "geojson"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { LayoutConfigJson } from "../../Models/ThemeConfig/Json/LayoutConfigJson"
import { PrepareTheme } from "../../Models/ThemeConfig/Conversion/PrepareTheme"
import { ConversionContext } from "../../Models/ThemeConfig/Conversion/ConversionContext"
import { LocalStorageSource } from "../../Logic/Web/LocalStorageSource"

export interface HighlightedTagRendering {
    path: ReadonlyArray<string | number>
    schema: ConfigMeta
}

export abstract class EditJsonState<T> {
    public readonly schema: ConfigMeta[]
    public readonly category: "layers" | "themes"
    public readonly server: StudioServer
    public readonly showIntro: UIEventSource<"no" | "intro" | "tagrenderings"> = <any>(
        LocalStorageSource.Get("studio-show-intro", "intro")
    )

    public readonly expertMode: UIEventSource<boolean>

    public readonly configuration: UIEventSource<Partial<T>> = new UIEventSource<Partial<T>>({})
    public readonly messages: Store<ConversionMessage[]>

    /**
     * The EditLayerUI shows a 'schemaBasedInput' for this path to pop advanced questions out
     */
    public readonly highlightedItem: UIEventSource<HighlightedTagRendering> = new UIEventSource(
        undefined
    )
    private sendingUpdates = false
    private readonly _stores = new Map<string, UIEventSource<any>>()

    constructor(
        schema: ConfigMeta[],
        server: StudioServer,
        category: "layers" | "themes",
        options?: {
            expertMode?: UIEventSource<boolean>
        }
    ) {
        this.schema = schema
        this.server = server
        this.category = category
        this.expertMode = options?.expertMode ?? new UIEventSource<boolean>(false)

        this.messages = this.setupErrorsForLayers()

        const layerId = this.getId()
        this.highlightedItem.addCallbackD((hl) => console.log("Highlighted item is", hl))
        this.configuration
            .mapD((config) => {
                if (!this.sendingUpdates) {
                    console.log("Not sending updates yet! Trigger 'startSendingUpdates' first")
                    return undefined
                }
                return JSON.stringify(config, null, "  ")
            })
            .stabilized(100)
            .addCallbackD(async (config) => {
                const id = layerId.data
                if (id === undefined) {
                    console.warn("No id found in layer, not updating")
                    return
                }
                await this.server.update(id, config, this.category)
            })
    }

    public startSavingUpdates(enabled = true) {
        this.sendingUpdates = enabled
        if (enabled) {
            this.configuration.ping()
        }
    }

    public getCurrentValueFor(path: ReadonlyArray<string | number>): any | undefined {
        // Walk the path down to see if we find something
        let entry = this.configuration.data
        for (let i = 0; i < path.length; i++) {
            if (entry === undefined) {
                // We reached a dead end - no old vlaue
                return undefined
            }
            const breadcrumb = path[i]
            entry = entry[breadcrumb]
        }
        return entry
    }

    public async delete(){
        await this.server.delete(this.getId().data, this.category)
    }
    public getStoreFor<T>(path: ReadonlyArray<string | number>): UIEventSource<T | undefined> {
        const key = path.join(".")

        const store = new UIEventSource<any>(this.getCurrentValueFor(path))
        store.addCallback((v) => {
            this.setValueAt(path, v)
        })
        this._stores.set(key, store)
        this.configuration.addCallbackD((config) => {
            store.setData(this.getCurrentValueFor(path))
        })
        return store
    }

    public register(
        path: ReadonlyArray<string | number>,
        value: Store<any>,
        noInitialSync: boolean = true
    ): () => void {
        const unsync = value.addCallback((v) => {
            this.setValueAt(path, v)
        })
        if (!noInitialSync) {
            this.setValueAt(path, value.data)
        }
        return unsync
    }

    public getSchemaStartingWith(path: string[]) {
        return this.schema.filter(
            (sch) =>
                !path.some((part, i) => !(sch.path.length > path.length && sch.path[i] === part))
        )
    }

    public getTranslationAt(path: string[]): ConfigMeta {
        const origConfig = this.getSchema(path)[0]
        return {
            path,
            type: "translation",
            hints: {
                typehint: "translation",
            },
            required: origConfig.required ?? false,
            description: origConfig.description ?? "A translatable object",
        }
    }

    public getSchema(path: string[]): ConfigMeta[] {
        const schemas = this.schema.filter(
            (sch) =>
                sch !== undefined &&
                !path.some((part, i) => !(sch.path.length == path.length && sch.path[i] === part))
        )
        if (schemas.length == 0) {
            console.warn("No schemas found for path", path.join("."))
        }
        return schemas
    }

    public setValueAt(path: ReadonlyArray<string | number>, v: any) {
        let entry = this.configuration.data
        const isUndefined =
            v === undefined ||
            v === null ||
            v === "" ||
            (typeof v === "object" && Object.keys(v).length === 0)

        for (let i = 0; i < path.length - 1; i++) {
            const breadcrumb = path[i]
            if (entry[breadcrumb] === undefined) {
                if (isUndefined) {
                    // we have a dead end _and_ we do not need to set a value - we do an early return
                    return
                }
                entry[breadcrumb] = typeof path[i + 1] === "number" ? [] : {}
            }
            entry = entry[breadcrumb]
        }

        const lastBreadcrumb = path.at(-1)
        if (isUndefined) {
            if (entry && entry[lastBreadcrumb]) {
                delete entry[lastBreadcrumb]
                this.configuration.ping()
            }
        } else if (entry[lastBreadcrumb] !== v) {
            entry[lastBreadcrumb] = v
            this.configuration.ping()
        }
    }

    public messagesFor(path: ReadonlyArray<string | number>): Store<ConversionMessage[]> {
        return this.messages.map((msgs) => {
            if (!msgs) {
                return []
            }
            return msgs.filter((msg) => {
                const pth = msg.context.path
                for (let i = 0; i < Math.min(pth.length, path.length); i++) {
                    if (pth[i] !== path[i]) {
                        return false
                    }
                }
                return true
            })
        })
    }

    protected abstract buildValidation(state: DesugaringContext): Conversion<T, any>

    protected abstract getId(): Store<string>

    private setupErrorsForLayers(): Store<ConversionMessage[]> {
        const layers = AllSharedLayers.getSharedLayersConfigs()
        const questions = layers.get("questions")
        const sharedQuestions = new Map<string, QuestionableTagRenderingConfigJson>()
        for (const question of questions.tagRenderings) {
            sharedQuestions.set(question["id"], <QuestionableTagRenderingConfigJson>question)
        }
        let state: DesugaringContext = {
            tagRenderings: sharedQuestions,
            sharedLayers: layers,
        }
        const prepare = this.buildValidation(state)
        return this.configuration.mapD((config) => {
            const context = ConversionContext.construct([], ["prepare"])
            try {
                prepare.convert(<T>config, context)
            } catch (e) {
                console.error(e)
                context.err(e)
            }
            return context.messages
        })
    }
}

export default class EditLayerState extends EditJsonState<LayerConfigJson> {
    // Needed for the special visualisations
    public readonly osmConnection: OsmConnection
    public readonly imageUploadManager = {
        getCountsFor() {
            return 0
        },
    }
    public readonly layout: { getMatchingLayer: (key: any) => LayerConfig }
    public readonly featureSwitches: {
        featureSwitchIsDebugging: UIEventSource<boolean>
    }

    /**
     * Used to preview and interact with the questions
     */
    public readonly testTags = new UIEventSource<OsmTags>({ id: "node/-12345" })
    public readonly exampleFeature: Feature<Point> = {
        type: "Feature",
        properties: this.testTags.data,
        geometry: {
            type: "Point",
            coordinates: [3.21, 51.2],
        },
    }

    constructor(
        schema: ConfigMeta[],
        server: StudioServer,
        osmConnection: OsmConnection,
        options: { expertMode: UIEventSource<boolean> }
    ) {
        super(schema, server, "layers", options)
        this.osmConnection = osmConnection
        this.layout = {
            getMatchingLayer: (_) => {
                try {
                    return new LayerConfig(<LayerConfigJson>this.configuration.data, "dynamic")
                } catch (e) {
                    return undefined
                }
            },
        }
        this.featureSwitches = {
            featureSwitchIsDebugging: new UIEventSource<boolean>(true),
        }

        this.addMissingTagRenderingIds()


        function cleanArray(data: object, key: string): boolean{
            if(!data){
                return false
            }
            if (data[key]) {
                // A bit of cleanup
                const lBefore = data[key].length
                const cleaned = Utils.NoNull(data[key])
                if (cleaned.length != lBefore) {
                    data[key] = cleaned
                    return true
                }
            }
            return false
        }

        this.configuration.addCallbackAndRunD((layer) => {
            let changed = cleanArray(layer, "tagRenderings") || cleanArray(layer, "pointRenderings")
            for (const tr of layer.tagRenderings ?? []) {
                if(typeof tr === "string"){
                    continue
                }

                const qtr = (<QuestionableTagRenderingConfigJson> tr)
                if(qtr.freeform && Object.keys(qtr.freeform ).length === 0){
                    delete qtr.freeform
                    changed = true
                }
            }
            if(changed){
                this.configuration.ping()
            }
        })
    }

    protected buildValidation(state: DesugaringContext) {
        return new Pipe(
            new PrepareLayer(state),
            new ValidateLayer("dynamic", false, undefined, true)
        )
    }

    protected getId(): Store<string> {
        return this.configuration.mapD((config) => config.id)
    }

    private addMissingTagRenderingIds() {
        this.configuration.addCallbackD((config) => {
            const trs = Utils.NoNull(config.tagRenderings ?? [])
            for (let i = 0; i < trs.length; i++) {
                const tr = trs[i]
                if (typeof tr === "string") {
                    continue
                }
                if (!tr["id"] && !tr["override"]) {
                    const qtr = <QuestionableTagRenderingConfigJson>tr
                    let id = "" + i + "_" + Utils.randomString(5)
                    if (qtr?.freeform?.key) {
                        id = qtr?.freeform?.key
                    } else if (qtr.mappings?.[0]?.if) {
                        id =
                            qtr.freeform?.key ??
                            TagUtils.Tag(qtr.mappings[0].if).usedKeys()?.[0] ??
                            "" + i
                    }
                    qtr["id"] = id
                }
            }
        })
    }
}

export class EditThemeState extends EditJsonState<LayoutConfigJson> {
    constructor(
        schema: ConfigMeta[],
        server: StudioServer,
        options: { expertMode: UIEventSource<boolean> }
    ) {
        super(schema, server, "themes", options)
    }

    protected buildValidation(state: DesugaringContext): Conversion<LayoutConfigJson, any> {
        return new Pipe(
            new PrepareTheme(state),
            new ValidateTheme(undefined, "", false, new Set(state.tagRenderings.keys()))
        )
    }

    protected getId(): Store<string> {
        return this.configuration.mapD((config) => config.id)
    }
}
