import { Utils } from "../../Utils"
import Combine from "./Combine"
import BaseUIElement from "../BaseUIElement"
import Title from "./Title"
import Table from "./Table"
import { UIEventSource } from "../../Logic/UIEventSource"
import { VariableUiElement } from "./VariableUIElement"

export default class Hotkeys {
    private static readonly _docs: UIEventSource<
        {
            key: { ctrl?: string; shift?: string; alt?: string; nomod?: string; onUp?: boolean }
            documentation: string
        }[]
    > = new UIEventSource<
        {
            key: { ctrl?: string; shift?: string; alt?: string; nomod?: string; onUp?: boolean }
            documentation: string
        }[]
    >([])
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
        documentation: string,
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
                if (event.key === keycode) {
                    action()
                    event.preventDefault()
                }
            })
        }
    }

    static generateDocumentation(): BaseUIElement {
        return new Combine([
            new Title("Hotkeys", 1),
            "MapComplete supports the following keys:",
            new Table(
                ["Key combination", "Action"],
                Hotkeys._docs.data
                    .map(({ key, documentation }) => {
                        const modifiers = Object.keys(key).filter(
                            (k) => k !== "nomod" && k !== "onUp"
                        )
                        const keycode: string =
                            key["ctrl"] ?? key["shift"] ?? key["alt"] ?? key["nomod"]
                        modifiers.push(keycode)
                        return [modifiers.join("+"), documentation]
                    })
                    .sort()
            ),
        ])
    }

    static generateDocumentationDynamic(): BaseUIElement {
        return new VariableUiElement(Hotkeys._docs.map((_) => Hotkeys.generateDocumentation()))
    }
}
