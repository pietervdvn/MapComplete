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

        search: {
            search: new Translation({
                en: "Search a location",
                nl: "Zoek naar een locatie"
            }),
            searching: new Translation({
                en: "Searching...",
                nl: "Aan het zoeken..."
            }),
            nothing: new Translation({
                en: "Nothing found...",
                nl: "Niet gevonden..."
            }),
            error: new Translation({
                en: "Something went wrong...",
                nl: "Niet gelukt..."
            })

        },

        picture: {
            uploadAPicture: new Translation({
                en: "Add a picture",
                nl: "Voeg een foto toe"

            }),
            licenseIntro: new Translation({
                en: "Your picture is published",
                nl: "Je foto wordt gepubliceerd"
            }),
            publicDomain: new Translation({
                en: "in the public domain",
                nl: "in het publiek domein"
            }),
            ccby: new Translation({
                en: "with a CC-BY license",
                nl: "met een CC-BY licentie"
            }),
            ccbysa: new Translation({
                en: "with a CC-BY-SA license",
                nl: "met een CC-BY-SA licentie"
            })
        }
    }

    public static W(s: string | UIElement): UIElement {
        if (s instanceof UIElement) {
            return s;
        }
        return new FixedUiElement(s);
    }

}
