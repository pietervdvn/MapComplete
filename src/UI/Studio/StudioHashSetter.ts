import { Store, UIEventSource } from "../../Logic/UIEventSource"
import Hash from "../../Logic/Web/Hash"

export default class StudioHashSetter {
    constructor(mode: "layer" | "theme", tab: Store<number>, name: Store<string>) {
        tab.mapD(tab => {
                Hash.hash.setData(mode + "/" + name.data + "/" + tab)
            }
            , [name])
    }
}
