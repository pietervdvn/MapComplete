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
        this.configuration.addCallback((config) => console.log("Current config is", config))
    }

    public register(path: ReadonlyArray<string | number>, value: Store<string>) {
        value.addCallbackAndRun((v) => {
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
        })
    }

    public getSchemaStartingWith(path: string[]) {
        return this.schema.filter(
            (sch) =>
                !path.some((part, i) => !(sch.path.length > path.length && sch.path[i] === part))
        )
    }

    public getSchema(path: string[]) {
        return this.schema.filter(
            (sch) =>
                !path.some((part, i) => !(sch.path.length == path.length && sch.path[i] === part))
        )
    }
}
