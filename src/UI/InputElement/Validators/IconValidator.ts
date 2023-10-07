import { Validator } from "../Validator"
import { Translation } from "../../i18n/Translation"
import licenses from "../../../assets/generated/license_info.json"
import { Utils } from "../../../Utils"

export default class IconValidator extends Validator {
    private static allLicenses = new Set(licenses.map((l) => l.path))
    private static allLicensesArr = Array.from(IconValidator.allLicenses)
    public static readonly isMeta = true
    constructor() {
        super("icon", "Makes sure that a valid .svg-path is added")
    }

    reformat(s: string, _?: () => string): string {
        return s.trim()
    }

    getFeedback(s: string, getCountry, sloppy?: boolean): Translation | undefined {
        s = this.reformat(s)
        if (!s.startsWith("http")) {
            if (!IconValidator.allLicenses.has(s)) {
                const close = sloppy
                    ? []
                    : Utils.sortedByLevenshteinDistance(
                          s.substring(s.lastIndexOf("/")),
                          IconValidator.allLicensesArr,
                          (s) => s.substring(s.lastIndexOf("/"))
                      ).slice(0, 5)
                return new Translation(
                    [
                        `Unkown builtin icon ${s}, perhaps you meant one of: <ul>`,
                        ...close.map(
                            (item) =>
                                `<li><span class="flex justify-start"> <img src='${item}' class="w-6 h-6"/>${item}</span></li>`
                        ),
                        "</ul>",
                    ].join("")
                )
            }
        }

        if (!s.endsWith(".svg")) {
            return new Translation("An icon should end with `.svg`")
        }
        return undefined
    }

    isValid(key: string, getCountry?: () => string): boolean {
        return this.getFeedback(key, getCountry, true) === undefined
    }
}
