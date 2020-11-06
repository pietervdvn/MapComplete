export class Img {

    public static runningFromConsole = false;
    
   static AsData(source:string){
       if(this.runningFromConsole){
           return source;
       }
       return `data:image/svg+xml;base64,${(btoa(source))}`;
   }
    
    static AsImageElement(source: string): string{
        return `<img src="${Img.AsData(source)}">`;
    }
    static readonly checkmark = `<svg width="26" height="18" viewBox="0 0 26 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7.28571L10.8261 15L23 3" stroke="black" stroke-width="4" stroke-linejoin="round"/></svg>`;
    static readonly no_checkmark = `<svg width="26" height="18" viewBox="0 0 26 18" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>`;
}

