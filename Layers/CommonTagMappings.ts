import {TagMappingOptions} from "../UI/TagMapping";
import {Img} from "../UI/Img";


export class CommonTagMappings {


    public static access = new TagMappingOptions({
        key: "access",
        mapping: {
            yes: "Vrij toegankelijk (op de paden)",
            no: "Niet toegankelijk",
            private: "Niet toegankelijk, want privegebied",
            permissive: "Toegankelijk, maar het is privegebied",
            guided: "Enkel met gids of op activiteit"
        }
    });

    public static operator = new TagMappingOptions({
        key: "operator",
        template: "Beheer door {operator}",
        mapping: {
            private: 'Beheer door een privepersoon of organisatie'
        }

    });
    public static osmLink = new TagMappingOptions({
        key: "id",
        mapping: {
            "node/-1": ""
        },
        template: "<span class='osmlink'><a href='https://osm.org/{id}' target='_blank'>" +
            Img.osmAbstractLogo +
            "</a></span>"
    });

    public static wikipediaLink = new TagMappingOptions({
        key: "wikipedia",
        missing: "",
        freeform: (value: string) => {
            let link = "";
            // @ts-ignore
            if (value.startsWith("https")) {
                link = value;
            } else {

                const splitted = value.split(":");
                const language = splitted[0];
                splitted.shift();
                const page = splitted.join(":");
                link = 'https://' + language + '.wikipedia.org/wiki/' + page;

            }
            return "<span class='wikipedialink'>" +
                "<a href='" + link + "' target='_blank'>" +
                "<img width='64px' src='./assets/wikipedia.svg' alt='wikipedia'" +
                "</a></span>";
        }
    });
}