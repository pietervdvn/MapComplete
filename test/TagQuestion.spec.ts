import T from "./TestHelper";
import {Utils} from "../Utils";

Utils.runningFromConsole = true;
import TagRenderingQuestion from "../UI/Popup/TagRenderingQuestion";
import {UIEventSource} from "../Logic/UIEventSource";
import TagRenderingConfig from "../Customizations/JSON/TagRenderingConfig";
import EditableTagRendering from "../UI/Popup/EditableTagRendering";

export default class TagQuestionSpec extends T {
    constructor() {
        super("TagQuestionElement",
            [
                ["Freeform has textfield", () => {
                    const tags = new UIEventSource({
                        id: "way/123",
                        amenity: 'public_bookcases'
                    });
                    const config = new TagRenderingConfig(
                        {
                            render: "The name is {name}",
                            question: "What is the name of this bookcase?",
                            freeform: {
                                key: "name",
                                type: "string"
                            }
                        }, undefined, "Testing tag"
                    );
                    const questionElement = new TagRenderingQuestion(tags, config);
                    const html = questionElement.InnerRender();
                    T.assertContains("What is the name of this bookcase?", html);
                    T.assertContains("<input type='text'", html);
                }],
                ["TagsQuestion with Freeform and mappings has textfield", () => {
                    const tags = new UIEventSource({
                        id: "way/123",
                        amenity: 'public_bookcases'
                    });
                    const config = new TagRenderingConfig(
                        {
                            render: "The name is {name}",
                            question: "What is the name of this bookcase?",
                            freeform: {
                                key: "name",
                                type: "string"
                            },
                            mappings: [
                                {
                                    "if": "noname=yes",
                                    "then": "This bookcase has no name"
                                }
                            ]
                        }, undefined, "Testing tag"
                    );
                    const questionElement = new TagRenderingQuestion(tags, config);
                    const html = questionElement.InnerRender();
                    T.assertContains("What is the name of this bookcase?", html);
                    T.assertContains("This bookcase has no name", html);
                    T.assertContains("<input type='text'", html);
                }]
            ]);
    }
}
