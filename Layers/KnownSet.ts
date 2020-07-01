import {LayerDefinition} from "../LayerDefinition";
import {NatureReserves} from "./NatureReserves";
import {Toilets} from "./Toilets";
import {Bos} from "./Bos";
import {Park} from "./Park";
import {Playground} from "./Playground";
import {Bookcases} from "./Bookcases";
import {Artwork} from "./Artwork";
import {GrbToFix} from "./GrbToFix";


export class KnownSet {
    public name: string;
    public title: string;
    public layers: LayerDefinition[];
    public welcomeMessage: string;
    public gettingStartedPlzLogin: string;
    public welcomeBackMessage: string;

    public startzoom: number;
    public startLon: number;
    public startLat: number;

    static allSets : any = {};
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
        KnownSet.allSets[this.name] = this;
    }


    static groen = new KnownSet("groen",
        "Buurtnatuur",
        [new NatureReserves(), new Park(), new Bos()],
        10,
        50.8435,
        4.3688,
"\n" +
        "<img src='assets/groen.svg' alt='logo-groen' class='logo'> <br />" +
        "<h3>Breng jouw buurtnatuur in kaart</h3>" +
        "<b>Natuur maakt gelukkig.</b> Aan de hand van deze website willen we de natuur dicht bij ons beter inventariseren. Met als doel meer mensen te laten genieten van toegankelijke natuur én te strijden voor meer natuur in onze buurten. \n" +
        "<ul>" +
        "<li>In welke natuurgebieden kan jij terecht? Hoe toegankelijk zijn ze?</li>" +
        "<li>In welke bossen kan een gezin in jouw gemeente opnieuw op adem komen?</li>" +
        "<li>Op welke onbekende plekjes is het zalig spelen?</li>" +
        "</ul>" +
        "<p>Samen kleuren we heel Vlaanderen en Brussel groen.</p>" +
        "<p>Blijf op de hoogte van de resultaten van buurtnatuur.be: <a href=\"https://www.groen.be/buurtnatuur\" target='_blank'>meld je aan voor e-mailupdates</a>.</p> \n"
       ,

        "<b>Begin meteen door <a href=\"https://www.openstreetmap.org/user/new\" target=\"_blank\">een account te maken\n" +
        "            te maken</a> of\n" +
        "            <span onclick=\"authOsm()\" class=\"activate-osm-authentication\">in te loggen</span>.</b>",
        "",
        
        "<h4>Tips</h4>" +
        
        "<ul>" +
        "<li>Over groen ingekleurde gebieden weten we alles wat we willen weten.</li>" +
        "<li>Bij rood ingekleurde gebieden ontbreekt nog heel wat info: klik een gebied aan en beantwoord de vragen.</li>" +
        "<li>Je kan altijd een foto toevoegen</li>" +
        "<li>Je kan ook zelf een gebied toevoegen door op de kaart te klikken</li>" +
        "</ul>" +
        "<small>" +
        "<p>" +
        "De oorspronkelijke data komt van <b>OpenStreetMap</b> en je antwoorden worden daar bewaard.<br/> Omdat iedereen vrij kan meewerken aan dit project, kunnen we niet garanderen dat er geen fouten opduiken." +
        "</p>" +
        "Je privacy is belangrijk. We tellen wel hoeveel gebruikers deze website bezoeken. We plaatsen een cookie waar geen persoonlijke informatie in bewaard wordt. " +
        "Als je inlogt, komt er een tweede cookie bij met je inloggegevens." +
        "</small>"
    );

    static openToiletMap = new KnownSet(
        "toilets",
        "Open Toilet Map",
        [new Toilets()],
        12,
        51.2,
        3.2,


        "        <h3>Open Toilet Map</h3>\n" +
        "\n" +
        "<p>Help us to create the most complete map about <i>all</i> the toilets in the world, based on openStreetMap." +
        "One can answer questions here, which help users all over the world to find an accessible toilet, close to them.</p>"
        ,
        "  <p>Start by <a href=\"https://www.openstreetmap.org/user/new\" target=\"_blank\">creating an account\n" +
        "            </a> or by " +
        "            <span onclick=\"authOsm()\" class=\"activate-osm-authentication\">logging in</span>.</p>",
        "Start by clicking a pin and answering the questions"
    );

    static bookcases = new KnownSet(
        "bookcases",
        "Open Bookcase Map",
        [new Bookcases()],
        14,
        51.2,
        3.2,


        "        <h3>Open BoekenkastjesKaart</h3>\n" +
        "\n" +
        "<p>" +
        "Help mee met het creëeren van een volledige kaart met alle boekenruilkastjes!" +
        "Een boekenruilkastje is een vaste plaats in publieke ruimte waar iedereen een boek in kan zetten of uit kan meenemen." +
        "Meestal een klein kastje of doosje dat op straat staat, maar ook een oude telefooncellen of een schap in een station valt hieronder."+
        "</p>"
        ,
        "  <p>Begin met <a href=\"https://www.openstreetmap.org/user/new\" target=\"_blank\">het aanmaken van een account\n" +
        "            </a> of door je " +
        "            <span onclick=\"authOsm()\" class=\"activate-osm-authentication\">aan te melden</span>.</p>",
        "Klik op een boekenruilkastje om vragen te beantwoorden"
    );

    static statues = new KnownSet(
        "statues",
        "Open Artwork Map",
        [new Artwork()],
        10,
        50.8435,
        4.3688,


        "        <h3>Open Statue Map</h3>\n" +
        "\n" +
        "<p>" +
        "Help with creating a map of all statues all over the world!" 
        
        ,
        "  <p>Start by <a href=\"https://www.openstreetmap.org/user/new\" target=\"_blank\">creating an account\n" +
        "            </a> or by " +
        "            <span onclick=\"authOsm()\" class=\"activate-osm-authentication\">logging in</span>.</p>",
        "Start by clicking a pin and answering the questions"
    );

    static grb = new KnownSet(
        "grb",
        "Grb import fix tool",
        [new GrbToFix()],
        10,
        50.8435,
        4.3688,


        "<h3>GRB Fix tool</h3>\n" +
        "\n" +
        "Expert use only"

        ,
        "",""
    );

}