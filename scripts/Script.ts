import ScriptUtils from "./ScriptUtils"

export default abstract class Script {
    private readonly _docs: string

    constructor(docs: string) {
        this._docs = docs
    }

    abstract main(args: string[]): Promise<void>

    public run(): void {
        ScriptUtils.fixUtils()
        const args = [...process.argv]
        args.splice(0, 2)
        const start = new Date()
        this.main(args)
            .then((_) => {
                const end = new Date()
                const millisNeeded = end.getTime() - start.getTime()

                const green = (s) => "\x1b[92m" + s + "\x1b[0m"
                console.log(green("All done! (" + millisNeeded + " ms)"))
            })
            .catch((e) => console.log("ERROR:", e))
    }

    public printHelp() {
        console.log(this._docs)
    }
}
