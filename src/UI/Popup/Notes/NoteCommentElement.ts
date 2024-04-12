import Combine from "../../Base/Combine"
import BaseUIElement from "../../BaseUIElement"
import Link from "../../Base/Link"
import { FixedUiElement } from "../../Base/FixedUiElement"
import Translations from "../../i18n/Translations"
import { Utils } from "../../../Utils"
import Img from "../../Base/Img"
import { SlideShow } from "../../Image/SlideShow"
import { Stores, UIEventSource } from "../../../Logic/UIEventSource"
import { OsmConnection } from "../../../Logic/Osm/OsmConnection"
import { VariableUiElement } from "../../Base/VariableUIElement"
import { SpecialVisualizationState } from "../../SpecialVisualization"
import SvelteUIElement from "../../Base/SvelteUIElement"
import Note from "../../../assets/svg/Note.svelte"
import Resolved from "../../../assets/svg/Resolved.svelte"
import Speech_bubble from "../../../assets/svg/Speech_bubble.svelte"

export default class NoteCommentElement extends Combine {
    constructor(
        comment: {
            date: string
            uid: number
            user: string
            user_url: string
            action: "closed" | "opened" | "reopened" | "commented"
            text: string
            html: string
            highlighted: boolean
        },
        state?: SpecialVisualizationState,
        index?: number,
        totalNumberOfComments?: number
    ) {
        const t = Translations.t.notes

        let actionIcon: BaseUIElement
        if (comment.action === "opened" || comment.action === "reopened") {
            actionIcon = new SvelteUIElement(Note)
        } else if (comment.action === "closed") {
            actionIcon = new SvelteUIElement(Resolved)
        } else {
            actionIcon = new SvelteUIElement(Speech_bubble)
        }

        let user: BaseUIElement
        if (comment.user === undefined) {
            user = t.anonymous
        } else {
            user = new Link(comment.user, comment.user_url ?? "", true)
        }

        const userinfo = Stores.FromPromise(
            Utils.downloadJsonCached(
                "https://api.openstreetmap.org/api/0.6/user/" + comment.uid,
                24 * 60 * 60 * 1000
            )
        )
        const userImg = new VariableUiElement(
            userinfo.map((userinfo) => {
                const href = userinfo?.user?.img?.href
                if (href !== undefined) {
                    return new Img(href).SetClass("rounded-full w-8 h-8 mr-4")
                }
                return undefined
            })
        )

        const htmlElement = document.createElement("div")
        htmlElement.innerHTML = Utils.purify(comment.html)
        const images = Array.from(htmlElement.getElementsByTagName("a"))
            .map((link) => link.href)
            .filter((link) => {
                link = link.toLowerCase()
                const lastDotIndex = link.lastIndexOf(".")
                const extension = link.substring(lastDotIndex + 1, link.length)
                return Utils.imageExtensions.has(extension)
            })
            .filter((link) => !link.startsWith("https://wiki.openstreetmap.org/wiki/File:"))
        let imagesEl: BaseUIElement = undefined
        if (images.length > 0) {
            const imageEls = images.map((i) =>
                new Img(i)
                    .SetClass("w-full block cursor-pointer")
                    .onClick(() =>
                        state?.previewedImage?.setData(<any>{
                            url_hd: i,
                            url: i,
                        })
                    )
                    .SetStyle("min-width: 50px; background: grey;")
            )
            imagesEl = new SlideShow(new UIEventSource<BaseUIElement[]>(imageEls)).SetClass("mb-1")
        }

        super([
            new Combine([
                actionIcon.SetClass("mr-4 w-6").SetStyle("flex-shrink: 0"),
                new FixedUiElement(comment.html).SetClass("flex flex-col").SetStyle("margin: 0"),
            ]).SetClass("flex"),
            imagesEl,
            new Combine([userImg, user.SetClass("mr-2"), comment.date]).SetClass(
                "flex justify-end items-center subtle"
            ),
        ])
        this.SetClass("flex flex-col pb-2 mb-2 border-gray-500 border-b")
        if (comment.highlighted) {
            this.SetClass("glowing-shadow")
            console.log(">>>", index, totalNumberOfComments)
            if (index + 2 === totalNumberOfComments) {
                console.log("Scrolling into view")
                requestAnimationFrame(() => {
                    this.ScrollIntoView()
                })
            }
        }
    }

    public static addCommentTo(
        txt: string,
        tags: UIEventSource<any>,
        state: { osmConnection: OsmConnection }
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
