import ValidatedTextField from "./UI/Input/ValidatedTextField";
import Combine from "./UI/Base/Combine";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {UIEventSource} from "./Logic/UIEventSource";
import TagRenderingConfig from "./Customizations/JSON/TagRenderingConfig";
import State from "./State";
import TagRenderingQuestion from "./UI/Popup/TagRenderingQuestion";
import {SlideShow} from "./UI/Image/SlideShow";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import Img from "./UI/Base/Img";
import {AttributedImage} from "./UI/Image/AttributedImage";
import {Imgur} from "./Logic/ImageProviders/Imgur";
import ReviewForm from "./UI/Reviews/ReviewForm";
import {OsmConnection} from "./Logic/Osm/OsmConnection";


function TestSlideshow(){
    const elems = new UIEventSource([
        new FixedUiElement("A"),
        new FixedUiElement("qmsldkfjqmlsdkjfmqlskdjfmqlksdf").SetClass("text-xl"),
        new Img("https://i.imgur.com/8lIQ5Hv.jpg"),
        new AttributedImage("https://i.imgur.com/y5XudzW.jpg", Imgur.singleton),
        new Img("https://www.grunge.com/img/gallery/the-real-reason-your-cat-sleeps-so-much/intro-1601496900.webp")
    ])
    new SlideShow(elems).AttachTo("maindiv")
}

function TestTagRendering(){
    State.state = new State(undefined)
    const tagsSource = new UIEventSource({
        id:"node/1"
    })
    new TagRenderingQuestion(
        tagsSource,
        new TagRenderingConfig({
            multiAnswer: false,
            freeform: {
                key:"valve"
            },
            question: "What valves are supported?",
            render: "This pump supports {valve}",
            mappings: [
                {
                    if: "valve=dunlop",
                    then: "This pump supports dunlop"
                },
                {
                    if:"valve=shrader",
                    then:"shrader is supported",
                }
            ],
            
        }, undefined, "test")
    ).AttachTo("maindiv")
    new VariableUiElement(tagsSource.map(tags => tags["valves"])).SetClass("alert").AttachTo("extradiv")
}

function TestAllInputMethods(){

    new Combine(ValidatedTextField.tpList.map(tp => {
        const tf = ValidatedTextField.InputForType(tp.name);

        return new Combine([tf, new VariableUiElement(tf.GetValue()).SetClass("alert")]);
    })).AttachTo("maindiv")    
}

new ReviewForm(() => {
    return undefined;
}, new OsmConnection(true, new UIEventSource<string>(undefined), "test")).AttachTo("maindiv");