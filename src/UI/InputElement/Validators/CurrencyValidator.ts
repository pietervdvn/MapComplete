import { Validator } from "../Validator"
import { Utils } from "../../../Utils"

export default class CurrencyValidator extends Validator {
    private readonly segmenter: Intl.Segmenter
    private readonly symbolToCurrencyMapping: Map<string, string>
    private readonly supportedCurrencies: Set<string>

    constructor() {
        super("currency", "Validates monetary amounts")
        if (Intl.Segmenter === undefined || Utils.runningFromConsole) {
            // Librewolf doesn't support this
            return
        }
        let locale = "en-US"
        if(!Utils.runningFromConsole){
             locale??= navigator.language
        }
        this.segmenter = new Intl.Segmenter(locale, {
            granularity: "word"
        })

        const mapping: Map<string, string> = new Map<string, string>()
        const supportedCurrencies: Set<string> = new Set(Intl.supportedValuesOf("currency"))
        this.supportedCurrencies = supportedCurrencies
        for (const currency of supportedCurrencies) {
            const symbol = (0).toLocaleString(
                locale,
                {
                    style: "currency",
                    currency: currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }
            ).replace(/\d/g, "").trim()

            mapping.set(symbol.toLowerCase(), currency)
        }
        this.symbolToCurrencyMapping = mapping
    }

    reformat(s: string): string {
        if (!this.segmenter) {
            return s
        }

        const parts = Array.from(this.segmenter.segment(s)).map(i => i.segment).filter(part => part.trim().length > 0)
        if(parts.length !== 2){
            return s
        }
        const mapping = this.symbolToCurrencyMapping
        let currency: string = undefined
        let amount = undefined
        for (const part of parts) {
            const lc = part.toLowerCase()
            if (this.supportedCurrencies.has(part.toUpperCase())) {
                currency = part.toUpperCase()
                continue
            }

            if (mapping.has(lc)) {
                currency = mapping.get(lc)
                continue
            }
            amount = part
        }
        if(amount === undefined || currency === undefined){
            return s
        }

        return amount+" "+currency
    }
}
