import {lstatSync, readdirSync, readFileSync} from "fs";
import * as https from "https";
import {LayerConfigJson} from "../Customizations/JSON/LayerConfigJson";
import {LayoutConfigJson} from "../Customizations/JSON/LayoutConfigJson";

export default class ScriptUtils {
    public static readDirRecSync(path, maxDepth = 999): string[] {
        const result = []
        if(maxDepth <= 0){
            return []
        }
        for (const entry of readdirSync(path)) {
            const fullEntry = path + "/" + entry
            const stats = lstatSync(fullEntry)
            if (stats.isDirectory()) {
                // Subdirectory
                // @ts-ignore
                result.push(...ScriptUtils.readDirRecSync(fullEntry, maxDepth - 1))
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

    public static getLayerFiles(): { parsed: LayerConfigJson, path: string }[] {
        return ScriptUtils.readDirRecSync("./assets/layers")
            .filter(path => path.indexOf(".json") > 0)
            .filter(path => path.indexOf("license_info.json") < 0)
            .map(path => {
                try {
                    const parsed = JSON.parse(readFileSync(path, "UTF8"));
                    return {parsed: parsed, path: path}
                } catch (e) {
                    console.error("Could not parse file ", "./assets/layers/" + path, "due to ", e)
                }
            })
    }

    public static getThemeFiles() : {parsed: LayoutConfigJson, path: string}[] {
        return ScriptUtils.readDirRecSync("./assets/themes")
            .filter(path => path.endsWith(".json"))
            .filter(path => path.indexOf("license_info.json") < 0)
            .map(path => {
                try {
                    const parsed = JSON.parse(readFileSync(path, "UTF8"));
                    return {parsed: parsed, path: path}
                } catch (e) {
                    console.error("Could not read file ", path, "due to ", e)
                    throw e
                }
            });
    }


}
