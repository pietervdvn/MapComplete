import {Layout} from "../Layout";
import * as Layer from "../Layers/Bookcases";
import {Widths} from "../Layers/Widths";
import {UIEventSource} from "../../UI/UIEventSource";

export class StreetWidth extends Layout{
    
    private static meetMethode = `
    
    
    We meten de ruimte die gedeeld wordt door auto's, fietsers en -in sommige gevallen- voetgangers.
    We meten dus van _verhoogde_ stoeprand tot stoeprand omdat dit de ruimte is die wordt gedeeld door auto's en fietsers.
    Daarnaast zoeken we ook een smaller stuk van de weg waar dat smallere stuk toch minstens 2m zo smal blijft.
    Een obstakel (zoals een trap, elektriciteitkast) negeren we omdat dit de meting te fel beinvloed.
    
    In een aantal straten is er geen verhoogde stoep. In dit geval meten we van muur tot muur, omdat dit de gedeelde ruimte is.
    We geven ook altijd een aanduiding of er al dan niet een voetpad aanwezig (en aan welke kant indien er maar één is), want indien er geen is heeft de voetganger ook ruimte nodig.
    
   (In sommige straten zijn er wel 'voetpadsuggesties' door een meter in andere kasseien te leggen, bv. met een kleurtje. Dit rekenen we niet als voetpad.
   
   Ook het parkeren van auto's wordt opgemeten.
   Als er een parallele parkeerstrook is, dan duiden we dit aan en nemen we de parkeerstrook mee in de straatbreedte.
   Als er een witte lijn is, dan negeren we dit. Deze witte lijnen duiden immers vaak een té smalle parkeerplaats aan - bv. 1.6m.
   Een auto is tegenwoordig al snel 1.8m tot zelfs 2.0m, dus dan springt die auto gemakkelijk 20 tot 30cm uit op de baan.
   
   Staan de auto's schuin geparkeerd of dwarsgeparkeerd? 
   Ook hier kan men het argument maken dat auto's er soms overspringen, maar dat is hier te variabel om in kaart te brengen.
   Daarnaast gebeurt het minder dat auto's overspringen én zijn deze gevallen relatief zeldzaam in de binnenstad.
   
   Concreet: 
   - Sla de 'parkeren'-vraag over
   - Maak een foto en stuur die door naar Pieter (+ vermelding straatnaam of dergelijke)
   - Meet de breedte vanaf de afbakening van de parkeerstrook.
   
   Ook bij andere lastige gevallen: maak een foto en vraag Pieter
   
   
   
   Instellen van de lasermeter
   ===========================
   
   1) Zet de lasermeter aan met de rode knop
   2) Het icoontje linksboven indiceert vanaf waar de laser meet - de voorkant of de achterkant van het apparaatje.
        Dit kan aangepast worden met het knopje links-onderaan.
        Kies wat je het liefste hebt
   3) Het icoontje bovenaan-midden indiceert de stand van de laser: directe afstand, of afstand over de grond.
        Dit MOET een driehoekje tonen.
        Indien niet: duw op het knopje links-bovenaan totdat dit een rechte driehoek toont
   4) Duw op de rode knop. Het lasertje gaat branden
   5) Hou het meetbakje boven de stoeprand (met de juiste rand), richt de laser op de andere stoep
   6) Duw opnieuw op de rode knop om te meten (de laser flikkert en gaat uit)
   7) Lees de afstand af op het scherm. Let op: in 'hoekstand' is dit niet de onderste waarde, maar die er net boven.
    
    `
    
    
    
    
    
    
    
    constructor() {
        super(    "width",
            ["nl"],
            "Straatbreedtes in Brugge",
            [new Widths(
                2,
               1.5,
                0.75
                
            )],
            15,
            51.20875,
            3.22435,
            "<h3>De straat is opgebruikt</h3>" +
            "<p>Er is steeds meer druk op de openbare ruimte. Voetgangers, fietsers, steps, auto's, bussen, bestelwagens, buggies, cargobikes, ... willen allemaal hun deel van de openbare ruimte.</p>" +
            "" +
            "<p>In deze studie nemen we Brugge onder de loep en kijken we hoe breed elke straat is én hoe breed elke straat zou moeten zijn voor een veilig én vlot verkeer.</p>" +
            "Verschillende ingrepen kunnen de stad teruggeven aan de inwoners en de stad leefbaarder en levendiger maken.<br/>" +
            "Denk aan:" +
            "<ul>" +
            "<li>De autovrije zone's uitbreiden</li>" +
            "<li>De binnenstad fietszone maken</li>" +
            "<li>Het aantal woonerven uitbreiden</li>" +
            "<li>Grotere auto's meer belasten - ze nemen immers meer parkeerruimte in.</li>" +
            "<li>Laat toeristen verplicht parkeren onder het zand; een (fiets)taxi kan hen naar hun hotel brengen</li>" +
            "<li>Voorzie in elke straat enkele parkeerplaatsen voor kortparkeren. Zo kunnen leveringen, iemand afzetten,... gebeuren zonder dat er een fietspad of een straat geblokkeerd wordt</li>" +
            "</ul>");
        this.icon = "assets/bug.svg";

    }
}