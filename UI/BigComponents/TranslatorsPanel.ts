import Toggle from "../Input/Toggle";
import Lazy from "../Base/Lazy";
import {Utils} from "../../Utils";
import Translations from "../i18n/Translations";
import Combine from "../Base/Combine";
import Locale from "../i18n/Locale";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {Translation} from "../i18n/Translation";
import {VariableUiElement} from "../Base/VariableUIElement";
import Link from "../Base/Link";
import LinkToWeblate from "../Base/LinkToWeblate";
import Toggleable from "../Base/Toggleable";
import Title from "../Base/Title";
import {UIEventSource} from "../../Logic/UIEventSource";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";


class TranslatorsPanelContent extends Combine {
    constructor(layout: LayoutConfig, isTranslator: UIEventSource<boolean>) {
        const t = Translations.t.translations
        const completeness = new Map<string, number>()
        let total = 0
        const untranslated = new Map<string, string[]>()
        Utils.WalkObject(layout, (o, path) => {
            const translation = <Translation><any>o;
            for (const lang of translation.SupportedLanguages()) {
                completeness.set(lang, 1 + (completeness.get(lang) ?? 0))
            }
            layout.title.SupportedLanguages().forEach(ln => {
                const trans = translation.translations
                if (trans["*"] !== undefined) {
                    return;
                }
                if (trans[ln] === undefined) {
                    if (!untranslated.has(ln)) {
                        untranslated.set(ln, [])
                    }
                    untranslated.get(ln).push(translation.context)
                }
            })
            if(translation.translations["*"] === undefined){
                total++
            }
        }, o => {
            if (o === undefined || o === null) {
                return false;
            }
            return o instanceof Translation;
        })


        const seed = t.completeness
        for (const ln of Array.from(completeness.keys())) {
            if(ln === "*"){
                continue
            }
            if (seed.translations[ln] === undefined) {
                seed.translations[ln] = seed.translations["en"]
            }
        }
        
        const completenessTr = {}
        const completenessPercentage = {}
        seed.SupportedLanguages().forEach(ln => {
            completenessTr[ln] = ""+(completeness.get(ln) ?? 0)
            completenessPercentage[ln] = ""+Math.round(100 * (completeness.get(ln) ?? 0) / total)
        })
        
        // "translationCompleteness": "Translations for {theme} in {language} are at {percentage}: {translated} out of {total}",
        const translated = seed.Subs({total, theme: layout.title,
        percentage: new Translation(completenessPercentage),
            translated: new Translation(completenessTr)
        })

        const missingTranslationsFor = (ln: string) => Utils.NoNull(untranslated.get(ln) ?? [])
            .filter(ctx => ctx.indexOf(':') > 0)
            .map(ctx => ctx.replace(/note_import_[a-zA-Z0-9_]*/, "note_import"))
            .map(context => new Link(context, LinkToWeblate.hrefToWeblate(ln, context), true))

        const disable = new SubtleButton(undefined, t.deactivate)
            .onClick(() => {
                Locale.showLinkToWeblate.setData(false)
            })

        super([
            new Title(
            Translations.t.translations.activateButton,
            ),
            new Toggle(t.isTranslator.SetClass("thanks block"), undefined, isTranslator),
            t.help,
            translated,
            disable,
            new VariableUiElement(Locale.language.map(ln => {

                const missing = missingTranslationsFor(ln)
                if (missing.length === 0) {
                    return undefined
                }
                return new Toggleable(
                    new Title(Translations.t.translations.missing.Subs({count: missing.length})),
                    new Combine(missing).SetClass("flex flex-col")
                )
            }))
        ])

    }
}

export default class TranslatorsPanel extends Toggle {

    
    constructor(state: { layoutToUse: LayoutConfig, isTranslator: UIEventSource<boolean> }, iconStyle?: string) {
        const t = Translations.t.translations
        super(
                new Lazy(() => new TranslatorsPanelContent(state.layoutToUse, state.isTranslator)
            ).SetClass("flex flex-col"),
            new SubtleButton(Svg.translate_ui().SetStyle(iconStyle), t.activateButton).onClick(() => Locale.showLinkToWeblate.setData(true)),
            Locale.showLinkToWeblate 
        )
        this.SetClass("hidden-on-mobile")
        
    }
}
