import Combine from "./Combine";
import BaseUIElement from "../BaseUIElement";
import {Translation} from "../i18n/Translation";
import {FixedUiElement} from "./FixedUiElement";
import Title from "./Title";
import List from "./List";
import Hash from "../../Logic/Web/Hash";
import Link from "./Link";
import {Utils} from "../../Utils";

export default class TableOfContents extends Combine {

    private readonly titles: Title[]

    constructor(elements: Combine | Title[], options?: {
        noTopLevel: false | boolean,
        maxDepth?: number
    }) {
        let titles: Title[]
        if (elements instanceof Combine) {
            titles = TableOfContents.getTitles(elements.getElements()) ?? []
        } else {
            titles = elements ?? []
        }

        let els: { level: number, content: BaseUIElement }[] = []
        for (const title of titles) {
            let content: BaseUIElement
            console.log("Constructing content for ", title)
            if (title.title instanceof Translation) {
                content = title.title.Clone()
            } else if (title.title instanceof FixedUiElement) {
                content = new FixedUiElement(title.title.content)
            } else if (Utils.runningFromConsole) {
                content = new FixedUiElement(title.AsMarkdown())
            } else if (title["title"] !== undefined) {
                content = new FixedUiElement(title.title.ConstructElement().innerText)
            } else {
                console.log("Not generating a title for ", title)
                continue
            }

            const vis = new Link(content, "#" + title.id)

            Hash.hash.addCallbackAndRun(h => {
                if (h === title.id) {
                    vis.SetClass("font-bold")
                } else {
                    vis.RemoveClass("font-bold")
                }
            })
            els.push({level: title.level, content: vis})

        }
        const minLevel = Math.min(...els.map(e => e.level))
        if (options?.noTopLevel) {
            els = els.filter(e => e.level !== minLevel)
        }

        if (options?.maxDepth) {
            els = els.filter(e => e.level <= (options.maxDepth + minLevel))
        }


        super(TableOfContents.mergeLevel(els).map(el => el.SetClass("mt-2")));
        this.SetClass("flex flex-col")
        this.titles = titles;
    }

    private static getTitles(elements: BaseUIElement[]): Title[] {
        const titles = []
        for (const uiElement of elements) {
            if (uiElement instanceof Combine) {
                titles.push(...TableOfContents.getTitles(uiElement.getElements()))
            } else if (uiElement instanceof Title) {
                titles.push(uiElement)
            }
        }
        return titles
    }

    private static mergeLevel(elements: { level: number, content: BaseUIElement }[]): BaseUIElement[] {
        const maxLevel = Math.max(...elements.map(e => e.level))
        const minLevel = Math.min(...elements.map(e => e.level))
        if (maxLevel === minLevel) {
            return elements.map(e => e.content)
        }
        const result: { level: number, content: BaseUIElement } [] = []
        let running: BaseUIElement[] = []
        for (const element of elements) {
            if (element.level === maxLevel) {
                running.push(element.content)
                continue
            }
            if (running.length !== undefined) {
                result.push({
                    content: new List(running),
                    level: maxLevel - 1
                })
                running = []
            }
            result.push(element)
        }
        if (running.length !== undefined) {
            result.push({
                content: new List(running),
                level: maxLevel - 1
            })
        }

        return TableOfContents.mergeLevel(result)
    }

    AsMarkdown(): string {
        const depthIcons = ["1.", "  -", "    +", "      *"]
        const lines = ["## Table of contents\n"];
        const minLevel = Math.min(...this.titles.map(t => t.level))
        for (const title of this.titles) {
            const prefix = depthIcons[title.level - minLevel] ?? "        ~"
            const text = title.title.AsMarkdown().replace("\n", "")
            const link = title.id
            lines.push(prefix + " [" + text + "](#" + link + ")")
        }

        return lines.join("\n") + "\n\n"
    }
}