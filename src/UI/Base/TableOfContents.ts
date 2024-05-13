import BaseUIElement from "../BaseUIElement"
import List from "./List"
import { marked } from "marked"
import { parse as parse_html } from "node-html-parser"
import { default as turndown } from "turndown"
import { Utils } from "../../Utils"

export default class TableOfContents {


    private static asLinkableId(text: string): string {
        return text
            ?.replace(/ /g, "-")
            ?.replace(/[?#.;:/]/, "")
            ?.toLowerCase() ?? ""
    }

    private static mergeLevel(
        elements: { level: number; content: BaseUIElement }[]
    ): BaseUIElement[] {
        const maxLevel = Math.max(...elements.map((e) => e.level))
        const minLevel = Math.min(...elements.map((e) => e.level))
        if (maxLevel === minLevel) {
            return elements.map((e) => e.content)
        }
        const result: { level: number; content: BaseUIElement }[] = []
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

    public static insertTocIntoMd(md: string): string {
        const htmlSource = <string>marked.parse(md)
        const el = parse_html(htmlSource)
        const structure = TableOfContents.generateStructure(<any>el)
        const firstTitle = structure[1]
        let minDepth = undefined
        do {
            minDepth = Math.min(...structure.map(s => s.depth))
            const minDepthCount = structure.filter(s => s.depth === minDepth)
            if (minDepthCount.length > 1) {
                break
            }
            // Erase a single top level heading
            structure.splice(structure.findIndex(s => s.depth === minDepth), 1)
        } while (structure.length > 0)

        if (structure.length <= 1) {
            return md
        }
        const separators = {
            1: "  -",
            2: "    +",
            3: "       *"
        }

        let toc = ""
        let topLevelCount = 0
        for (const el of structure) {
            const depthDiff = el.depth - minDepth
            const link = `[${el.title}](#${TableOfContents.asLinkableId(el.title)})`
            if (depthDiff === 0) {
                topLevelCount++
                toc += `${topLevelCount}. ${link}\n`
            } else if (depthDiff <= 3) {
                toc += `${separators[depthDiff]} ${link}\n`
            }
        }

        const heading = Utils.Times(() => "#", firstTitle.depth)
        toc = heading + " Table of contents\n\n" + toc

        const firstTitleIndex = md.indexOf(firstTitle.title)

        const intro = md.substring(0, firstTitleIndex)
        const splitPoint = intro.lastIndexOf("\n")

        return md.substring(0, splitPoint) + toc + md.substring(splitPoint)

    }

    public static generateStructure(html: Element): { depth: number, title: string, el: Element }[] {
        if (html === undefined) {
            return []
        }
        return [].concat(...Array.from(html.childNodes ?? []).map(
            child => {
                const tag: string = child["tagName"]?.toLowerCase()
                if (!tag) {
                    return []
                }
                if (tag.match(/h[0-9]/)) {
                    const depth = Number(tag.substring(1))
                    return [{ depth, title: child.textContent, el: child }]
                }
                return TableOfContents.generateStructure(<Element>child)
            }
        ))
    }
}
