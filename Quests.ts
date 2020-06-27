import {QuestionDefinition} from "./Logic/Question";


export class Quests {


    static hasFee = QuestionDefinition.radioQuestionSimple("Moet men betalen om deze toiletten te gebruiken?", 10,
        "fee",
        [{text: "ja", value: "yes"}, {text: "nee", value: "no"}]
    );

    static toiletsWheelChairs = QuestionDefinition.radioQuestionSimple("Zijn deze toiletten rolstoeltoegankelijk?", 20,
        "wheelchair",
        [{text: "ja", value: "yes"}, {text: "nee", value: "no"}]
    ).addUnrequiredTag("toilets:position", "urinals");

    static toiletsChangingTable = QuestionDefinition.radioQuestionSimple("Is er een luiertafel beschikbaar?", 20,
        "changing_table",
        [{text: "ja", value: "yes"}, {text: "nee", value: "no"}]
    )
    // Urinals are often a pitlatrine/something very poor where no changing table is
        .addUnrequiredTag("toilets:position", "urinals").addUnrequiredTag("toilets:position", "urinal");

    static toiletsChangingTableLocation = QuestionDefinition.radioAndTextQuestion("Waar bevindt de luiertafel zich?", 5,
        "changing_table",
        [{text: "In de vrouwentoiletten", value: "female_toilet"},
            {text: "In de mannentoiletten", value: "male_toilet"},
            {text: "In de rolstoeltoegangkelijke toiletten", value: "wheelchair_toilet"},
            {text: "In de aparte, speciaal voorziene ruimte", value: "dedicated_room"},
            {text: "In de genderneutrale toiletten", value: "unisex_toilet"}]
    )
        .addRequiredTag("changing_table", "yes");


    static toiletsPosition = QuestionDefinition.radioQuestionSimple("Wat voor toiletten zijn dit?", 1,
        "toilets:position",
        [{text: "Enkel urinoirs", value: "urinals"},
            {text: "Enkel 'gewone' toiletten waar men op gaat zitten", value: "seated"},
            {text: "Er zijn zowel urinoirs als zittoiletten", value: "seated;urinals"}]);



    static accessNatureReserve = QuestionDefinition.radioQuestionSimple(
        "Is dit gebied toegankelijk voor het publiek?",
        10,
        "access",
        [
            {text: "Nee, dit is afgesloten", value: "no"},
            {text: "Nee, dit is een privaat terrein", value: "no"},
            {text: "Hoewel het een privebos is, kan men er toch in", value: "permissive"},
            {text: "Enkel tijdens activiteiten of met een gids", value: "guided"},
            {text: "Ja, het is gewoon toegankelijk", value: "yes"}
        ]
    ).addUnrequiredTag("seamark:type", "restricted_area");

    static nameOf(name: string) : QuestionDefinition {
        return QuestionDefinition.noNameOrNameQuestion("<b>Wat is de <i>officiële</i> naam van dit " + name + "?</b><br />" +
            "Veel gebieden hebben geen naam. Duid dit dan ook zo aan.",
            "Dit " + name + " heeft geen naam", 20);
    }

    static operator =
        QuestionDefinition.radioAndTextQuestion(
            "Wie is de beheerder van dit gebied?",
            1,
            "operator",
            [{text: "Natuurpunt", value: "Natuurpunt"},
                {text: "Het Agenschap voor Natuur en Bos", value: "Agentschap Natuur en Bos"},
                {text: "Een prive-eigenaar", value: "private"}
            ]
        ).addUnrequiredTag("access", "private")
            .addUnrequiredTag("access", "no");



}