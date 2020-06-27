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
            "node/-1": "<span class='osmlink'>Over enkele momenten sturen we je punt naar OpenStreetMap</span>"
        },
        template: "<span class='osmlink'><a href='https://osm.org/{id}' target='_blank'>" +
            Img.osmAbstractLogo +
            "</a></span>"
    })
}