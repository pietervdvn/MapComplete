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
    private static readonly _docs: UIEventSource<
        {
            key: { ctrl?: string; shift?: string; alt?: string; nomod?: string; onUp?: boolean }
            documentation: string | Translation
        }[]
    > = new UIEventSource<
        {
            key: { ctrl?: string; shift?: string; alt?: string; nomod?: string; onUp?: boolean }
            documentation: string | Translation
        }[]
    >([])

    private static textElementSelected(): boolean {
        return ["input", "textarea"].includes(document?.activeElement?.tagName?.toLowerCase())
    }
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
        action: () => void
    ) {
        const type = key["onUp"] ? "keyup" : "keypress"
        let keycode: string = key["ctrl"] ?? key["shift"] ?? key["alt"] ?? key["nomod"]
        if (keycode.length == 1) {
            keycode = keycode.toLowerCase()
            if (key["shift"] !== undefined) {
                keycode = keycode.toUpperCase()
            }
        }

        this._docs.data.push({ key, documentation })
        this._docs.ping()
        if (Utils.runningFromConsole) {
            return
        }
        if (key["ctrl"] !== undefined) {
            document.addEventListener("keydown", function (event) {
                if (event.ctrlKey && event.key === keycode) {
                    action()
                    event.preventDefault()
                }
            })
        } else if (key["shift"] !== undefined) {
            document.addEventListener(type, function (event) {
                if (Hotkeys.textElementSelected()) {
                    // A text element is selected, we don't do anything special
                    return
                }
                if (event.shiftKey && event.key === keycode) {
                    action()
                    event.preventDefault()
                }
            })
        } else if (key["alt"] !== undefined) {
            document.addEventListener(type, function (event) {
                if (event.altKey && event.key === keycode) {
                    action()
                    event.preventDefault()
                }
            })
        } else if (key["nomod"] !== undefined) {
            document.addEventListener(type, function (event) {
                if (Hotkeys.textElementSelected()) {
                    // A text element is selected, we don't do anything special
                    return
                }
                if (event.key === keycode) {
                    action()
                    event.preventDefault()
                }
            })
        }
    }

    static generateDocumentation(): BaseUIElement {
        const byKey: [string, string | Translation][] = Hotkeys._docs.data
            .map(({ key, documentation }) => {
                const modifiers = Object.keys(key).filter((k) => k !== "nomod" && k !== "onUp")
                const keycode: string = key["ctrl"] ?? key["shift"] ?? key["alt"] ?? key["nomod"]
                modifiers.push(keycode)
                return <[string, string | Translation]>[modifiers.join("+"), documentation]
            })
            .sort()
        const t = Translations.t.hotkeyDocumentation
        return new Combine([
            new Title(t.title, 1),
            t.intro,
            new Table(
                [t.key, t.action],
                byKey.map(([key, doc]) => {
                    return [new FixedUiElement(key).SetClass("code"), doc]
                })
            ),
        ])
    }

    static generateDocumentationDynamic(): BaseUIElement {
        return new VariableUiElement(Hotkeys._docs.map((_) => Hotkeys.generateDocumentation()))
    }
}
