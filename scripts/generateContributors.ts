import {exec} from "child_process";
import {writeFile, writeFileSync} from "fs";

function asList(hist: Map<string, number>): {contributors: { contributor: string, commits: number }[]
}{
    const ls = []
    hist.forEach((commits, contributor) => {
        ls.push({commits, contributor})
    })
    ls.sort((a, b) => (b.commits - a.commits))
    return {contributors: ls}
}

function main() {
    exec("git log --pretty='%aN %%!%% %s' ", ((error, stdout, stderr) => {

        const entries = stdout.split("\n").filter(str => str !== "")
        const codeContributors = new Map<string, number>()
        const translationContributors = new Map<string, number>()
        for (const entry of entries) {
            console.log(entry)
            let [author, message] = entry.split("%!%").map(s => s.trim())
            if(author === "Weblate"){
                continue
            }
            if (author === "pietervdvn") {
                author = "Pieter Vander Vennet"
            }
            let hist = codeContributors;
            if (message.startsWith("Translated using Weblate")) {
                hist = translationContributors
            }
            hist.set(author, 1 + (hist.get(author) ?? 0))
        }
        
        const codeContributorsTarget = "assets/contributors.json"
        writeFileSync(codeContributorsTarget, JSON.stringify(asList(codeContributors)))
        const translatorsTarget = "assets/translators.json"
        writeFileSync(translatorsTarget, JSON.stringify(asList(translationContributors)))

    }));
}

main()