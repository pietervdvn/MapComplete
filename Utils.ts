import * as $ from "jquery"
import Constants from "./Models/Constants";


export class Utils {

    /**
     * In the 'deploy'-step, some code needs to be run by ts-node.
     * However, ts-node crashes when it sees 'document'. When running from console, we flag this and disable all code where document is needed.
     * This is a workaround and yet another hack
     */
    public static runningFromConsole = false;
    
    public static readonly assets_path = "./assets/svg/";

    static EncodeXmlValue(str) {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
    }

    /**
     * Gives a clean float, or undefined if parsing fails
     * @param str
     */
    static asFloat(str): number {
        if (str) {
            const i = parseFloat(str);
            if (isNaN(i)) {
                return undefined;
            }
            return i;
        }
        return undefined;
    }

    public static Upper(str: string) {
        return str.substr(0, 1).toUpperCase() + str.substr(1);
    }

    public static TwoDigits(i: number) {
        if (i < 10) {
            return "0" + i;
        }
        return "" + i;
    }

    public static Round(i: number) {
        if(i < 0){
            return "-" + Utils.Round(-i);
        }
        const j = "" + Math.floor(i * 10);
        if (j.length == 1) {
            return "0." + j;
        }
        return j.substr(0, j.length - 1) + "." + j.substr(j.length - 1, j.length);
    }

    public static Times(f: ((i: number) => string), count: number): string {
        let res = "";
        for (let i = 0; i < count; i++) {
            res += f(i);
        }
        return res;
    }

    static DoEvery(millis: number, f: (() => void)) {
        if (Utils.runningFromConsole) {
            return;
        }
        window.setTimeout(
            function () {
                f();
                Utils.DoEvery(millis, f);
            }
            , millis)
    }

    public static NoNull<T>(array: T[]): T[] {
        const ls: T[] = [];
        for (const t of array) {
            if (t === undefined || t === null) {
                continue;
            }
            ls.push(t);
        }
        return ls;
    }
    
    public static NoEmpty(array: string[]): string[]{
        const ls: string[] = [];
        for (const t of array) {
            if (t === "") {
                continue;
            }
            ls.push(t);
        }
        return ls;
    }

    public static EllipsesAfter(str : string, l : number = 100){
        if(str === undefined){
            return undefined;
        }
        if(str.length <= l){
            return str;
        }
        return str.substr(0, l - 3)+"...";
    }
    
    public static Dedup(arr: string[]):string[]{
        if(arr === undefined){
            return undefined;
        }
        const newArr = [];
        for (const string of arr) {
            if (newArr.indexOf(string) < 0) {
                newArr.push(string);
            }
        }
        return newArr;
    }

    public static MergeTags(a: any, b: any) {
        const t = {};
        for (const k in a) {
            t[k] = a[k];
        }
        for (const k in b) {
            t[k] = b[k];
        }
        return t;
    }

    public static SplitFirst(a: string, sep: string): string[] {
        const index = a.indexOf(sep);
        if (index < 0) {
            return [a];
        }
        return [a.substr(0, index), a.substr(index + sep.length)];
    }

    // Date will be undefined on failure
    public static changesetDate(id: number, action: ((isFound: Date) => void)): void {
        $.getJSON("https://www.openstreetmap.org/api/0.6/changeset/" + id,
            function (data) {
                console.log(data)
                action(new Date(data.elements[0].created_at));
            })
            .fail(() => {
                action(undefined);
            });

    }
    
    public static LoadCustomCss(location: string){
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.id = "customCss";
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = location;
        link.media = 'all';
        head.appendChild(link);
        console.log("Added custom layout ",location)
    }


    static MatchKeys(object: any, prototype: any, context?: string){

        for (const objectKey in object) {
            if(prototype[objectKey] === undefined){
                console.error("Key ", objectKey, "might be not supported (in context",context,")")
            }   
        }
    }
    
    static Merge(source: any, target: any){
        target = JSON.parse(JSON.stringify(target));
        source = JSON.parse(JSON.stringify(source));
        for (const key in source) {
            const sourceV = source[key];
            const targetV = target[key]
            if(typeof sourceV === "object"){
                if(targetV === undefined){
                    target[key] = sourceV;
                }else{
                    Utils.Merge(sourceV, targetV);
                }
                
            }else{
                target[key] = sourceV;
            }
            
        }
        return target;
    }
    
    static ToMuchTags(source: any, toCheck: any, context: string){

        for (const key in toCheck) {
            const toCheckV = toCheck[key];
            const sourceV = source[key];
            if(sourceV === undefined){
                console.error("Probably a wrong tag in ", context, ": ", key, "might be wrong")
            }
            if(typeof toCheckV === "object"){
                if(typeof sourceV !== "object"){
                    console.error("Probably a wrong value in ", context, ": ", key, "is a fixed value in the source")
                }else{
                    Utils.ToMuchTags(sourceV, toCheckV, context+"."+key);
                }
            }
        }
        
    }
    
}
