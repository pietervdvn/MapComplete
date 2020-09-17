import Translation from "./Translation";
import T from "./Translation";
import {UIElement} from "../UIElement";
import {FixedUiElement} from "../Base/FixedUiElement";


export default class Translations {

    constructor() {
        throw "Translations is static. If you want to intitialize a new translation, use the singular form"
    }


    static t = {
        image: {
            addPicture: new T({
                en: 'Add picture',
                es: 'Añadir foto',
                ca: 'Afegir foto',
                nl: 'Voeg foto toe',
                fr: 'Ajoutez une photo',
                gl: 'Engadir imaxe',
                de: "Bild hinzufügen"
            }),

            uploadingPicture: new T({
                en: 'Uploading your picture...',
                nl: 'Bezig met een foto te uploaden...',
                es: 'Subiendo tu imagen ...',
                ca: 'Pujant la teva imatge ...',
                fr: 'Mettre votre photo en ligne',
                gl: 'Subindo a túa imaxe...',
                de: 'Ihr Bild hochladen...'
            }),

            uploadingMultiple: new T({
                en: 'Uploading {count} of your picture...',
                nl: 'Bezig met {count} foto\'s te uploaden...',
                ca: 'Pujant {count} de la teva imatge...',
                es: 'Subiendo {count} de tus fotos...',
                fr: 'Mettre votre {count} photos en ligne',
                gl: 'Subindo {count} das túas imaxes...',
                de: '{count} Ihrer Bilder hochgeladen...'
            }),

            pleaseLogin: new T({
                en: 'Please login to add a picure',
                nl: 'Gelieve je aan te melden om een foto toe te voegen',
                es: 'Entra para subir una foto',
                ca: 'Entra per pujar una foto',
                fr: 'Connectez vous pour mettre une photo en ligne',
                gl: 'Inicia a sesión para subir unha imaxe',
                de: 'Bitte einloggen, um ein Bild hinzuzufügen'
            }),

            willBePublished: new T({
                en: 'Your picture will be published: ',
                es: 'Tu foto será publicada: ',
                ca: 'La teva foto serà publicada: ',
                nl: 'Jouw foto wordt gepubliceerd: ',
                fr: 'Votre photo va être publié: ',
                gl: 'A túa imaxe será publicada: ',
                de: 'Ihr Bild wird veröffentlicht: '
            }),

            cco: new T({
                en: 'in the public domain',
                ca: 'en domini públic',
                es: 'en dominio público',
                nl: 'in het publiek domein',
                fr: 'sur le domaine publique',
                gl: 'no dominio público',
                de: 'in die Public Domain'
            }),

            ccbs: new T({
                en: 'under the CC-BY-SA-license',
                nl: 'onder de CC-BY-SA-licentie',
                ca: 'sota llicència CC-BY-SA',
                es: 'bajo licencia CC-BY-SA',
                fr: 'sous la license CC-BY-SA',
                gl: 'baixo a licenza CC-BY-SA',
                de: 'unter der CC-BY-SA-Lizenz'
            }),
            ccb: new T({
                en: 'under the CC-BY-license',
                ca: 'sota la llicència CC-BY',
                es: 'bajo licencia CC-BY',
                nl: 'onder de CC-BY-licentie',
                fr: 'sous la license CC-BY',
                gl: 'baixo a licenza CC-BY',
                de: 'unter der CC-BY-Lizenz'
            }),

            uploadFailed: new T({
                en: "Could not upload your picture. Do you have internet and are third party API's allowed? Brave browser or UMatrix might block them.",
                nl: "Afbeelding uploaden mislukt. Heb je internet? Gebruik je Brave of UMatrix? Dan moet je derde partijen toelaten.",
                ca: "No s\'ha pogut carregar la imatge. Tens Internet i es permeten API de tercers? El navegador Brave o UMatrix podria bloquejar-les.",
                es: "No se pudo cargar la imagen. ¿Tienes Internet y se permiten API de terceros? El navegador Brave o UMatrix podría bloquearlas.",
                fr: "L'ajout de la photo a échoué. Êtes-vous connecté à Internet?",
                gl: "Non foi posíbel subir a imaxe. Tes internet e permites API de terceiros? O navegador Brave ou UMatrix podería bloquealas.",
                de: "Wir konnten Ihr Bild nicht hochladen. Haben Sie Internet und sind API's von Dritten erlaubt? Brave Browser oder UMatrix blockieren evtl..",
            }),

            respectPrivacy: new T({
                en: "Please respect privacy. Do not photograph people nor license plates",
                ca: "Respecta la privacitat. No fotografiïs gent o matrícules",
                es: "Respeta la privacidad. No fotografíes gente o matrículas",
                nl: "Respecteer privacy. Fotografeer geen mensen of nummerplaten",
                fr: "Merci de respecter la vie privée. Ne publiez pas les plaques d\'immatriculation",
                gl: "Respecta a privacidade. Non fotografes xente ou matrículas",
                de: "Bitte respektieren Sie die Privatsphäre. Fotografieren Sie weder Personen noch Nummernschilder"
            }),
            uploadDone: new T({
                en: "<span class='thanks'>Your picture has been added. Thanks for helping out!</span>",
                ca: "<span class='thanks'>La teva imatge ha estat afegida. Gràcies per ajudar.</span>",
                es: "<span class='thanks'>Tu imagen ha sido añadida. Gracias por ayudar.</span>",
                nl: "<span class='thanks'>Je afbeelding is toegevoegd. Bedankt om te helpen!</span>",
                fr: "<span class='thanks'>Votre photo est ajouté. Merci beaucoup!</span>",
                gl: "<span class='thanks'>A túa imaxe foi engadida. Grazas por axudar.</span>",
                de: "<span class='thanks'>Ihr Bild wurde hinzugefügt. Vielen Dank für Ihre Hilfe!</span>",
            }),
            dontDelete: new T({
                "nl":"Terug",
                "en":"Cancel",
                "de": "Abbrechen"
            }),
            doDelete: new T({
                "nl":"Verwijder afbeelding",
                "en":"Remove image",
                "de": "Bild entfernen"
            }),
            isDeleted: new T({
                "nl":"Verwijderd",
                "en":"Deleted",
                "de": "Gelöscht"
            })
        },
        centerMessage: {
            loadingData: new T({
                en: 'Loading data...',
                ca: 'Carregant dades...',
                es: 'Cargando datos...',
                nl: 'Data wordt geladen...',
                fr: 'Chargement des données',
                gl: 'Cargando os datos...',
                de: 'Daten werden geladen...'
            }),
            zoomIn: new T({
                en: 'Zoom in to view or edit the data',
                ca: 'Amplia per veure o editar les dades',
                es: 'Amplía para ver o editar los datos',
                nl: 'Zoom in om de data te zien en te bewerken',
                fr: 'Rapprochez vous sur la carte pour voir ou éditer les données',
                gl: 'Achégate para ollar ou editar os datos',
                de: 'Vergrößern, um die Daten anzuzeigen oder zu bearbeiten'
            }),
            ready: new T({
                en: "Done!",
                ca: "Fet.",
                es: "Hecho.",
                nl: "Klaar!",
                fr: "Finis!",
                gl: "Feito!",
                de: "Erledigt!"
            }),

            retrying: new T({
                en: "Loading data failed. Trying again... ({count})",
                ca: "La càrrega de dades ha fallat.Tornant-ho a intentar... ({count})",
                es: "La carga de datos ha fallado.Volviéndolo a probar... ({count})",
                gl: "A carga dos datos fallou. Tentándoo de novo... ({count})",
                de: "Laden von Daten fehlgeschlagen. Erneuter Versuch... ({count})",
            })

        },
        general: {
            loginWithOpenStreetMap: new T({
                en: "Login with OpenStreetMap",
                ca: "Entra a OpenStreetMap",
                es: "Entra en OpenStreetMap",
                nl: "Aanmelden met OpenStreetMap",
                fr: 'Se connecter avec OpenStreeMap',
                gl: "Inicia a sesión no OpenStreetMap",
                de: "Anmeldung mit OpenStreetMap"
            }),

            welcomeBack: new T({
                en: "You are logged in, welcome back!",
                ca: "Has entrat, benvingut.",
                es: "Has entrado, bienvenido.",
                nl: "Je bent aangemeld. Welkom terug!",
                fr: "Vous êtes connecté, bienvenue",
                gl: "Iniciaches a sesión, benvido.",
                de: "Sie sind eingeloggt, willkommen zurück!"
            }),
            loginToStart: new T({
                en: "Login to answer this question",
                ca: "Entra per contestar aquesta pregunta",
                es: "Entra para contestar esta pregunta",
                nl: "Meld je aan om deze vraag te beantwoorden",
                fr: "Connectez vous pour répondre à cette question",
                gl: "Inicia a sesión para responder esta pregunta",
                de: "Anmelden, um diese Frage zu beantworten",
            }),
            search: {
                search: new Translation({
                    en: "Search a location",
                    ca: "Cerca una ubicació",
                    es: "Busca una ubicación",
                    nl: "Zoek naar een locatie",
                    fr: "Chercher une location",
                    gl: "Procurar unha localización",
                    de: "Einen Ort suchen"
                }),
                searching: new Translation({
                    en: "Searching...",
                    ca: "Cercant...",
                    es: "Buscando...",
                    nl: "Aan het zoeken...",
                    fr: "Chargement",
                    gl: "Procurando...",
                    de: "Auf der Suche..."

                }),
                nothing: new Translation({
                    en: "Nothing found...",
                    ca: "Res trobat.",
                    es: "Nada encontrado.",
                    nl: "Niet gevonden...",
                    fr: "Rien n'a été trouvé ",
                    gl: "Nada atopado...",
                    de: "Nichts gefunden..."
                }),
                error: new Translation({
                    en: "Something went wrong...",
                    ca: "Alguna cosa no ha sortit bé...",
                    es: "Alguna cosa no ha ido bien...",
                    nl: "Niet gelukt...",
                    fr: "Quelque chose n\'a pas marché...",
                    gl: "Algunha cousa non foi ben...",
                    de: "Etwas ging schief..."
                })

            },
            returnToTheMap: new T({
                en: "Return to the map",
                ca: "Tornar al mapa",
                es: "Volver al mapa",
                nl: "Naar de kaart",
                fr: "Retourner sur la carte",
                gl: "Voltar ó mapa",
                de: "Zurück zur Karte"
            }),
            save: new T({
                en: "Save",
                ca: "Desar",
                es: "Guardar",
                nl: "Opslaan",
                fr: "Sauvegarder",
                gl: "Gardar",
                de: "Speichern"
            }),
            cancel: new T({
                en: "Cancel",
                ca: "Cancel·lar",
                es: "Cancelar",
                nl: "Annuleren",
                fr: "Annuler",
                gl: "Desbotar",
                de: "Abbrechen"
            }),
            skip: new T({
                en: "Skip this question",
                ca: "Saltar aquesta pregunta",
                es: "Saltar esta pregunta",
                nl: "Vraag overslaan",
                fr: "Passer la question",
                gl: "Ignorar esta pregunta",
                de: "Diese Frage überspringen"
            }),
            oneSkippedQuestion: new T({
                en: "One question is skipped",
                ca: "Has ignorat una pregunta",
                es: "Has ignorado una pregunta",
                nl: "Een vraag is overgeslaan",
                fr: "Une question a été passé",
                gl: "Ignoraches unha pregunta",
                de: "Eine Frage wurde übersprungen"
            }),
            skippedQuestions: new T({
                en: "Some questions are skipped",
                ca: "Has ignorat algunes preguntes",
                es: "Has ignorado algunas preguntas",
                nl: "Sommige vragen zijn overgeslaan",
                fr: "Questions passées",
                gl: "Ignoraches algunhas preguntas",
                de: "Einige Fragen wurden übersprungen"
            }),
            number: new T({
                en: "number",
                ca: "nombre",
                es: "número",
                nl: "getal",
                fr: "Nombre",
                gl: "número",
                de: "Zahl"
            }),

            osmLinkTooltip: new T({
                en: "See this object on OpenStreetMap for history and more editing options",
                ca: "Mira aquest objecte a OpenStreetMap per veure historial i altres opcions d\'edició",
                es: "Mira este objeto en OpenStreetMap para ver historial y otras opciones de edición",
                nl: "Bekijk dit object op OpenStreetMap waar geschiedenis en meer aanpasopties zijn",
                fr: "Voir l'historique de cet objet sur OpenStreetMap et plus d'options d'édition",
                gl: "Ollar este obxecto no OpenStreetMap para ollar o historial e outras opcións de edición",
                de: "Dieses Objekt auf OpenStreetMap anschauen für die Geschichte und weitere Bearbeitungsmöglichkeiten"
            }),
            add: {
                addNew: new T({
                    en: "Add a new {category} here",
                    ca: "Afegir {category} aquí",
                    es: "Añadir {category} aquí",
                    nl: "Voeg hier een {category} toe",
                    fr: "Ajouter un/une {category} ici",
                    gl: "Engadir {category} aquí",
                    de: "Hier eine neue {category} hinzufügen"
                }),
                header: new T({
                    en: "<h2>Add a point?</h2>You clicked somewhere where no data is known yet.<br/>",
                    ca: "<h2>Vols afegir un punt?</h2>Has marcat un lloc on no coneixem les dades.<br/>",
                    es: "<h2>Quieres añadir un punto?</h2>Has marcado un lugar del que no conocemos los datos.<br/>",
                    nl: "<h2>Punt toevoegen?</h2>Je klikte ergens waar er nog geen data is. Kies hieronder welk punt je wilt toevoegen<br/>",
                    fr: "<h2>Pas de données</h2>Vous avez cliqué sur un endroit ou il n'y a pas encore de données. <br/>",
                    gl: "<h2>Queres engadir un punto?</h2>Marcaches un lugar onde non coñecemos os datos.<br/>",
                    de: "<h2>Punkt hinzufügen?</h2>Sie haben irgendwo geklickt, wo noch keine Daten bekannt sind.<br/>"
                }),
                pleaseLogin: new T({
                    en: "<a class='activate-osm-authentication'>Please log in to add a new point</a>",
                    ca: "<a class='activate-osm-authentication'>Entra per afegir un nou punt</a>",
                    es: "<a class='activate-osm-authentication'>Entra para añadir un nuevo punto</a>",
                    nl: "<a class='activate-osm-authentication'>Gelieve je aan te melden om een punt to te voegen</a>",
                    fr: "<a class='activate-osm-authentication'>Vous devez vous connecter pour ajouter un point</a>",
                    gl: "<a class='activate-osm-authentication'>Inicia a sesión para engadir un novo punto</a>",
                    de: "<a class='activate-osm-authentication'>Bitte loggen Sie sich ein, um einen neuen Punkt hinzuzufügen</a>"
                }),
                zoomInFurther: new T({
                    en: "Zoom in further to add a point.",
                    ca: "Apropa per afegir un punt.",
                    es: "Acerca para añadir un punto.",
                    nl: "Gelieve verder in te zoomen om een punt toe te voegen.",
                    fr: "Rapprochez vous pour ajouter un point.",
                    gl: "Achégate para engadir un punto.",
                    de: "Weiter einzoomen, um einen Punkt hinzuzufügen."
                }),
                stillLoading: new T({
                    en: "The data is still loading. Please wait a bit before you add a new point.",
                    ca: "Les dades es segueixen carregant. Espera una mica abans d\'afegir cap punt.",
                    es: "Los datos se siguen cargando. Espera un poco antes de añadir ningún punto.",
                    nl: "De data wordt nog geladen. Nog even geduld en dan kan je een punt toevoegen.",
                    fr: "Chargement des donnés. Patientez un instant avant d'ajouter un nouveau point.",
                    gl: "Os datos seguen a cargarse. Agarda un intre antes de engadir ningún punto.",
                    de: "Die Daten werden noch geladen. Bitte warten Sie etwas, bevor Sie einen neuen Punkt hinzufügen."
                }),
                confirmIntro: new T({
                    en: "<h3>Add a {title} here?</h3>The point you create here will be <b>visible for everyone</b>. Please, only add things on to the map if they truly exist. A lot of applications use this data.",
                    ca: "<h3>Afegir {title} aquí?</h3>El punt que estàs creant <b>el veurà tothom</b>. Només afegeix coses que realment existeixin. Moltes aplicacions fan servir aquestes dades.",
                    es: "<h3>Añadir {title} aquí?</h3>El punto que estás creando <b>lo verá todo el mundo</b>. Sólo añade cosas que realmente existan. Muchas aplicaciones usan estos datos.",
                    nl: "<h3>Voeg hier een {title} toe?</h3>Het punt dat je hier toevoegt, is <b>zichtbaar voor iedereen</b>. Veel applicaties gebruiken deze data, voeg dus enkel punten toe die echt bestaan.",
                    fr: "<h3>Ajouter un/une {title} ici?</h3>Le point que vous ajouter sera visible par tout le monde. Merci d'etre sûr que ce point existe réellement. Beaucoup d'autres applications reposent sur ces données.",
                    gl: "<h3>Engadir {title} aquí?</h3>O punto que estás a crear <b>será ollado por todo o mundo</b>. Só engade cousas que realmente existan. Moitas aplicacións empregan estes datos.",
                    de: "<h3>Hier einen {title} hinzufügen?</h3>Der Punkt, den Sie hier anlegen, wird <b>für alle sichtbar sein</b>. Bitte fügen Sie der Karte nur dann Dinge hinzu, wenn sie wirklich existieren. Viele Anwendungen verwenden diese Daten.",
                }),
                confirmButton: new T({
                    en: "Add a {category} here",
                    ca: "Afegir {category} aquí",
                    es: "Añadir {category} aquí",
                    nl: "Voeg hier een {category} toe",
                    fr: "Ajouter un/une {category} ici",
                    gl: "Engadir {category} aquí",
                    de: "Hier eine {category} hinzufügen"
                }),
                openLayerControl: new T({
                    "en": "Open the layer control box",
                    "nl": "Open de laag-instellingen"
                })
                ,
                layerNotEnabled: new T({
                    "en": "The layer {layer} is not enabled. Enable this layer to add a point",
                    "nl": "De laag {layer} is gedeactiveerd. Activeer deze om een punt toe te voegn"
                })
            },
            pickLanguage: new T({
                en: "Choose a language",
                ca: "Tria idioma",
                es: "Escoge idioma",
                nl: "Kies je taal",
                fr: "Choisir la langue",
                gl: "Escoller lingua",
                de: "Wählen Sie eine Sprache"
            }),
            about: new T({
                en: "Easily edit and add OpenStreetMap for a certain theme",
                ca: "Edita facilment i afegeix punts a OpenStreetMap d\'una temàtica determinada",
                es: "Edita facilmente y añade puntos en OpenStreetMap de un tema concreto",
                nl: "Easily edit and add OpenStreetMap for a certain theme",
                fr: "Édition facile et ajouter OpenStreetMap pour un certain thème",
                gl: "Editar doadamente e engadir puntos no OpenStreetMap dun eido en concreto",
                de: "OpenStreetMap für ein bestimmtes Thema einfach bearbeiten und hinzufügen"
            }),
            nameInlineQuestion: new T({
                en: "The name of this {category} is $$$",
                ca: "{category}: El seu nom és $$$",
                es: "{category}: Su nombre es $$$",
                nl: "De naam van dit {category} is $$$",
                fr: "Le nom de cet/cette {category} est $$$",
                gl: "{category}: O teu nome é $$$",
                de: "Der Name dieser {category} ist $$$"
            }),
            noNameCategory: new T({
                en: "{category} without a name",
                ca: "{category} sense nom",
                es: "{category} sin nombre",
                nl: "{category} zonder naam",
                fr: "{category} sans nom",
                gl: "{category} sen nome",
                de: "{category} ohne Namen",
            }),
            questions: {
                phoneNumberOf: new T({
                    en: "What is the phone number of {category}?",
                    ca: "Quin és el telèfon de {category}?",
                    es: "Qué teléfono tiene {category}?",
                    nl: "Wat is het telefoonnummer van {category}?",
                    fr: "Quel est le nom de {category}?",
                    gl: "Cal é o número de teléfono de {category}?",
                    de: "Wie lautet die Telefonnummer der {category}?"
                }),
                phoneNumberIs: new T({
                    en: "The phone number of this {category} is <a href='tel:{phone}' target='_blank'>{phone}</a>",
                    ca: "El número de telèfon de {category} és <a href='tel:{phone}' target='_blank'>{phone}</a>",
                    es: "El número de teléfono de {category} es <a href='tel:{phone}' target='_blank'>{phone}</a>",
                    nl: "Het telefoonnummer van {category} is <a href='tel:{phone}' target='_blank'>{phone}</a>",
                    fr: "Le numéro de téléphone de {category} est <a href='tel:{phone}' target='_blank'>{phone}</a>",
                    gl: "O número de teléfono de {category} é <a href='tel:{phone}' target='_blank'>{phone}</a>",
                    de: "Die Telefonnummer der {category} lautet <a href='tel:{phone}' target='_blank'>{phone}</a>"
                }),
                websiteOf: new T({
                    en: "What is the website of {category}?",
                    ca: "Quina és la pàgina web de {category}?",
                    es: "Cual es la página web de {category}?",
                    nl: "Wat is de website van {category}?",
                    fr: "Quel est le site internet de {category}?",
                    gl: "Cal é a páxina web de {category}?",
                    de: "Was ist die Website der {category}?"
                }),
                websiteIs: new T({
                    en: "Website: <a href='{website}' target='_blank'>{website}</a>",
                    ca: "Pàgina web: <a href='{website}' target='_blank'>{website}</a>",
                    es: "Página web: <a href='{website}' target='_blank'>{website}</a>",
                    nl: "Website: <a href='{website}' target='_blank'>{website}</a>",
                    fr: "Website: <a href='{website}' target='_blank'>{website}</a>",
                    gl: "Páxina web: <a href='{website}' target='_blank'>{website}</a>",
                    de: "Webseite: <a href='{website}' target='_blank'>{website}</a>",
                }),
                emailOf: new T({
                        en: "What is the email address of {category}?",
                        ca: "Quina és l\'adreça de correu-e de {category}?",
                        es: "¿Qué dirección de correu tiene {category}?",
                        nl: "Wat is het email-adres van {category}?",
                        fr: "Quel est l'adresse email de {category}?",
                        gl: "Cal é o enderezo de correo electrónico de {category}?",
                        de: "Wie lautet die E-Mail-Adresse der {category}?"
                    }
                ),
                emailIs: new T({
                    en: "The email address of this {category} is <a href='mailto:{email}' target='_blank'>{email}</a>",
                    ca: "L\'adreça de correu de {category} és <a href='mailto:{email}' target='_blank'>{email}</a>",
                    es: "La dirección de correo de {category} es <a href='mailto:{email}' target='_blank'>{email}</a>",
                    nl: "Het email-adres van {category} is <a href='mailto:{email}' target='_blank'>{email}</a>",
                    fr: "L'adresse email de {category} est <a href='mailto:{email}' target='_blank'>{email}</a>",
                    gl: "O enderezo de correo electrónico de {category} é <a href='mailto:{email}' target='_blank'>{email}</a>",
                    de: "Die E-Mail-Adresse dieser {category} lautet <a href='mailto:{email}' target='_blank'>{email}</a>"
                }),

            },
            openStreetMapIntro: new T({
                en: "<h3>An Open Map</h3>" +
                    "<p>Wouldn't it be cool if there was a single map, which everyone could freely use and edit? " +
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
                    "<p>Zou het niet fantastisch zijn als er een open kaart zou zijn die door iedereen aangepast én gebruikt kan worden? Een kaart waar iedereen zijn interesses aan zou kunnen toevoegen? " +
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
                    "Se mudas algo aquí, tamén será reflexado nesas aplicacións, na súa seguinte actualización!</p>",
                de: "<h3>Eine offene Karte</h3>" +
                    "<p>Wäre es nicht toll, wenn es eine offene Karte gäbe, die von jedem angepasst und benutzt werden könnte? Eine Karte, zu der jeder seine Interessen hinzufügen kann? " +
                    "Dann bräuchte man all diese Websites mit unterschiedlichen, kleinen und inkompatiblen Karten (die immer veraltet sind) nicht mehr.</p>" +
                    "<p><b><a href='https://OpenStreetMap.org' target='_blank'>OpenStreetMap</a></b> ist diese offene Karte. Die Kartendaten können kostenlos verwendet werden (mit <a href='https://osm.org/copyright' target='_blank'>Attribution und Veröffentlichung von Änderungen an diesen Daten</a>). Darüber hinaus können Sie die Karte kostenlos ändern und Fehler beheben, wenn Sie ein Konto erstellen. " +
                    "Diese Website basiert ebenfalls auf OpenStreetMap. Wenn Sie eine Frage hier beantworten, geht die Antwort auch dorthin.</p>" +
                    "Viele Menschen und Anwendungen nutzen OpenStreetMap bereits: <a href='https://maps.me/' target='_blank'>Maps.me</a>, <a href='https://osmAnd.net' target='_blank'>OsmAnd</a>, verschiedene spezialisierte Routenplaner, die Hintergrundkarten auf Facebook, Instagram,...<br/>" +
                    "Sogar Apple Maps und Bing Maps verwenden OpenStreetMap in ihren Karten!</p>" +
                    "</p>" +
                    "<p>Wenn Sie hier einen Punkt hinzufügen oder eine Frage beantworten, wird er nach einer Weile in all diesen Anwendungen sichtbar sein.</p>"
            }),
            
            sharescreen: {
                intro: new T({
                    en: "<h3>Share this map</h3> Share this map by copying the link below and sending it to friends and family:",
                    ca: "<h3>Comparteix aquest mapa</h3> Comparteix aquest mapa copiant l\'enllaç de sota i enviant-lo a amics i família:",
                    es: "<h3>Comparte este mapa</h3> Comparte este mapa copiando el enlace de debajo y enviándolo a amigos y familia:",
                    fr: "<h3>Partager cette carte</h3> Partagez cette carte en copiant le lien suivant et envoyer le à vos amis:",
                    nl: "<h3>Deel deze kaart</h3> Kopieer onderstaande link om deze kaart naar vrienden en familie door te sturen:",
                    gl: "<h3>Comparte este mapa</h3> Comparte este mapa copiando a ligazón de embaixo e enviándoa ás amizades e familia:",
                    de: "<h3>Diese Karte teilen</h3> Sie können diese Karte teilen, indem Sie den untenstehenden Link kopieren und an Freunde und Familie schicken:",

                }),
                addToHomeScreen: new T({
                    en: "<h3>Add to your home screen</h3>You can easily add this website to your smartphone home screen for a native feel. Click the 'add to home screen button' in the URL bar to do this.",
                    ca: "<h3>Afegir-lo a la pantalla d\'inici</h3>Pots afegir aquesta web a la pantalla d\'inici del teu smartphone per a que es vegi més nadiu. Apreta al botó 'afegir a l\'inici' a la barra d\'adreces URL per fer-ho.",
                    es: "<h3>Añadir a la pantalla de inicio</h3>Puedes añadir esta web en la pantalla de inicio de tu smartphone para que se vea más nativo. Aprieta el botón 'añadir a inicio' en la barra de direcciones URL para hacerlo.",
                    fr: "<h3>Ajouter à votre page d'accueil</h3> Vous pouvez facilement ajouter la carte à votre écran d'accueil de téléphone. Cliquer sur le boutton 'ajouter à l'evran d'accueil' dans la barre d'URL pour éffecteur cette tâche",
                    gl: "<h3>Engadir á pantalla de inicio</h3>Podes engadir esta web na pantalla de inicio do teu smartphone para que se vexa máis nativo. Preme o botón 'engadir ó inicio' na barra de enderezos URL para facelo.",
                    nl: "<h3>Voeg toe aan je thuis-scherm</h3>Je kan deze website aan je thuisscherm van je smartphone toevoegen voor een native feel",
                    de: "<h3>Zum Startbildschirm hinzufügen</h3> Sie können diese Website einfach zum Startbildschirm Ihres Smartphones hinzufügen, um ein natives Gefühl zu erhalten. Klicken Sie dazu in der URL-Leiste auf die Schaltfläche 'Zum Startbildschirm hinzufügen'.",
                }),
                embedIntro: new T({
                    en: "<h3>Embed on your website</h3>Please, embed this map into your website. <br/>We encourage you to do it - you don't even have to ask permission. <br/>  It is free, and always will be. The more people using this, the more valuable it becomes.",
                    ca: "<h3>Inclou-ho a la teva pàgina web</h3>Inclou aquest mapa dins de la teva pàgina web. <br/> T\'animem a que ho facis, no cal que demanis permís. <br/>  És de franc, i sempre ho serà. A més gent que ho faci servir més valuós serà.",
                    es: "<h3>Inclúyelo en tu página web</h3>Incluye este mapa en tu página web. <br/> Te animamos a que lo hagas, no hace falta que pidas permiso. <br/> Es gratis, y siempre lo será. A más gente que lo use más valioso será.",
                    fr: "<h3>Incorporer à votre website</h3>AJouter la carte à votre website. <br/>On vous en encourage - pas besoin de permission. <br/>  C'est gratuit et pour toujours. Le plus de personnes l'utilisent, le mieux ce sera.",
                    gl: "<h3>Inclúeo na túa páxina web</h3>Inclúe este mapa na túa páxina web. <br/> Animámoche a que o fagas, non fai falla que pidas permiso. <br/> É de balde, e sempre será. Canta máis xente que o empregue máis valioso será.",
                    nl: "<h3>Plaats dit op je website</h3>Voeg dit kaartje toe op je eigen website.<br/>We moedigen dit zelfs aan - je hoeft geen toestemming te vragen.<br/> Het is gratis en zal dat altijd blijven. Hoe meer het gebruikt wordt, hoe waardevoller",
                    de: "<h3>Auf Ihrer Website einbetten</h3>Bitte, betten Sie diese Karte in Ihre Website ein. <br/>Wir ermutigen Sie, es zu tun - Sie müssen nicht einmal um Erlaubnis fragen. <br/> Es ist kostenlos und wird es immer sein. Je mehr Leute sie benutzen, desto wertvoller wird sie."
                }),
                copiedToClipboard: new T({
                    en: "Link copied to clipboard",
                    gl: "Ligazón copiada ó portapapeis",
                    nl: "Link gekopieerd naar klembord",
                    de: "Link in die Zwischenablage kopiert"
                }),
                thanksForSharing: new T({
                    en: "Thanks for sharing!",
                    gl: "Grazas por compartir!",
                    nl: "Bedankt om te delen!",
                    de: "Danke für das Teilen!"
                }),
                editThisTheme: new T({
                    en: "Edit this theme",
                    gl: "Editar este tema",
                    nl: "Pas dit thema aan",
                    de: "Dieses Thema bearbeiten"
                }),
                editThemeDescription: new T({
                    en: "Add or change questions to this map theme",
                    gl: "Engadir ou mudar preguntas a este tema do mapa",
                    nl: "Pas vragen aan of voeg vragen toe aan dit kaartthema",
                    de: "Fragen zu diesem Kartenthema hinzufügen oder ändern"
                }),
                fsUserbadge: new T({
                    en: "Enable the login-button",
                    gl: "Activar botón de inicio de sesión",
                    nl: "Activeer de login-knop",
                    de:" Anmelde-Knopf aktivieren"
                }),
                fsSearch: new T({
                    en: "Enable the search bar",
                    gl: "Activar a barra de procura",
                    nl: "Activeer de zoekbalk",
                    de: " Suchleiste aktivieren"
                }),
                fsWelcomeMessage: new T({
                    en: "Show the welcome message popup and associated tabs",
                    gl: "Amosar a xanela emerxente da mensaxe de benvida e as lapelas asociadas",
                    nl: "Toon het welkomstbericht en de bijhorende tabbladen",
                    de: "Popup der Begrüßungsnachricht und zugehörige Registerkarten anzeigen"
                }),
                fsLayers: new T({
                    en: "Enable thelayer control",
                    gl: "Activar o control de capas",
                    nl: "Toon de knop voor laagbediening",
                    de: "Aktivieren der Layersteuerung"
                }),

                fsLayerControlToggle: new T({
                    en: "Start with the layer control expanded",
                    gl: "Comenza co control de capas expandido",
                    nl: "Toon de laagbediening meteen volledig",
                    de: "Mit der erweiterten Ebenenkontrolle beginnen"
                }),
                fsAddNew: new T({
                    en: "Enable the 'add new POI' button",
                    nl: "Activeer het toevoegen van nieuwe POI",
                    gl: "Activar o botón de 'engadir novo PDI'",
                    de: "Schaltfläche 'neuen POI hinzufügen' aktivieren",
                }),
                fsGeolocation: new T({
                    en: "Enable the 'geolocate-me' button (mobile only)",
                    gl: "Activar o botón de 'xeolocalizarme' (só móbil)",
                    nl: "Toon het knopje voor geolocalisatie (enkel op mobiel)",
                    de: "Die Schaltfläche 'Mich geolokalisieren' aktivieren (nur für Mobil)",
                }),
                fsIncludeCurrentBackgroundMap: new T({
                    en: "Include the current background choice <b>{name}</b>",
                    nl: "Gebruik de huidige achtergrond <b>{name}</b>",
                    de: "Die aktuelle Hintergrundwahl einschließen <b>{name}</b>",
                }),
                fsIncludeCurrentLayers: new T({
                    en: "Include the current layer choices",
                    nl: "Toon enkel de huidig getoonde lagen",
                    de: "Die aktuelle Ebenenauswahl einbeziehen"
                }),
                fsIncludeCurrentLocation: new T({
                    en: "Include current location",
                    nl: "Start op de huidige locatie",
                    de: "Aktuelle Position einbeziehen"
                })
            },
            morescreen: {
                intro: new T({
                    en: "<h3>More quests</h3>Do you enjoy collecting geodata? <br/>There are more themes available.",
                    ca: "<h3>Més peticions</h3>T\'agrada captar dades? <br/>Hi ha més capes disponibles.",
                    es: "<h3>Más peticiones</h3>Te gusta captar datos? <br/>Hay más capas disponibles.",
                    fr: "<h3>Plus de thème </h3>Vous aimez collecter des données? <br/>Il y a plus de thèmes disponible.",
                    nl: "<h3>Meer thema's</h3>Vind je het leuk om geodata te verzamelen? <br/> Hier vind je meer kaartthemas.",
                    gl: "<h3>Máis tarefas</h3>Góstache captar datos? <br/>Hai máis capas dispoñíbeis.",
                    de: "<h3>Weitere Quests</h3>Sammeln Sie gerne Geodaten? <br/>Es sind weitere Themen verfügbar."
                }),
                
                requestATheme: new T({
                    en: "If you want a custom-built quest, request it <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>here</a>",
                    ca: "Si vols que et fem una petició pròpia , demana-la <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>aquí</a>",
                    es: "Si quieres que te hagamos una petición propia , pídela <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>aquí</a>",
                    nl: "Wil je een eigen kaartthema, vraag dit <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>hier aan</a>",
                    fr: "Si vous voulez une autre carte thématique, demandez <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>ici</a>",
                    gl: "Se queres que che fagamos unha tarefa propia , pídea <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>aquí</a>",
                    de: "Wenn Sie einen speziell angefertigte Quest wünschen, können Sie diesen <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>hier</a> anfragen",
                }),

                streetcomplete: new T({
                    en: "Another, similar application is <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
                    ca: "Una altra aplicació similar és <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
                    es: "Otra aplicación similar es <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
                    fr: "Une autre application similaire est <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
                    nl: "Een andere, gelijkaardige Android-applicatie is <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
                    gl: "Outra aplicación semellante é <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
                    de: "Eine andere, ähnliche Anwendung ist <a href='https://play.google.com/store/apps/details?id=de.westnordost.streetcomplete' target='_blank'>StreetComplete</a>",
                }),
                createYourOwnTheme: new T({
                    en: "Create your own MapComplete theme from scratch",
                    ca: "Crea la teva pròpia petició completa de MapComplete des de zero.",
                    es: "Crea tu propia petición completa de MapComplete desde cero.",
                    nl: "Maak je eigen MapComplete-kaart",
                    fr: "Créez votre propre MapComplete carte",
                    gl: "Crea o teu propio tema completo do MapComplete dende cero.",
                    de: "Erstellen Sie Ihr eigenes MapComplete-Thema von Grund auf neu",
                })
            },
            readYourMessages: new T({
                en: "Please, read all your OpenStreetMap-messages before adding a new point.",
                ca: "Llegeix tots els teus missatges d\'OpenStreetMap abans d\'afegir nous punts.",
                es: "Lee todos tus mensajes de OpenStreetMap antes de añadir nuevos puntos.",
                nl: "Gelieve eerst je berichten op OpenStreetMap te lezen alvorens nieuwe punten toe te voegen.",
                fr: "Merci de lire tout vos messages d'OpenStreetMap avant d'ajouter un nouveau point.",
                gl: "Le todos a túas mensaxes do OpenStreetMap antes de engadir novos puntos.",
                de: "Bitte lesen Sie alle Ihre OpenStreetMap-Nachrichten, bevor Sie einen neuen Punkt hinzufügen"
            }),
            fewChangesBefore: new T({
                en: "Please, answer a few questions of existing points before adding a new point.",
                ca: "Contesta unes quantes preguntes sobre punts existents abans d\'afegir-ne un de nou.",
                es: "Contesta unas cuantas preguntas sobre puntos existentes antes de añadir nuevos.",
                nl: "Gelieve eerst enkele vragen van bestaande punten te beantwoorden vooraleer zelf punten toe te voegen.",
                fr: "Merci de répondre à quelques questions à propos de point déjà existant avant d'ajouter de nouveaux points",
                gl: "Responde unhas cantas preguntas sobre puntos existentes antes de engadir novos.",
                de: "Bitte beantworten Sie ein paar Fragen zu bestehenden Punkten, bevor Sie einen neuen Punkt hinzufügen."
            }),
            goToInbox: new T({
                en: "Open inbox",
                es: "Abrir mensajes",
                ca: "Obrir missatges",
                nl: "Ga naar de berichten",
                fr: "Ouvrir les messages",
                gl: "Abrir mensaxes",
                de: "Posteingang öffnen"
            }),
            getStartedLogin: new T({
                en: "Login with OpenStreetMap to get started",
                es: "Entra en OpenStreetMap para empezar",
                ca: "Entra a OpenStreetMap per començar",
                nl: "Login met OpenStreetMap om te beginnen",
                fr: "Connectez vous avec OpenStreetMap pour commencer",
                de: "Mit OpenStreetMap einloggen und loslegen"
            }),
            getStartedNewAccount: new T({
                en: " or <a href='https://www.openstreetmap.org/user/new' target='_blank'>create a new account</a>",
                nl: " of <a href='https://www.openstreetmap.org/user/new' target='_blank'>maak een nieuwe account aan</a> ",
                fr: " ou <a href='https://www.openstreetmap.org/user/new' target='_blank'>registrez vous</a>",
                es: " o <a href='https://www.openstreetmap.org/user/new' target='_blank'>crea una nueva cuenta</a>",
                ca: " o <a href='https://www.openstreetmap.org/user/new' target='_blank'>crea un nou compte</a>",
                gl: " ou <a href='https://www.openstreetmap.org/user/new' target='_blank'>crea unha nova conta</a>",
                de: " oder <a href='https://www.openstreetmap.org/user/new' target='_blank'>ein neues Konto anlegen</a>",
            }),
            noTagsSelected: new T({
                en: "No tags selected",
                es: "No se han seleccionado etiquetas",
                ca: "No s\'han seleccionat etiquetes",
                gl: "Non se seleccionaron etiquetas",
                de: "Keine Tags ausgewählt"
            }),
            customThemeIntro: new T({
                en: "<h3>Custom themes</h3>These are previously visited user-generated themes.",
                nl: "<h3>Onofficiële themea's</h3>Je bezocht deze thema's gemaakt door andere OpenStreetMappers eerder",
                gl: "<h3>Temas personalizados</h3>Estes son temas xerados por usuarios previamente visitados.",
                de: "<h3>Kundenspezifische Themen</h3>Dies sind zuvor besuchte benutzergenerierte Themen"
            }), 
            aboutMapcomplete: new T({
                en: "<h3>About MapComplete</h3>" +
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
                nl: "<h3>Over MapComplete</h3>" +
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
                de: "<h3>Über MapComplete</h3>" +
                    "<p>MapComplete ist ein OpenStreetMap-Editor, der jedem helfen soll, auf einfache Weise Informationen zu einem <b>Einzelthema hinzuzufügen.</b></p>" +
                    "<p>Nur Merkmale, die für ein einzelnes Thema relevant sind, werden mit einigen vordefinierten Fragen gezeigt, um die Dinge <b>einfach und extrem benutzerfreundlich</b> zu halten." +
                    "Der Themen-Betreuer kann auch eine Sprache für die Schnittstelle wählen, Elemente deaktivieren oder sogar in eine andere Website ohne jegliches UI-Element einbetten.</p>" + 
                  
                    "<p>Ein weiterer wichtiger Teil von MapComplete ist jedoch, immer <b>den nächsten Schritt anzubieten</b>um mehr über OpenStreetMap zu erfahren:" +
                    "<ul>" +
                    "<li>Ein iframe ohne UI-Elemente verlinkt zu einer Vollbildversion</li>" +
                    "<li>Die Vollbildversion bietet Informationen über OpenStreetMap</li>" +
                    "<li>Wenn Sie nicht eingeloggt sind, werden Sie gebeten, sich einzuloggen</li>" +
                    "<li>Wenn Sie eine einzige Frage beantwortet haben, dürfen Sie Punkte hinzufügen</li>" +
                    "<li>An einem bestimmten Punkt erscheinen die tatsächlich hinzugefügten Tags, die später mit dem Wiki verlinkt werden...</li>" +
                    "</ul></p>" +
                    "<p>Fällt Ihnen ein Problem mit MapComplete auf? Haben Sie einen Feature-Wunsch? Wollen Sie beim Übersetzen helfen? " +
                    "Gehen Sie <a href='https://github.com/pietervdvn/MapComplete' target='_blank'>zum Quellcode</a> oder <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'>zur Problemverfolgung</a>.</p>",
            }),
            backgroundMap: new T({
                "en": "Background map",
                "nl": "Achtergrondkaart",
                "de": "Hintergrundkarte"
            }),
            zoomInToSeeThisLayer: new T({
                "nl":"Vergroot de kaart om deze laag te zien",
                "en":"Zoom in to see this layer"
            })
        },
        favourite: {
            title: new T({
                en: "Personal theme",
                nl: "Persoonlijk thema",
                es: "Interficie personal",
                ca: "Interfície personal",
                gl: "Tema personalizado",
                de: "Persönliches Thema"
            }),
            description: new T({
                en: "Create a personal theme based on all the available layers of all themes",
                es: "Crea una interficie basada en todas las capas disponibles de todas las interficies",
                ca: "Crea una interfície basada en totes les capes disponibles de totes les interfícies",
                gl: "Crea un tema baseado en todas as capas dispoñíbeis de todos os temas",
                de: "Erstellen Sie ein persönliches Thema auf der Grundlage aller verfügbaren Ebenen aller Themen"
            }),
            panelIntro: new T({
                en: "<h3>Your personal theme</h3>Activate your favourite layers from all the official themes",
                ca: "<h3>La teva interfície personal</h3>Activa les teves capes favorites de totes les interfícies oficials",
                es: "<h3>Tu interficie personal</h3>Activa tus capas favoritas de todas las interficies oficiales",
                gl: "<h3>O teu tema personalizado</h3>Activa as túas capas favoritas de todos os temas oficiais",
                de: "<h3>Ihr persönliches Thema</h3>Aktivieren Sie Ihre Lieblingsebenen aus allen offiziellen Themen"
            }),
            loginNeeded: new T({
                en: "<h3>Log in</h3>A personal layout is only available for OpenStreetMap users",
                es: "<h3>Entrar</h3>El diseño personalizado sólo está disponible para los usuarios de OpenstreetMap",
                ca: "<h3>Entrar</h3>El disseny personalizat només està disponible pels usuaris d\' OpenstreetMap",
                gl: "<h3>Iniciar a sesión</h3>O deseño personalizado só está dispoñíbel para os usuarios do OpenstreetMap",
                de: "<h3>Anmelden</h3>Ein persönliches Layout ist nur für OpenStreetMap-Benutzer verfügbar",
            }),
            reload: new T({
                en: "Reload the data",
                es: "Recarga los datos",
                ca: "Recarrega les dades",
                gl: "Recargar os datos",
                de: "Daten neu laden"
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
