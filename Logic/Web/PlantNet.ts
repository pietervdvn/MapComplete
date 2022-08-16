import {Utils} from "../../Utils";

export default class PlantNet {
    private static baseUrl = "https://my-api.plantnet.org/v2/identify/all?api-key=2b10AAsjzwzJvucA5Ncm5qxe"

    public static query(imageUrls: string[]) : Promise<PlantNetResult>{
        if (imageUrls.length > 5) {
            throw "At most 5 images can be given to PlantNet.query"
        }
        if (imageUrls.length == 0) {
            throw "At least one image should be given to PlantNet.query"
        }
        let url = PlantNet. baseUrl;
        for (const image of imageUrls) {
            url += "&images="+encodeURIComponent(image)
        }
        return Utils.downloadJson(url)
    }

    public static exampleResult: PlantNetResult = {
        "query": {
            "project": "all",
            "images": ["https://my.plantnet.org/images/image_1.jpeg", "https://my.plantnet.org/images/image_2.jpeg"],
            "organs": ["flower", "leaf"],
            "includeRelatedImages": false
        },
        "language": "en",
        "preferedReferential": "the-plant-list",
        "bestMatch": "Hibiscus rosa-sinensis L.",
        "results": [{
            "score": 0.91806,
            "species": {
                "scientificNameWithoutAuthor": "Hibiscus rosa-sinensis",
                "scientificNameAuthorship": "L.",
                "genus": {
                    "scientificNameWithoutAuthor": "Hibiscus",
                    "scientificNameAuthorship": "",
                    "scientificName": "Hibiscus"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Malvaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Malvaceae"
                },
                "commonNames": ["Hawaiian hibiscus", "Hibiscus", "Chinese hibiscus"],
                "scientificName": "Hibiscus rosa-sinensis L."
            },
            "gbif": {"id": "3152559"}
        }, {
            "score": 0.00759,
            "species": {
                "scientificNameWithoutAuthor": "Hibiscus moscheutos",
                "scientificNameAuthorship": "L.",
                "genus": {
                    "scientificNameWithoutAuthor": "Hibiscus",
                    "scientificNameAuthorship": "",
                    "scientificName": "Hibiscus"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Malvaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Malvaceae"
                },
                "commonNames": ["Crimsoneyed rosemallow", "Mallow-rose", "Swamp rose-mallow"],
                "scientificName": "Hibiscus moscheutos L."
            },
            "gbif": {"id": "3152596"}
        }, {
            "score": 0.00676,
            "species": {
                "scientificNameWithoutAuthor": "Hibiscus schizopetalus",
                "scientificNameAuthorship": "(Dyer) Hook.f.",
                "genus": {
                    "scientificNameWithoutAuthor": "Hibiscus",
                    "scientificNameAuthorship": "",
                    "scientificName": "Hibiscus"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Malvaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Malvaceae"
                },
                "commonNames": ["Campanilla", "Chinese lantern", "Fringed rosemallow"],
                "scientificName": "Hibiscus schizopetalus (Dyer) Hook.f."
            },
            "gbif": {"id": "9064581"}
        }, {
            "score": 0.00544,
            "species": {
                "scientificNameWithoutAuthor": "Hibiscus palustris",
                "scientificNameAuthorship": "L.",
                "genus": {
                    "scientificNameWithoutAuthor": "Hibiscus",
                    "scientificNameAuthorship": "",
                    "scientificName": "Hibiscus"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Malvaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Malvaceae"
                },
                "commonNames": ["Swamp Rose Mallow", "Hardy Hidiscus", "Twisted Hibiscus"],
                "scientificName": "Hibiscus palustris L."
            },
            "gbif": {"id": "6377046"}
        }, {
            "score": 0.0047,
            "species": {
                "scientificNameWithoutAuthor": "Hibiscus sabdariffa",
                "scientificNameAuthorship": "L.",
                "genus": {
                    "scientificNameWithoutAuthor": "Hibiscus",
                    "scientificNameAuthorship": "",
                    "scientificName": "Hibiscus"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Malvaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Malvaceae"
                },
                "commonNames": ["Indian-sorrel", "Roselle", "Jamaica-sorrel"],
                "scientificName": "Hibiscus sabdariffa L."
            },
            "gbif": {"id": "3152582"}
        }, {
            "score": 0.0037,
            "species": {
                "scientificNameWithoutAuthor": "Abelmoschus moschatus",
                "scientificNameAuthorship": "Medik.",
                "genus": {
                    "scientificNameWithoutAuthor": "Abelmoschus",
                    "scientificNameAuthorship": "",
                    "scientificName": "Abelmoschus"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Malvaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Malvaceae"
                },
                "commonNames": ["Musk okra", "Musk-mallow", "Tropical jewel-hibiscus"],
                "scientificName": "Abelmoschus moschatus Medik."
            },
            "gbif": {"id": "8312665"}
        }, {
            "score": 0.00278,
            "species": {
                "scientificNameWithoutAuthor": "Hibiscus grandiflorus",
                "scientificNameAuthorship": "Michx.",
                "genus": {
                    "scientificNameWithoutAuthor": "Hibiscus",
                    "scientificNameAuthorship": "",
                    "scientificName": "Hibiscus"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Malvaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Malvaceae"
                },
                "commonNames": ["Swamp rosemallow", "Swamp Rose-Mallow"],
                "scientificName": "Hibiscus grandiflorus Michx."
            },
            "gbif": {"id": "3152592"}
        }, {
            "score": 0.00265,
            "species": {
                "scientificNameWithoutAuthor": "Hibiscus acetosella",
                "scientificNameAuthorship": "Welw. ex Hiern",
                "genus": {
                    "scientificNameWithoutAuthor": "Hibiscus",
                    "scientificNameAuthorship": "",
                    "scientificName": "Hibiscus"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Malvaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Malvaceae"
                },
                "commonNames": ["False roselle", "Red-leaf hibiscus", "African rosemallow"],
                "scientificName": "Hibiscus acetosella Welw. ex Hiern"
            },
            "gbif": {"id": "3152551"}
        }, {
            "score": 0.00253,
            "species": {
                "scientificNameWithoutAuthor": "Bixa orellana",
                "scientificNameAuthorship": "L.",
                "genus": {
                    "scientificNameWithoutAuthor": "Bixa",
                    "scientificNameAuthorship": "",
                    "scientificName": "Bixa"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Bixaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Bixaceae"
                },
                "commonNames": ["Arnatto", "Lipsticktree", "Annatto"],
                "scientificName": "Bixa orellana L."
            },
            "gbif": {"id": "2874863"}
        }, {
            "score": 0.00179,
            "species": {
                "scientificNameWithoutAuthor": "Malvaviscus penduliflorus",
                "scientificNameAuthorship": "Moc. & Sessé ex DC.",
                "genus": {
                    "scientificNameWithoutAuthor": "Malvaviscus",
                    "scientificNameAuthorship": "",
                    "scientificName": "Malvaviscus"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Malvaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Malvaceae"
                },
                "commonNames": ["Mazapan"],
                "scientificName": "Malvaviscus penduliflorus Moc. & Sessé ex DC."
            },
            "gbif": {"id": "3152776"}
        }, {
            "score": 0.00145,
            "species": {
                "scientificNameWithoutAuthor": "Hibiscus diversifolius",
                "scientificNameAuthorship": "Jacq.",
                "genus": {
                    "scientificNameWithoutAuthor": "Hibiscus",
                    "scientificNameAuthorship": "",
                    "scientificName": "Hibiscus"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Malvaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Malvaceae"
                },
                "commonNames": ["Cape hibiscus", "Swamp hibiscus", "Comfortroot"],
                "scientificName": "Hibiscus diversifolius Jacq."
            },
            "gbif": {"id": "7279239"}
        }, {
            "score": 0.00141,
            "species": {
                "scientificNameWithoutAuthor": "Hippeastrum reginae",
                "scientificNameAuthorship": "(L.) Herb.",
                "genus": {
                    "scientificNameWithoutAuthor": "Hippeastrum",
                    "scientificNameAuthorship": "",
                    "scientificName": "Hippeastrum"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Amaryllidaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Amaryllidaceae"
                },
                "commonNames": ["Amaryllis", "Cheryl's Treasure", "Easter lily"],
                "scientificName": "Hippeastrum reginae (L.) Herb."
            },
            "gbif": {"id": "2854474"}
        }, {
            "score": 0.00114,
            "species": {
                "scientificNameWithoutAuthor": "Hibiscus martianus",
                "scientificNameAuthorship": "Zucc.",
                "genus": {
                    "scientificNameWithoutAuthor": "Hibiscus",
                    "scientificNameAuthorship": "",
                    "scientificName": "Hibiscus"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Malvaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Malvaceae"
                },
                "commonNames": ["Heartleaf rosemallow", "Mountain rosemallow", "Heartleaf rose-mallow"],
                "scientificName": "Hibiscus martianus Zucc."
            },
            "gbif": {"id": "3152578"}
        }, {
            "score": 0.00109,
            "species": {
                "scientificNameWithoutAuthor": "Acalypha hispida",
                "scientificNameAuthorship": "Burm.f.",
                "genus": {
                    "scientificNameWithoutAuthor": "Acalypha",
                    "scientificNameAuthorship": "",
                    "scientificName": "Acalypha"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Euphorbiaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Euphorbiaceae"
                },
                "commonNames": ["Philippine-medusa", "Bristly copperleaf", "Chenilleplant"],
                "scientificName": "Acalypha hispida Burm.f."
            },
            "gbif": {"id": "3056375"}
        }, {
            "score": 0.00071,
            "species": {
                "scientificNameWithoutAuthor": "Hibiscus arnottianus",
                "scientificNameAuthorship": "A. Gray",
                "genus": {
                    "scientificNameWithoutAuthor": "Hibiscus",
                    "scientificNameAuthorship": "",
                    "scientificName": "Hibiscus"
                },
                "family": {
                    "scientificNameWithoutAuthor": "Malvaceae",
                    "scientificNameAuthorship": "",
                    "scientificName": "Malvaceae"
                },
                "commonNames": ["White rosemallow", "Native Hawaiian White Hibiscus", "Native White Rose-Mallow"],
                "scientificName": "Hibiscus arnottianus A. Gray"
            },
            "gbif": {"id": "3152543"}
        }],
        "version": "2022-06-14 (6.0)",
        "remainingIdentificationRequests": 499
    }

}

export interface PlantNetResult {
    "query": {
        "project": string, "images": string[],
        "organs": string[],
        "includeRelatedImages": boolean
    },
    "language": string,
    "preferedReferential": string,
    "bestMatch": string,
    "results": {
        "score": number,
        "gbif": { "id": string /*Actually a number*/ }
        "species":
            {
                "scientificNameWithoutAuthor": string,
                "scientificNameAuthorship": string,
                "genus": { "scientificNameWithoutAuthor": string, scientificNameAuthorship: string, "scientificName": string },
                "family": { "scientificNameWithoutAuthor": string, scientificNameAuthorship: string, "scientificName": string },
                "commonNames": string [],
                "scientificName": string
            },
    }[],
    "version": string,
    "remainingIdentificationRequests": number
}
