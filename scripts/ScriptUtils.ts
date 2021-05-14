import {lstatSync, readdirSync} from "fs";
import * as https from "https";

export default class ScriptUtils {
    public static readDirRecSync(path): string[] {
        const result = []
        for (const entry of readdirSync(path)) {
            const fullEntry = path + "/" + entry
            const stats = lstatSync(fullEntry)
            if (stats.isDirectory()) {
                // Subdirectory
                // @ts-ignore
                result.push(...ScriptUtils.readDirRecSync(fullEntry))
            } else {
                result.push(fullEntry)
            }
        }
        return result;
    }

    public static DownloadJSON(url): Promise<any> {
        return new Promise((resolve, reject) => {
            try {


                https.get(url, (res) => {
                    const parts: string[] = []
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        // @ts-ignore
                        parts.push(chunk)
                    });

                    res.addListener('end', function () {
                        const result = parts.join("")
                        try {
                            resolve(JSON.parse(result))
                        } catch (e) {
                            reject(e)
                        }
                    });
                })
            } catch (e) {
                reject(e)
            }
        })

    }

    public static sleep(ms) {
        if (ms <= 0) {
            process.stdout.write("\r                                       \r")
            return;
        }
        return new Promise((resolve) => {
            process.stdout.write("\r Sleeping for " + (ms / 1000) + "s \r")
            setTimeout(resolve, 1000);
        }).then(() => ScriptUtils.sleep(ms - 1000));
    }


}
