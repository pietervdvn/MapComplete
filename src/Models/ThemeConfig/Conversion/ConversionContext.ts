import { ConversionMessage, ConversionMsgLevel } from "./Conversion"
import { Utils } from "../../../Utils"

export class ConversionContext {
    private static reported = false
    /**
     *  The path within the data structure where we are currently operating
     */
    readonly path: ReadonlyArray<string | number>
    /**
     * Some information about the current operation
     */
    readonly operation: ReadonlyArray<string>
    readonly messages: ConversionMessage[]
    private _hasErrors: boolean = false

    private constructor(
        messages: ConversionMessage[],
        path: ReadonlyArray<string | number>,
        operation?: ReadonlyArray<string>
    ) {
        this.path = path
        this.operation = operation ?? []
        // Messages is shared by reference amonst all 'context'-objects for performance
        this.messages = messages
        if (this.path.some((p) => typeof p === "object" || p === "[object Object]")) {
            throw "ConversionMessage: got an object as path entry:" + JSON.stringify(path)
        }
        if (this.path.some((p) => typeof p === "number" && p < 0)) {
            if (!ConversionContext.reported) {
                ConversionContext.reported = true
                console.trace("ConversionContext: got a path containing a negative number")
            }
        }
    }

    public static construct(path: (string | number)[], operation: string[]) {
        return new ConversionContext([], [...path], [...operation])
    }

    public static test(msg?: string) {
        return new ConversionContext([], msg ? [msg] : [], ["test"])
    }

    static print(msg: ConversionMessage) {
        const noString = msg.context.path.filter(
            (p) => typeof p !== "string" && typeof p !== "number"
        )
        if (noString.length > 0) {
            console.warn("Non-string value in path:", ...noString)
        }
        if (msg.level === "error") {
            console.error(
                ConversionContext.red("ERR "),
                msg.context.path.join("."),
                ConversionContext.red(msg.message),
                msg.context.operation.join(".")
            )
        } else if (msg.level === "warning") {
            console.warn(
                ConversionContext.red("<!> "),
                msg.context.path.join("."),
                ConversionContext.yellow(msg.message),
                msg.context.operation.join(".")
            )
        } else {
            console.log("    ", msg.context.path.join("."), msg.message)
        }
    }

    private static yellow(s) {
        return "\x1b[33m" + s + "\x1b[0m"
    }

    private static red(s) {
        return "\x1b[31m" + s + "\x1b[0m"
    }

    /**
     * Does an inline edit of the messages for which a new path is defined
     * This is a slight hack
     * @param rewritePath
     */
    public rewriteMessages(
        rewritePath: (
            p: ReadonlyArray<number | string>
        ) => undefined | ReadonlyArray<number | string>
    ): void {
        for (let i = 0; i < this.messages.length; i++) {
            const m = this.messages[i]
            const newPath = rewritePath(m.context.path)
            if (!newPath) {
                continue
            }
            const rewrittenContext = new ConversionContext(
                this.messages,
                newPath,
                m.context.operation
            )
            this.messages[i] = <ConversionMessage>{ ...m, context: rewrittenContext }
        }
    }

    public enter(key: string | number | (string | number)[]) {
        if (!Array.isArray(key)) {
            if (typeof key === "number" && key < 0) {
                console.trace("Invalid key")
                throw "Invalid key: <0"
            }
            return new ConversionContext(this.messages, [...this.path, key], this.operation)
        }
        return new ConversionContext(this.messages, [...this.path, ...key], this.operation)
    }

    public enters(...key: (string | number)[]) {
        return this.enter(key)
    }

    public inOperation(key: string) {
        return new ConversionContext(this.messages, this.path, [...this.operation, key])
    }

    warn(message: string) {
        this.messages.push({ context: this, level: "warning", message })
    }

    err(message: string) {
        this._hasErrors = true
        this.messages.push({ context: this, level: "error", message })
    }

    info(message: string) {
        this.messages.push({ context: this, level: "information", message })
    }

    getAll(mode: ConversionMsgLevel): ConversionMessage[] {
        return this.messages.filter((m) => m.level === mode)
    }

    public hasErrors() {
        if (this._hasErrors) {
            return true
        }
        const foundErr = this.messages?.find((m) => m.level === "error") !== undefined
        this._hasErrors = foundErr
        return foundErr
    }

    debug(message: string) {
        this.messages.push({ context: this, level: "debug", message })
    }

    /**
     * Exactly the same as Utils.Merge, except that it wraps the error message
     * @param source
     * @param target
     * @constructor
     */
    MergeObjectsForOverride<T, S>(source: Readonly<S>, target: T): T & S {
        try{
            return Utils.Merge(source,target)
        }catch (e) {
            this.err("Could not apply an override: due to "+e+"\n\tHINT: did you just pull changes from the repository or switch branches? Try 'npm run reset:layeroverview'")
        }
    }
}
