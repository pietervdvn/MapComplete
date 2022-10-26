import ScriptUtils from "../scripts/ScriptUtils"
import { Utils } from "../Utils"
import * as fakedom from "fake-dom"
import Locale from "../UI/i18n/Locale"

export const mochaHooks = {
    beforeEach(done) {
        ScriptUtils.fixUtils()
        Locale.language.setData("en")

        if (fakedom === undefined || window === undefined) {
            throw "FakeDom not initialized"
        }

        // Block internet access
        const realDownloadFunc = Utils.externalDownloadFunction
        Utils.externalDownloadFunction = async (url) => {
            console.error(
                "Fetching ",
                url,
                "blocked in tests, use Utils.injectJsonDownloadForTests"
            )
            const data = await realDownloadFunc(url)
            console.log(
                "\n\n ----------- \nBLOCKED DATA\n Utils.injectJsonDownloadForTests(\n" + "       ",
                JSON.stringify(url),
                ", \n",
                "       ",
                //   JSON.stringify(data),
                "\n    )\n------------------\n\n"
            )
            throw new Error(
                "Detected internet access for URL " +
                    url +
                    ", please inject it with Utils.injectJsonDownloadForTests"
            )
        }

        done()
    },
}
