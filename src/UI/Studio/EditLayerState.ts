import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import { ConfigMeta } from "./configMeta"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"
import { QueryParameters } from "../../Logic/Web/QueryParameters"
import {
    ConversionContext,
    ConversionMessage,
    DesugaringContext,
    Pipe,
} from "../../Models/ThemeConfig/Conversion/Conversion"
import { PrepareLayer } from "../../Models/ThemeConfig/Conversion/PrepareLayer"
import { ValidateLayer } from "../../Models/ThemeConfig/Conversion/Validation"
import { AllSharedLayers } from "../../Customizations/AllSharedLayers"
import { QuestionableTagRenderingConfigJson } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"

/**
 * Sends changes back to the server
 */
export class LayerStateSender {
    constructor(serverLocation: string, layerState: EditLayerState) {
        layerState.configuration.addCallback(async (config) => {
            // console.log("Current config is", Utils.Clone(config))
            const id = config.id
            if (id === undefined) {
                console.log("No id found in layer, not updating")
                return
            }
            const fresponse = await fetch(`${serverLocation}/layers/${id}/${id}.json`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify(config, null, "  "),
            })
        })
    }
}

export default class EditLayerState {
    public readonly osmConnection: OsmConnection
    public readonly schema: ConfigMeta[]

    public readonly featureSwitches: { featureSwitchIsDebugging: UIEventSource<boolean> }

    public readonly configuration: UIEventSource<Partial<LayerConfigJson>> = new UIEventSource<
        Partial<LayerConfigJson>
    >({})
    public readonly messages: Store<ConversionMessage[]>

    constructor(schema: ConfigMeta[]) {
        this.schema = schema
        this.osmConnection = new OsmConnection({
            oauth_token: QueryParameters.GetQueryParameter(
                "oauth_token",
                undefined,
                "Used to complete the login"
            ),
        })
        this.featureSwitches = {
            featureSwitchIsDebugging: new UIEventSource<boolean>(true),
        }
        let state: DesugaringContext
        {
            const layers = AllSharedLayers.getSharedLayersConfigs()
            const questions = layers.get("questions")
            const sharedQuestions = new Map<string, QuestionableTagRenderingConfigJson>()
            for (const question of questions.tagRenderings) {
                sharedQuestions.set(question["id"], <QuestionableTagRenderingConfigJson>question)
            }
            state = {
                tagRenderings: sharedQuestions,
                sharedLayers: layers,
            }
        }
        this.messages = this.configuration.map((config) => {
            const context = ConversionContext.construct([], ["prepare"])

            const prepare = new Pipe(
                new PrepareLayer(state),
                new ValidateLayer("dynamic", false, undefined)
            )
            prepare.convert(<LayerConfigJson>config, context)
            console.log(context.messages)
            return context.messages
        })
        console.log("Configuration store:", this.configuration)
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

    public getStoreFor(path: ReadonlyArray<string | number>): UIEventSource<any | undefined> {
        const store = new UIEventSource<any>(this.getCurrentValueFor(path))
        store.addCallback((v) => {
            console.log("UPdating store", path, v)
            this.setValueAt(path, v)
        })
        return store
    }

    public register(
        path: ReadonlyArray<string | number>,
        value: Store<any>,
        noInitialSync: boolean = false
    ): () => void {
        const unsync = value.addCallback((v) => this.setValueAt(path, v))
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
        console.log("Setting value", v, "to", path, "in entry", entry)
        for (let i = 0; i < path.length - 1; i++) {
            const breadcrumb = path[i]
            if (entry[breadcrumb] === undefined) {
                entry[breadcrumb] = typeof path[i + 1] === "number" ? [] : {}
            }
            entry = entry[breadcrumb]
        }
        if (v !== undefined && v !== null && v !== "") {
            entry[path.at(-1)] = v
        } else if (entry) {
            delete entry[path.at(-1)]
        }
        this.configuration.ping()
    }
}
