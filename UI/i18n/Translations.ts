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
                en: 'Cyclofix - an open map for cyclists',
                nl: 'Cyclofix - een open kaart voor fietsers',
                fr: 'Cyclofix - Une carte ouverte pour les cyclistes',
                gl: 'Cyclofix - Un mapa aberto para os ciclistas'
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
                    "Pour plus d'informations sur le projet cyclofix, rendez-vous sur <a href='https://cyclofix.osm.be/'>cyclofix.osm.be</a>.",
                gl: "O obxectivo deste mapa é amosar ós ciclistas unha solución doada de empregar para atopar a infraestrutura axeitada para as súas necesidades.<br><br>" + //isto funciona na lingua falada: ; pensa na estación de arranxo de bicicletas máis preta, por exemplo.
                    "Podes obter a túa localización precisa (só para dispositivos móbiles) e escoller as capas que sexan relevantes para ti na esquina inferior esquerda. " +
                    "Tamén podes empregar esta ferramenta para engadir ou editar puntos de interese ó mapa e fornecer máis datos respondendo as cuestións.<br><br>" +
                    "Todas as modificacións que fagas serán gardadas de xeito automático na base de datos global do OpenStreetMap e outros poderán reutilizalos libremente.<br><br>" +
                    "Para máis información sobre o proxecto cyclofix, vai a <a href='https://cyclofix.osm.be/'>cyclofix.osm.be</a>."
            }),
           
            station: {
                name: new T({
                    en: 'bike station (repair, pump or both)',
                    nl: 'fietspunt (herstel, pomp of allebei)',
                    fr: 'station velo (réparation, pompe à vélo)',
                    gl: 'estación de bicicletas (arranxo, bomba de ar ou ambos)'
                }),
                // title: new T({en: 'Bike station', nl: 'Fietsstation', fr: 'Station vélo', gl: 'Estación de bicicletas'}), Old, non-dynamic title
                titlePump: new T({
                  
                }),
                titleRepair: new T({
                    en: 'Bike repair station',
                    nl: 'Herstelpunt',
                    fr: 'TODO: fr',
                    gl: 'Estación de arranxo de bicicletas'
                }),
                titlePumpAndRepair: new T({
                    en: 'Bike station (pump & repair)',
                    nl: 'Herstelpunt met pomp',
                    fr: 'Point station velo avec pompe',
                    gl: 'Estación de bicicletas (arranxo e bomba de ar)'
                }),
                
                valves: {
                   
                    default: new T({
                         }),
                    dunlop: new T({}),
                    sclaverand: new T({
                      
                    }),
                  
                    template: new T({
                        en: 'Some other valve(s): $$$',
                        nl: 'Een ander type ventiel(en): $$$',
                        fr: 'Autre(s) type(s) de valve(s): $$$',
                        gl: 'Algunha outra válvula: $$$'
                    })
                },
            },
            shop: {
                name: new T({
                    en: "bike repair/shop",
                    nl: "fietszaak",
                    fr: "magasin ou réparateur de vélo",
                    gl: "tenda/arranxo de bicicletas"
                }),

                title: new T({
                    en: "Bike repair/shop",
                    nl: "Fietszaak",
                    fr: "Magasin et réparateur de vélo",
                    gl: "Tenda/arranxo de bicicletas"
                }),
                titleRepair: new T({
                    en: "Bike repair",
                    nl: "Fietsenmaker",
                    fr: "Réparateur de vélo",
                    gl: "Arranxo de bicicletas"
                }),
                titleShop: new T({
                    en: "Bike shop",
                    nl: "Fietswinkel",
                    fr: "Magasin de vélo",
                    gl: "Tenda de bicicletas"
                }),

                titleNamed: new T({
                    en: "Bike repair/shop {name}",
                    nl: "Fietszaak {name}",
                    fr: "Magasin et réparateur de vélo {name}",
                    gl: "Tenda/arranxo de bicicletas {name}"
                }),
                titleRepairNamed: new T({
                    en: "Bike repair {name}",
                    nl: "Fietsenmaker {name}",
                    fr: "Réparateur de vélo {name}",
                    gl: "Arranxo de bicicletas {name}"
                }),
                titleShopNamed: new T({
                    en: "Bike shop {name}",
                    nl: "Fietswinkel {name}",
                    fr: "Magasin de vélo {name}",
                    gl: "Tenda de bicicletas {name}"
                }),


                retail: {
                    question: new T({
                        en: "Does this shop sell bikes?",
                        nl: "Verkoopt deze winkel fietsen?",
                        fr: "Est-ce que ce magasin vend des vélos?",
                        gl: "Esta tenda vende bicicletas?"
                    }),
                    yes: new T({
                        en: "This shop sells bikes",
                        nl: "Deze winkel verkoopt fietsen",
                        fr: "Ce magasin vend des vélos",
                        gl: "Esta tenda vende bicicletas"
                    }),
                    no: new T({
                        en: "This shop doesn't sell bikes",
                        nl: "Deze winkel verkoopt geen fietsen",
                        fr: "Ce magasin ne vend pas de vélo",
                        gl: "Esta tenda non vende bicicletas"
                    }),
                },
                repair: {
                    question: new T({
                        en: "Does this shop repair bikes?",
                        nl: "Herstelt deze winkel fietsen?",
                        fr: "Est-ce que ce magasin répare des vélos?",
                        gl: "Esta tenda arranxa bicicletas?"
                    }),
                    yes: new T({
                        en: "This shop repairs bikes",
                        nl: "Deze winkel herstelt fietsen",
                        fr: "Ce magasin répare des vélos",
                        gl: "Esta tenda arranxa bicicletas"
                    }),
                    no: new T({
                        en: "This shop doesn't repair bikes",
                        nl: "Deze winkel herstelt geen fietsen",
                        fr: "Ce magasin ne répare pas les vélos",
                        gl: "Esta tenda non arranxa bicicletas"
                    }),
                    sold: new T({
                        en: "This shop only repairs bikes bought here",
                        nl: "Deze winkel herstelt enkel fietsen die hier werden gekocht",
                        fr: "Ce magasin ne répare seulement les vélos achetés là-bas",
                        gl: "Esta tenda só arranxa bicicletas mercadas aquí"
                    }),
                    brand: new T({
                        en: "This shop only repairs bikes of a certain brand",
                        nl: "Deze winkel herstelt enkel fietsen van een bepaald merk",
                        fr: "Ce magasin ne répare seulement des marques spécifiques",
                        gl: "Esta tenda só arranxa bicicletas dunha certa marca"
                    }),
                },
                rental: {
                    question: new T({
                        en: "Does this shop rent out bikes?",
                        nl: "Verhuurt deze winkel fietsen?",
                        fr: "Est-ce ce magasin loue des vélos?",
                        gl: "Esta tenda aluga bicicletas?"
                    }),
                    yes: new T({
                        en: "This shop rents out bikes",
                        nl: "Deze winkel verhuurt fietsen",
                        fr: "Ce magasin loue des vélos",
                        gl: "Esta tenda aluga bicicletas"
                    }),
                    no: new T({
                        en: "This shop doesn't rent out bikes",
                        nl: "Deze winkel verhuurt geen fietsen",
                        fr: "Ce magasin ne loue pas de vélos",
                        gl: "Esta tenda non aluga bicicletas"
                    }),
                },
                pump: {
                    question: new T({
                        en: "Does this shop offer a bike pump for use by anyone?",
                        nl: "Biedt deze winkel een fietspomp aan voor iedereen?",
                        fr: "Est-ce que ce magasin offre une pompe en accès libre?",
                        gl: "Esta tenda ofrece unha bomba de ar para uso de calquera persoa?"
                    }),
                    yes: new T({
                        en: "This shop offers a bike pump for anyone",
                        nl: "Deze winkel biedt geen fietspomp aan voor eender wie",
                        fr: "Ce magasin offre une pompe en acces libre",
                        gl: "Esta tenda ofrece unha bomba de ar para uso de calquera persoa"
                    }),
                    no: new T({
                        en: "This shop doesn't offer a bike pump for anyone",
                        nl: "Deze winkel biedt een fietspomp aan voor iedereen",
                        fr: "Ce magasin n'offre pas de pompe en libre accès",
                        gl: "Esta tenda non ofrece unha bomba de ar para uso de calquera persoa"
                    })
                },
                qName: {
                    question: new T({
                        en: "What is the name of this bicycle shop?",
                        nl: "Wat is de naam van deze fietszaak?",
                        fr: "Quel est le nom du magasin de vélo?",
                        gl: "Cal é o nome desta tenda de bicicletas?"
                    }),
                    render: new T({
                        en: "This bicycle shop is called {name}",
                        nl: "Deze fietszaak heet {name}",
                        fr: "Ce magasin s'appelle {name}",
                        gl: "Esta tenda de bicicletas chámase {name}"
                    }),
                    template: new T({
                        en: "This bicycle shop is called: $$$",
                        nl: "Deze fietszaak heet: <b>$$$</b>",
                        fr: "Ce magasin s'appelle $$$",
                        gl: "Esta tenda de bicicletas chámase: $$$"
                    })
                },
                secondHand: {
                    question: new T({
                        en: "Does this shop sell second-hand bikes?",
                        nl: "Verkoopt deze winkel tweedehands fietsen?",
                        fr: "Est-ce ce magasin vend des vélos d'occasion",
                        gl: "Esta tenda vende bicicletas de segunda man?"
                    }),
                    yes: new T({
                        en: "This shop sells second-hand bikes",
                        nl: "Deze winkel verkoopt tweedehands fietsen",
                        fr: "Ce magasin vend des vélos d'occasion",
                        gl: "Esta tenda vende bicicletas de segunda man"
                    }),
                    no: new T({
                        en: "This shop doesn't sell second-hand bikes",
                        nl: "Deze winkel verkoopt geen tweedehands fietsen",
                        fr: "Ce magasin ne vend pas de vélos d'occasion",
                        gl: "Esta tenda non vende bicicletas de segunda man"
                    }),
                    only: new T({
                        en: "This shop only sells second-hand bikes",
                        nl: "Deze winkel verkoopt enkel tweedehands fietsen",
                        fr: "Ce magasin vend seulement des vélos d'occasion",
                        gl: "Esta tenda só vende bicicletas de segunda man"
                    }),
                },
                diy: {
                    question: new T({
                        en: "Are there tools here to repair your own bike?",
                        nl: "Biedt deze winkel gereedschap aan om je fiets zelf te herstellen?",
                        fr: "Est-ce qu'il y a des outils pour réparer son vélo dans ce magasin?",
                        gl: "Hai ferramentas aquí para arranxar a túa propia bicicleta?"
                    }),
                    yes: new T({
                        en: "This shop offers tools for DIY repair",
                        nl: "Deze winkel biedt gereedschap aan om je fiets zelf te herstellen",
                        fr: "Ce magasin offre des outils pour réparer son vélo soi-même",
                        gl: "Hai ferramentas aquí para arranxar a túa propia bicicleta"
                    }),
                    no: new T({
                        en: "This shop doesn't offer tools for DIY repair",
                        nl: "Deze winkel biedt geen gereedschap aan om je fiets zelf te herstellen",
                        fr: "Ce magasin n'offre pas des outils pour réparer son vélo soi-même",
                        gl: "Non hai ferramentas aquí para arranxar a túa propia bicicleta"
                    }),
                }
            },
            nonBikeShop: {             
                name: new T({
                    en: "shop that sells/repairs bikes",
                    nl: "winkel die fietsen verkoopt/herstelt",
                    fr: "magasin qui repare/vend des vélos",
                    gl: "tenda que vende/arranxa bicicletas"
                }),

                title: new T({
                    en: "Shop that sells/repairs bikes",
                    nl: "Winkel die fietsen verkoopt/herstelt",
                    fr: "Magasin qui répare/vend des vélos",
                    gl: "Tenda que vende/arranxa bicicletas"
                }),
                titleRepair: new T({
                    en: "Shop that repairs bikes",
                    nl: "Winkel die fietsen herstelt",
                    fr: "Magasin qui répare les vélos",
                    gl: "Tenda que arranxa bicicletas"
                }),
                titleShop: new T({
                    en: "Shop that sells bikes",
                    nl: "Winkel die fietsen verkoopt",
                    fr: "Magasin qui vend des vélos",
                    gl: "Tenda que vende bicicletas"
                }),
                
                titleNamed: new T({
                    en: "{name} (sells/repairs bikes)",
                    nl: "{name} (verkoopt/herstelt fietsen)",
                    fr: "vend/repare les vélos",
                    gl: "{name} (vende/arranxa bicicletas)"
                }),
                titleRepairNamed: new T({
                    en: "{name} (repairs bikes)",
                    nl: "{name} (herstelt fietsen)",
                    fr: "{name} (répare les vélos)",
                    gl: "{name} (arranxa bicicletas)"
                }),
                titleShopNamed: new T({
                    en: "{name} (sells bikes)",
                    nl: "{name} (verkoopt fietsen)",
                    fr: "{name} (vend des vélos)",
                    gl: "{name} (vende bicicletas)"
                }),
            }
        },

        image: {
            addPicture: new T({
                en: 'Add picture',
                es: 'Añadir foto',
                ca: 'Afegir foto',
                nl: 'Voeg foto toe',
                fr: 'Ajoutez une photo',
                gl: 'Engadir imaxe'
            }),

            uploadingPicture: new T({
                en: 'Uploading your picture...',
                nl: 'Bezig met een foto te uploaden...',
                es: 'Subiendo tu imagen ...',
                ca: 'Pujant la teva imatge ...',
                fr: 'Mettre votre photo en ligne',
                gl: 'Subindo a túa imaxe...'
            }),

            uploadingMultiple: new T({
                en: 'Uploading {count} of your picture...',
                nl: 'Bezig met {count} foto\'s te uploaden...',
                ca: 'Pujant {count} de la teva imatge...',
                es: 'Subiendo {count} de tus fotos...',
                fr: 'Mettre votre {count} photos en ligne',
                gl: 'Subindo {count} das túas imaxes...'
            }),

            pleaseLogin: new T({
                en: 'Please login to add a picure',
                nl: 'Gelieve je aan te melden om een foto toe te voegen',
                es: 'Entra para subir una foto',
                ca: 'Entra per pujar una foto',
                fr: 'Connectez vous pour mettre une photo en ligne',
                gl: 'Inicia a sesión para subir unha imaxe'
            }),

            willBePublished: new T({
                en: 'Your picture will be published: ',
                es: 'Tu foto será publicada: ',
                ca: 'La teva foto serà publicada: ',
                nl: 'Jouw foto wordt gepubliceerd: ',
                fr: 'Votre photo va être publié',
                gl: 'A túa imaxe será publicada: '
            }),

            cco: new T({
                en: 'in the public domain',
                ca: 'en domini públic',
                es: 'en dominio público',
                nl: 'in het publiek domein',
                fr: 'sur le domaine publique',
                gl: 'no dominio público'
            }),

            ccbs: new T({
                en: 'under the CC-BY-SA-license',
                nl: 'onder de CC-BY-SA-licentie',
                ca: 'sota llicència CC-BY-SA',
                es: 'bajo licencia CC-BY-SA',
                fr: 'sous la license CC-BY-SA',
                gl: 'baixo a licenza CC-BY-SA'
            }),
            ccb: new T({
                en: 'under the CC-BY-license',
                ca: 'sota la llicència CC-BY',
                es: 'bajo licencia CC-BY',
                nl: 'onder de CC-BY-licentie',
                fr: 'sous la license CC-BY',
                gl: 'baixo a licenza CC-BY'
            }),

            uploadFailed: new T({
                en: "Could not upload your picture. Do you have internet and are third party API's allowed? Brave browser or UMatrix might block them.",
                nl: "Afbeelding uploaden mislukt. Heb je internet? Gebruik je Brave of UMatrix? Dan moet je derde partijen toelaten.",
                ca: "No s\'ha pogut carregar la imatge. Tens Internet i es permeten API de tercers? El navegador Brave o UMatrix podria bloquejar-les.",
                es: "No se pudo cargar la imagen. ¿Tienes Internet y se permiten API de terceros? El navegador Brave o UMatrix podría bloquearlas.",
                fr: "L'ajout de la photo a échoué. Êtes-vous connecté à Internet?",
                gl: "Non foi posíbel subir a imaxe. Tes internet e permites API de terceiros? O navegador Brave ou UMatrix podería bloquealas."
            }),

            respectPrivacy: new T({
                en: "Please respect privacy. Do not photograph people nor license plates",
                ca: "Respecta la privacitat. No fotografiïs gent o matrícules",
                es: "Respeta la privacidad. No fotografíes gente o matrículas",
                nl: "Respecteer privacy. Fotografeer geen mensen of nummerplaten",
                fr: "Merci de respecter la vie privée. Ne publiez pas les plaques d\'immatriculation",
                gl: "Respecta a privacidade. Non fotografes xente ou matrículas"
            }),
            uploadDone: new T({
                en: "<span class='thanks'>Your picture has been added. Thanks for helping out!</span>",
                ca: "<span class='thanks'>La teva imatge ha estat afegida. Gràcies per ajudar.</span>",
                es: "<span class='thanks'>Tu imagen ha sido añadida. Gracias por ayudar.</span>",
                nl: "<span class='thanks'>Je afbeelding is toegevoegd. Bedankt om te helpen!</span>",
                fr: "<span class='thanks'>Votre photo est ajouté. Merci beaucoup!</span>",
                gl: "<span class='thanks'>A túa imaxe foi engadida. Grazas por axudar.</span>"
            }),
            dontDelete: new T({
                "nl":"Terug",
                "en":"Cancel"
            }),
            doDelete: new T({
                "nl":"Verwijder afbeelding",
                "en":"Remove image"
            }),
            isDeleted: new T({
                "nl":"Verwijderd",
                "en":"Deleted"
            })
        },
        centerMessage: {
            loadingData: new T({
                en: 'Loading data...',
                ca: 'Carregant dades...',
                es: 'Cargando datos...',
                nl: 'Data wordt geladen...',
                fr: 'Chargement des données',
                gl: 'Cargando os datos...'
            }),
            zoomIn: new T({
                en: 'Zoom in to view or edit the data',
                ca: 'Amplia per veure o editar les dades',
                es: 'Amplía para ver o editar los datos',
                nl: 'Zoom in om de data te zien en te bewerken',
                fr: 'Rapprochez vous sur la carte pour voir ou éditer les données',
                gl: 'Achégate para ollar ou editar os datos'
            }),
            ready: new T({
                en: 'Done!',
                ca: 'Fet.',
                es: 'Hecho.',
                nl: 'Klaar!',
                fr: 'Finis!',
                gl: 'Feito!'
            }),

            retrying: new T({
                en: "Loading data failed. Trying again... ({count})",
                ca: "La càrrega de dades ha fallat.Tornant-ho a intentar... ({count})",
                es: "La carga de datos ha fallado.Volviéndolo a probar... ({count})",
                gl: "A carga dos datos fallou. Tentándoo de novo... ({count})"
            })

        },
        general: {
            loginWithOpenStreetMap: new T({
                en: "Login with OpenStreetMap",
                ca: "Entra a OpenStreetMap",
                es: "Entra en OpenStreetMap",
                nl: "Aanmelden met OpenStreetMap",
                fr: 'Se connecter avec OpenStreeMap',
                gl: "Inicia a sesión no OpenStreetMap"
            }),

            welcomeBack: new T({
                en: "You are logged in, welcome back!",
                ca: "Has entrat, benvingut.",
                es: "Has entrado, bienvenido.",
                nl: "Je bent aangemeld. Welkom terug!",
                fr: "Vous êtes connecté, bienvenue",
                gl: "Iniciaches a sesión, benvido."
            }),
            loginToStart: new T({
                en: "Login to answer this question",
                ca: "Entra per contestar aquesta pregunta",
                es: "Entra para contestar esta pregunta",
                nl: "Meld je aan om deze vraag te beantwoorden",
                fr: "Connectez vous pour répondre à cette question",
                gl: "Inicia a sesión para responder esta pregunta"
            }),
            search: {
                search: new Translation({
                    en: "Search a location",
                    ca: "Cerca una ubicació",
                    es: "Busca una ubicación",
                    nl: "Zoek naar een locatie",
                    fr: "Chercher une location",
                    gl: "Procurar unha localización"
                }),
                searching: new Translation({
                    en: "Searching...",
                    ca: "Cercant...",
                    es: "Buscando...",
                    nl: "Aan het zoeken...",
                    fr: "Chargement",
                    gl: "Procurando..."

                }),
                nothing: new Translation({
                    en: "Nothing found...",
                    ca: "Res trobat.",
                    es: "Nada encontrado.",
                    nl: "Niet gevonden...",
                    fr: "Rien n'a été trouvé ",
                    gl: "Nada atopado..."
                }),
                error: new Translation({
                    en: "Something went wrong...",
                    ca: "Alguna cosa no ha sortit bé...",
                    es: "Alguna cosa no ha ido bien...",
                    nl: "Niet gelukt...",
                    fr: "Quelque chose n\'a pas marché...",
                    gl: "Algunha cousa non foi ben..."

                })

            },
            returnToTheMap: new T({
                en: "Return to the map",
                ca: "Tornar al mapa",
                es: "Volver al mapa",
                nl: "Naar de kaart",
                fr: "Retourner sur la carte",
                gl: "Voltar ó mapa"
            }),
            save: new T({
                en: "Save",
                ca: "Desar",
                es: "Guardar",
                nl: "Opslaan",
                fr: "Sauvegarder",
                gl: "Gardar"
            }),
            cancel: new T({
                en: "Cancel",
                ca: "Cancel·lar",
                es: "Cancelar",
                nl: "Annuleren",
                fr: "Annuler",
                gl: "Desbotar"
            }),
            skip: new T({
                en: "Skip this question",
                ca: "Saltar aquesta pregunta",
                es: "Saltar esta pregunta",
                nl: "Vraag overslaan",
                fr: "Passer la question",
                gl: "Ignorar esta pregunta"
            }),
            oneSkippedQuestion: new T({
                en: "One question is skipped",
                ca: "Has ignorat una pregunta",
                es: "Has ignorado una pregunta",
                nl: "Een vraag is overgeslaan",
                fr: "Une question a été passé",
                gl: "Ignoraches unha pregunta"
            }),
            skippedQuestions: new T({
                en: "Some questions are skipped",
                ca: "Has ignorat algunes preguntes",
                es: "Has ignorado algunas preguntas",
                nl: "Sommige vragen zijn overgeslaan",
                fr: "Questions passées",
                gl: "Ignoraches algunhas preguntas"
            }),
            number: new T({
                en: "number",
                ca: "nombre",
                es: "número",
                nl: "getal",
                fr: "Nombre",
                gl: "número"
            }),

            osmLinkTooltip: new T({
                en: "See this object on OpenStreetMap for history and more editing options",
                ca: "Mira aquest objecte a OpenStreetMap per veure historial i altres opcions d\'edició",
                es: "Mira este objeto en OpenStreetMap para ver historial y otras opciones de edición",
                nl: "Bekijk dit object op OpenStreetMap waar geschiedenis en meer aanpasopties zijn",
                fr: "Voir l'historique de cet objet sur OpenStreetMap et plus d'options d'édition",
                gl: "Ollar este obxecto no OpenStreetMap para ollar o historial e outras opcións de edición"
            }),
            add: {
                addNew: new T({
                    en: "Add a new {category} here",
                    ca: "Afegir {category} aquí",
                    es: "Añadir {category} aquí",
                    nl: "Voeg hier een {category} toe",
                    fr: "Ajouter un/une {category} ici",
                    gl: "Engadir {category} aquí"
                }),
                header: new T({
                    en: "<h2>Add a point?</h2>You clicked somewhere where no data is known yet.<br/>",
                    ca: "<h2>Vols afegir un punt?</h2>Has marcat un lloc on no coneixem les dades.<br/>",
                    es: "<h2>Quieres añadir un punto?</h2>Has marcado un lugar del que no conocemos los datos.<br/>",
                    nl: "<h2>Punt toevoegen?</h2>Je klikte ergens waar er nog geen data is. Kies hieronder welk punt je wilt toevoegen<br/>",
                    fr: "<h2>Pas de données</h2>Vous avez cliqué sur un endroit ou il n'y a pas encore de données. <br/>",
                    gl: "<h2>Queres engadir un punto?</h2>Marcaches un lugar onde non coñecemos os datos.<br/>"
                }),
                pleaseLogin: new T({
                    en: "<a class='activate-osm-authentication'>Please log in to add a new point</a>",
                    ca: "<a class='activate-osm-authentication'>Entra per afegir un nou punt</a>",
                    es: "<a class='activate-osm-authentication'>Entra para añadir un nuevo punto</a>",
                    nl: "<a class='activate-osm-authentication'>Gelieve je aan te melden om een punt to te voegen</a>",
                    fr: "<a class='activate-osm-authentication'>Vous devez vous connecter pour ajouter un point</a>",
                    gl: "<a class='activate-osm-authentication'>Inicia a sesión para engadir un novo punto</a>"
                }),
                zoomInFurther: new T({
                    en: "Zoom in further to add a point.",
                    ca: "Apropa per afegir un punt.",
                    es: "Acerca para añadir un punto.",
                    nl: "Gelieve verder in te zoomen om een punt toe te voegen",
                    fr: "Rapprochez vous pour ajouter un point.",
                    gl: "Achégate para engadir un punto."
                }),
                stillLoading: new T({
                    en: "The data is still loading. Please wait a bit before you add a new point",
                    ca: "Les dades es segueixen carregant. Espera una mica abans d\'afegir cap punt.",
                    es: "Los datos se siguen cargando. Espera un poco antes de añadir ningún punto.",
                    nl: "De data wordt nog geladen. Nog even geduld en dan kan je een punt toevoegen.",
                    fr: "Chargement des donnés. Patientez un instant avant d'ajouter un nouveau point",
                    gl: "Os datos seguen a cargarse. Agarda un intre antes de engadir ningún punto."
                }),
                confirmIntro: new T({
                    en: "<h3>Add a {title} here?</h3>The point you create here will be <b>visible for everyone</b>. Please, only add things on to the map if they truly exist. A lot of applications use this data.",
                    ca: "<h3>Afegir {title} aquí?</h3>El punt que estàs creant <b>el veurà tothom</b>. Només afegeix coses que realment existeixin. Moltes aplicacions fan servir aquestes dades.",
                    es: "<h3>Añadir {title} aquí?</h3>El punto que estás creando <b>lo verá todo el mundo</b>. Sólo añade cosas que realmente existan. Muchas aplicaciones usan estos datos.",
                    nl: "<h3>Voeg hier een {title} toe?</h3>Het punt dat je hier toevoegt, is <b>zichtbaar voor iedereen</b>. Veel applicaties gebruiken deze data, voeg dus enkel punten toe die echt bestaan.",
                    fr: "<h3>Ajouter un/une {title} ici?</h3>Le point que vous ajouter sera visible par tout le monde. Merci d'etre sûr que ce point existe réellement. Beaucoup d'autres applications reposent sur ces données.",
                    gl: "<h3>Engadir {title} aquí?</h3>O punto que estás a crear <b>será ollado por todo o mundo</b>. Só engade cousas que realmente existan. Moitas aplicacións empregan estes datos."

                }),
                confirmButton: new T({
                    en: "Add a {category} here",
                    ca: "Afegir {category} aquí",
                    es: "Añadir {category} aquí",
                    nl: "Voeg hier een {category} toe",
                    fr: "Ajouter un/une {category} ici",
                    gl: "Engadir {category} aquí"
                })
            },
            pickLanguage: new T({
                en: "Choose a language",
                ca: "Tria idioma",
                es: "Escoge idioma",
                nl: "Kies je taal",
                fr: "Choisir la langue",
                gl: "Escoller lingua"
            }),
            about: new T({
                en: "Easily edit and add OpenStreetMap for a certain theme",
                ca: "Edita facilment i afegeix punts a OpenStreetMap d\'una temàtica determinada",
                es: "Edita facilmente y añade puntos en OpenStreetMap de un tema concreto",
                nl: "Easily edit and add OpenStreetMap for a certain theme",
                fr: "Édition facile et ajouter OpenStreetMap pour un certain thème",
                gl: "Editar doadamente e engadir puntos no OpenStreetMap dun eido en concreto"


            }),
            nameInlineQuestion: new T({
                en: "The name of this {category} is $$$",
                ca: "{category}: El seu nom és $$$",
                es: "{category}: Su nombre es $$$",
                nl: "De naam van dit {category} is $$$",
                fr: "Le nom de cet/cette {category} est $$$",
                gl: "{category}: O teu nome é $$$"
            }),
            noNameCategory: new T({
                en: "{category} without a name",
                ca: "{category} sense nom",
                es: "{category} sin nombre",
                nl: "{category} zonder naam",
                fr: "{category} sans nom",
                gl: "{category} sen nome"
            }),
            questions: {
                phoneNumberOf: new T({
                    en: "What is the phone number of {category}?",
                    ca: "Quin és el telèfon de {category}?",
                    es: "Qué teléfono tiene {category}?",
                    nl: "Wat is het telefoonnummer van {category}?",
                    fr: "Quel est le nom de {category}?",
                    gl: "Cal é o número de teléfono de {category}?"
                }),
                phoneNumberIs: new T({
                    en: "The phone number of this {category} is <a href='tel:{phone}' target='_blank'>{phone}</a>",
                    ca: "El número de telèfon de {category} és <a href='tel:{phone}' target='_blank'>{phone}</a>",
                    es: "El número de teléfono de {category} es <a href='tel:{phone}' target='_blank'>{phone}</a>",
                    nl: "Het telefoonnummer van {category} is <a href='tel:{phone}' target='_blank'>{phone}</a>",
                    fr: "Le numéro de téléphone de {category} est <a href='tel:{phone}' target='_blank'>{phone}</a>",
                    gl: "O número de teléfono de {category} é <a href='tel:{phone}' target='_blank'>{phone}</a>"
                }),
                websiteOf: new T({
                    en: "What is the website of {category}?",
                    ca: "Quina és la pàgina web de {category}?",
                    es: "Cual es la página web de {category}?",
                    nl: "Wat is de website van {category}?",
                    fr: "Quel est le site internet de {category}?",
                    gl: "Cal é a páxina web de {category}?"
                }),
                websiteIs: new T({
                    en: "Website: <a href='{website}' target='_blank'>{website}</a>",
                    ca: "Pàgina web: <a href='{website}' target='_blank'>{website}</a>",
                    es: "Página web: <a href='{website}' target='_blank'>{website}</a>",
                    nl: "Website: <a href='{website}' target='_blank'>{website}</a>",
                    fr: "Website: <a href='{website}' target='_blank'>{website}</a>",
                    gl: "Páxina web: <a href='{website}' target='_blank'>{website}</a>"
                }),
                emailOf: new T({
                        en: "What is the email address of {category}?",
                        ca: "Quina és l\'adreça de correu-e de {category}?",
                        es: "¿Qué dirección de correu tiene {category}?",
                        nl: "Wat is het email-adres van {category}?",
                        fr: "Quel est l'adresse email de {category}?",
                        gl: "Cal é o enderezo de correo electrónico de {category}?"
                    }
                ),
                emailIs: new T({
                    en: "The email address of this {category} is <a href='mailto:{email}' target='_blank'>{email}</a>",
                    ca: "L\'adreça de correu de {category} és <a href='mailto:{email}' target='_blank'>{email}</a>",
                    es: "La dirección de correo de {category} es <a href='mailto:{email}' target='_blank'>{email}</a>",
                    nl: "Het email-adres van {category} is <a href='mailto:{email}' target='_blank'>{email}</a>",
                    fr: "L'adresse email de {category} est <a href='mailto:{email}' target='_blank'>{email}</a>",
                    gl: "O enderezo de correo electrónico de {category} é <a href='mailto:{email}' target='_blank'>{email}</a>"
                }),

            },
            openStreetMapIntro: new T({
                en: "<h3>An Open Map</h3>" +
                    "<p></p>Wouldn't it be cool if there was a single map, which everyone could freely use and edit?" +
                    "A single place to store all geo-information? Then, all those websites with different, small and incompatible maps (which are always outdated) wouldn't be needed anymore.</p>" +
                    "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> is this map. The map data can be used for free (with <a href='https://osm.org/copyright' target='_blank'>attribution and publication of changes to that data</a>)." +
                    " On top of that, everyone can freely add new data and fix errors. This website uses OpenStreetMap as well. All the data is from there, and your answers and corrections are added there as well.</p>" +
                    "<p>A ton of people and application already use OpenStreetMap:  <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, but also the maps at Facebook, Instagram, Apple-maps and Bing-maps are (partly) powered by OpenStreetMap." +
                    "If you change something here, it'll be reflected in those applications too - after their next update!</p>",
                es: "<h3>Un mapa abierto</h3>" +
                    "<p></p>¿No sería genial si hubiera un solo mapa, que todos pudieran usar y editar libremente?" +
                    "¿Un solo lugar para almacenar toda la información geográfica? Entonces, todos esos sitios web con mapas diferentes, pequeños e incompatibles (que siempre están desactualizados) ya no serían necesarios.</p>" +
                    "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> es ese mapa. Los datos del mapa se pueden utilizar de forma gratuita (con <a href='https://osm.org/copyright' target='_blank'> atribución y publicación de cambios en esos datos</a>)." +
                    "Además de eso, todos pueden agregar libremente nuevos datos y corregir errores. Este sitio web también usa OpenStreetMap. Todos los datos provienen de allí, y tus respuestas y correcciones también se añadirán allí.</p>" +
                    "<p>Muchas personas y aplicaciones ya usan OpenStreetMap: <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, pero también los mapas de Facebook, Instagram, Apple y Bing son (en parte) impulsados ​​por OpenStreetMap ." +
                    "Si cambias algo aquí, también se reflejará en esas aplicaciones, en su próxima actualización</p>",
                ca: "<h3>Un mapa obert</h3>" +
                    "<p></p>No seria genial si hagués un únic mapa, que tothom pogués utilitzar i editar lliurement?" +
                    "Un sol lloc on emmagatzemar tota la informació geogràfica? Llavors tots aquests llocs web amb mapes diferents petits i incompatibles (que sempre estaran desactulitzats) ja no serien necessaris.</p>" +
                    "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> és aquest mapa. Les dades del mapa es poden utilitzar de franc (amb <a href='https://osm.org/copyright' target='_blank'> atribució i publicació de canvis en aquestes dades</a>)." +
                    "A més a més, tothom pot agregar lliurement noves dades i corregir errors. De fet, aquest lloc web també fa servir OpenStreetMap. Totes les dades provenen d\'allà i les teves respostes i correccions també s\'afegiran allà.</p>" +
                    "<p>Moltes persones i aplicacions ja utilitzen OpenStreetMap: <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, però també els mapes de Facebook, Instagram, Apple i Bing són (en part) impulsats ​​per OpenStreetMap." +
                    "Si canvies alguna cosa aquí també es reflectirà en aquestes aplicacions en la seva propera actualització.</p>",
                nl: "<h3>Een open kaart</h3>" +
                    "<p>Zou het niet fantastisch zijn als er een open kaart zou zijn die door iedereen aangepast én gebruikt kan worden? Een kaart iedereen zijn interesses aan zou kunnen toevoegen? " +
                    "Dan zouden er geen duizend-en-één verschillende kleine kaartjes, websites, ... meer nodig zijn</p>" +
                    "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> is deze open kaart. Je mag de kaartdata gratis gebruiken (mits <a href='https://osm.org/copyright' target='_blank'>bronvermelding en herpublicatie van aanpassingen</a>). Daarenboven mag je de kaart ook gratis aanpassen als je een account maakt. " +
                    "Ook deze website is gebaseerd op OpenStreetMap. Als je hier een vraag beantwoord, gaat het antwoord daar ook naartoe</p>" +
                    "<p>Tenslotte zijn er reeds vele gebruikers van OpenStreetMap. Denk maar <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, verschillende gespecialiseerde routeplanners, de achtergrondkaarten op Facebook, Instagram,...<br/>" +
                    "Zelfs Apple Maps en Bing-Maps gebruiken OpenStreetMap in hun kaarten!</p>" +
                    "</p>" +
                    "<p>Kortom, als je hier een punt toevoegd of een vraag beantwoord, zal dat na een tijdje ook in al dié applicaties te zien zijn.</p>",
                fr: "<h3>Une carte ouverte</h3>" +
                    "<p></p>How incroyable se serait d'avoir sur une carte que tout le monde pourrait éditer ouvertement?" +
                    "Une seule et unique plateforme regroupant toutes les informations geographiques? Ainsi nous n'aurons plus besoin de toutes ces petites et incompatibles cartes (souvent non mises à jour).</p>" +
                    "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> est la carte qu'il vous faut!. Toutes les donnees de cette carte peuvent être utilisé gratuitement (avec <a href='https://osm.org/copyright' target='_blank'> d\'attribution et de publication des changements de données</a>)." +
                    " De plus tout le monde est libre d'ajouter de nouvelles données et corriger les erreurs. Ce site internet utilise également OpenStreetMap. Toutes les données y proviennent et tous les ajouts et modifications y seront également ajoutés.</p>" +
                    "<p>De nombreux individus et d'applications utilisent déjà OpenStreetMap:  <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, mais aussi les cartes de Facebook, Instagram, Apple-maps et Bing-maps sont(en partie) supporté par OpenStreetMap." +
                    "Si vous modifié quelque chose ici, ces changement seront retranscris sur ces applications aussi - des lors de leur mise à jour! </p>",
                gl: "<h3>Un mapa aberto</h3>" +
                    "<p></p>Non sería xenial se houbera un só mapa, que todos puideran empregar e editar de xeito libre?" +
                    "Un só lugar para almacenar toda a información xeográfica? Entón, todos eses sitios web con mapas diferentes, pequenos e incompatíbeis (que sempre están desactualizados) xa non serían necesarios.</p>" +
                    "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> é ese mapa. Os datos do mapa pódense empregar de balde (con <a href='https://osm.org/copyright' target='_blank'> atribución e publicación de modificacións neses datos</a>)." +
                    "Ademais diso, todos poden engadir de xeito ceibe novos datos e corrixir erros. Este sitio web tamén emprega o OpenStreetMap. Todos os datos proveñen de alí, e as túas respostas e correccións tamén serán engadidas alí.</p>" +
                    "<p>Moitas persoas e aplicacións xa empregan o OpenStreetMap: <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, pero tamén os mapas do Facebook, Instagram, Apple e Bing son (en parte) impulsados ​​polo OpenStreetMap." +
                    "Se mudas algo aquí, tamén será reflexado nesas aplicacións, na súa seguinte actualización!</p>"
            }),
            
            sharescreen: {
                intro: new T({
                    en: "<h3>Share this map</h3> Share this map by copying the link below and sending it to friends and family:",
                    ca: "<h3>Comparteix aquest mapa</h3> Comparteix aquest mapa copiant l\'enllaç de sota i enviant-lo a amics i família:",
                    es: "<h3>Comparte este mapa</h3> Comparte este mapa copiando el enlace de debajo y enviándolo a amigos y familia:",
                    fr: "<h3>Partager cette carte</h3> Partagez cette carte en copiant le lien suivant et envoyer le à vos amis:",
                    nl: "<h3>Deel deze kaart</h3> Kopieer onderstaande link om deze kaart naar vrienden en familie door te sturen:",
                    gl: "<h3>Comparte este mapa</h3> Comparte este mapa copiando a ligazón de embaixo e enviándoa ás amizades e familia:"

                }),
                addToHomeScreen: new T({
                    en: "<h3>Add to your home screen</h3>You can easily add this website to your smartphone home screen for a native feel. Click the 'add to home screen button' in the URL bar to do this.",
                    ca: "<h3>Afegir-lo a la pantalla d\'inici</h3>Pots afegir aquesta web a la pantalla d\'inici del teu smartphone per a que es vegi més nadiu. Apreta al botó 'afegir a l\'inici' a la barra d\'adreces URL per fer-ho.",
                    es: "<h3>Añadir a la pantalla de inicio</h3>Puedes añadir esta web en la pantalla de inicio de tu smartphone para que se vea más nativo. Aprieta el botón 'añadir a inicio' en la barra de direcciones URL para hacerlo.",
                    fr: "<h3>Ajouter à votre page d'accueil</h3> Vous pouvez facilement ajouter la carte à votre écran d'accueil de téléphone. Cliquer sur le boutton 'ajouter à l'evran d'accueil' dans la barre d'URL pour éffecteur cette tâche",
                    gl: "<h3>Engadir á pantalla de inicio</h3>Podes engadir esta web na pantalla de inicio do teu smartphone para que se vexa máis nativo. Preme o botón 'engadir ó inicio' na barra de enderezos URL para facelo.",
                    nl: "<h3>Voeg toe aan je thuis-scherm</h3>Je kan deze website aan je thuisscherm van je smartphone toevoegen voor een native feel"
                }),
                embedIntro: new T({
                    en: "<h3>Embed on your website</h3>Please, embed this map into your website. <br/>We encourage you to do it - you don't even have to ask permission. <br/>  It is free, and always will be. The more people using this, the more valuable it becomes.",
                    ca: "<h3>Inclou-ho a la teva pàgina web</h3>Inclou aquest mapa dins de la teva pàgina web. <br/> T\'animem a que ho facis, no cal que demanis permís. <br/>  És de franc, i sempre ho serà. A més gent que ho faci servir més valuós serà.",
                    es: "<h3>Inclúyelo en tu página web</h3>Incluye este mapa en tu página web. <br/> Te animamos a que lo hagas, no hace falta que pidas permiso. <br/> Es gratis, y siempre lo será. A más gente que lo use más valioso será.",
                    fr: "<h3>Incorporer à votre website</h3>AJouter la carte à votre website. <br/>On vous en encourage - pas besoin de permission. <br/>  C'est gratuit et pour toujours. Le plus de personnes l'utilisent, le mieux ce sera.",
                    gl: "<h3>Inclúeo na túa páxina web</h3>Inclúe este mapa na túa páxina web. <br/> Animámoche a que o fagas, non fai falla que pidas permiso. <br/> É de balde, e sempre será. Canta máis xente que o empregue máis valioso será.",
                    nl: "<h3>Plaats dit op je website</h3>Voeg dit kaartje toe op je eigen website.<br/>We moedigen dit zelfs aan - je hoeft geen toestemming te vragen.<br/> Het is gratis en zal dat altijd blijven. Hoe meer het gebruikt wordt, hoe waardevoller"
                }),
                copiedToClipboard: new T({
                    en: "Link copied to clipboard",
                    gl: "Ligazón copiada ó portapapeis",
                    nl: "Link gekopieerd naar klembord"
                }),
                thanksForSharing: new T({
                    en: "Thanks for sharing!",
                    gl: "Grazas por compartir!",
                    nl: "Bedankt om te delen!"
                }),
                editThisTheme: new T({
                    en: "Edit this theme",
                    gl: "Editar este tema",
                    nl: "Pas dit thema aan"
                }),
                editThemeDescription: new T({
                    en: "Add or change questions to this map theme",
                    gl: "Engadir ou mudar preguntas a este tema do mapa",
                    nl: "Pas vragen aan of voeg vragen toe aan dit kaartthema",
                }),
                fsUserbadge: new T({
                    en: "Enable the login-button",
                    gl: "Activar botón de inicio de sesión",
                    nl: "Activeer de login-knop"
                }),
                fsSearch: new T({
                    en: "Enable the search bar",
                    gl: "Activar a barra de procura",
                    nl: "Activeer de zoekbalk"
                }),
                fsWelcomeMessage: new T({
                    en: "Show the welcome message popup and associated tabs",
                    gl: "Amosar a xanela emerxente da mensaxe de benvida e as lapelas asociadas",
                    nl: "Toon het welkomstbericht en de bijhorende tabbladen "
                }),
                fsLayers: new T({
                    en: "Enable thelayer control",
                    gl: "Activar o control de capas",
                    nl: "Toon de knop voor laagbediening"
                }),

                fsLayerControlToggle: new T({
                    en: "Start with the layer control expanded",
                    gl: "Comenza co control de capas expandido",
                    nl: "Toon de laagbediening meteen volledig"
                }),
                fsAddNew: new T({
                    en: "Enable the 'add new POI' button",
                    nl: "Activeer het toevoegen van nieuwe POI",
                    gl: "Activar o botón de 'engadir novo PDI'",
                }),
                fsGeolocation: new T({
                    en: "Enable the 'geolocate-me' button (mobile only)",
                    gl: "Activar o botón de 'xeolocalizarme' (só móbil)",
                    nl: "Toon het knopje voor geolocalisatie (enkel op mobiel)"
                }),
                fsIncludeCurrentBackgroundMap: new T({
                    en: "Include the current background choice <b>{name}</b>",
                    nl: "Gebruik de huidige achtergrond <b>{name}</b>"
                }),
                fsIncludeCurrentLayers: new T({
                    en: "Include the current layer choices",
                    nl: "Toon enkel de huidig getoonde lagen"
                }),
                fsIncludeCurrentLocation: new T({
                    en: "Include current location",
                    nl: "Start op de huidige locatie"
                })
            },
            morescreen: {
                intro: new T({
                    en: "<h3>More quests</h3>Do you enjoy collecting geodata? <br/>There are more themes available.",
                    ca: "<h3>Més peticions</h3>T\'agrada captar dades? <br/>Hi ha més capes disponibles.",
                    es: "<h3>Más peticiones</h3>Te gusta captar datos? <br/>Hay más capas disponibles.",
                    fr: "<h3>Plus de thème </h3>Vous aimez collecter des données? <br/>Il y a plus de thèmes disponible.",
                    nl: "<h3>Meer thema's</h3>Vind je het leuk om geodata te verzamelen? <br/> Hier vind je meer kaartthemas.",
                    gl: "<h3>Máis tarefas</h3>Góstache captar datos? <br/>Hai máis capas dispoñíbeis."
                }),
                
                requestATheme: new T({
                    en: "If you want a custom-built quest, request it <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>here</a>",
                    ca: "Si vols que et fem una petició pròpia , demana-la <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>aquí</a>",
                    es: "Si quieres que te hagamos una petición propia , pídela <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>aquí</a>",
                    nl: "Wil je een eigen kaartthema, vraag dit <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>hier aan</a>",
                    fr: "Si vous voulez une autre carte thématique, demandez <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>ici</a>",
                    gl: "Se queres que che fagamos unha tarefa propia , pídea <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>aquí</a>"
                }),

                streetcomplete: new T({
                    en: "Another, similar application is <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
                    ca: "Una altra aplicació similar és <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
                    es: "Otra aplicación similar es <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
                    fr: "Une autre application similaire est <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
                    nl: "Een andere, gelijkaardige Android-applicatie is <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
                    gl: "Outra aplicación semellante é <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>"
                }),
                createYourOwnTheme: new T({
                    en: "Create your own MapComplete theme from scratch",
                    ca: "Crea la teva pròpia petició completa de MapComplete des de zero.",
                    es: "Crea tu propia petición completa de MapComplete desde cero.",
                    nl: "Maak je eigen MapComplete-kaart",
                    fr: "Créez votre propre MapComplete carte",
                    gl: "Crea o teu propio tema completo do MapComplete dende cero."
                })
            },
            readYourMessages: new T({
                en: "Please, read all your OpenStreetMap-messages before adding a new point.",
                ca: "Llegeix tots els teus missatges d\'OpenStreetMap abans d\'afegir nous punts.",
                es: "Lee todos tus mensajes de OpenStreetMap antes de añadir nuevos puntos.",
                nl: "Gelieve eerst je berichten op OpenStreetMap te lezen alvorens nieuwe punten toe te voegen.",
                fr: "Merci de lire tout vos messages d'OpenStreetMap avant d'ajouter un nouveau point.",
                gl: "Le todos a túas mensaxes do OpenStreetMap antes de engadir novos puntos."
            }),
            fewChangesBefore: new T({
                en: "Please, answer a few questions of existing points before adding a new point.",
                ca: "Contesta unes quantes preguntes sobre punts existents abans d\'afegir-ne un de nou.",
                es: "Contesta unas cuantas preguntas sobre puntos existentes antes de añadir nuevos.",
                nl: "Gelieve eerst enkele vragen van bestaande punten te beantwoorden vooraleer zelf punten toe te voegen.",
                fr: "Merci de répondre à quelques questions à propos de point déjà existant avant d'ajouter de nouveaux points",
                gl: "Responde unhas cantas preguntas sobre puntos existentes antes de engadir novos."

            }),
            goToInbox: new T({
                en: "Open inbox",
                es: "Abrir mensajes",
                ca: "Obrir missatges",
                nl: "Ga naar de berichten",
                fr: "Ouvrir les messages",
                gl: "Abrir mensaxes"
            }),
            getStartedLogin: new T({
                en: "Login with OpenStreetMap to get started",
                es: "Entra en OpenStreetMap para empezar",
                ca: "Entra a OpenStreetMap per començar",
                nl: "Login met OpenStreetMap om te beginnen",
                fr: "Connectez vous avec OpenStreetMap pour commencer"
            }),
            getStartedNewAccount: new T({
                en: " or <a href='https://www.openstreetmap.org/user/new' target='_blank'>create a new account</a>",
                nl: " of <a href='https://www.openstreetmap.org/user/new' target='_blank'>maak een nieuwe account aan</a> ",
                fr: " ou <a href='https://www.openstreetmap.org/user/new' target='_blank'>registrez vous</a>",
                es: " o <a href='https://www.openstreetmap.org/user/new' target='_blank'>crea una nueva cuenta</a>",
                ca: " o <a href='https://www.openstreetmap.org/user/new' target='_blank'>crea un nou compte</a>",
                gl: " ou <a href='https://www.openstreetmap.org/user/new' target='_blank'>crea unha nova conta</a>"
            }),
            noTagsSelected: new T({
                en: "No tags selected",
                es: "No se han seleccionado etiquetas",
                ca: "No s\'han seleccionat etiquetes",
                gl: "Non se seleccionaron etiquetas"
            }),
            customThemeIntro: new T({
                en: "<h3>Custom themes</h3>These are previously visited user-generated themes.",
                nl: "<h3>Onofficiële themea's</h3>Je bezocht deze thema's gemaakt door andere OpenStreetMappers eerder",
                gl: "<h3>Temas personalizados</h3>Estes son temas xerados por usuarios previamente visitados."
            }), aboutMapcomplete: new T({
                en:"<h3>About MapComplete</h3>" +
                    "<p>MapComplete is an OpenStreetMap editor that is meant to help everyone to easily add information on a <b>single theme.</b></p>" +
                    "<p>Only features relevant to a single theme are shown with a few predefined questions, in order to keep things <b>simple and extremly user-friendly</b>." +
                    "The theme maintainer can also choose a language for the interface, choose to disable elements or even to embed it into a different website without any UI-element at all.</p>" + 
                  
                    "<p>However, another important part of MapComplete is to always <b>offer the next step</b> to learn more about OpenStreetMap:" +
                    "<ul>" +
                    "<li>An iframe without UI-elements will link to a full-screen version</li>" +
                    "<li>The fullscreen version offers information about OpenStreetMap</li>" +
                    "<li>If you're not logged in, you're asked to log in</li>" +
                    "<li>If you answered a single question, you are allowed to add points</li>" +
                    "<li>At a certain point, the actual added tags appear which later get linked to the wiki...</li>" +
                    "</ul></p>" +
                    "<p>Do you notice an issue with MapComplete? Do you have a feature request? Do you want to help translating? " +
                    "Head over to <a href='https://github.com/pietervdvn/MapComplete' target='_blank'>the source code</a> or <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>issue tracker.</a></p>",
                nl:"<h3>Over MapComplete</h3>" +
                    "<p>MapComplete is een OpenStreetMap-editor om eenvoudig informatie toe te voegen over <b>één enkel onderwerp</b>.</p>" +
                    "<p>Om de editor zo <b>simpel en gebruiksvriendelijk mogelijk</b> te houden, worden enkel objecten relevant voor het thema getoond." +
                    "Voor deze objecten kunnen dan vragen beantwoord worden, of men kan een nieuw punt van dit thema toevoegen." +
                    "De maker van het thema kan er ook voor opteren om een aantal elementen van de gebruikersinterface uit te schakelen of de taal ervan in te stellen.</p>" +

                    "<p>Een ander belangrijk aspect is om bezoekers stap voor stap meer te leren over OpenStreetMap:" +
                    "<ul>" +
                    "<li>Een iframe zonder verdere uitleg linkt naar de volledige versie van MapComplete</li>" +
                    "<li>De volledige versie heeft uitleg over OpenStreetMap</li>" +
                    "<li>Als je niet aangemeld bent, wordt er je gevraagd dit te doen</li>" +
                    "<li>Als je minstens één vraag hebt beantwoord, kan je punten gaan toevoegen.</li>" +
                    "<li>Heb je genoeg changesets, dan verschijnen de tags die wat later doorlinken naar de wiki</li>" +
                    "</ul></p>" +
                    "<p>Merk je een bug of wil je een extra feature? Wil je helpen vertalen? Bezoek dan de <a href='https://github.com/pietervdvn/MapComplete' target='_blank'>broncode</a> en <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>issue tracker</a></p>",

            }),
            backgroundMap: new T({
                "en":"Background map",
                "nl":"Achtergrondkaart"
            })


        },
        favourite: {

            title: new T({
                en: "Personal theme",
                nl: "Persoonlijk thema",
                es: "Interficie personal",
                ca: "Interfície personal",
                gl: "Tema personalizado"
            }),
            description: new T({
                en: "Create a personal theme based on all the available layers of all themes",
                es: "Crea una interficie basada en todas las capas disponibles de todas las interficies",
                ca: "Crea una interfície basada en totes les capes disponibles de totes les interfícies",
                gl: "Crea un tema baseado en todas as capas dispoñíbeis de todos os temas"
            }),


            panelIntro: new T({
                en: "<h3>Your personal theme</h3>Activate your favourite layers from all the official themes",
                ca: "<h3>La teva interfície personal</h3>Activa les teves capes favorites de totes les interfícies oficials",
                es: "<h3>Tu interficie personal</h3>Activa tus capas favoritas de todas las interficies oficiales",
                gl: "<h3>O teu tema personalizado</h3>Activa as túas capas favoritas de todos os temas oficiais"
            }),
            loginNeeded: new T({
                en: "<h3>Log in</h3>A personal layout is only available for OpenStreetMap users",
                es: "<h3>Entrar</h3>El diseño personalizado sólo está disponible para los usuarios de OpenstreetMap",
                ca: "<h3>Entrar</h3>El disseny personalizat només està disponible pels usuaris d\' OpenstreetMap",
                gl: "<h3>Iniciar a sesión</h3>O deseño personalizado só está dispoñíbel para os usuarios do OpenstreetMap"
            }),
            reload: new T({
                en: "Reload the data",
                es: "Recarga los datos",
                ca: "Recarrega les dades",
                gl: "Recargar os datos"
            })
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