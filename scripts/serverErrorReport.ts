import { Handler, Server } from "./server"
import Script from "./Script"
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { mkdir } from "node:fs"
import ScriptUtils from "./ScriptUtils"
import { IncomingMessage } from "node:http"

class ServerErrorReport extends Script {

    private errorReport = 0

    constructor() {
        super("A server which receives and logs error reports")
    }

    private getFilename(logDirectory: string, d: Date): string {
        return logDirectory +
            "/" +
            d.getUTCFullYear() +
            "_" +
            (d.getUTCMonth() + 1) +
            "_" +
            d.getUTCDate() +
            ".lines.json"
    }

    public reportError(path: string, queryParams: URLSearchParams, req: IncomingMessage, body: string | undefined, logDirectory: string) {
        if (!body) {
            throw "{\"error\": \"No body; use a post request\"}"
        }
        console.log(body)
        const ip = <string>req.headers["x-forwarded-for"]

        try {
            body = JSON.parse(body)
        } catch (e) {
            // could not parse, we'll save it as is
        }
        const d = new Date()
        const file = this.getFilename(logDirectory, d)
        const date = d.toISOString()
        const contents =
            "\n" + JSON.stringify({ ip, index: this.errorReport, date, message: body })
        if (!existsSync(file)) {
            writeFileSync(file, contents)
        } else {
            appendFileSync(file, contents)
        }
       this. errorReport++
        return `{"status":"ok", "nr": ${this.errorReport}}`
    }

    async main(args: string[]): Promise<void> {
        const logDirectory = args[0] ?? "./error_logs"
        console.log("Logging to directory", logDirectory)
        if (!existsSync(logDirectory)) {
            mkdirSync(logDirectory)
            console.log("Created this directory")
        }

        if (!existsSync(logDirectory+"/csp")) {
            mkdirSync(logDirectory+"/csp")
            console.log("Created this directory")
        }

        new Server(2348, {}, [
            {
                mustMatch: "status",
                mimetype: "application/json",
                handle: async () => {
                    const filename = this.getFilename(logDirectory, new Date())
                    let errorsToday = 0
                    if (existsSync(filename)) {
                        const contents = readFileSync(filename, "utf8")
                        errorsToday = contents.split("\n").length
                    }
                    return JSON.stringify({
                        "online": true,
                        "errors_today": errorsToday,
                    })
                },
            },
            {
                mustMatch: "report",
                mimetype: "application/json",
                handle(path: string, queryParams: URLSearchParams, req: IncomingMessage, body: string | undefined) {
                    return this.reportError(queryParams, req, body, logDirectory)
                },
            },
            {
                mustMatch: "csp",
                mimetype: "application/json",
                handle(path: string, queryParams: URLSearchParams, req: IncomingMessage, body: string | undefined) {
                    return this.reportError(queryParams, req, body, logDirectory+"/csp")
                },
            },
        ])
    }
}

new ServerErrorReport().run()
