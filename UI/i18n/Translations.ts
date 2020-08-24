import Translation from "./Translation";
import T from "./Translation";
import {UIElement} from "../UIElement";
import {FixedUiElement} from "../Base/FixedUiElement";


export default class Translations {

    constructor() {
        throw "Translations is static. If you want to intitialize a new translation, use the singular form"
    }


    static t = {
        climbingTrees: {
            layer: {

                title: new T({
                    nl: "Klimbomen"
                }),
                description: new T({
                    nl: "Een klimboom is een mooie boom waar men in kan klimmen, al dan niet officieel"
                })
            },
            layout: {
                title: new T({nl: "Open Klimbomenkaart"}),
                welcome: new T({nl: "Markeer je favoriete klimboom"})
            }

        },

        artwork: {
            name: new T({ en: 'Artwork', nl: 'Kunstwerk', fr: "Oeuvre d'art" }),
            title: new T({ en: 'Artwork', nl: 'Kunstwerk', fr: "Oeuvre d'art" }),
            type: {
                render: new T({
                    en: 'This is artwork of the type: {artwork_type}',
                    nl: 'Dit is een kunstwerk van het type: {artwork_type}',
                    fr: "Ceci est un travail d'art de type: {artwork_type}"
                }),
                template: new T({ en: 'Some other type: $$$', nl: 'Een ander type: $$$', fr: 'Un autre type: $$$' }),
                question: new T({
                    en: 'What is the type of this artwork?',
                    nl: 'Wat voor type kunstwerk is dit?',
                    fr: "Quel est le type de cette oeuvre d'art?"
                }),
                architecture: new T({ en: "architecture", nl: "architectuur", fr: "architecture" }),
                mural: new T({ en: "mural", nl: "muurschildering", fr: "mural" }),
                painting: new T({ en: "painting", nl: "schilderij", fr: "peinture" }),
                sculpture: new T({ en: "sculpture", nl: "beeldhouwwerk", fr: "sculpture" }),
                statue: new T({ en: "statue", nl: "standbeeld", fr: "statue" }),
                bust: new T({ en: "bust", nl: "buste", fr: "buste" }),
                stone: new T({ en: "stone", nl: "steen", fr: "rocher" }),
                installation: new T({ en: "installation", nl: "installatie", fr: "installation" }),
                graffiti: new T({ en: "graffiti", nl: "graffiti", fr: "graffiti" }),
                relief: new T({ en: "relief", nl: "verlichting", fr: "relief" }),
                azulejo: new T({ en: "azulejo", nl: "azulejo", fr: "azulejo" }),
                tilework: new T({ en: "tilework", nl: "tegelwerk", fr: "carrelage" })
            }, artist: {
                question: new T({en:"Which artist created this artwork?"})
            }

        },
        cyclofix: {
            title: new T({
                en: 'Cyclofix - an open map for cyclists',
                nl: 'Cyclofix - een open kaart voor fietsers',
                fr: 'Cyclofix - Une carte ouverte pour les cyclistes'
            }),
            description: new T({
                en: "The goal of this map is to present cyclists with an easy-to-use solution to find the appropriate infrastructure for their needs.<br><br>" + //this works in spoken language: ; think about the nearest bike repair station for example
                    "You can track your precise location (mobile only) and select layers that are relevant for you in the bottom left corner. " +
                    "You can also use this tool to add or edit pins (points of interest) to the map and provide more data by answering the questions.<br><br>" +
                    "All changes you make will automatically be saved in the global database of OpenStreetMap and can be freely re-used by others.<br><br>" +
                    "For more information about the cyclofix project, go to <a href='https://cyclofix.osm.be/'>cyclofix.osm.be</a>.",
                nl: "Het doel van deze kaart is om fietsers een gebruiksvriendelijke oplossing te bieden voor het vinden van de juiste infrastructuur voor hun behoeften.<br><br>" + //; denk bijvoorbeeld aan de dichtstbijzijnde fietsherstelplaats.
                    "U kunt uw exacte locatie volgen (enkel mobiel) en in de linkerbenedenhoek categorieën selecteren die voor u relevant zijn. " +
                    "U kunt deze tool ook gebruiken om 'spelden' aan de kaart toe te voegen of te bewerken en meer gegevens te verstrekken door de vragen te beantwoorden.<br><br>" +
                    "Alle wijzigingen die u maakt worden automatisch opgeslagen in de wereldwijde database van OpenStreetMap en kunnen  door anderen vrij worden hergebruikt.<br><br>" +
                    "Bekijk voor meer info over cyclofix ook <a href='https://cyclofix.osm.be/'>cyclofix.osm.be</a>.",
                fr: "Le but de cette carte est de présenter aux cyclistes une solution facile à utiliser pour trouver l'infrastructure appropriée à leurs besoins.<br><br>" + //; pensez par exemple à la station de réparation de vélos la plus proche.
                    "Vous pouvez suivre votre localisation précise (mobile uniquement) et sélectionner les couches qui vous concernent dans le coin inférieur gauche. " +
                    "Vous pouvez également utiliser cet outil pour ajouter ou modifier des épingles (points d'intérêt) sur la carte et fournir plus de données en répondant aux questions.<br><br>" +
                    "Toutes les modifications que vous apportez seront automatiquement enregistrées dans la base de données mondiale d'OpenStreetMap et peuvent être librement réutilisées par d'autres.<br><br>" +
                    "Pour plus d'informations sur le projet cyclofix, rendez-vous sur <a href='https://cyclofix.osm.be/'>cyclofix.osm.be</a>."
            }),
            freeFormPlaceholder: new T({en: 'specify', nl: 'specifieer', fr: 'Specifiéz'}),
            parking: {
                name: new T({en: 'bike parking', nl: 'fietsparking', fr: 'parking à vélo'}),
                title: new T({en: 'Bike parking', nl: 'Fietsparking', fr: 'Parking à vélo'}),
                type: {
                    render: new T({
                        en: 'This is a bicycle parking of the type: {bicycle_parking}',
                        nl: 'Dit is een fietsparking van het type: {bicycle_parking}',
                        fr: 'Ceci est un parking à vélo de type {bicycle_parking}'
                    }),
                    template: new T({en: 'Some other type: $$$', nl: 'Een ander type: $$$', fr: "D'autres types: $$$"}),
                    question: new T({
                        en: 'What is the type of this bicycle parking?',
                        nl: 'Van welk type is deze fietsparking?',
                        fr: 'Quelle type de parking s\'agit il? '
                    }),
                    eg: new T({en: ", for example", nl: ", bijvoorbeeld", fr: ",par example"}),
                    stands: new T({en: 'Staple racks', nl: 'Nietjes', fr: 'Arceaux'}),
                    wall_loops: new T({en: 'Wheel rack/loops', nl: 'Wielrek/lussen', fr: 'Pinces-roues'}),
                    handlebar_holder: new T({en: 'Handlebar holder', nl: 'Stuurhouder', fr: 'Support guidon'}),
                    shed: new T({en: 'Shed', nl: 'Schuur', fr: 'Abri'}),
                    rack: new T({en: 'Rack', nl: 'Rek', fr: 'Râtelier'}),
                    "two-tier": new T({en: 'Two-tiered', nl: 'Dubbel (twee verdiepingen)', fr: 'Superposé'}),
                },
                operator: {
                    render: new T({
                        en: 'This bike parking is operated by {operator}',
                        nl: 'Deze fietsparking wordt beheerd door {operator}',
                        fr: 'Ce parking est opéré par {operator}'
                    }),
                    template: new T({en: 'A different operator: $$$', nl: 'Een andere beheerder: $$$', fr: 'TODO: fr'}),
                    question: new T({
                        en: 'Who operates this bike station (name of university, shop, city...)?',
                        nl: 'Wie beheert deze fietsenparking (naam universiteit, winkel, stad...)?',
                        fr: 'Qui opére cette station vélo (nom de l\'université, magasin, vile...)'
                    }),
                    private: new T({
                        en: 'Operated by a private person',
                        nl: 'Wordt beheerd door een privépersoon',
                        fr: 'Opéré par un tier privé'
                    }),
                },
                covered: {
                    question: new T({
                        en: 'Is this parking covered? Also select "covered" for indoor parkings.',
                        nl: 'Is deze parking overdekt? Selecteer ook "overdekt" voor fietsparkings binnen een gebouw.',
                        fr: 'TODO: fr'
                    }),
                    yes: new T({
                        en: 'This parking is covered (it has a roof)',
                        nl: 'Deze parking is overdekt (er is een afdak)',
                        fr: 'TODO: fr'
                    }),
                    no: new T({
                        en: 'This parking is not covered',
                        nl: 'Deze parking is niet overdekt',
                        fr: 'TODO: fr'
                    })
                },
                capacity: {
                    question: new T({
                        en: "How many bicycles fit in this bicycle parking (including possible cargo bicycles)?",
                        nl: "Voor hoeveel fietsen is er bij deze fietsparking plaats (inclusief potentiëel bakfietsen)?",
                        fr: "TODO: fr"
                    }),
                    template: new T({
                        en: "This parking fits $nat$ bikes",
                        nl: "Deze parking heeft plaats voor $nat$ fietsen",
                        fr: "TODO: fr"
                    }),
                    render: new T({
                        en: "Place for {capacity} bikes (in total)",
                        nl: "Plaats voor {capacity} fietsen (in totaal)",
                        fr: "TODO: fr"
                    }),
                },
                capacity_cargo: {
                    question: new T({
                        en: "How many cargo bicycles fit in this bicycle parking?",
                        nl: "Voor hoeveel bakfietsen heeft deze fietsparking plaats?",
                        fr: "TODO: fr"
                    }),
                    template: new T({
                        en: "This parking fits $nat$ cargo bikes",
                        nl: "Deze parking heeft plaats voor $nat$ fietsen",
                        fr: "TODO: fr"
                    }),
                    render: new T({
                        en: "Place for {capacity:cargo_bike} cargo bikes",
                        nl: "Plaats voor {capacity:cargo_bike} bakfietsen",
                        fr: "TODO: fr"
                    }),
                },
                access_cargo: {
                    question: new T({
                        en: "Does this bicycle parking have spots for cargo bikes?",
                        nl: "Heeft deze fietsparking plaats voor bakfietsen?",
                        fr: "TODO: fr"
                    }),
                    yes: new T({
                        en: "This parking has room for cargo bikes",
                        nl: "Deze parking heeft plaats voor bakfietsen",
                        fr: "TODO: fr"
                    }),
                    designated: new T({
                        en: "This parking has designated (official) spots for cargo bikes.",
                        nl: "Er zijn speciale plaatsen voorzien voor bakfietsen",
                        fr: "TODO: fr"
                    }),
                    no: new T({
                        en: "You're not allowed to park cargo bikes",
                        nl: "Je mag hier geen bakfietsen parkeren",
                        fr: "TODO: fr"
                    })
                }
            },
            station: {
                name: new T({
                    en: 'bike station (repair, pump or both)',
                    nl: 'fietspunt (herstel, pomp of allebei)',
                    fr: 'station velo (réparation, pompe à vélo)'
                }),
                // title: new T({en: 'Bike station', nl: 'Fietsstation', fr: 'Station vélo'}), Old, non-dynamic title
                titlePump: new T({en: 'Bike pump', nl: 'Fietspomp', fr: 'TODO: fr'}),
                titleRepair: new T({en: 'Bike repair station', nl: 'Herstelpunt', fr: 'TODO: fr'}),
                titlePumpAndRepair: new T({
                    en: 'Bike station (pump & repair)',
                    nl: 'Herstelpunt met pomp',
                    fr: 'TODO: fr'
                }),
                manometer: {
                    question: new T({
                        en: 'Does the pump have a pressure indicator or manometer?',
                        nl: 'Heeft deze pomp een luchtdrukmeter?',
                        fr: 'Est-ce que la pompe à un manomètre integré?'
                    }),
                    yes: new T({en: 'There is a manometer', nl: 'Er is een luchtdrukmeter', fr: 'Il y a un manomètre'}),
                    no: new T({
                        en: 'There is no manometer',
                        nl: 'Er is geen luchtdrukmeter',
                        fr: 'Il n\'y a pas de manomètre'
                    }),
                    broken: new T({
                        en: 'There is manometer but it is broken',
                        nl: 'Er is een luchtdrukmeter maar die is momenteel defect',
                        fr: 'Il y a un manomètre mais il est cassé'
                    })
                },
                electric: {
                    question: new T({
                        en: 'Is this an electric bike pump?',
                        nl: 'Is dit een electrische fietspomp?',
                        fr: 'Est-ce que cette pompe est électrique?'
                    }),
                    manual: new T({en: 'Manual pump', nl: 'Manuele pomp', fr: 'Pompe manuelle'}),
                    electric: new T({en: 'Electrical pump', nl: 'Electrische pomp', fr: 'Pompe électrique'})
                },
                operational: {
                    question: new T({
                        en: 'Is the bike pump still operational?',
                        nl: 'Werkt de fietspomp nog?',
                        fr: 'Est-ce que cette pompe marche t\'elle toujours?'
                    }),
                    operational: new T({
                        en: 'The bike pump is operational',
                        nl: 'De fietspomp werkt nog',
                        fr: 'La pompe est opérationnelle'
                    }),
                    broken: new T({en: 'The bike pump is broken', nl: 'De fietspomp is kapot', fr: 'La pompe est cassé'})
                },
                valves: {
                    question: new T({
                        en: 'What valves are supported?',
                        nl: 'Welke ventielen werken er met de pomp?',
                        fr: 'Quelles valves sont compatibles?'
                    }),
                    default: new T({
                        en: 'There is a default head, so Dunlop, Sclaverand and auto',
                        nl: 'Er is een standaard aansluiting, die dus voor Dunlop, Sclaverand en auto\'s werkt',
                        fr: 'Il y a une valve par défaut, fonctionnant sur les valves Dunlop, Sclaverand et les valves de voitures'
                    }),
                    dunlop: new T({en: 'Only Dunlop', nl: 'Enkel Dunlop', fr: 'TODO: fr'}),
                    sclaverand: new T({
                        en: 'Only Sclaverand (also known as Presta)',
                        nl: 'Enkel Sclaverand (ook gekend als Presta)',
                        fr: 'Seulement Sclaverand (aussi appelé Presta)'
                    }),
                    auto: new T({en: 'Only for cars', nl: 'Enkel voor auto\'s', fr: 'TODO: fr'}),
                    render: new T({
                        en: 'This pump supports the following valves: {valves}',
                        nl: 'Deze pomp werkt met de volgende ventielen: {valves}',
                        fr: 'Cette pompe est compatible avec les valves suivantes: {valves}'
                    }),
                    template: new T({
                        en: 'Some other valve(s): $$$',
                        nl: 'Een ander type ventiel(en): $$$',
                        fr: 'Autre(s) type(s) de valve(s): $$$'
                    })
                },
                chain: {
                    question: new T({
                        en: 'Does this bike repair station have a special tool to repair your bike chain?',
                        nl: 'Heeft dit herstelpunt een speciale reparatieset voor je ketting?',
                        fr: 'Est-ce que cette station vélo a un outils specifique pour réparer la chaîne du velo?'
                    }),
                    yes: new T({
                        en: 'There is a chain tool',
                        nl: 'Er is een reparatieset voor je ketting',
                        fr: 'Il y a un outil pour réparer la chaine'
                    }),
                    no: new T({
                        en: 'There is no chain tool',
                        nl: 'Er is geen reparatieset voor je ketting',
                        fr: 'Il n\'y a pas d\'outil pour réparer la chaine'
                    }),
                },
                operator: {
                    render: new T({
                        en: 'This bike station is operated by {operator}',
                        nl: 'Dit fietspunt wordt beheerd door {operator}',
                        fr: 'Cette station vélo est opéré par {operator}'
                    }),
                    template: new T({en: 'A different operator: $$$', nl: 'Een andere beheerder: $$$', fr: 'TODO: fr'}),
                    question: new T({
                        en: 'Who operates this bike station (name of university, shop, city...)?',
                        nl: 'Wie beheert dit fietsstation (naam universiteit, winkel, stad...)?',
                        fr: 'Qui opére cette station vélo (nom de l\'université, magasin, ville...)?'
                    }),
                    private: new T({
                        en: 'Operated by a private person',
                        nl: 'Wordt beheerd door een privépersoon',
                        fr: 'Operé par un tier privé'
                    }),
                },
                services: {
                    question: new T({
                        en: "Which services are available at this bike station?",
                        nl: "Welke functies biedt dit fietspunt?",
                        fr: "Quels services sont valables à cette station vélo?"
                    }),
                    pump: new T({
                        // Note: this previously read: a pump is available. It is not because the pump is present, that it is available (e.g. broken)
                        en: "There is only a pump present",
                        nl: "Er is enkel een pomp aanwezig",
                        fr: "Il y a seulement une pompe"
                    }),
                    tools: new T({
                        en: "There are only tools (screwdrivers, pliers...) present",
                        nl: "Er is enkel gereedschap aanwezig (schroevendraaier, tang...)",
                        fr: "Il y a seulement des outils (tournevis, pinces...)"
                    }),
                    both: new T({
                        en: "There are both tools and a pump present",
                        nl: "Er is zowel een pomp als gereedschap aanwezig",
                        fr: "IL y a des outils et une pompe"
                    }),
                },
                stand: {
                    question: new T({
                        en: "Does this bike station have a hook to suspend your bike with or a stand to elevate it?",
                        nl: "Heeft dit herstelpunt een haak of standaard om je fiets op te hangen/zetten?",
                        fr: "Est-ce que cette station vélo à un crochet pour suspendre son velo ou une accroche pour l'élevé?"
                    }),
                    yes: new T({
                        en: "There is a hook or stand",
                        nl: "Er is een haak of standaard",
                        fr: "Oui il y a un crochet ou une accroche"
                    }),
                    no: new T({
                        en: "There is no hook or stand",
                        nl: "Er is geen haak of standaard",
                        fr: "Non il n'y pas de crochet ou d'accroche"
                    }),
                },
            },
            shop: {
                name: new T({en: "bike repair/shop", nl: "fietszaak", fr: "magasin ou réparateur de vélo"}),
                
                title: new T({en: "Bike repair/shop", nl: "Fietszaak", fr: "Magasin et réparateur de vélo"}),
                titleRepair: new T({en: "Bike repair", nl: "Fietsenmaker", fr: "Réparateur de vélo"}),
                titleShop: new T({en: "Bike shop", nl: "Fietswinkel", fr: "Magasin de vélo"}),

                titleNamed: new T({
                    en: "Bike repair/shop {name}",
                    nl: "Fietszaak {name}",
                    fr: "Magasin et réparateur de vélo {name}"
                }),
                titleRepairNamed: new T({
                    en: "Bike repair {name}",
                    nl: "Fietsenmaker {name}",
                    fr: "Réparateur de vélo {name}"
                }),
                titleShopNamed: new T({
                    en: "Bike shop {name}",
                    nl: "Fietswinkel {name}",
                    fr: "Magasin de vélo {name}"
                }),


                retail: {
                    question: new T({
                        en: "Does this shop sell bikes?",
                        nl: "Verkoopt deze winkel fietsen?",
                        fr: "Est-ce que ce magasin vend des vélos?"
                    }),
                    yes: new T({
                        en: "This shop sells bikes",
                        nl: "Deze winkel verkoopt fietsen",
                        fr:  "Ce magasin vend des vélos"
                    }),
                    no: new T({
                        en: "This shop doesn't sell bikes",
                        nl: "Deze winkel verkoopt geen fietsen",
                        fr: "Ce magasin ne vend pas de vélo"
                    }),
                },
                repair: {
                    question: new T({
                        en: "Does this shop repair bikes?",
                        nl: "Herstelt deze winkel fietsen?",
                        fr: "Est-ce que ce magasin répare des vélos?"
                    }),
                    yes: new T({en: "This shop repairs bikes", nl: "Deze winkel herstelt fietsen", fr: "Ce magasin répare des vélos"}),
                    no: new T({
                        en: "This shop doesn;t repair bikes",
                        nl: "Deze winkel herstelt geen fietsen",
                        fr: "Ce magasin ne répare pas les vélos"
                    }),
                    sold: new T({en: "This shop only repairs bikes bought here", nl: "Deze winkel herstelt enkel fietsen die hier werden gekocht", fr: "Ce magasin ne répare seulement les vélos achetés là-bas"}),
                    brand: new T({en: "This shop only repairs bikes of a certain brand", nl: "Deze winkel herstelt enkel fietsen van een bepaald merk", fr: "Ce magasin ne répare seulement des marques spécifiques"}),
                },
                rental: {
                    question: new T({
                        en: "Does this shop rent out bikes?",
                        nl: "Verhuurt deze winkel fietsen?",
                        fr: "Est-ce ce magasin loue des vélos?"
                    }),
                    yes: new T({en: "This shop rents out bikes", nl: "Deze winkel verhuurt fietsen", fr: "Ce magasin loue des vélos"}),
                    no: new T({
                        en: "This shop doesn't rent out bikes",
                        nl: "Deze winkel verhuurt geen fietsen",
                        fr: "Ce magasin ne loue pas de vélos"
                    }),
                },
                pump: {
                    question: new T({
                        en: "Does this shop offer a bike pump for use by anyone?",
                        nl: "Biedt deze winkel een fietspomp aan voor iedereen?",
                        fr: "Est-ce que ce magasin offre une pompe en accès libre?"
                    }),
                    yes: new T({
                        en: "This shop offers a bike pump for anyone",
                        nl: "Deze winkel biedt geen fietspomp aan voor eender wie",
                        fr: "Ce magasin offre une pompe en acces libre"
                    }),
                    no: new T({
                        en: "This shop doesn't offer a bike pump for anyone",
                        nl: "Deze winkel biedt een fietspomp aan voor iedereen",
                        fr: "Ce magasin n'offre pas de pompe en libre accès"
                    })
                },
                qName: {
                    question: new T({
                        en: "What is the name of this bicycle shop?",
                        nl: "Wat is de naam van deze fietszaak?",
                        fr: "Quel est le nom du magasin de vélo?"
                    }),
                    render: new T({
                        en: "This bicycle shop is called {name}",
                        nl: "Deze fietszaak heet {name}",
                        fr: "Ce magasin s'appelle {name}"
                    }),
                    template: new T({
                        en: "This bicycle shop is called: $$$",
                        nl: "Deze fietszaak heet: <b>$$$</b>",
                        fr: "Ce magasin s'appelle $$$"
                    })
                },
                secondHand: {
                    question: new T({en: "Does this shop sell second-hand bikes?", nl: "Verkoopt deze winkel tweedehands fietsen?", fr: "Est-ce ce magasin vend des vélos d'occasion"}),
                    yes: new T({en: "This shop sells second-hand bikes", nl: "Deze winkel verkoopt tweedehands fietsen", fr: "Ce magasin vend des vélos d'occasion"}),
                    no: new T({en: "This shop doesn't sell second-hand bikes", nl: "Deze winkel verkoopt geen tweedehands fietsen", fr: "Ce magasin ne vend pas de vélos d'occasion"}),
                    only: new T({en: "This shop only sells second-hand bikes", nl: "Deze winkel verkoopt enkel tweedehands fietsen", fr: "Ce magasin vend seulement des vélos d'occasion"}),
                },
                diy: {
                    question: new T({
                        en: "Are there tools here to repair your own bike?",
                        nl: "Biedt deze winkel gereedschap aan om je fiets zelf te herstellen?",
                        fr: "Est-ce qu'il y a des outils pour réparer son vélo dans ce magasin?",
                    }),
                    yes: new T({
                        en: "This shop offers tools for DIY repair",
                        nl: "Deze winkel biedt gereedschap aan om je fiets zelf te herstellen",
                        fr: "Ce magasin offre des outils pour réparer son vélo soi-même"
                    }),
                    no: new T({
                        en: "This shop doesn't offer tools for DIY repair",
                        nl: "Deze winkel biedt geen gereedschap aan om je fiets zelf te herstellen",
                        fr: "Ce magasin n'offre pas des outils pour réparer son vélo soi-même"
                    }),
                }
            },
            cafe: {
                name: new T({en: "Bike cafe", nl: "Fietscafé", fr: "Café vélo"}),
                title: new T({en: "Bike cafe", nl: "Fietscafé", fr: "Café Vélo"}),
                qName: {
                    question: new T({
                        en: "What is the name of this bike cafe?",
                        nl: "Wat is de naam van dit fietscafé?",
                        fr: "Quel est le nom de ce Café vélo"
                    }),
                    render: new T({
                        en: "This bike cafe is called {name}",
                        nl: "Dit fietscafé heet {name}",
                        fr: "Ce Café vélo s'appelle {name}"
                    }),
                    template: new T({
                        en: "This bike cafe is called: $$$",
                        nl: "Dit fietscafé heet: <b>$$$</b>",
                        fr: "Ce Café vélo s'appelle $$$"
                    })
                },
                repair: {
                    question: new T({
                        en: "Does this bike cafe repair bikes?",
                        nl: "Verkoopt dit fietscafé fietsen?",
                        fr: "Est-ce que ce Café vélo répare les vélos?"
                    }),
                    yes: new T({
                        en: "This bike cafe repairs bikes",
                        nl: "Dit fietscafé herstelt fietsen",
                        fr: "Ce Café vélo répare les vélos"
                    }),
                    no: new T({
                        en: "This bike cafe doesn;t repair bikes",
                        nl: "Dit fietscafé herstelt geen fietsen",
                        fr: "Ce Café vélo ne répare pas les vélos"
                    })
                },
                pump: {
                    question: new T({
                        en: "Does this bike cafe offer a bike pump for use by anyone?",
                        nl: "Biedt dit fietscafé een fietspomp aan voor iedereen?",
                        fr: "Est-ce que ce Café vélo propose une pompe en libre accès"
                    }),
                    yes: new T({
                        en: "This bike cafe offers a bike pump for anyone",
                        nl: "Dit fietscafé biedt geen fietspomp aan voor eender wie",
                        fr: "Ce Café vélo offre une pompe en libre accès"
                    }),
                    no: new T({
                        en: "This bike cafe doesn't offer a bike pump for anyone",
                        nl: "Dit fietscafé biedt een fietspomp aan voor iedereen",
                        fr: "Ce Café vélo n'offre pas de pompe en libre accès"
                    })
                },
                diy: {
                    question: new T({
                        en: "Are there tools here to repair your own bike?",
                        nl: "Biedt dit fietscafé gereedschap aan om je fiets zelf te herstellen?",
                        fr: "Est-ce qu'il y a des outils pour réparer soi-même son vélo?",
                    }),
                    yes: new T({
                        en: "This bike cafe offers tools for DIY repair",
                        nl: "Dit fietscafé biedt gereedschap aan om je fiets zelf te herstellen",
                        fr: "Ce Café vélo propose des outils pour réparer son vélo soi-même"
                    }),
                    no: new T({
                        en: "This bike cafe doesn't offer tools for DIY repair",
                        nl: "Dit fietscafé biedt geen gereedschap aan om je fiets zelf te herstellen",
                        fr: "Ce Café vélo ne propose pas d'outils pour réparer son vélo soi-même"
                    })
                }
            },
            nonBikeShop: {             
                name: new T({
                    en: "shop that sells/repairs bikes",
                    nl: "winkel die fietsen verkoopt/herstelt",
                    fr: "magasin qui repare/vend des vélos"
                }),

                title: new T({
                    en: "Shop that sells/repairs bikes",
                    nl: "Winkel die fietsen verkoopt/herstelt",
                    fr: "Magasin qui répare/vend des vélos"
                }),
                titleRepair: new T({
                    en: "Shop that repairs bikes",
                    nl: "Winkel die fietsen herstelt",
                    fr: "Magasin qui répare les vélos"
                }),
                titleShop: new T({
                    en: "Shop that sells bikes",
                    nl: "Winkel die fietsen verkoopt",
                    fr: "Magasin qui vend des vélos"
                }),
                
                titleNamed: new T({
                    en: "{name} (sells/repairs bikes)",
                    nl: "{name} (verkoopt/herstelt fietsen)",
                    fr: "vend/repare les vélos"
                }),
                titleRepairNamed: new T({
                    en: "{name} (repairs bikes)",
                    nl: "{name} (herstelt fietsen)",
                    fr: "{name} (répare les vélos)"
                }),
                titleShopNamed: new T({
                    en: "{name} (sells bikes)",
                    nl: "{name} (verkoopt fietsen)",
                    fr: "{name} (vend des vélos)"
                }),
            },
            drinking_water: {
                title: new T({
                    en: 'Drinking water',
                    nl: "Drinkbaar water",
                    fr: "Eau potable"
                })
            }
        },

        image: {
            addPicture: new T({en: 'Add picture', nl: 'Voeg foto toe', fr: 'Ajoutez une photo'}),
            uploadingPicture: new T({
                en: 'Uploading your picture...',
                nl: 'Bezig met een foto te uploaden...',
                fr: 'Mettre votre photo en ligne'
            }),
            uploadingMultiple: new T({
                en: 'Uploading {count} of your picture...',
                nl: 'Bezig met {count} foto\'s te uploaden...',
                fr: 'Mettre votre {count} photos en ligne'
            }),
            pleaseLogin: new T({
                en: 'Please login to add a picure',
                nl: 'Gelieve je aan te melden om een foto toe te voegen',
                fr: 'Connectez vous pour mettre une photo en ligne'
            }),
            willBePublished: new T({
                en: 'Your picture will be published: ',
                nl: 'Jouw foto wordt gepubliceerd: ',
                fr: 'Votre photo va être publié'
            }),
            cco: new T({en: 'in the public domain', nl: 'in het publiek domein', fr: 'sur le domaine publique'}),
            ccbs: new T({
                en: 'under the CC-BY-SA-license',
                nl: 'onder de CC-BY-SA-licentie',
                fr: 'sous la license CC-BY-SA'
            }),
            ccb: new T({en: 'under the CC-BY-license', nl: 'onder de CC-BY-licentie', fr: 'sous la license CC-BY'}),
            uploadFailed: new T({
                en: "Could not upload your picture. Do you have internet and are third party API's allowed? Brave browser or UMatrix might block them.",
                nl: "Afbeelding uploaden mislukt. Heb je internet? Gebruik je Brave of UMatrix? Dan moet je derde partijen toelaten.",
                fr: "L'ajout de la photo a échoué. Êtes-vous connecté à Internet?"
            }),
            respectPrivacy: new T({
                en: "Please respect privacy. Do not photograph people nor license plates",
                nl: "Respecteer privacy. Fotografeer geen mensen of nummerplaten",
                fr: "Merci de respecter la vie privée. Ne publiez pas les plaques d\'immatriculation"
            }),
            uploadDone: new T({
                en: "<span class='thanks'>Your picture has been added. Thanks for helping out!</span>",
                nl: "<span class='thanks'>Je afbeelding is toegevoegd. Bedankt om te helpen!</span>",
                fr: "<span class='thanks'>Votre photo est ajouté. Merci beaucoup!</span>"
            })
        },
        centerMessage: {
            loadingData: new T({en: 'Loading data...', nl: 'Data wordt geladen...', fr: 'Chargement des données'}),
            zoomIn: new T({
                en: 'Zoom in to view or edit the data',
                nl: 'Zoom in om de data te zien en te bewerken',
                fr: 'Rapprochez vous sur la carte pour voir ou éditer les données',
            }),
            ready: new T({en: 'Done!', nl: 'Klaar!', fr: 'Finis!'}), 
            retrying: new T({en: "Loading data failed. Trying again... ({count})"})

        },
        general: {
            loginWithOpenStreetMap: new T({en: "Login with OpenStreetMap", nl: "Aanmelden met OpenStreetMap", fr:'Se connecter avec OpenStreeMap'}),
            welcomeBack: new T({
                en: "You are logged in, welcome back!",
                nl: "Je bent aangemeld. Welkom terug!",
                fr: "Vous êtes connecté, bienvenue"
            }),
            loginToStart: new T({
                en: "Login to answer this question",
                nl: "Meld je aan om deze vraag te beantwoorden",
                fr: "Connectez vous pour répondre à cette question"
            }),
            search: {
                search: new Translation({
                    en: "Search a location",
                    nl: "Zoek naar een locatie",
                    fr: "Chercher une location"
                }),
                searching: new Translation({
                    en: "Searching...",
                    nl: "Aan het zoeken...",
                    fr: "Chargement"
                    
                }),
                nothing: new Translation({
                    en: "Nothing found...",
                    nl: "Niet gevonden...",
                    fr: "Rien n'a été trouvé "
                }),
                error: new Translation({
                    en: "Something went wrong...",
                    nl: "Niet gelukt...",
                    fr: "Quelque chose n\'a pas marché..."
             
                })

            },
            returnToTheMap: new T({
                en: "Return to the map",
                nl: "Naar de kaart",
                fr: "Retourner sur la carte"
             
            }),
            save: new T({
                en: "Save",
                nl: "Opslaan",
                fr: "Sauvegarder"
            }),
            cancel: new T({
                en: "Cancel",
                nl: "Annuleren",
                fr: "Annuler"
            }),
            skip: new T({
                en: "Skip this question",
                nl: "Vraag overslaan",
                fr: "Passer la question"
              
            }),
            oneSkippedQuestion: new T({
                en: "One question is skipped",
                nl: "Een vraag is overgeslaan",
                fr: "Une question a été passé"
            }),
            skippedQuestions: new T({
                en: "Some questions are skipped",
                nl: "Sommige vragen zijn overgeslaan",
                fr: "Questions passées"
            }),
            number: new T({
                en: "number",
                nl: "getal",
                fr: "Nombre"
            }),

            osmLinkTooltip: new T({
                en: "See this object on OpenStreetMap for history and more editing options",
                nl: "Bekijk dit object op OpenStreetMap waar geschiedenis en meer aanpasopties zijn",
                fr: "Voir l'historique de cet objet sur OpenStreetMap et plus d'options d'édition"

            }),
            
            add: {
                addNew: new T({
                    en: "Add a new {category} here",
                    nl: "Voeg hier een {category} toe",
                    fr: "Ajouter un/une {category} ici"

                }),
                header: new T({
                    en: "<h2>Add a point?</h2>You clicked somewhere where no data is known yet.<br/>",
                    nl: "<h2>Punt toevoegen?</h2>Je klikte ergens waar er nog geen data is.<br/>",
                    fr: "<h2>Pas de données</h2> vous avez cliqué sur un endroit ou il n'y a pas encore de données. <br/>"

                }),
                pleaseLogin: new T({
                    en: "<a class='activate-osm-authentication'>Please log in to add a new point</a>",
                    nl: "<a class='activate-osm-authentication'>Gelieve je aan te melden om een punt to te voegen</a>",
                    fr: "<a class='activate-osm-authentication'>Vous devez vous connecter pour ajouter un point</a>"
                }),
                zoomInFurther: new T({
                    en: "Zoom in further to add a point.",
                    nl: "Gelieve verder in te zoomen om een punt toe te voegen",
                    fr: "Rapprochez vous pour ajouter un point."
                }),
                stillLoading: new T({
                    en: "The data is still loading. Please wait a bit before you add a new point",
                    nl: "De data wordt nog geladen. Nog even geduld en dan kan je een punt toevoegen.",
                    fr: "Chargement des donnés. Patientez un instant avant d'ajouter un nouveau point"
                }),
                confirmIntro: new T({
                    en: "<h3>Add a {title} here?</h3>The point you create here will be <b>visible for everyone</b>. Please, only add things on to the map if they truly exist. A lot of applications use this data.",
                    nl: "<h3>Voeg hier een {title} toe?</h3>Het punt dat je hier toevoegt, is <b>zichtbaar voor iedereen</b>. Veel applicaties gebruiken deze data, voeg dus enkel punten toe die echt bestaan.",
                    fr: "<h3>Ajouter un/une {title} ici?</h3>Le point que vous ajouter sera visible par tout le monde. Merci d'etre sûr que ce point existe réellement. Beaucoup d'autres applications reposent sur ces données.",

                }),
                confirmButton: new T({
                    en: "Add a {category} here",
                    nl: "Voeg hier een {category} toe",
                    fr: "Ajouter un/une {category} ici"
                })
            },
            pickLanguage: new T({
                en: "Choose a language",
                nl: "Kies je taal",
                fr: "Choisir la langue"
            }),
            about: new T({
                en: "Easily edit and add OpenStreetMap for a certain theme",
                nl: "Easily edit and add OpenStreetMap for a certain theme",
                fr: "Édition facile et ajouter OpenStreetMap pour un certain thème"


            }),
            nameInlineQuestion: new T({
                en: "The name of this {category} is $$$",
                nl: "De naam van dit {category} is $$$",
                fr: "Le nom de cet/cette {category} est $$$",
            }),
            noNameCategory: new T({
                en: "{catehory} without a name",
                nl: "{category} zonder naam",
                fr: "{category} sans nom"
            }),
            questions: {
                phoneNumberOf: new T({
                    en: "What is the phone number of {category}?",
                    nl: "Wat is het telefoonnummer van {category}?",
                    fr: "Quel est le nom de {category}?"
                }),
                phoneNumberIs: new T({
                    en: "The phone number of this {category} is <a href='tel:{phone}' target='_blank'>{phone}</a>",
                    nl: "Het telefoonnummer van {category} is <a href='tel:{phone}' target='_blank'>{phone}</a>",
                    fr: "Le numéro de téléphone de {category} est <a href='tel:{phone}' target='_blank'>{phone}</a>",
                }),
                websiteOf: new T({
                    en: "What is the website of {category}?",
                    nl: "Wat is de website van {category}?",
                    fr: "Quel est le site internet de {category}?"
                }),
                websiteIs: new T({
                    en: "Website: <a href='{website}' target='_blank'>{website}</a>",
                    nl: "Website: <a href='{website}' target='_blank'>{website}</a>",
                    fr: "Website: <a href='{website}' target='_blank'>{website}</a>"
                }),
                emailOf: new T({
                        en: "What is the email address of {category}?",
                        nl: "Wat is het email-adres van {category}?",
                        fr: "Quel est l'adresse email de {category}?"
                    }
                ),
                emailIs: new T({
                    en: "The email address of this {category} is <a href='mailto:{email}' target='_blank'>{email}</a>",
                    nl: "Het email-adres van {category} is <a href='mailto:{email}' target='_blank'>{email}</a>",
                    fr: "L'adresse email de {category} est <a href='mailto:{email}' target='_blank'>{email}</a>"
                }),

            },
            openStreetMapIntro: new T({
                en: "<h3>An Open Map</h3>" +
                    "<p></p>Wouldn't it be cool if there was a single map, which everyone could freely use and edit?" +
                    "A single place to store all geo-information? Then, all those websites with different, small and incompatible maps (which are always outdated) wouldn't be needed anymore.</p>" +
                    "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> is this map. The map data can be used for free (with <a href='https://osm.org/copyright' target='_blank'>attribution and publication of changes to that data</a>)." +
                    " On top of that, everyone can freely add new data and fix errors. This website uses OpenStreetMap as well. All the data is from there, and your answers and corrections are added there as well.</p>" +
                    "<p>A ton of people and application already use OpenStreetMap:  <a href='https://maps.me/' traget='_blank'>Maps.me</a>, <a href='https://osmAnd.net' traget='_blank'>OsmAnd</a>, but also the maps at Facebook, Intsagram, Apple-maps and Bing-maps are (partly) powered by OpenStreetMap." +
                    "If you change something here, it'll be reflected in those applications too - after their next update!</p>",
                nl: "<h3>Een open kaart</h3>" +
                    "<p>Zou het niet fantastisch zijn als er een open kaart zou zijn, die door iedereen aangepast én gebruikt kon worden? Waar iedereen zijn interesses aan zou kunnen toevoegen?" +
                    "Dan zouden er geen duizend-en-één verschillende kleine kaartjes, websites, ... meer nodig zijn</p>" +
                    "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> is deze open kaart. Je mag de kaartdata gratis gebruiken (mits <a href='https://osm.org/copyright' target='_blank'>bronvermelding en herpublicatie van aanpassingen</a>). Daarenboven mag je de kaart ook gratis aanpassen als je een account maakt." +
                    "Ook deze website is gebaseerd op OpenStreetMap. Als je hier een vraag beantwoord, gaat het antwoord daar ook naartoe</p>" +
                    "<p>Tenslotte zijn er reeds vele gebruikers van OpenStreetMap. Denk maar <a href='https://maps.me/' traget='_blank'>Maps.me</a>, <a href='https://osmAnd.net' traget='_blank'>OsmAnd</a>, verschillende gespecialiseerde routeplanners, de achtergrondkaarten op Facebook, Instagram,...<br/> Zelfs Apple Maps en Bing-Maps gebruiken OpenStreetMap in hun kaarten!</p>" +
                    "<p></p>Kortom, als je hier een antwoord geeft of een fout aanpast, zal dat na een tijdje ook in al dié applicaties te zien zijn.</p>",
                fr: "<h3>Une carte ouverte</h3>" +
                    "<p></p>How incroyable se serait d'avoir sur une carte que tout le monde pourrait éditer ouvertement?" +
                    "Une seule et unique plateforme regroupant toutes les informations geographiques? Ainsi nous n'aurons plus besoin de toutes ces petites et incompatibles cartes (souvent non mises à jour).</p>" +
                    "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> est la carte qu'il vous faut!. Toutes les donnees de cette carte peuvent être utilisé gratuitement (avec <a href='https://osm.org/copyright' target='_blank'> d\'attribution et de publication des changements de données</a>)." +
                    " De plus tout le monde est libre d'ajouter de nouvelles données et corriger les erreurs. Ce site internet utilise également OpenStreetMap. Toutes les données y proviennent et tous les ajouts et modifications y seront également ajoutés.</p>" +
                    "<p>De nombreux individus et d'applications utilisent déjà OpenStreetMap:  <a href='https://maps.me/' traget='_blank'>Maps.me</a>, <a href='https://osmAnd.net' traget='_blank'>OsmAnd</a>, mais aussi les cartes de Facebook, Intsagram, Apple-maps et Bing-maps sont(en partie) supporté par OpenStreetMap." +
                    "Si vous modifié quelque chose ici, ces changement seront retranscris sur ces applications aussi - des lors de leur mise à jour! </p>"
            }),
            
            sharescreen: {
                intro: new T({
                    en: "<h3>Share this map</h3> Share this map by copying the link below and sending it to friends and family:",
                    fr: "<h3>Partager cette carte</h3> Partagez cette carte en copiant le lien suivant et envoyer le à vos amis:",
                    nl: "<h3>Deel deze kaart</h3> Kopieer onderstaande link om deze kaart naar vrienden en familie door te sturen:",

                }),
                addToHomeScreen: new T({
                    en: "<h3>Add to your home screen</h3>You can easily add this website to your smartphone home screen for a native feel. Click the 'add to home screen button' in the URL bar to do this.",
                    fr: "<h3>Ajouter à votre page d'accueil</h3> Vous pouvez facilement ajouter la carte à votre écran d'accueil de téléphone. Cliquer sur le boutton 'ajouter à l'evran d'accueil' dans la barre d'URL pour éffecteur cette tâche",
                    nl: "<h3>Voeg toe aan je thuis-scherm</h3>Je kan deze website aan je thuisscherm van je smartphone toevoegen voor een native feel"
                }),
                embedIntro: new T({
                    en: "<h3>Embed on your website</h3>Please, embed this map into your website. <br/>We encourage you to do it - you don't even have to ask permission. <br/>  It is free, and always will be. The more people using this, the more valuable it becomes.",
                    fr: "<h3>Incorporer à votre website</h3>AJouter la carte à votre website. <br/>On vous en encourage - pas besoin de permission. <br/>  C'est gratuit et pour toujours. Le plus de personnes l'utilisent, le mieux ce sera.",
                    nl: "<h3>Plaats dit op je website</h3>Voeg dit kaartje toe op je eigen website.<br/>We moedigen dit zelfs aan - je hoeft geen toestemming te vragen.<br/> Het is gratis en zal dat altijd blijven. Hoe meer het gebruikt wordt, hoe waardevoller"
                })
            },
            morescreen: {
                intro: new T({
                    en: "<h3>More quests</h3>Do you enjoy collecting geodata? <br/>There are more layers available.",
                    fr: "<h3>Plus de thème </h3>Vous aimez collecter des données? <br/>Il y a plus de thèmes disponible.",
                    nl: "<h3>Meer thema's</h3>Vind je het leuk om geodata te verzamelen? <br/> Hier vind je meer opties."
                }),
                
                requestATheme: new T({
                    en: "If you want a custom-built quest, request it <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>here</a>",
                    nl: "Wil je een eigen kaartthema, vraag dit <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>hier aan</a>",
                    fr: "Si vous voulez une autre carte thématique, demandez <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>ici</a>"
                }),

                streetcomplete: new T({
                    en: "Another, similar application is <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
                    fr: "Une autre application similaire est <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
                    nl: "Een andere, gelijkaardige Android-applicatie is <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>"
                }),
                createYourOwnTheme: new T({
                    en: "Create your own MapComplete theme from scratch",
                    nl: "Maak je eigen MapComplete-kaart",
                    fr: "Créez votre propre MapComplete carte"
                })
            },
            readYourMessages: new T({
                en: "Please, read all your OpenStreetMap-messages before adding a new point.",
                nl: "Gelieve eerst je berichten op OpenStreetMap te lezen alvorens nieuwe punten toe te voegen.",
                fr: "Merci de lire tout vos messages d'OpenStreetMap avant d'ajouter un nouveau point.",
            }),
            fewChangesBefore: new T({
                en: "Please, answer a few questions of existing points before adding a new point.",
                nl: "Gelieve eerst enkele vragen van bestaande punten te beantwoorden vooraleer zelf punten toe te voegen.",
                fr: "Merci de répondre à quelques questions à propos de point déjà existant avant d'ajouter de nouveaux points"

            }),
            goToInbox: new T({
                en: "Open inbox",
                nl: "Ga naar de berichten",
                fr: "Ouvrir les messages"
            }),
            getStartedLogin: new T({
                en: "Login with OpenStreetMap to get started",
                nl: "Login met OpenStreetMap om te beginnen",
                fr: "Connectez vous avec OpenStreetMap pour commencer"
            }),
            getStartedNewAccount: new T({
                en: " or <a href='https://www.openstreetmap.org/user/new' target='_blank'>create a new account</a>",
                nl: " of <a href='https://www.openstreetmap.org/user/new' target='_blank'>maak een nieuwe account aan</a> ",
                fr: " ou <a href='https://www.openstreetmap.org/user/new' target='_blank'>registrez vous</a>"
            }),
        },
        favourite: {
            title: new T({en: "Personal theme"}),
            description: new T({
                en: "Create a personal theme based on all the available layers of all themes"
            }),
            panelIntro: new T({
                en: "<h3>Your personal theme</h3>Activate your favourite layers from all the official themes"
            }),
            loginNeeded: new T({en: "<h3>Log in</h3>A personal layout is only available for OpenStreetMap users"}),
            reload: new T({en: "Reload the data"})
        }
    }

    public static W(s: string | UIElement): UIElement {
        if (typeof (s) === "string") {
            return new FixedUiElement(s);
        }
        return s;
    }

    public static WT(s: string | Translation): Translation {
        if (typeof (s) === "string") {
            return new Translation({en: s});
        }
        return s;
    }

    public static CountTranslations() {
        const queue: any = [Translations.t];
        const tr: Translation[] = [];
        while (queue.length > 0) {
            const item = queue.pop();
            if (item instanceof Translation || item.translations !== undefined) {
                tr.push(item);
            } else if (typeof (item) === "string") {
                console.warn("Got single string in translationgs file: ", item);
            } else {
                for (const t in item) {
                    const x = item[t];
                    queue.push(x)
                }
            }
        }

        const langaugeCounts = {};
        for (const translation of tr) {
            for (const language in translation.translations) {
                if (langaugeCounts[language] === undefined) {
                    langaugeCounts[language] = 1
                } else {
                    langaugeCounts[language]++;
                }
            }
        }
        for (const language in langaugeCounts) {
            console.log("Total translations in ", language, langaugeCounts[language], "/", tr.length)
        }

    }

}
