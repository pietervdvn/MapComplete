import WikidataPreviewBox from "./UI/Wikipedia/WikidataPreviewBox";
import {UIEventSource} from "./Logic/UIEventSource";
import Wikidata from "./Logic/Web/Wikidata";
import WikidataSearchBox from "./UI/Wikipedia/WikidataSearchBox";

new WikidataSearchBox({searchText: new UIEventSource("Brugge")}).AttachTo("maindiv")