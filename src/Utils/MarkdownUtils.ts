export default class MarkdownUtils {
    public static table(header: string[], contents: string[][]) {
        let result = ""

        result += "\n\n| " + header.join(" | ") + " |\n"
        result += header.map(() => "-----").join("|") + " |\n"
        for (const line of contents) {
            if (!line) {
                continue
            }
            result += "| " + line.map((x) => x ?? "").join(" | ") + " |\n"
        }
        result += "\n\n"
        return result
    }

    static list(strings: string[]): string {
        if(strings.length === 0){
            return ""
        }
        return "\n\n"+strings.map((item) => " - " + item).join("\n")+"\n\n"
    }
}
