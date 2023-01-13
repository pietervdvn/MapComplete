import { UIEventSource } from "../Logic/UIEventSource"
import { QueryParameters } from "../Logic/Web/QueryParameters"
import Hash from "../Logic/Web/Hash"

export class DefaultGuiState {
    static state: DefaultGuiState

    public readonly welcomeMessageIsOpened: UIEventSource<boolean> = new UIEventSource<boolean>(
        false
    )
    public readonly downloadControlIsOpened: UIEventSource<boolean> = new UIEventSource<boolean>(
        false
    )
    public readonly filterViewIsOpened: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    public readonly copyrightViewIsOpened: UIEventSource<boolean> = new UIEventSource<boolean>(
        false
    )
    public readonly currentViewControlIsOpened: UIEventSource<boolean> = new UIEventSource<boolean>(
        false
    )
    public readonly userInfoIsOpened: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    public readonly userInfoFocusedQuestion: UIEventSource<string> = new UIEventSource<string>(
        undefined
    )
    public readonly welcomeMessageOpenedTab: UIEventSource<number>

    constructor() {
        this.welcomeMessageOpenedTab = UIEventSource.asFloat(
            QueryParameters.GetQueryParameter(
                "tab",
                "0",
                `The tab that is shown in the welcome-message.`
            )
        )
        const sources = {
            welcome: this.welcomeMessageIsOpened,
            download: this.downloadControlIsOpened,
            filters: this.filterViewIsOpened,
            copyright: this.copyrightViewIsOpened,
            currentview: this.currentViewControlIsOpened,
            userinfo: this.userInfoIsOpened,
        }

        const self = this
        this.userInfoIsOpened.addCallback((isOpen) => {
            if (!isOpen) {
                console.log("Resetting focused question")
                self.userInfoFocusedQuestion.setData(undefined)
            }
        })

        sources[Hash.hash.data?.toLowerCase()]?.setData(true)

        if (Hash.hash.data === "" || Hash.hash.data === undefined) {
            this.welcomeMessageIsOpened.setData(true)
        }
    }
}
