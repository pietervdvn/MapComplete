import ScriptUtils from "../scripts/ScriptUtils"
import { Utils } from "../src/Utils"
import Locale from "../src/UI/i18n/Locale"
import { beforeEach } from "vitest"
import { ReferencingWaysMetaTagger } from "../src/Logic/SimpleMetaTagger"

beforeEach(async () => {
    ScriptUtils.fixUtils()
    Locale.language.setData("en")
    ReferencingWaysMetaTagger.enabled = false

    // Block internet access
    Utils.externalDownloadFunction = async (url) => {
        console.trace("Fetching external data during tests:", url)
        throw "Fetching " + url + " blocked in tests, use Utils.injectJsonDownloadForTests instead"
    }
})
