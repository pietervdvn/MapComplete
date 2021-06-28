import {VariableUiElement} from "../Base/VariableUIElement";
import {OsmObject} from "../../Logic/Osm/OsmObject";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Translation} from "../i18n/Translation";
import State from "../../State";
import Toggle from "../Input/Toggle";
import Translations from "../i18n/Translations";
import Loading from "../Base/Loading";
import UserDetails from "../../Logic/Osm/OsmConnection";
import Constants from "../../Models/Constants";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import {Utils} from "../../Utils";


export default class DeleteButton extends Toggle {
    constructor(id: string) {

        const hasRelations: UIEventSource<boolean> = new UIEventSource<boolean>(null)
        OsmObject.DownloadReferencingRelations(id, (rels) => {
            hasRelations.setData(rels.length > 0)
        })

        const hasWays: UIEventSource<boolean> = new UIEventSource<boolean>(null)
        OsmObject.DownloadReferencingWays(id, (ways) => {
            hasWays.setData(ways.length > 0)
        })

        const previousEditors = new UIEventSource<number[]>(null)
        OsmObject.DownloadHistory(id, versions => {
            const uids = versions.map(version => version.tags["_last_edit:contributor:uid"])
            previousEditors.setData(uids)
        })
        const allByMyself = previousEditors.map(previous => {
            if (previous === null) {
                return null;
            }
            const userId = State.state.osmConnection.userDetails.data.uid;
            return !previous.some(editor => editor !== userId)
        }, [State.state.osmConnection.userDetails])

        const t = Translations.t.deleteButton

        super(
            new Toggle(
                new VariableUiElement(
                    hasRelations.map(hasRelations => {
                        if (hasRelations === null || hasWays.data === null) {
                            return new Loading()
                        }
                        if (hasWays.data || hasRelations) {
                            return t.partOfOthers.Clone()
                        }

                        return new Toggle(
                            new SubtleButton(Svg.delete_icon_svg(), t.delete.Clone()),
                            t.notEnoughExperience.Clone(),
                            State.state.osmConnection.userDetails.map(userinfo =>
                                allByMyself.data ||
                                userinfo.csCount >= Constants.userJourney.deletePointsOfOthersUnlock,
                                [allByMyself])
                        )

                    }, [hasWays])
                ),
                t.onlyEditedByLoggedInUser.Clone().onClick(State.state.osmConnection.AttemptLogin),
                State.state.osmConnection.isLoggedIn),
            t.isntAPoint,
            new UIEventSource<boolean>(id.startsWith("node"))
        );
    }
}