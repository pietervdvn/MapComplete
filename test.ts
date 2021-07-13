import SplitRoadWizard from "./UI/Popup/SplitRoadWizard";
import State from "./State";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";

State.state = new State(AllKnownLayouts.layoutsList[4]);
new SplitRoadWizard("way/1234").AttachTo("maindiv")