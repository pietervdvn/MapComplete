import {DropDown} from "./Input/DropDown";
import Locale from "./i18n/Locale";
import BaseUIElement from "./BaseUIElement";
import * as native from "../assets/language_native.json"
import * as language_translations from "../assets/language_translations.json"
import {Translation} from "./i18n/Translation";
import * as used_languages from "../assets/generated/used_languages.json"
import Lazy from "./Base/Lazy";
import Toggle from "./Input/Toggle";

export default class LanguagePicker {


    public static CreateLanguagePicker(
        languages: string[],
        label: string | BaseUIElement = "") : BaseUIElement{

        if (languages === undefined || languages.length <= 1) {
            return undefined;
        }
        
        const allLanguages : string[] = used_languages.languages;
        
        const normalPicker = LanguagePicker.dropdownFor(languages, label);
        const fullPicker = new Lazy(() => LanguagePicker.dropdownFor(allLanguages, label))
        return new Toggle(fullPicker, normalPicker, Locale.showLinkToWeblate)
    }
    
    private static dropdownFor(languages: string[], label: string | BaseUIElement): BaseUIElement {
       return new DropDown(label, languages.map(lang => {
                return {value: lang, shown: LanguagePicker.hybrid(lang) }
            }
        ), Locale.language)
    }

    private static hybrid(lang: string): Translation {
        const nativeText = native[lang] ?? lang
        const allTranslations =  (language_translations["default"] ?? language_translations)
        const translation = {}
        const trans =  allTranslations[lang]
        if(trans === undefined){
            return new Translation({"*": nativeText})
        }
        for (const key in trans) {
            const translationInKey = allTranslations[lang][key]
            if(nativeText.toLowerCase() === translationInKey.toLowerCase()){
                translation[key] = nativeText
            }else{
                translation[key] = nativeText + " ("+translationInKey+")"
            }
            
        }
        return new Translation(translation)
    } 


}