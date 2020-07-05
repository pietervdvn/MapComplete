import {LayerDefinition} from "./LayerDefinition";

/**
 * A layout is a collection of settings of the global view (thus: welcome text, title, selection of layers).
 */
export class Layout {
    public name: string;
    public title: string;
    public layers: LayerDefinition[];
    public welcomeMessage: string;
    public gettingStartedPlzLogin: string;
    public welcomeBackMessage: string;

    public startzoom: number;
    public startLon: number;
    public startLat: number;
    public welcomeTail: string;

    
    constructor(
        name: string,
        title: string,
        layers: LayerDefinition[],
        startzoom: number,
        startLat: number,
        startLon: number,
        welcomeMessage: string,
        gettingStartedPlzLogin: string,
        welcomeBackMessage: string,
        welcomeTail: string = ""
    ) {
        this.title = title;
        this.startLon = startLon;
        this.startLat = startLat;
        this.startzoom = startzoom;
        this.name = name;
        this.layers = layers;
        this.welcomeMessage = welcomeMessage;
        this.gettingStartedPlzLogin = gettingStartedPlzLogin;
        this.welcomeBackMessage = welcomeBackMessage;
        this.welcomeTail = welcomeTail;
    }

/*


    static statues = new Layout(
    
    );

*/
}

