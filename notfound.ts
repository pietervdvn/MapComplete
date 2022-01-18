import {FixedUiElement} from "./UI/Base/FixedUiElement";
import Combine from "./UI/Base/Combine";
import BackToIndex from "./UI/BigComponents/BackToIndex";

new Combine([new FixedUiElement("This page is not found"),
new BackToIndex()]).AttachTo("maindiv")