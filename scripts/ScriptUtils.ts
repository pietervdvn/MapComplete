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
    
    public static DownloadJSON(url, continuation : (parts : string []) => void){
        https.get(url, (res) => {
            console.log("Got response!")
            const parts : string[] = []
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                // @ts-ignore
                parts.push(chunk)
            });

            res.addListener('end', function () {
                continuation(parts)
            });
        })
    }

    public static sleep(ms) {
        return new Promise((resolve) => {
            console.debug("Sleeping for", ms)
            setTimeout(resolve, ms);
           
        });
    }


}
