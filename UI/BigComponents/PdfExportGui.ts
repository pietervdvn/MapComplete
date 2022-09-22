import Combine from "../Base/Combine";
import {FlowPanelFactory, FlowStep} from "../ImportFlow/FlowStep";
import {ImmutableStore, Store, UIEventSource} from "../../Logic/UIEventSource";
import {InputElement} from "../Input/InputElement";
import {SvgToPdf, SvgToPdfOptions} from "../../Utils/svgToPdf";
import {FixedInputElement} from "../Input/FixedInputElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import FileSelectorButton from "../Input/FileSelectorButton";
import InputElementMap from "../Input/InputElementMap";
import {RadioButton} from "../Input/RadioButton";
import {Utils} from "../../Utils";
import {VariableUiElement} from "../Base/VariableUIElement";
import Loading from "../Base/Loading";
import BaseUIElement from "../BaseUIElement";
import Img from "../Base/Img";
import Title from "../Base/Title";
import CheckBoxes, {CheckBox} from "../Input/Checkboxes";
import Minimap from "../Base/Minimap";
import SearchAndGo from "./SearchAndGo";
import Toggle from "../Input/Toggle";
import List from "../Base/List";
import LeftIndex from "../Base/LeftIndex";
import Constants from "../../Models/Constants";
import Toggleable from "../Base/Toggleable";
import Lazy from "../Base/Lazy";
import LinkToWeblate from "../Base/LinkToWeblate";
import Link from "../Base/Link";
import {SearchablePillsSelector} from "../Input/SearchableMappingsSelector";
import * as languages from "../../assets/language_translations.json"
import {Translation} from "../i18n/Translation";

class SelectTemplate extends Combine implements FlowStep<{ title: string, pages: string[] }> {
    readonly IsValid: Store<boolean>;
    readonly Value: Store<{ title: string, pages: string[] }>;

    constructor() {
        const elements: InputElement<{ templateName: string, pages: string[] }>[] = []
        for (const templateName in SvgToPdf.templates) {
            const template = SvgToPdf.templates[templateName]
            elements.push(new FixedInputElement(
                new Combine([new FixedUiElement(templateName).SetClass("font-bold pr-2"),
                    template.description
                ])
                , new UIEventSource({templateName, pages: template.pages})))
        }

        const file = new FileSelectorButton(new FixedUiElement("Select an svg image which acts as template"), {
            acceptType: "image/svg+xml",
            allowMultiple: true
        })
        const fileMapped = new InputElementMap<FileList, { templateName: string, pages: string[], fromFile: true }>(file, (x0, x1) => x0 === x1,
            (filelist) => {
                if (filelist === undefined) {
                    return undefined;
                }
                const pages = []
                let templateName: string = undefined;
                for (const file of Array.from(filelist)) {

                    if (templateName == undefined) {
                        templateName = file.name.substring(file.name.lastIndexOf("/") + 1)
                        templateName = templateName.substring(0, templateName.lastIndexOf("."))
                    }
                    pages.push(file.text())
                }

                return {
                    templateName,
                    pages,
                    fromFile: true
                }

            },
            _ => undefined
        )
        elements.push(fileMapped)
        const radio = new RadioButton(elements, {selectFirstAsDefault: true})

        const loaded: Store<{ success: { title: string, pages: string[] } } | { error: any }> = radio.GetValue().bind(template => {
            if (template === undefined) {
                return undefined
            }
            if (template["fromFile"]) {
                return UIEventSource.FromPromiseWithErr(Promise.all(template.pages).then(pages => ({
                    title: template.templateName,
                    pages
                })))
            }
            const urls = template.pages.map(p => SelectTemplate.ToUrl(p))
            const dloadAll: Promise<{ title: string, pages: string[] }> = Promise.all(urls.map(url => Utils.download(url))).then(pages => ({
                pages,
                title: template.templateName
            }))

            return UIEventSource.FromPromiseWithErr(dloadAll)
        })
        const preview = new VariableUiElement(
            loaded.map(pages => {
                if (pages === undefined) {
                    return new Loading()
                }
                if (pages["error"] !== undefined) {
                    return new FixedUiElement("Loading preview failed: " + pages["err"]).SetClass("alert")
                }
                const svgs = pages["success"].pages
                if (svgs.length === 0) {
                    return new FixedUiElement("No pages loaded...").SetClass("alert")
                }
                const els: BaseUIElement[] = []
                for (const pageSrc of svgs) {
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
        let path = window.location.pathname
        path = path.substring(0, path.lastIndexOf("/"))
        return window.location.protocol + "//" + window.location.host + path + "/" + spec
    }

}

class SelectPdfOptions extends Combine implements FlowStep<{ title: string, pages: string[], options: SvgToPdfOptions }> {
    readonly IsValid: Store<boolean>;
    readonly Value: Store<{ title: string, pages: string[], options: SvgToPdfOptions }>;

    constructor(title: string, pages: string[], getFreeDiv: () => string) {
        const dummy = new CheckBox("Don't add data to the map (to quickly preview the PDF)", false)
        const overrideMapLocation = new CheckBox("Override map location: use a selected location instead of the location set in the template", false)
        const locationInput = Minimap.createMiniMap().SetClass("block w-full")
        const searchField = new SearchAndGo({leafletMap: locationInput.leafletMap})
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
                title,
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

    constructor(title: string, pages: string[], options: SvgToPdfOptions) {
        const svgToPdf = new SvgToPdf(title, pages, options)
        const languageOptions = [
            new FixedInputElement("Nederlands", "nl"),
            new FixedInputElement("English", "en")
        ]
        const langs: string[] = Array.from(Object.keys(languages["default"] ?? languages))
        console.log("Available languages are:",langs)
        const languageSelector = new SearchablePillsSelector(
            langs.map(l => ({
                show: new Translation(languages[l]),
                value: l,
                mainTerm: languages[l]
            })), {
                mode: "select-many"
            }
        )

        const isPrepared = UIEventSource.FromPromiseWithErr(svgToPdf.Prepare())

        super([
            new Title("Select languages..."),
            languageSelector,
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
                const langs = languageSelector.GetValue().data
                console.log("Languages are", langs)
                if (langs.length === 0) {
                    return undefined
                }
                return {svgToPdf, languages: langs}
            }
            return undefined;
        }, [languageSelector.GetValue()])
        this.IsValid = this.Value.map(v => v !== undefined)
    }

}

class InspectStrings extends Toggle implements FlowStep<{ svgToPdf: SvgToPdf, languages: string[] }> {
    readonly IsValid: Store<boolean>;
    readonly Value: Store<{ svgToPdf: SvgToPdf; languages: string[] }>;

    constructor(svgToPdf: SvgToPdf, languages: string[]) {

        const didLoadLanguages = UIEventSource.FromPromiseWithErr(svgToPdf.PrepareLanguages(languages)).map(l => l !== undefined && l["success"] !== undefined)

        super(new Combine([
                new Title("Inspect translation strings"),
                ...languages.map(l => new Lazy(() => InspectStrings.createOverviewPanel(svgToPdf, l)))
            ]),
            new Loading(),
            didLoadLanguages
        );
        this.Value = new ImmutableStore({svgToPdf, languages})
        this.IsValid = didLoadLanguages
    }

    private static createOverviewPanel(svgToPdf: SvgToPdf, language: string): BaseUIElement {
        const elements: BaseUIElement[] = []

        for (const translationKey of Array.from(svgToPdf.translationKeys())) {
            let spec = translationKey
            if (translationKey.startsWith("layer.")) {
                spec = "layers:" + translationKey.substring(6)
            } else {
                spec = "core:" + translationKey
            }
            elements.push(new Combine([
                new Link(spec, LinkToWeblate.hrefToWeblate(language, spec), true).SetClass("font-bold link-underline"),
                "&nbsp;",
                svgToPdf.getTranslation("$" + translationKey, language, true) ?? new FixedUiElement("No translation found!").SetClass("alert")

            ]))
        }

        return new Toggleable(
            new Title("Translations for " + language),
            new Combine(["The following keys are used:",
                new List(elements)
            ]),
            {closeOnClick: false, height: "15rem"})
    }

}

class SavePdf extends Combine {

    constructor(svgToPdf: SvgToPdf, languages: string[]) {

        super([
            new Title("Generating your pdfs..."),
            new List(languages.map(lng => new Toggle(
                lng + " is done!",
                new Loading("Creating pdf for " + lng),
                UIEventSource.FromPromiseWithErr(svgToPdf.ConvertSvg(lng).then(() => true))
                    .map(x => x !== undefined && x["success"] === true)
            )))
        ]);
    }
}

export class PdfExportGui extends LeftIndex {


    constructor(freeDivId: string) {

        let i = 0
        const createDiv = (): string => {
            const div = document.createElement("div")
            div.id = "freediv-" + (i++)
            document.getElementById(freeDivId).append(div)
            return div.id
        }

        Constants.defaultOverpassUrls.splice(0, 1)
        const {flow, furthestStep, titles} = FlowPanelFactory.start(
            new Title("Select template"), new SelectTemplate()
        ).then(new Title("Select options"), ({title, pages}) => new SelectPdfOptions(title, pages, createDiv))
            .then("Generate maps...", ({title, pages, options}) => new PreparePdf(title, pages, options))
            .then("Inspect translations", (({svgToPdf, languages}) => new InspectStrings(svgToPdf, languages)))
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

        super(leftContents, flow)
    }
}
