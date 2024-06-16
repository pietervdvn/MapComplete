import Script from "./Script"
import { Server } from "./server"
import ScriptUtils from "./ScriptUtils"

class OpenProxy extends Script {
    constructor() {
        super(
            "Allows any MapComplete-related domain to access the open internet via the proxy. No caching is done"
        )
    }
    async main(args: string[]): Promise<void> {
        new Server(1237, {}, [
            {
                mustMatch: "json",
                mimetype: "application/json",
                handle: async (_, params) => {
                    const url = decodeURIComponent(params.get("url"))
                    let content = await ScriptUtils.Download(url)
                    while (content["redirect"]) {
                        content = await ScriptUtils.Download(content["redirect"])
                    }
                    return content["content"]
                },
            },
        ])
    }
}

new OpenProxy().run()
