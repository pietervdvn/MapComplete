import {describe} from 'mocha'
import {expect} from 'chai'
import SourceConfig from "../../../Models/ThemeConfig/SourceConfig";
import {TagUtils} from "../../../Logic/Tags/TagUtils";

describe("SourceConfig", () => {

    it("should throw an error on conflicting tags", () => {
        expect(() => {
            new SourceConfig(
                {
                    osmTags: TagUtils.Tag({
                        and: ["x=y", "a=b", "x!=y"]
                    })
                }, false
            )
        }).to.throw(/tags are conflicting/)
    })
})
