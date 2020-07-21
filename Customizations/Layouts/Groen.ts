import {NatureReserves} from "../Layers/NatureReserves";
import {Park} from "../Layers/Park";
import {Bos} from "../Layers/Bos";
import {Layout} from "../Layout";

export class Groen extends Layout {
    
    constructor() {
        super("buurtnatuur",
            ["nl"],
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
            "<li>Je kan altijd een vraag overslaan als je het antwoord niet weet of niet zeker bent</li>" +
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
        
        this.locationContains = ["buurtnatuur.be"]
    }
}