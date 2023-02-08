import ScriptUtils from "../scripts/ScriptUtils"
import { Utils } from "../Utils"
import * as fakedom from "fake-dom"
import Locale from "../UI/i18n/Locale"
import { beforeEach } from "vitest"
import { ReferencingWaysMetaTagger } from "../Logic/SimpleMetaTagger"

beforeEach(async () => {
    ScriptUtils.fixUtils()
    Locale.language.setData("en")
    ReferencingWaysMetaTagger.enabled = false
    if (fakedom === undefined || window === undefined) {
        throw "FakeDom not initialized"
    }

    // Block internet access
    Utils.externalDownloadFunction = async (url) => {
        throw "Fetching " + url + "blocked in tests, use Utils.injectJsonDownloadForTests instead"
    }
})
