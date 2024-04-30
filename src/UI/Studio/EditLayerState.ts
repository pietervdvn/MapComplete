import { ConfigMeta } from "./configMeta"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"
import {
    Conversion,
    ConversionMessage,
    DesugaringContext,
    Pipe
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
import { TagRenderingConfigJson } from "../../Models/ThemeConfig/Json/TagRenderingConfigJson"

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
     * The tab in the UI that is selected, used for deeplinks
     */
    public readonly selectedTab: UIEventSource<number> = new UIEventSource<number>(0)

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


        const layerId = this.getId()
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
        this.messages = this.createMessagesStore()

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

    public async delete() {
        await this.server.delete(this.getId().data, this.category)
    }

    public getStoreFor<T>(path: ReadonlyArray<string | number>): UIEventSource<T | undefined> {
        const key = path.join(".")

        const store = new UIEventSource<any>(this.getCurrentValueFor(path))
        store.addCallback((v) => {
            this.setValueAt(path, v)
        })
        this._stores.set(key, store)
        this.configuration.addCallbackD(() => {
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
                typehint: "translation"
            },
            required: origConfig.required ?? false,
            description: origConfig.description ?? "A translatable object"
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
                if (msg.level === "debug" || msg.level === "information") {
                    return false
                }
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

    protected abstract validate(configuration: Partial<T>): Promise<ConversionMessage[]>;

    /**
     * Creates a store that validates the configuration and which contains all relevant (error)-messages
     * @private
     */
    private createMessagesStore(): Store<ConversionMessage[]> {
        return this.configuration.mapAsyncD(async (config) => {
            if(!this.validate){
                return []
            }
            return await this.validate(config)
        }).map(messages => messages ?? [])
    }
}

class ContextRewritingStep<T> extends Conversion<LayerConfigJson, T> {
    private readonly _step: Conversion<LayerConfigJson, T>
    private readonly _state: DesugaringContext
    private readonly _getTagRenderings: (t: T) => TagRenderingConfigJson[]

    constructor(
        state: DesugaringContext,
        step: Conversion<LayerConfigJson, T>,
        getTagRenderings: (t: T) => TagRenderingConfigJson[]
    ) {
        super(
            "When validating a layer, the tagRenderings are first expanded. Some builtin tagRendering-calls (e.g. `contact`) will introduce _multiple_ tagRenderings, causing the count to be off. This class rewrites the error messages to fix this",
            [],
            "ContextRewritingStep"
        )
        this._state = state
        this._step = step
        this._getTagRenderings = getTagRenderings
    }

    convert(json: LayerConfigJson, context: ConversionContext): T {
        const converted = this._step.convert(json, context)
        const originalIds = json.tagRenderings?.map(
            (tr) => (<QuestionableTagRenderingConfigJson>tr)["id"]
        )
        if (!originalIds) {
            return converted
        }

        let newTagRenderings: TagRenderingConfigJson[]
        if (converted === undefined) {
            const prepared = new PrepareLayer(this._state)
            newTagRenderings = <TagRenderingConfigJson[]>(
                prepared.convert(json, context).tagRenderings
            )
        } else {
            newTagRenderings = this._getTagRenderings(converted)
        }
        context.rewriteMessages((path) => {
            if (path[0] !== "tagRenderings") {
                return undefined
            }
            const newPath = [...path]
            const idToSearch = newTagRenderings[newPath[1]].id
            const oldIndex = originalIds.indexOf(idToSearch)
            if (oldIndex < 0) {
                console.warn("Original ID was not found: ", idToSearch)
                return undefined // We don't modify the message
            }
            newPath[1] = oldIndex
            return newPath
        })
        return converted
    }
}

export default class EditLayerState extends EditJsonState<LayerConfigJson> {
    // Needed for the special visualisations
    public readonly osmConnection: OsmConnection
    public readonly imageUploadManager = {
        getCountsFor() {
            return 0
        }
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
            coordinates: [3.21, 51.2]
        }
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
            getMatchingLayer: () => {
                try {
                    return new LayerConfig(<LayerConfigJson>this.configuration.data, "dynamic")
                } catch (e) {
                    return undefined
                }
            }
        }
        this.featureSwitches = {
            featureSwitchIsDebugging: new UIEventSource<boolean>(true)
        }

        this.addMissingTagRenderingIds()

        function cleanArray(data: object, key: string): boolean {
            if (!data) {
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
                if (typeof tr === "string") {
                    continue
                }

                const qtr = <QuestionableTagRenderingConfigJson>tr
                if (qtr.freeform && Object.keys(qtr.freeform).length === 0) {
                    delete qtr.freeform
                    changed = true
                }
            }
            if (changed) {
                this.configuration.ping()
            }
        })
    }

    protected buildValidation(state: DesugaringContext) {
        return new ContextRewritingStep(
            state,
            new Pipe(new PrepareLayer(state), new ValidateLayer("dynamic", false, undefined, true)),
            (t) => <TagRenderingConfigJson[]>t.raw.tagRenderings
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

    protected async validate(configuration: Partial<LayerConfigJson>): Promise<ConversionMessage[]> {

        const layers = AllSharedLayers.getSharedLayersConfigs()

        const questions = layers.get("questions")
        const sharedQuestions = new Map<string, QuestionableTagRenderingConfigJson>()
        for (const question of questions.tagRenderings) {
            sharedQuestions.set(question["id"], <QuestionableTagRenderingConfigJson>question)
        }
        const state: DesugaringContext = {
            tagRenderings: sharedQuestions,
            sharedLayers: layers
        }
        const prepare = this.buildValidation(state)
        const context = ConversionContext.construct([], ["prepare"])
        try {
            prepare.convert(<LayerConfigJson>configuration, context)
        } catch (e) {
            console.error(e)
            context.err(e)
        }
        return context.messages
    }
}

export class EditThemeState extends EditJsonState<LayoutConfigJson> {
    constructor(
        schema: ConfigMeta[],
        server: StudioServer,
        options: { expertMode: UIEventSource<boolean> }
    ) {
        super(schema, server, "themes", options)
        this.setupFixers()
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

    /** Applies a few bandaids to get everything smoothed out in case of errors; a big bunch of hacks basically
     */
    public setupFixers() {
        this.configuration.addCallbackAndRunD(config => {
            if (config.layers) {
                // Remove 'null' and 'undefined' values from the layer array if any are found
                for (let i = config.layers.length; i >= 0; i--) {
                    if (!config.layers[i]) {
                        config.layers.splice(i, 1)
                    }
                }
            }
        })
    }

    protected async validate(configuration: Partial<LayoutConfigJson>) {

        const layers = AllSharedLayers.getSharedLayersConfigs()

        for (const l of configuration.layers ?? []) {
            if(typeof l !== "string"){
                continue
            }
            if (!l.startsWith("https://")) {
                continue
            }
            const config = <LayerConfigJson> await Utils.downloadJsonCached(l, 1000*60*10)
            layers.set(l, config)
        }

        const questions = layers.get("questions")
        const sharedQuestions = new Map<string, QuestionableTagRenderingConfigJson>()
        for (const question of questions.tagRenderings) {
            sharedQuestions.set(question["id"], <QuestionableTagRenderingConfigJson>question)
        }
        const state: DesugaringContext = {
            tagRenderings: sharedQuestions,
            sharedLayers: layers
        }
        const prepare = this.buildValidation(state)
        const context = ConversionContext.construct([], ["prepare"])
        if(configuration.layers){
            Utils.NoNullInplace(configuration.layers)
        }
        try {
            prepare.convert(<LayoutConfigJson>configuration, context)
        } catch (e) {
            console.error(e)
            context.err(e)
        }
        return context.messages
    }

}
