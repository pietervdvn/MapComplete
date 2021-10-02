import Wikidata from "./Logic/Web/Wikidata";
import WikipediaBox from "./UI/WikipediaBox";
import Locale from "./UI/i18n/Locale";
import LanguagePicker from "./UI/LanguagePicker";

new WikipediaBox("Q177").SetStyle("max-height: 25rem")
    .AttachTo("maindiv")
LanguagePicker.CreateLanguagePicker(["en","nl","fr","de"]).AttachTo("extradiv")