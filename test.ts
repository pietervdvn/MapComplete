import {OsmObject} from "./Logic/Osm/OsmObject";
import DeleteButton from "./UI/Popup/DeleteButton";
import Combine from "./UI/Base/Combine";
import State from "./State";
/*import ValidatedTextField from "./UI/Input/ValidatedTextField";
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
import Minimap from "./UI/Base/Minimap";
import Loc from "./Models/Loc";
import AvailableBaseLayers from "./Logic/Actors/AvailableBaseLayers";
import ShowDataLayer from "./UI/ShowDataLayer";
import LayoutConfig from "./Customizations/JSON/LayoutConfig";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";


function TestSlideshow() {
    const elems = new UIEventSource([
        new FixedUiElement("A"),
        new FixedUiElement("qmsldkfjqmlsdkjfmqlskdjfmqlksdf").SetClass("text-xl"),
        new Img("https://i.imgur.com/8lIQ5Hv.jpg"),
        new AttributedImage("https://i.imgur.com/y5XudzW.jpg", Imgur.singleton),
        new Img("https://www.grunge.com/img/gallery/the-real-reason-your-cat-sleeps-so-much/intro-1601496900.webp")
    ])
    new SlideShow(elems).AttachTo("maindiv")
}

function TestTagRendering() {
    State.state = new State(undefined)
    const tagsSource = new UIEventSource({
        id: "node/1"
    })
    new TagRenderingQuestion(
        tagsSource,
        new TagRenderingConfig({
            multiAnswer: false,
            freeform: {
                key: "valve"
            },
            question: "What valves are supported?",
            render: "This pump supports {valve}",
            mappings: [
                {
                    if: "valve=dunlop",
                    then: "This pump supports dunlop"
                },
                {
                    if: "valve=shrader",
                    then: "shrader is supported",
                }
            ],
            
        }, undefined, "test"),
        []
    ).AttachTo("maindiv")
    new VariableUiElement(tagsSource.map(tags => tags["valves"])).SetClass("alert").AttachTo("extradiv")
}

function TestAllInputMethods() {

    new Combine(ValidatedTextField.tpList.map(tp => {
        const tf = ValidatedTextField.InputForType(tp.name);

        return new Combine([tf, new VariableUiElement(tf.GetValue()).SetClass("alert")]);
    })).AttachTo("maindiv")
}

function TestMiniMap() {

    const location = new UIEventSource<Loc>({
        lon: 4.84771728515625,
        lat: 51.17920846421931,
        zoom: 14
    })
    const map0 = new Minimap({
        location: location,
        allowMoving: true,
        background: new AvailableBaseLayers(location).availableEditorLayers.map(layers => layers[2])
    })
    map0.SetStyle("width: 500px; height: 250px; overflow: hidden; border: 2px solid red")
        .AttachTo("maindiv")

    const layout = AllKnownLayouts.layoutsList[1]
    State.state = new State(layout)
    console.log("LAYOUT is", layout.id)

    const feature = {
            "type": "Feature",
            _matching_layer_id: "bike_repair_station",
            "properties": {
                id: "node/-1",
                "amenity": "bicycle_repair_station"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    4.84771728515625,
                    51.17920846421931
                ]
            }
        }

    ;

    State.state.allElements.addOrGetElement(feature)

    const featureSource = new UIEventSource([{
        freshness: new Date(),
        feature: feature
    }])

    new ShowDataLayer(
        featureSource,
        map0.leafletMap,
        new UIEventSource<LayoutConfig>(layout)
    )

    const map1 = new Minimap({
            location: location,
            allowMoving: true,
            background: new AvailableBaseLayers(location).availableEditorLayers.map(layers => layers[5])
        },
    )

    map1.SetStyle("width: 500px; height: 250px; overflow: hidden; border : 2px solid black")
        .AttachTo("extradiv")


    new ShowDataLayer(
        featureSource,
        map1.leafletMap,
        new UIEventSource<LayoutConfig>(layout)
    )

    featureSource.ping()
}
//*/
State.state= new State(undefined)
new Combine([
    new DeleteButton("node/8598664388"),
]).AttachTo("maindiv")
