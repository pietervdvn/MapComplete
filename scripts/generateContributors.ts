import { exec } from "child_process"
import { writeFileSync } from "fs"

interface Contributor {
    /**
     * The name of the contributor
     */
    contributor: string
    /**
     * The number of commits
     */
    commits: number
}

interface ContributorList {
    contributors: Contributor[]
}

function asList(hist: Map<string, number>): ContributorList {
    const ls: Contributor[] = []
    hist.forEach((commits, contributor) => {
        ls.push({ commits, contributor })
    })
    ls.sort((a, b) => b.commits - a.commits)
    return { contributors: ls }
}

function main() {
    exec("git log --pretty='%aN %%!%% %s' ", (_, stdout) => {
        const entries = stdout.split("\n").filter((str) => str !== "")
        const codeContributors = new Map<string, number>()
        const translationContributors = new Map<string, number>()
        for (const entry of entries) {
            console.log(entry)
            let [author, message] = entry.split("%!%").map((s) => s.trim())
            if (author === "Weblate") {
                continue
            }
            if (author === "pietervdvn") {
                author = "Pieter Vander Vennet"
            }
            let hist = codeContributors
            if (
                message.startsWith("Translated using Weblate") ||
                message.startsWith("Translated using Hosted Weblate")
            ) {
                hist = translationContributors
            }
            hist.set(author, 1 + (hist.get(author) ?? 0))
        }

        const codeContributorsTarget = "src/assets/contributors.json"
        writeFileSync(codeContributorsTarget, JSON.stringify(asList(codeContributors), null, "  "))
        const translatorsTarget = "src/assets/translators.json"
        writeFileSync(
            translatorsTarget,
            JSON.stringify(asList(translationContributors), null, "  ")
        )
    })
}

main()
