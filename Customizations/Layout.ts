import {LayerDefinition} from "./LayerDefinition";
import { UIElement } from "../UI/UIElement";
import { FixedUiElement } from "../UI/Base/FixedUiElement";

/**
 * A layout is a collection of settings of the global view (thus: welcome text, title, selection of layers).
 */
export class Layout {
    public name: string;
    public title: UIElement;
    public layers: LayerDefinition[];
    public welcomeMessage: UIElement;
    public gettingStartedPlzLogin: string;
    public welcomeBackMessage: string;

    public startzoom: number;
    public startLon: number;
    public startLat: number;
    public welcomeTail: string;

    public locationContains: string[];

    /**
     * 
     * @param name: The name used in the query string. If in the query "quests=<name>" is defined, it will select this layout
     * @param title: Will be used in the <title> of the page
     * @param layers: The layers to show, a list of LayerDefinitions
     * @param startzoom: The initial starting zoom of the map
     * @param startLat:The initial starting latitude of the map
     * @param startLon: the initial starting longitude of the map
     * @param welcomeMessage: This message is shown in the collapsable box on the left
     * @param gettingStartedPlzLogin: This is shown below the welcomemessage and wrapped in a login link.
     * @param welcomeBackMessage: This is shown when the user is logged in
     * @param welcomeTail: This text is shown below the login message. It is ideal for extra help
     */
    constructor(
        name: string,
        title: UIElement | string,
        layers: LayerDefinition[],
        startzoom: number,
        startLat: number,
        startLon: number,
        welcomeMessage: UIElement | string,
        gettingStartedPlzLogin: string = "Please login to get started",
        welcomeBackMessage: string = "You are logged in. Welcome back!",
        welcomeTail: string = ""
    ) {
        this.title = typeof(title) === 'string' ? new FixedUiElement(title) : title;
        this.startLon = startLon;
        this.startLat = startLat;
        this.startzoom = startzoom;
        this.name = name;
        this.layers = layers;
        this.welcomeMessage = typeof(welcomeMessage) === 'string' ? new FixedUiElement(welcomeMessage) : welcomeMessage;
        this.gettingStartedPlzLogin = gettingStartedPlzLogin;
        this.welcomeBackMessage = welcomeBackMessage;
        this.welcomeTail = welcomeTail;
    }

}

