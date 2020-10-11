import codegrid from "codegrid-js";

export default class CodeGrid {
    private static readonly grid = CodeGrid.InitGrid();
    

    public static getCode(lat: any, lon: any, handle: (error, code) => void) {
        CodeGrid.grid.getCode(lat, lon, handle);
    }

    private static InitGrid(): any {
        const grid = codegrid.CodeGrid("./tiles/");

        // Heat up the caches
        grid.getCode(50.2, 3.2, (error, code) => {
        });
        grid.getCode(52.5072, 13.4248, (error, code) => {
        });
        grid.getCode(40.4781, -3.7034, () => {
        });
        return grid;
    }


}