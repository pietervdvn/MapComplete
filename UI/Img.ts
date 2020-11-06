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
}

