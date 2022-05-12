import {FixedUiElement} from "./UI/Base/FixedUiElement";
import Img from "./UI/Base/Img";
import { Utils } from "./Utils";

new FixedUiElement("Hi").AttachTo("maindiv")

window.setTimeout(() => {
    new FixedUiElement("Loading...").AttachTo("maindiv")
//    new Img("http://4.bp.blogspot.com/-_vTDmo_fSTw/T3YTV0AfGiI/AAAAAAAAAX4/Zjh2HaoU5Zo/s1600/beautiful%2Bkitten.jpg").AttachTo("maindiv")
    Utils.download("http://127.0.0.1:1234/somedata").then(data => {
        console.log("Got ", data)
        return new FixedUiElement(data).AttachTo("extradiv");
    })
}, 1000)
