import Translation from "./Translation";
import {UIElement} from "../UIElement";
import {FixedUiElement} from "../Base/FixedUiElement";


export default class Translations {
    static cylofix = {
        title: new Translation({
            en: 'Cyclofix bicycle infrastructure',
            nl: 'Cyclofix fietsinfrastructuur',
            fr: 'TODO: FRENCH TRANSLATION'
        }),
        description: new Translation({
            en: "On this map we want to collect data about the whereabouts of bicycle pumps and public racks in Brussels." +
                "As a result, cyclists will be able to quickly find the nearest infrastructure for their needs.",
            nl: "Op deze kaart willen we gegevens verzamelen over de locatie van fietspompen en openbare stelplaatsen in Brussel." +
                "Hierdoor kunnen fietsers snel de dichtstbijzijnde infrastructuur vinden die voldoet aan hun behoeften.",
            fr: "Sur cette carte, nous voulons collecter des données sur la localisation des pompes à vélo et des supports publics à Bruxelles." +
                "Les cyclistes pourront ainsi trouver rapidement l'infrastructure la plus proche de leurs besoins."
        })
    };
    static general = {
        loginWithOpenStreetMap: new Translation({
            en: "Click here to login with OpenStreetMap",
            nl: "Klik hier op je aan te melden met OpenStreetMap"
        }),
        uploadAPicture: new Translation({
            en: "Add a picture",
            nl: "Voeg een foto toe"

        })
    }

    public static W(s: string | UIElement):
        UIElement {
        if (s instanceof UIElement) {
            return s;
        }
        return new FixedUiElement(s);
    }

}
