import * as fs from "fs";
import {lstatSync, readdirSync, readFileSync} from "fs";
import {Utils} from "../Utils";
import * as https from "https";
import {LayoutConfigJson} from "../Models/ThemeConfig/Json/LayoutConfigJson";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";

Utils.runningFromConsole = true

export default class ScriptUtils {


    public static fixUtils() {
        Utils.externalDownloadFunction = ScriptUtils.DownloadJSON
    }


    public static readDirRecSync(path, maxDepth = 999): string[] {
        const result = []
        if (maxDepth <= 0) {
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

    public static DownloadFileTo(url, targetFilePath: string): void {
        console.log("Downloading ", url, "to", targetFilePath)
        https.get(url, (res) => {
            const filePath = fs.createWriteStream(targetFilePath);
            res.pipe(filePath);
            filePath.on('finish', () => {
                filePath.close();
                console.log('Download Completed');
            })


        })
    }

    public static DownloadJSON(url, headers?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                headers = headers ?? {}
                headers.accept = "application/json"
                console.log("ScriptUtils.DownloadJson(", url.substring(0,40), url.length > 40 ? "...":"" ,")")
                const urlObj = new URL(url)
                https.get({
                    host: urlObj.host,
                    path: urlObj.pathname + urlObj.search,

                    port: urlObj.port,
                    headers: headers
                }, (res) => {
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
                            console.error("Could not parse the following as JSON:", result)
                            reject(e)
                        }
                    });
                })
            } catch (e) {
                reject(e)
            }
        })

    }

    public static erasableLog(...text) {
        process.stdout.write("\r " + text.join(" ") + "                \r")
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
            .filter(path => path.indexOf(".proto.json") < 0)
            .filter(path => path.indexOf("license_info.json") < 0)
            .map(path => {
                try {
                    const contents = readFileSync(path, "UTF8")
                    if (contents === "") {
                        throw "The file " + path + " is empty, did you properly save?"
                    }

                    const parsed = JSON.parse(contents);
                    return {parsed: parsed, path: path}
                } catch (e) {
                    console.error("Could not parse file ", "./assets/layers/" + path, "due to ", e)
                }
            })
    }

    public static getThemeFiles(): { parsed: LayoutConfigJson, path: string }[] {
        return ScriptUtils.readDirRecSync("./assets/themes")
            .filter(path => path.endsWith(".json"))
            .filter(path => path.indexOf("license_info.json") < 0)
            .map(path => {
                try {
                    const contents = readFileSync(path, "UTF8");
                    if (contents === "") {
                        throw "The file " + path + " is empty, did you properly save?"
                    }
                    const parsed = JSON.parse(contents);
                    return {parsed: parsed, path: path}
                } catch (e) {
                    console.error("Could not read file ", path, "due to ", e)
                    throw e
                }
            });
    }


    public static TagInfoHistogram(key: string): Promise<{
        data: { count: number, value: string, fraction: number }[]
    }> {
        const url = `https://taginfo.openstreetmap.org/api/4/key/values?key=${key}&filter=all&lang=en&sortname=count&sortorder=desc&page=1&rp=17&qtype=value`
        return ScriptUtils.DownloadJSON(url)
    }

}
