import {UIEventSource} from "./Logic/UIEventSource";
import TagRenderingQuestion from "./UI/Popup/TagRenderingQuestion";
import TagRenderingConfig from "./Models/ThemeConfig/TagRenderingConfig";

const config = new TagRenderingConfig({
    question: "What is the name?",
    render: "The name is {name}",
    freeform: {
        key: 'name',
        inline:true
    },
    mappings:[
        {
            if:"noname=yes",
            then: "This feature has no name"
        }
    ]
})

const tags = new UIEventSource<any>({
    name: "current feature name"
})

new TagRenderingQuestion(
    tags, config, undefined).AttachTo("maindiv")