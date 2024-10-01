import { Store, UIEventSource } from "../../../Logic/UIEventSource"

export default class NoteCommentElement {


    /**
     * Adds the comment to the _visualisation_ of the given note; doesn't _actually_ upload
     * @param txt
     * @param tags
     * @param state
     */
    public static addCommentTo(
        txt: string,
        tags: UIEventSource<any>,
        state: { osmConnection: { userDetails: Store<{ name: string; uid: number }> } }
    ) {
        const comments: any[] = JSON.parse(tags.data["comments"])
        const username = state.osmConnection.userDetails.data.name

        const urlRegex = /(https?:\/\/[^\s]+)/g
        const html = txt.replace(urlRegex, function (url) {
            return '<a href="' + url + '">' + url + "</a>"
        })

        comments.push({
            date: new Date().toISOString(),
            uid: state.osmConnection.userDetails.data.uid,
            user: username,
            user_url: "https://www.openstreetmap.org/user/" + username,
            action: "commented",
            text: txt,
            html: html,
            highlighted: true,
        })
        tags.data["comments"] = JSON.stringify(comments)
        tags.ping()
    }
}
