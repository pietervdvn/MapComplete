import Wikipedia from "./Logic/Web/Wikipedia";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import WikipediaBox from "./UI/WikipediaBox";
import Loading from "./UI/Base/Loading";


new WikipediaBox({
    pagename: "Poertoren",
    language: "nl"
})
    .SetStyle("max-height: 20rem;")
    .AttachTo("maindiv")


