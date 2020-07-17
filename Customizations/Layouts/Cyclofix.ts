import {Layout} from "../Layout";
import BikeParkings from "../Layers/BikeParkings";
import BikeServices from "../Layers/BikeStations";
import {GhostBike} from "../Layers/GhostBike";
import {DrinkingWater, DrinkingWaterLayer} from "../Layers/DrinkingWater";


export default class Cyclofix extends Layout {
    constructor() {
        super(
            "pomp",
            "Cyclofix bicycle infrastructure",
            [new GhostBike(), new BikeServices(), new BikeParkings(), new DrinkingWater()],
            16,
            50.8465573,
            4.3516970,


            "<h3>Cyclofix bicycle infrastructure</h3>\n" +
            "\n" +
            "<p><b>EN&gt;</b> On this map we want to collect data about the whereabouts of bicycle pumps and public racks in Brussels." +
            "As a result, cyclists will be able to quickly find the nearest infrastructure for their needs.</p>" +
            "<p><b>NL&gt;</b> Op deze kaart willen we gegevens verzamelen over de locatie van fietspompen en openbare stelplaatsen in Brussel." +
            "Hierdoor kunnen fietsers snel de dichtstbijzijnde infrastructuur vinden die voldoet aan hun behoeften.</p>" +
            "<p><b>FR&gt;</b> Sur cette carte, nous voulons collecter des données sur la localisation des pompes à vélo et des supports publics à Bruxelles." +
            "Les cyclistes pourront ainsi trouver rapidement l'infrastructure la plus proche de leurs besoins.</p>"
            ,
            "", "");
    }
}
