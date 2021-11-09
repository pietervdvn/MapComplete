import State from "../../../State";
import {OsmObject} from "../OsmObject";
import OsmChangeAction from "./OsmChangeAction";
import {Changes} from "../Changes";
import {ChangeDescription} from "./ChangeDescription";
import ChangeTagAction from "./ChangeTagAction";
import {TagsFilter} from "../../Tags/TagsFilter";
import {And} from "../../Tags/And";
import {Tag} from "../../Tags/Tag";

export default class DeleteAction extends OsmChangeAction {

    private readonly _softDeletionTags: TagsFilter;
    private readonly meta: {
        theme: string,
        specialMotivation: string,
        changeType: "deletion"
    };
    private readonly _id: string;
    private _hardDelete: boolean;


    constructor(id: string,
                softDeletionTags: TagsFilter,
                meta: {
                    theme: string,
                    specialMotivation: string
                },
                hardDelete: boolean) {
        super(id,true)
        this._id = id;
        this._hardDelete = hardDelete;
        this.meta = {...meta, changeType: "deletion"};
        this._softDeletionTags = new And([softDeletionTags,
            new Tag("fixme", `A mapcomplete user marked this feature to be deleted (${meta.specialMotivation})`)
        ]);

    }

    protected async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {

        const osmObject = await OsmObject.DownloadObjectAsync(this._id)

        if (this._hardDelete) {
            return [{
                meta: this.meta,
                doDelete: true,
                type: osmObject.type,
                id: osmObject.id,
            }]
        } else {
            return await new ChangeTagAction(
                this._id, this._softDeletionTags, osmObject.tags,
                {
                    theme: State.state?.layoutToUse?.id ?? "unkown",
                    changeType: "soft-delete"
                }
            ).CreateChangeDescriptions(changes)
        }
    }

}