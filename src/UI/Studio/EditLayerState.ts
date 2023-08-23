import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import { ConfigMeta } from "./configMeta"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"

export default class EditLayerState {
    public readonly osmConnection: OsmConnection
    public readonly schema: ConfigMeta[]

    public readonly featureSwitches: { featureSwitchIsDebugging: UIEventSource<boolean> }

    public readonly configuration: UIEventSource<Partial<LayerConfigJson>> = new UIEventSource<
        Partial<LayerConfigJson>
    >({})

    constructor(schema: ConfigMeta[]) {
        this.schema = schema
        this.osmConnection = new OsmConnection({})
        this.featureSwitches = {
            featureSwitchIsDebugging: new UIEventSource<boolean>(true),
        }
        this.configuration.addCallback((config) => {
            // console.log("Current config is", Utils.Clone(config))
        })
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
        return this.schema.filter(
            (sch) =>
                sch !== undefined &&
                !path.some((part, i) => !(sch.path.length == path.length && sch.path[i] === part))
        )
    }

    public setValueAt(path: ReadonlyArray<string | number>, v: any) {
        {
            let entry = this.configuration.data
            for (let i = 0; i < path.length - 1; i++) {
                const breadcrumb = path[i]
                if (entry[breadcrumb] === undefined) {
                    entry[breadcrumb] = typeof path[i + 1] === "number" ? [] : {}
                }
                entry = entry[breadcrumb]
            }
            if (v) {
                entry[path.at(-1)] = v
            } else if (entry) {
                delete entry[path.at(-1)]
            }
            this.configuration.ping()
        }
    }
}
