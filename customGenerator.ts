import {UIEventSource} from "./Logic/UIEventSource";
import SingleSetting from "./UI/CustomGenerator/SingleSetting";
import Combine from "./UI/Base/Combine";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import GeneralSettings from "./UI/CustomGenerator/GeneralSettings";
import {TabbedComponent} from "./UI/Base/TabbedComponent";
import AllLayersPanel from "./UI/CustomGenerator/AllLayersPanel";
import SharePanel from "./UI/CustomGenerator/SharePanel";
import {GenerateEmpty} from "./UI/CustomGenerator/GenerateEmpty";
import PageSplit from "./UI/Base/PageSplit";
import HelpText from "./Customizations/HelpText";
import {TagRendering} from "./Customizations/TagRendering";
import {FromJSON} from "./Customizations/JSON/FromJSON";
import {LayoutConfigJson} from "./Customizations/JSON/LayoutConfigJson";


let layout = GenerateEmpty.createTestLayout();
if(window.location.hash.length > 10){
    layout = JSON.parse(atob(window.location.hash.substr(1))) as LayoutConfigJson;
}
const es = new UIEventSource(layout);
const encoded = es.map(config => btoa(JSON.stringify(config)));
const liveUrl = encoded.map(encoded => `./index.html?userlayout=${es.data.id}#${encoded}`)
const iframe = liveUrl.map(url => `<iframe src='${url}' width='100%' height='99%' style="box-sizing: border-box" title='Theme Preview'></iframe>`);

TagRendering.injectFunction();

const currentSetting = new UIEventSource<SingleSetting<any>>(undefined)

const generalSettings = new GeneralSettings(es, currentSetting);
const languages = generalSettings.languages;


// The preview
const preview = new Combine([
    new VariableUiElement(iframe.stabilized(2500))
]).SetClass("preview")


new TabbedComponent([
    {
        header: "<img src='./assets/gear.svg'>",
        content:
            new PageSplit(
                generalSettings.SetStyle("width: 50vw;"),
                new Combine([
                    new HelpText(currentSetting).SetStyle("height:calc(100% - 65vh); width: 100%; display:block; overflow-y: auto"),
                    preview.SetStyle("height:65vh; width:100%; display:block")
                ]).SetStyle("position:relative; width: 50%;")
            )
    },
    {
        header: "<img src='./assets/layers.svg'>",
        content: new AllLayersPanel(es, languages)
    },
    {
        header: "<img src='./assets/floppy.svg'>",
        content: new VariableUiElement(es.map(config => {
            return JSON.stringify(config, null, 2)
                .replace(/\n/g, "<br/>")
                .replace(/ /g, "&nbsp;");
        }))

    },
    {
        header: "<img src='./assets/share.svg'>",
        content: new SharePanel(es, liveUrl)
    }
], 1).SetClass("main-tabs")
    .AttachTo("maindiv");

