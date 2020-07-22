import Translation from "./Translation";
import T from "./Translation";
import {UIElement} from "../UIElement";
import {FixedUiElement} from "../Base/FixedUiElement";


export default class Translations {

    constructor() {
        throw "Translations is static. If you want to intitialize a new translation, use the singular form"
    }


    static t = {
        cyclofix: {
            title: new T({
                en: 'Cyclofix bicycle infrastructure',
                nl: 'Cyclofix fietsinfrastructuur',
                fr: 'TODO: FRENCH TRANSLATION'
            }),
            description: new T({
                en: "On this map we want to collect data about the whereabouts of bicycle pumps and public racks in Brussels." +
                    "As a result, cyclists will be able to quickly find the nearest infrastructure for their needs.",
                nl: "Op deze kaart willen we gegevens verzamelen over de locatie van fietspompen en openbare stelplaatsen in Brussel." +
                    "Hierdoor kunnen fietsers snel de dichtstbijzijnde infrastructuur vinden die voldoet aan hun behoeften.",
                fr: "Sur cette carte, nous voulons collecter des données sur la localisation des pompes à vélo et des supports publics à Bruxelles." +
                    "Les cyclistes pourront ainsi trouver rapidement l'infrastructure la plus proche de leurs besoins."
            }),
            freeFormPlaceholder: new T({en: 'specify', nl: 'specifieer', fr: 'TODO: fr'}),
            parking: {
                name: new T({en: 'bike parking', nl: 'fietsparking', fr: 'TODO: fr'}),
                title: new T({en: 'Bike parking', nl: 'Fietsparking', fr: 'TODO: fr'}),
                type: {
                    render: new T({
                        en: 'This is a bicycle parking of the type: {bicycle_parking}',
                        nl: 'Dit is een fietsenparking van het type: {bicycle_parking}',
                        fr: 'TODO: fr'
                    }),
                    template: new T({en: 'Some other type: $$$', nl: 'Een ander type: $$$', fr: 'TODO: fr'}),
                    question: new T({
                        en: 'What is the type of this bicycle parking?',
                        nl: 'Van welk type is deze fietsenparking?',
                        fr: 'TODO: fr'
                    }),
                    eg: new T({en: ", for example", nl: ", bijvoorbeeld"}),
                    stands: new T({en: 'Staple racks', nl: 'Nietjes', fr: 'TODO: fr'}),
                    wall_loops: new T({en: 'Wheel rack/loops', nl: 'Wielrek/lussen', fr: 'TODO: fr'}),
                    handlebar_holder: new T({en: 'Handlebar holder', nl: 'Stuurhouder', fr: 'TODO: fr'}),
                    shed: new T({en: 'Shed', nl: 'Schuur', fr: 'TODO: fr'}),
                    rack: new T({en: 'Rack', nl: 'Rek', fr: 'TODO: fr'}),
                    "two-tier": new T({en: 'Two-tiered', nl: 'Dubbel (twee verdiepingen)', fr: 'TODO: fr'}),
                },

                operator: {
                    render: new T({
                        en: 'This bike parking is operated by {operator}',
                        nl: 'Deze fietsenparking wordt beheerd door {operator}',
                        fr: 'TODO: fr'
                    }),
                    template: new T({en: 'A different operator: $$$', nl: 'Een andere beheerder: $$$', fr: 'TODO: fr'}),
                    question: new T({
                        en: 'Who operates this bike station (name of university, shop, city...)?',
                        nl: 'Wie beheert deze fietsenparking (naam universiteit, winkel, stad...)?',
                        fr: 'TODO: fr'
                    }),
                    private: new T({
                        en: 'Operated by a private person',
                        nl: 'Wordt beheerd door een privépersoon',
                        fr: 'TODO: fr'
                    }),
                }
            },
            station: {
                name: new T({
                    en: 'bike station (repair, pump or both)',
                    nl: 'fietsstation (herstel, pomp of allebei)',
                    fr: 'TODO: fr'
                }),
                title: new T({en: 'Bike station', nl: 'Fietsstation', fr: 'TODO: fr'}),
                manometer: {
                    question: new T({
                        en: 'Does the pump have a pressure indicator or manometer?',
                        nl: 'Heeft deze pomp een luchtdrukmeter?',
                        fr: 'TODO: fr'
                    }),
                    yes: new T({en: 'There is a manometer', nl: 'Er is een luchtdrukmeter', fr: 'TODO: fr'}),
                    no: new T({en: 'There is no manometer', nl: 'Er is geen luchtdrukmeter', fr: 'TODO: fr'}),
                    broken: new T({
                        en: 'There is manometer but it is broken',
                        nl: 'Er is een luchtdrukmeter maar die is momenteel defect',
                        fr: 'TODO: fr'
                    })
                },
                electric: {
                    question: new T({
                        en: 'Is this an electric bike pump?',
                        nl: 'Is dit een electrische fietspomp?',
                        fr: 'TODO: fr'
                    }),
                    manual: new T({en: 'Manual pump', nl: 'Manuele pomp', fr: 'TODO: fr'}),
                    electric: new T({en: 'Electrical pump', nl: 'Electrische pomp', fr: 'TODO: fr'})
                },
                operational: {
                    question: new T({
                        en: 'Is the bike pump still operational?',
                        nl: 'Werkt de fietspomp nog?',
                        fr: 'TODO: fr'
                    }),
                    operational: new T({
                        en: 'The bike pump is operational',
                        nl: 'De fietspomp werkt nog',
                        fr: 'TODO: fr'
                    }),
                    broken: new T({en: 'The bike pump is broken', nl: 'De fietspomp is kapot', fr: 'TODO: fr'})
                },
                valves: {
                    question: new T({
                        en: 'What valves are supported?',
                        nl: 'Welke ventielen werken er met de pomp?',
                        fr: 'TODO: fr'
                    }),
                    default: new T({
                        en: 'There is a default head, so Dunlop, Sclaverand and auto',
                        nl: 'Er is een standaard aansluiting, die dus voor Dunlop, Sclaverand en auto\'s werkt',
                        fr: 'TODO: fr'
                    }),
                    dunlop: new T({en: 'Only Dunlop', nl: 'Enkel Dunlop', fr: 'TODO: fr'}),
                    sclaverand: new T({
                        en: 'Only Sclaverand (also known as Presta)',
                        nl: 'Enkel Sclaverand (ook gekend als Presta)',
                        fr: 'TODO: fr'
                    }),
                    auto: new T({en: 'Only for cars', nl: 'Enkel voor auto\'s', fr: 'TODO: fr'}),
                    render: new T({
                        en: 'This pump supports the following valves: {valves}',
                        nl: 'Deze pomp werkt met de volgende ventielen: {valves}',
                        fr: 'TODO: fr'
                    }),
                    template: new T({
                        en: 'Some other valve(s): $$$',
                        nl: 'Een ander type ventiel(en): $$$',
                        fr: 'TODO: fr'
                    })
                },
                chain: {
                    question: new T({
                        en: 'Does this bike station have a special tool to repair your bike chain?',
                        nl: 'Heeft dit fietsstation een speciale reparatieset voor je ketting?',
                        fr: 'TODO: fr'
                    }),
                    yes: new T({
                        en: 'There is a chain tool',
                        nl: 'Er is een reparatieset voor je ketting',
                        fr: 'TODO: fr'
                    }),
                    no: new T({
                        en: 'There is no chain tool',
                        nl: 'Er is geen reparatieset voor je ketting',
                        fr: 'TODO: fr'
                    }),
                },
                operator: {
                    render: new T({
                        en: 'This bike station is operated by {operator}',
                        nl: 'Dit fietsstation wordt beheerd door {operator}',
                        fr: 'TODO: fr'
                    }),
                    template: new T({en: 'A different operator: $$$', nl: 'Een andere beheerder: $$$', fr: 'TODO: fr'}),
                    question: new T({
                        en: 'Who operates this bike station (name of university, shop, city...)?',
                        nl: 'Wie beheert dit fietsstation (naam universiteit, winkel, stad...)?',
                        fr: 'TODO: fr'
                    }),
                    private: new T({
                        en: 'Operated by a private person',
                        nl: 'Wordt beheerd door een privépersoon',
                        fr: 'TODO: fr'
                    }),
                },
                services: {
                    question: new T({
                        en: 'Which services are available at this bike station?',
                        nl: 'Welke functies biedt dit fietsstation?',
                        fr: 'TODO: fr'
                    }),
                    pump: new T({
                        en: 'There is only a pump available',
                        nl: 'Er is enkel een pomp beschikbaar',
                        fr: 'TODO: fr'
                    }),
                    tools: new T({
                        en: 'There are only tools (screwdrivers, pliers...) available',
                        nl: 'Er is enkel gereedschap beschikbaar (schroevendraaier, tang...)',
                        fr: 'TODO: fr'
                    }),
                    both: new T({
                        en: 'There are both tools and a pump available',
                        nl: 'Er is zowel een pomp als gereedschap beschikbaar',
                        fr: 'TODO: fr'
                    }),
                },
                stand: {
                    question: new T({
                        en: 'Does this bike station have a hook to suspend your bike with or a stand to elevate it?',
                        nl: 'Heeft dit fietsstation een haak of standaard om je fiets op te hangen/zetten?',
                        fr: 'TODO: fr'
                    }),
                    yes: new T({en: 'There is a hook or stand', nl: 'Er is een haak of standaard', fr: 'TODO: fr'}),
                    no: new T({en: 'There is no hook or stand', nl: 'Er is geen haak of standaard', fr: 'TODO: fr'}),
                }
            },
            shop: {
                name: new T({en: 'bike shop', nl: 'fietswinkel', fr: 'TODO: fr'}),
                
                title: new T({en: 'Bike shop', nl: 'Fietszaak', fr: 'TODO: fr'}),
                titleRepair: new T({en: 'Bike repair', nl: 'Fietsenmaker', fr: 'TODO: fr'}),
                titleShop: new T({en: 'Bike repair/shop', nl: 'Fietswinkel', fr: 'TODO: fr'}),
                
                titleNamed: new T({en: 'Bike repair/shop', nl: 'Fietszaak {name}', fr: 'TODO: fr'}),
                titleRepairNamed: new T({en: 'Bike shop', nl: 'Fietsenmaker {name}', fr: 'TODO: fr'}),
                titleShopNamed: new T({en: 'Bike repair/shop', nl: 'Fietswinkel {name}', fr: 'TODO: fr'}),



                retail: {
                    question: new T({
                        en: 'Does this shop sell bikes?',
                        nl: 'Verkoopt deze winkel fietsen?',
                        fr: 'TODO: fr'
                    }),
                    yes: new T({en: 'This shop sells bikes', nl: 'Deze winkel verkoopt fietsen', fr: 'TODO: fr'}),
                    no: new T({
                        en: 'This shop doesn\'t sell bikes',
                        nl: 'Deze winkel verkoopt geen fietsen',
                        fr: 'TODO: fr'
                    }),
                },
                repair: {
                    question: new T({
                        en: 'Does this shop repair bikes?',
                        nl: 'Verkoopt deze winkel fietsen?',
                        fr: 'TODO: fr'
                    }),
                    yes: new T({en: 'This shop repairs bikes', nl: 'Deze winkel herstelt fietsen', fr: 'TODO: fr'}),
                    no: new T({
                        en: 'This shop doesn\'t repair bikes',
                        nl: 'Deze winkel herstelt geen fietsen',
                        fr: 'TODO: fr'
                    }),
                    sold: new T({en: 'This shop only repairs bikes bought here', nl: 'Deze winkel herstelt enkel fietsen die hier werden gekocht', fr: 'TODO: fr'}),
                    brand: new T({en: 'This shop only repairs bikes of a certain brand', nl: 'Deze winkel herstelt enkel fietsen van een bepaald merk', fr: 'TODO: fr'}),
                },
                rental: {
                    question: new T({
                        en: 'Does this shop rent out bikes?',
                        nl: 'Verhuurt deze winkel fietsen?',
                        fr: 'TODO: fr'
                    }),
                    yes: new T({en: 'This shop rents out bikes', nl: 'Deze winkel verhuurt fietsen', fr: 'TODO: fr'}),
                    no: new T({
                        en: 'This shop doesn\'t rent out bikes',
                        nl: 'Deze winkel verhuurt geen fietsen',
                        fr: 'TODO: fr'
                    }),
                },
                pump: {
                    question: new T({
                        en: 'Does this shop offer a bike pump for use by anyone?',
                        nl: 'Biedt deze winkel een fietspomp aan voor iedereen?',
                        fr: 'TODO: fr'
                    }),
                    yes: new T({
                        en: 'This shop offers a bike pump for anyone',
                        nl: 'Deze winkel biedt geen fietspomp aan voor eender wie',
                        fr: 'TODO: fr'
                    }),
                    no: new T({
                        en: 'This shop doesn\'t offer a bike pump for anyone',
                        nl: 'Deze winkel biedt een fietspomp aan voor iedereen',
                        fr: 'TODO: fr'
                    })
                },
                qName: {
                    question: new T({en: 'What is the name of this bicycle shop?', nl: 'Wat is de naam van deze fietszaak?', fr: 'TODO: fr'}),
                    render: new T({en: 'This bicycle shop is called {name}', nl: 'Deze fietszaak heet <b>{name}</b>', fr: 'TODO: fr'}),
                    template: new T({en: 'This bicycle shop is called: $$$', nl: 'Deze fietszaak heet: <b>$$$</b>', fr: 'TODO: fr'})
                },
                secondHand: {
                    question: new T({en: 'Does this shop sell second-hand bikes?', nl: 'Verkoopt deze winkel tweedehands fietsen?', fr: 'TODO: fr'}),
                    yes: new T({en: 'This shop sells second-hand bikes', nl: 'Deze winkel verkoopt tweedehands fietsen', fr: 'TODO: fr'}),
                    no: new T({en: 'This shop doesn\'t sell second-hand bikes', nl: 'Deze winkel verkoopt geen tweedehands fietsen', fr: 'TODO: fr'}),
                    only: new T({en: 'This shop only sells second-hand bikes', nl: 'Deze winkel verkoopt enkel tweedehands fietsen', fr: 'TODO: fr'}),
                },
                diy: {
                    question: new T({en: 'Are there tools here to repair your own bike?', nl: 'Biedt deze winkel gereedschap aan om je fiets zelf te herstellen?', fr: 'TODO: fr'}),
                    yes: new T({en: 'This shop offers tools for DIY repair', nl: 'Deze winkel biedt gereedschap aan om je fiets zelf te herstellen', fr: 'TODO: fr'}),
                    no: new T({en: 'This shop doesn\'t offer tools for DIY repair', nl: 'Deze winkel biedt geen gereedschap aan om je fiets zelf te herstellen', fr: 'TODO: fr'}),
                }
            },
            drinking_water: {
                title: new T({
                    en: 'Drinking water',
                    nl: "Drinkbaar water"
                })
            }
        },
        image: {
            addPicture: new T({en: 'Add picture', nl: 'Voeg foto toe', fr: 'TODO: fr'}),
            uploadingPicture: new T({
                en: 'Uploading your picture...',
                nl: 'Bezig met een foto te uploaden...',
                fr: 'TODO: fr'
            }),
            pleaseLogin: new T({
                en: 'Please login to add a picure or to answer questions',
                nl: 'Gelieve je aan te melden om een foto toe te voegen of vragen te beantwoorden',
                fr: 'TODO: fr'
            }),
            willBePublished: new T({
                en: 'Your picture will be published: ',
                nl: 'Jouw foto wordt gepubliceerd: ',
                fr: 'TODO: fr'
            }),
            cco: new T({en: 'in the public domain', nl: 'in het publiek domein', fr: 'TODO: fr'}),
            ccbs: new T({en: 'under the CC-BY-SA-license', nl: 'onder de CC-BY-SA-licentie', fr: 'TODO: fr'}),
            ccb: new T({en: 'under the CC-BY-license', nl: 'onder de CC-BY-licentie', fr: 'TODO: fr'})
        },
        centerMessage: {
            loadingData: new T({en: 'Loading data...', nl: 'Data wordt geladen...', fr: 'TODO: fr'}),
            zoomIn: new T({
                en: 'Zoom in to view or edit the data',
                nl: 'Zoom in om de data te zien en te bewerken',
                fr: 'TODO: fr'
            }),
            ready: new T({en: 'Done!', nl: 'Klaar!', fr: 'TODO: fr'}),
        },
        general: {
            loginWithOpenStreetMap: new T({en: "Login with OpenStreetMap", nl: "Aanmelden met OpenStreetMap"}),
            getStarted: new T({
                en: "<span class='activate-osm-authentication'>Login with OpenStreetMap</span> or <a href='https://www.openstreetmap.org/user/new' target='_blank'>make a free account to get started</a>",
                nl: "<span class='activate-osm-authentication'>Meld je aan met je OpenStreetMap-account</span> of <a href='https://www.openstreetmap.org/user/new' target='_blank'>maak snel en gratis een account om te beginnen</a>",
            }),
            welcomeBack: new T({
                en: "You are logged in, welcome back!",
                nl: "Je bent aangemeld. Welkom terug!"
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
            returnToTheMap: new T({
                en: "Return to the map",
                nl: "Naar de kaart"
            }),
            save: new T({
                en: "Save",
                nl: "Opslaan"
            }),
            cancel: new T({
                en: "Cancel",
                nl: "Annuleren"
            }),
            skip: new T({
                en: "Skip this question",
                nl: "Vraag overslaan"
            }),
            oneSkippedQuestion: new T({
                en: "One question is skipped",
                nl: "Een vraag is overgeslaan"
            }),
            skippedQuestions: new T({
                en: "Some questions are skipped",
                nl: "Sommige vragen zijn overgeslaan"
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
