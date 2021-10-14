import MoveConfigJson from "./Json/MoveConfigJson";

export default class MoveConfig {

    public readonly enableImproveAccuracy: boolean
    public readonly enableRelocation: boolean

    constructor(json: MoveConfigJson, context: string) {
        this.enableImproveAccuracy = json.enableImproveAccuracy ?? true
        this.enableRelocation = json.enableRelocation ?? true
        if (!(this.enableRelocation || this.enableImproveAccuracy)) {
            throw "At least one default move reason should be allowed (at " + context + ")"
        }
    }


}