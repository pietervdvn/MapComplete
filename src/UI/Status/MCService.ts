import { Store } from "../../Logic/UIEventSource"

export interface MCService {
    name: string
    status: Store<"online" | "degraded" | "offline">
    message?: Store<undefined | string>
}
