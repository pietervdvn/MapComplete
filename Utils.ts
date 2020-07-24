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
}
