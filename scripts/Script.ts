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
        this.main(args)
            .then((_) => console.log("All done"))
            .catch((e) => console.log("ERROR:", e))
    }

    public printHelp() {
        console.log(this._docs)
    }
}
