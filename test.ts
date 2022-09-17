import MinimapImplementation from "./UI/Base/MinimapImplementation";
import {Utils} from "./Utils";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import LayerConfig from "./Models/ThemeConfig/LayerConfig";
import Constants from "./Models/Constants";
import {And} from "./Logic/Tags/And";
import {Tag} from "./Logic/Tags/Tag";
import {FlowPanelFactory, FlowStep} from "./UI/ImportFlow/FlowStep";
import Title from "./UI/Base/Title";
import Combine from "./UI/Base/Combine";
import {ImmutableStore, Store, UIEventSource} from "./Logic/UIEventSource";
import {RadioButton} from "./UI/Input/RadioButton";
import {InputElement} from "./UI/Input/InputElement";
import {FixedInputElement} from "./UI/Input/FixedInputElement";
import List from "./UI/Base/List";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import BaseUIElement from "./UI/BaseUIElement";
import LeftIndex from "./UI/Base/LeftIndex";
import {SvgToPdf, SvgToPdfOptions} from "./Utils/svgToPdf";
import Img from "./UI/Base/Img";
import Toggle from "./UI/Input/Toggle";
import CheckBoxes, {CheckBox} from "./UI/Input/Checkboxes";
import Loading from "./UI/Base/Loading";
import Minimap from "./UI/Base/Minimap";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import SearchAndGo from "./UI/BigComponents/SearchAndGo";

MinimapImplementation.initialize()

let i = 0

function createElement(): string {
    const div = document.createElement("div")
    div.id = "freediv-" + (i++)
    document.getElementById("extradiv").append(div)
    return div.id
}

async function main() {
    {
        // Dirty hack!
        // Make the charging-station layer simpler to allow querying it by overpass
        const bikechargingStationLayer: LayerConfig = AllKnownLayouts.allKnownLayouts.get("toerisme_vlaanderen").layers.find(l => l.id === "charging_station_ebikes")
        bikechargingStationLayer.source.osmTags = new And([new Tag("amenity", "charging_station"), new Tag("bicycle", "yes")])
        Constants.defaultOverpassUrls.splice(0, 1) // remove overpass-api.de for this run
    }


    const svg = await Utils.download(window.location.protocol + "//" + window.location.host + "/assets/templates/MapComplete-flyer.svg")
    const svgBack = await Utils.download(window.location.protocol + "//" + window.location.host + "/assets/templates/MapComplete-flyer.back.svg")

    const options = <SvgToPdfOptions>{
        getFreeDiv: createElement,
        disableMaps: false
    }
    const front = await new SvgToPdf([svg, svgBack], options)
    await front.ConvertSvg("Flyer-nl.pdf", "nl")
    await front.ConvertSvg("Flyer-en.pdf", "en")

}

class SelectTemplate extends Combine implements FlowStep<string[]> {
    readonly IsValid: Store<boolean>;
    readonly Value: Store<string[]>;

    constructor() {
        const elements: InputElement<{ pages: string[] }>[] = []
        for (const templateName in SvgToPdf.templates) {
            const template = SvgToPdf.templates[templateName]
            elements.push(new FixedInputElement(template.description, new UIEventSource(template)))
        }
        const radio = new RadioButton(elements, {selectFirstAsDefault: true})

        const loaded: Store<{ success: string[] } | { error: any }> = radio.GetValue().bind(template => {
            if (template === undefined) {
                return undefined
            }
            const urls = template.pages.map(p => SelectTemplate.ToUrl(p))
            const dloadAll: Promise<string[]> = Promise.all(urls.map(url => Utils.download(url)))

            return UIEventSource.FromPromiseWithErr(dloadAll)
        })
        const preview = new VariableUiElement(
            loaded.map(pages => {
                if (pages === undefined) {
                    return new Loading()
                }
                if (pages["err"] !== undefined) {
                    return new FixedUiElement("Loading preview failed: " + pages["err"]).SetClass("alert")
                }
                const els: BaseUIElement[] = []
                for (const pageSrc of pages["success"]) {
                    const el = new Img(pageSrc, true)
                        .SetClass("w-96 m-2 border-black border-2")
                    els.push(el)
                }
                return new Combine(els).SetClass("flex border border-subtle rounded-xl");
            })
        )

        super([
            new Title("Select template"),
            radio,
            new Title("Preview"),
            preview
        ]);
        this.Value = loaded.map(l => l === undefined ? undefined : l["success"])
        this.IsValid = this.Value.map(v => v !== undefined)
    }

    public static ToUrl(spec: string) {
        if (spec.startsWith("http")) {
            return spec
        }
        return window.location.protocol + "//" + window.location.host + "/" + spec
    }

}

class SelectPdfOptions extends Combine implements FlowStep<{ pages: string[], options: SvgToPdfOptions }> {
    readonly IsValid: Store<boolean>;
    readonly Value: Store<{ pages: string[], options: SvgToPdfOptions }>;

    constructor(pages: string[], getFreeDiv: () => string) {
        const dummy = new CheckBox("Don't add data to the map (to quickly preview the PDF)", false)
        const overrideMapLocation = new CheckBox("Override map location: use a selected location instead of the location set in the template", false)
        const locationInput = Minimap.createMiniMap().SetClass("block w-full")
        const searchField = new SearchAndGo( {leafletMap: locationInput.leafletMap})
        const selectLocation =
            new Combine([
                new Toggle(new Combine([new Title("Select override location"), searchField]).SetClass("flex"), undefined, overrideMapLocation.GetValue()),
                new Toggle(locationInput.SetStyle("height: 20rem"), undefined, overrideMapLocation.GetValue()).SetStyle("height: 20rem")
            ]).SetClass("block").SetStyle("height: 25rem")
        super([new Title("Select options"),
            dummy,
            overrideMapLocation,
            selectLocation
        ]);
        this.Value = dummy.GetValue().map((disableMaps) => {
            return {
                pages,
                options: <SvgToPdfOptions>{
                    disableMaps,
                    getFreeDiv,
                    overrideLocation: overrideMapLocation.GetValue().data ? locationInput.location.data : undefined
                }
            }
        }, [overrideMapLocation.GetValue(), locationInput.location])
        this.IsValid = new ImmutableStore(true)
    }

}

class PreparePdf extends Combine implements FlowStep<{ svgToPdf: SvgToPdf, languages: string[] }> {
    readonly IsValid: Store<boolean>;
    readonly Value: Store<{ svgToPdf: SvgToPdf, languages: string[] }>;

    constructor(pages: string[], options: SvgToPdfOptions) {
        const svgToPdf = new SvgToPdf(pages, options)
        const languageOptions = [
            new FixedInputElement("Nederlands", "nl"),
            new FixedInputElement("English", "en")
        ]
        const languages = new CheckBoxes(languageOptions)

        const isPrepared = UIEventSource.FromPromiseWithErr(svgToPdf.Prepare())

        super([
            new Title("Select languages..."),
            languages,
            new Toggle(
                new Loading("Preparing maps..."),
                undefined,
                isPrepared.map(p => p === undefined)
            )
        ]);
        this.Value = isPrepared.map(isPrepped => {
            if (isPrepped === undefined) {
                return undefined
            }
            if (isPrepped["success"] !== undefined) {
                const svgToPdf = isPrepped["success"]
                const langs = languages.GetValue().data.map(i => languageOptions[i].GetValue().data)
                return {svgToPdf, languages: langs}
            }
            return undefined;
        },  [languages.GetValue()])
        this.IsValid = this.Value.map(v => v !== undefined)
    }

}


class SavePdf extends Combine {

    constructor(svgToPdf: SvgToPdf, languages: string[]) {

        super([
            new Title("Generating your pdfs..."),
            new List(languages.map(lng => new Toggle(
                lng + " is done!",
                new Loading("Creating pdf for " + lng),
                UIEventSource.FromPromiseWithErr(svgToPdf.ConvertSvg("Template" + "_" + lng + ".pdf", lng).then(() => true))
                    .map(x => x !== undefined && x["success"] === true)
            )))
        ]);
    }
}

const {flow, furthestStep, titles} = FlowPanelFactory.start(
    new Title("Select template"), new SelectTemplate()
).then(new Title("Select options"), (pages) => new SelectPdfOptions(pages, createElement))
    .then("Generate maps...", ({pages, options}) => new PreparePdf(pages, options))
    .finish("Generating...", ({svgToPdf, languages}) => new SavePdf(svgToPdf, languages))

const toc = new List(
    titles.map(
        (title, i) =>
            new VariableUiElement(
                furthestStep.map((currentStep) => {
                    if (i > currentStep) {
                        return new Combine([title]).SetClass("subtle")
                    }
                    if (i == currentStep) {
                        return new Combine([title]).SetClass("font-bold")
                    }
                    if (i < currentStep) {
                        return title
                    }
                })
            )
    ),
    true
)

const leftContents: BaseUIElement[] = [
    toc
].map((el) => el?.SetClass("pl-4"))

new LeftIndex(leftContents, flow).AttachTo("maindiv")
// main().then(() => console.log("Done!"))
