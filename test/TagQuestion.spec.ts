import T from "./TestHelper";
import {Utils} from "../Utils";

Utils.runningFromConsole = true;
import TagRenderingQuestion from "../UI/Popup/TagRenderingQuestion";
import {UIEventSource} from "../Logic/UIEventSource";
import TagRenderingConfig from "../Customizations/JSON/TagRenderingConfig";
import EditableTagRendering from "../UI/Popup/EditableTagRendering";


new T("TagQuestionElement",
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
                        {"if": "noname=yes",
                        "then": "This bookcase has no name"}
                    ]
                }, undefined, "Testing tag"
            );
            const questionElement = new TagRenderingQuestion(tags, config);
            const html = questionElement.InnerRender();
            T.assertContains("What is the name of this bookcase?", html);
            T.assertContains("This bookcase has no name", html);
            T.assertContains("<input type='text'", html);
        }],
        ["Regression: has drinking water is asked", () => {
            const tags = new UIEventSource({
                id: "node/123",
                amenity: 'drinking_water'
            });
            const jsonConfig = {
                "#": "Bottle refill",
                "question": {
                    "en": "How easy is it to fill water bottles?",
                    "nl": "Hoe gemakkelijk is het om drinkbussen bij te vullen?",
                    "de": "Wie einfach ist es, Wasserflaschen zu füllen?"
                },
                "mappings": [
                    {
                        "if": "bottle=yes",
                        "then": {
                            "en": "It is easy to refill water bottles",
                            "nl": "Een drinkbus bijvullen gaat makkelijk",
                            "de": "Es ist einfach, Wasserflaschen nachzufüllen"
                        }
                    },
                    {
                        "if": "bottle=no",
                        "then": {
                            "en": "Water bottles may not fit",
                            "nl": "Een drinkbus past moeilijk",
                            "de": "Wasserflaschen passen möglicherweise nicht"
                        }
                    }
                ]
            };
            const config = new TagRenderingConfig(
                jsonConfig, null, "test");
            const questionElement = new EditableTagRendering(tags, config);
            const html = questionElement.InnerRender();
            T.assertContains("How easy is it to fill water bottles?", html);
            T.assertContains("It is easy to refill water bottles", html);
            T.assertContains("<input type='radio'", html);
        }]
    ]
);