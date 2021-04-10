import {lstatSync, readdirSync} from "fs";

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

}
