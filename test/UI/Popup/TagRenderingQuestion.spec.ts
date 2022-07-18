import {describe} from 'mocha'
import {TagRenderingConfigJson} from "../../../Models/ThemeConfig/Json/TagRenderingConfigJson";
import TagRenderingConfig from "../../../Models/ThemeConfig/TagRenderingConfig";
import TagRenderingQuestion from "../../../UI/Popup/TagRenderingQuestion";
import {UIEventSource} from "../../../Logic/UIEventSource";
import { expect } from 'chai';
import Locale from "../../../UI/i18n/Locale";

describe("TagRenderingQuestion", () => {

    it("should have a freeform text field with the user defined placeholder", () => {

        const configJson = <TagRenderingConfigJson>{
            id: "test-tag-rendering",
            question: "Question?",
            render: "Rendering {capacity}",
            freeform: {
                key: "capacity",
                type: "pnat",
                placeholder: "Some user defined placeholder"
            }
        }
        const config = new TagRenderingConfig(configJson, "test")
        const ui = new TagRenderingQuestion( new UIEventSource<any>({}), config)
        const html = ui.ConstructElement()
        expect(html.getElementsByTagName("input")[0]["placeholder"]).eq("Some user defined placeholder")
    })

    it("should have a freeform text field with a type explanation", () => {

        Locale.language.setData("en")
        const configJson = <TagRenderingConfigJson>{
            id: "test-tag-rendering",
            question: "Question?",
            render: "Rendering {capacity}",
            freeform: {
                key: "capacity",
                type: "pnat",
            }
        }
        const config = new TagRenderingConfig(configJson, "test")
        const ui = new TagRenderingQuestion( new UIEventSource<any>({}), config)
        const html = ui.ConstructElement()
        expect(html.getElementsByTagName("input")[0]["placeholder"])
            .eq("capacity (a positive, whole number)")
    })
})
