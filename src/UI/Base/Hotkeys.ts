import { Utils } from "../../Utils"
import Combine from "./Combine"
import BaseUIElement from "../BaseUIElement"
import Title from "./Title"
import Table from "./Table"
import { UIEventSource } from "../../Logic/UIEventSource"
import { VariableUiElement } from "./VariableUIElement"
import { Translation } from "../i18n/Translation"
import { FixedUiElement } from "./FixedUiElement"
import Translations from "../i18n/Translations"

export default class Hotkeys {
    public static readonly _docs: UIEventSource<
        {
            key: { ctrl?: string; shift?: string; alt?: string; nomod?: string; onUp?: boolean }
            documentation: string | Translation
            alsoTriggeredBy: Translation[]
        }[]
    > = new UIEventSource([])

    /**
     * Register a hotkey
     * @param key
     * @param documentation
     * @param action the function to run. It might return 'false', indicating that it didn't do anything and gives control back to the default flow
     * @constructor
     */
    public static RegisterHotkey(
        key: (
            | {
                  ctrl: string
              }
            | {
                  shift: string
              }
            | {
                  alt: string
              }
            | {
                  nomod: string
              }
        ) & {
            onUp?: boolean
        },
        documentation: string | Translation,
        action: () => void | false,
        alsoTriggeredBy?: Translation[]
    ) {
        const type = key["onUp"] ? "keyup" : "keypress"
        let keycode: string = key["ctrl"] ?? key["shift"] ?? key["alt"] ?? key["nomod"]
        if (keycode.length == 1) {
            keycode = keycode.toLowerCase()
            if (key["shift"] !== undefined) {
                keycode = keycode.toUpperCase()
            }
        }

        this._docs.data.push({ key, documentation, alsoTriggeredBy })
        this._docs.ping()
        if (Utils.runningFromConsole) {
            return
        }
        if (key["ctrl"] !== undefined) {
            document.addEventListener("keydown", function (event) {
                if (event.ctrlKey && event.key === keycode) {
                    if (action() !== false) {
                        event.preventDefault()
                    }
                }
            })
        } else if (key["shift"] !== undefined) {
            document.addEventListener(type, function (event) {
                if (Hotkeys.textElementSelected(event)) {
                    // A text element is selected, we don't do anything special
                    return
                }
                if (event.shiftKey && event.key === keycode) {
                    if (action() !== false) {
                        event.preventDefault()
                    }
                }
            })
        } else if (key["alt"] !== undefined) {
            document.addEventListener(type, function (event) {
                if (event.altKey && event.key === keycode) {
                    if (action() !== false) {
                        event.preventDefault()
                    }
                }
            })
        } else if (key["nomod"] !== undefined) {
            document.addEventListener(type, function (event) {
                if (Hotkeys.textElementSelected(event) && keycode !== "Escape") {
                    // A text element is selected, we don't do anything special
                    return
                }
                if (event.key === keycode) {
                    const result = action()
                    if (result !== false) {
                        event.preventDefault()
                    }
                }
            })
        }
    }

    static generateDocumentation(): BaseUIElement {
        return new VariableUiElement(
            Hotkeys._docs.mapD((docs) => {
                let byKey: [string, string | Translation, Translation[] | undefined][] = docs
                    .map(({ key, documentation, alsoTriggeredBy }) => {
                        const modifiers = Object.keys(key).filter(
                            (k) => k !== "nomod" && k !== "onUp"
                        )
                        let keycode: string =
                            key["ctrl"] ?? key["shift"] ?? key["alt"] ?? key["nomod"]
                        if (keycode.length == 1) {
                            keycode = keycode.toUpperCase()
                        }
                        if (keycode === " ") {
                            keycode = "Spacebar"
                        }
                        modifiers.push(keycode)
                        return <[string, string | Translation, Translation[] | undefined]>[
                            modifiers.join("+"),
                            documentation,
                            alsoTriggeredBy,
                        ]
                    })
                    .sort()
                byKey = Utils.NoNull(byKey)
                for (let i = byKey.length - 1; i > 0; i--) {
                    if (byKey[i - 1][0] === byKey[i][0]) {
                        byKey.splice(i, 1)
                    }
                }
                const t = Translations.t.hotkeyDocumentation
                return new Combine([
                    new Title(t.title, 1),
                    t.intro,
                    new Table(
                        [t.key, t.action],
                        byKey.map(([key, doc, alsoTriggeredBy]) => {
                            let keyEl: BaseUIElement = new FixedUiElement(key).SetClass(
                                "literal-code w-fit h-fit"
                            )
                            if (alsoTriggeredBy?.length > 0) {
                                keyEl = new Combine([keyEl, ...alsoTriggeredBy]).SetClass(
                                    "flex gap-x-4 items-center"
                                )
                            }
                            return [keyEl, doc]
                        })
                    ),
                ])
            })
        )
    }

    static generateDocumentationDynamic(): BaseUIElement {
        return new VariableUiElement(Hotkeys._docs.map((_) => Hotkeys.generateDocumentation()))
    }

    private static textElementSelected(event: KeyboardEvent): boolean {
        if (event.ctrlKey || event.altKey) {
            // This is an event with a modifier-key, lets not ignore it
            return false
        }
        if (event.key === "Escape") {
            return false // Another not-printable character that should not be ignored
        }
        return ["input", "textarea"].includes(document?.activeElement?.tagName?.toLowerCase())
    }
}
