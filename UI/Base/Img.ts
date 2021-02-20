import Constants from "../../Models/Constants";
import {Utils} from "../../Utils";

export default class Img {

    public static runningFromConsole = false;

   static AsData(source:string){
       if(Utils.runningFromConsole){
           return source;
       }
       return `data:image/svg+xml;base64,${(btoa(source))}`;
   }

    static AsImageElement(source: string, css_class: string = "", style=""): string{
        return `<img class="${css_class}" style="${style}" alt="" src="${Img.AsData(source)}">`;
    }
}

