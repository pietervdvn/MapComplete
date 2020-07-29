import {FeatureInfoBox} from "./UI/FeatureInfoBox";
import {TagRenderingOptions} from "./Customizations/TagRendering";
import {Changes} from "./Logic/Changes";
import {UIEventSource} from "./UI/UIEventSource";
import {OsmConnection} from "./Logic/OsmConnection";
import {ElementStorage} from "./Logic/ElementStorage";
import {Tag} from "./Logic/TagsFilter";
import FixedText from "./Customizations/Questions/FixedText";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

const osm = new OsmConnection(true);
const changes = new Changes("test", osm, new ElementStorage());

const tags = new UIEventSource<any>({name: "<b>ESCAPEE <h3>"});
const x = new TagRenderingOptions(
    {
        mappings: [
            {k: null, txt: "Test: {name}"}
        ]
    }
);

new FeatureInfoBox(undefined, tags, new FixedText(new FixedUiElement("{name}")), [x], changes, osm.userDetails)
    .AttachTo("maindiv");