import { UIEventSource } from "../Logic/UIEventSource"
import Hash from "../Logic/Web/Hash"

export class DefaultGuiState {
    public readonly welcomeMessageIsOpened: UIEventSource<boolean> = new UIEventSource<boolean>(
        false
    )

    public readonly menuIsOpened: UIEventSource<boolean> = new UIEventSource<boolean>(false)

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

    private readonly sources: Record<string, UIEventSource<boolean>> = {
        welcome: this.welcomeMessageIsOpened,
        download: this.downloadControlIsOpened,
        filters: this.filterViewIsOpened,
        copyright: this.copyrightViewIsOpened,
        currentview: this.currentViewControlIsOpened,
        userinfo: this.userInfoIsOpened,
    }

    constructor() {
        const self = this
        this.userInfoIsOpened.addCallback((isOpen) => {
            if (!isOpen) {
                console.log("Resetting focused question")
                self.userInfoFocusedQuestion.setData(undefined)
            }
        })

        this.sources[Hash.hash.data?.toLowerCase()]?.setData(true)

        if (Hash.hash.data === "" || Hash.hash.data === undefined) {
            this.welcomeMessageIsOpened.setData(true)
        }
    }

    public closeAll(except) {
        for (const sourceKey in this.sources) {
            this.sources[sourceKey].setData(false)
        }
    }
}
