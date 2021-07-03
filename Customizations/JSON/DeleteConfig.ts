import {DeleteConfigJson} from "./DeleteConfigJson";
import {Translation} from "../../UI/i18n/Translation";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import Translations from "../../UI/i18n/Translations";
import {FromJSON} from "./FromJSON";

export default class DeleteConfig {
    public readonly  extraDeleteReasons?: {
        explanation: Translation,
        changesetMessage: string
    }[]

    public readonly  nonDeleteMappings?: { if: TagsFilter, then: Translation }[]

    public readonly  softDeletionTags?: TagsFilter
    public readonly  neededChangesets?: number

    constructor(json: DeleteConfigJson, context: string) {

        this.extraDeleteReasons = json.extraDeleteReasons?.map((reason, i) => {
            const ctx = `${context}.extraDeleteReasons[${i}]`
            if ((reason.changesetMessage ?? "").length <= 5) {
                throw `${ctx}.explanation is too short, needs at least 4 characters`
            }
            return {
                explanation: Translations.T(reason.explanation, ctx + ".explanation"),
                changesetMessage: reason.changesetMessage
            }
        })
        this.nonDeleteMappings = json.nonDeleteMappings?.map((nonDelete, i) => {
            const ctx = `${context}.extraDeleteReasons[${i}]`
            return {
                if: FromJSON.Tag(nonDelete.if, ctx + ".if"),
                then: Translations.T(nonDelete.then, ctx + ".then")
            }
        })
        
        this.softDeletionTags = null;
        if(json.softDeletionTags !== undefined){
            this.softDeletionTags =  FromJSON.Tag(json.softDeletionTags,`${context}.softDeletionTags`)

        }
        this.neededChangesets = json.neededChangesets
    }
    
    
}