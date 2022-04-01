import {Utils} from "../Utils";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import TranslatorsPanel from "../UI/BigComponents/TranslatorsPanel";
import * as languages from "../assets/generated/used_languages.json"
{
    const usedLanguages = languages.languages
    
    // Some statistics
    console.log(Utils.FixedLength("", 12) + " " + usedLanguages.map(l => Utils.FixedLength(l, 6)).join(""))
    const all = new Map<string, number[]>()

    usedLanguages.forEach(ln => all.set(ln, []))

    for (const layoutId of Array.from(AllKnownLayouts.allKnownLayouts.keys())) {
        const layout = AllKnownLayouts.allKnownLayouts.get(layoutId)
        if(layout.hideFromOverview){
            continue
        }
        const {completeness, total} = TranslatorsPanel.MissingTranslationsFor(layout)
        process.stdout.write(Utils.FixedLength(layout.id, 12) + " ")
        for (const language of usedLanguages) {
            const compl = completeness.get(language)
            all.get(language).push((compl ?? 0) / total)
            if (compl === undefined) {
                process.stdout.write("      ")
                continue
            }
            const percentage = Math.round(100 * compl / total)
            process.stdout.write(Utils.FixedLength(percentage + "%", 6))
        }
        process.stdout.write("\n")
    }

    process.stdout.write(Utils.FixedLength("average", 12) + " ")
    for (const language of usedLanguages) {
        const ratios = all.get(language)
        let sum = 0
        ratios.forEach(x => sum += x)
        const percentage = Math.round(100 * (sum / ratios.length))
        process.stdout.write(Utils.FixedLength(percentage + "%", 6))
    }
    process.stdout.write("\n")
    console.log(Utils.FixedLength("", 12) + " " + usedLanguages.map(l => Utils.FixedLength(l, 6)).join(""))
}