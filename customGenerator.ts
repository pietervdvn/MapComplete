import {LayoutConfigJson} from "./Customizations/JSON/LayoutConfigJson";
import {UIEventSource} from "./Logic/UIEventSource";
import SingleSetting from "./UI/CustomGenerator/SingleSetting";
import Combine from "./UI/Base/Combine";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import GeneralSettings from "./UI/CustomGenerator/GeneralSettings";
import {SubtleButton} from "./UI/Base/SubtleButton";
import {TabbedComponent} from "./UI/Base/TabbedComponent";
import AllLayersPanel from "./UI/CustomGenerator/AllLayersPanel";
import SharePanel from "./UI/CustomGenerator/SharePanel";


const empty: LayoutConfigJson = {
    id: "",
    title: {},
    description: {},
    language: [],
    maintainer: "",
    icon: "./assets/bug.svg",
    version: "0",
    startLat: 0,
    startLon: 0,
    startZoom: 1,
    socialImage: "",
    layers: [],
}

const test: LayoutConfigJson = {
    id: "test",
    title: {"en": "Test layout"},
    description: {"en": "A layout for testing"},
    language: ["en"],
    maintainer: "Pieter Vander Vennet",
    icon: "./assets/bug.svg",
    version: "0",
    startLat: 0,
    startLon: 0,
    startZoom: 1,
    widenFactor: 0.05,
    socialImage: "",
    layers: [],
}


const es = new UIEventSource(test);
const encoded = es.map(config => btoa(JSON.stringify(config)));
const testUrl = encoded.map(encoded => `./index.html?userlayout=${es.data.id}&test=true#${encoded}`)
const liveUrl = encoded.map(encoded => `./index.html?userlayout=${es.data.id}#${encoded}`)


const currentSetting = new UIEventSource<SingleSetting<any>>(undefined)

const generalSettings = new GeneralSettings(es, currentSetting);
const languages = generalSettings.languages;
new TabbedComponent([
    {
        header: "<img src='./assets/gear.svg'>",
        content: generalSettings
    },
    {
        header: "<img src='./assets/layers.svg'>",
        content: new AllLayersPanel(es, currentSetting, languages)
    },
    {
        header: "<img src='./assets/floppy.svg'>",
        content: "Save"
    },
    {
        header: "<img src='./assets/share.svg'>",
        content: new SharePanel(es, liveUrl)
    }
]).AttachTo("left");


const returnButton = new SubtleButton("./assets/close.svg",
    new VariableUiElement(
        currentSetting.map(currentSetting => {
                if (currentSetting === undefined) {
                    return "";
                }
                return "Return to general help";
            }
        )
    ))
    .ListenTo(currentSetting)
    .onClick(() => currentSetting.setData(undefined));


const helpText = new VariableUiElement(currentSetting.map((setting: SingleSetting<any>) => {
    if (setting === undefined) {
        return "<h1>Welcome to the Custom Theme Builder</h1>" +
            "Here, one can make their own custom mapcomplete themes.<br/>" +
            "Fill out the fields to get a working mapcomplete theme. More information on the selected field will appear here when you click it";
    }

    return new Combine(["<h1>", setting._name, "</h1>", setting._description.Render()]).Render();
}))


new Combine([helpText,
    returnButton,
]).AttachTo("right");

// The preview
new Combine([
    new VariableUiElement(testUrl.map(testUrl => `<iframe src='${testUrl}' width='100%' height='99%' style="box-sizing: border-box" title='Theme Preview'></iframe>`))
]).AttachTo("bottomright");





