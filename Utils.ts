import {UIElement} from "./UI/UIElement";

export class Utils {

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
    
    public static Upper(str : string){
        return str.substr(0,1).toUpperCase() + str.substr(1);
    }

    static DoEvery(millis: number, f: (() => void)) {
        if (UIElement.runningFromConsole) {
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
            if(newArr.indexOf(string) < 0){
                newArr.push(string);
            }
        }
        return newArr;
    }
    
    public static MergeTags(a :any, b: any){
        const t = {};
        for (const k in a) {
            t[k] = a[k];
        }
        for (const k in b) {
            t[k] = b[k];
        }
        return t;
    }
    
    public static SplitFirst(a: string, sep: string):string[]{
        const index = a.indexOf(sep);
        if(index < 0){
            return [a];
        }
        return [a.substr(0, index), a.substr(index+sep.length)];
    }

}
