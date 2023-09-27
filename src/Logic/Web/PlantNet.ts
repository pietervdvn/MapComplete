import { Utils } from "../../Utils"

export default class PlantNet {
    public static baseUrl =
        "https://my-api.plantnet.org/v2/identify/all?api-key=2b10AAsjzwzJvucA5Ncm5qxe"

    public static query(imageUrls: string[]): Promise<PlantNetResult> {
        if (imageUrls.length > 5) {
            throw "At most 5 images can be given to PlantNet.query"
        }
        if (imageUrls.length == 0) {
            throw "At least one image should be given to PlantNet.query"
        }
        let url = PlantNet.baseUrl
        for (const image of imageUrls) {
            url += "&images=" + encodeURIComponent(image)
        }
        return Utils.downloadJsonCached(url, 365 * 24 * 60 * 60 * 1000)
    }

    public static exampleResult: PlantNetResult = {
        query: {
            project: "all",
            images: [
                "https://my.plantnet.org/images/image_1.jpeg",
                "https://my.plantnet.org/images/image_2.jpeg",
            ],
            organs: ["flower", "leaf"],
            includeRelatedImages: false,
        },
        language: "en",
        preferedReferential: "the-plant-list",
        bestMatch: "Hibiscus rosa-sinensis L.",
        results: [
            {
                score: 0.91806,
                species: {
                    scientificNameWithoutAuthor: "Hibiscus rosa-sinensis",
                    scientificNameAuthorship: "L.",
                    genus: {
                        scientificNameWithoutAuthor: "Hibiscus",
                        scientificNameAuthorship: "",
                        scientificName: "Hibiscus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Malvaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Malvaceae",
                    },
                    commonNames: ["Hawaiian hibiscus", "Hibiscus", "Chinese hibiscus"],
                    scientificName: "Hibiscus rosa-sinensis L.",
                },
                gbif: { id: "3152559" },
            },
            {
                score: 0.00759,
                species: {
                    scientificNameWithoutAuthor: "Hibiscus moscheutos",
                    scientificNameAuthorship: "L.",
                    genus: {
                        scientificNameWithoutAuthor: "Hibiscus",
                        scientificNameAuthorship: "",
                        scientificName: "Hibiscus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Malvaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Malvaceae",
                    },
                    commonNames: ["Crimsoneyed rosemallow", "Mallow-rose", "Swamp rose-mallow"],
                    scientificName: "Hibiscus moscheutos L.",
                },
                gbif: { id: "3152596" },
            },
            {
                score: 0.00676,
                species: {
                    scientificNameWithoutAuthor: "Hibiscus schizopetalus",
                    scientificNameAuthorship: "(Dyer) Hook.f.",
                    genus: {
                        scientificNameWithoutAuthor: "Hibiscus",
                        scientificNameAuthorship: "",
                        scientificName: "Hibiscus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Malvaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Malvaceae",
                    },
                    commonNames: ["Campanilla", "Chinese lantern", "Fringed rosemallow"],
                    scientificName: "Hibiscus schizopetalus (Dyer) Hook.f.",
                },
                gbif: { id: "9064581" },
            },
            {
                score: 0.00544,
                species: {
                    scientificNameWithoutAuthor: "Hibiscus palustris",
                    scientificNameAuthorship: "L.",
                    genus: {
                        scientificNameWithoutAuthor: "Hibiscus",
                        scientificNameAuthorship: "",
                        scientificName: "Hibiscus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Malvaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Malvaceae",
                    },
                    commonNames: ["Swamp Rose Mallow", "Hardy Hidiscus", "Twisted Hibiscus"],
                    scientificName: "Hibiscus palustris L.",
                },
                gbif: { id: "6377046" },
            },
            {
                score: 0.0047,
                species: {
                    scientificNameWithoutAuthor: "Hibiscus sabdariffa",
                    scientificNameAuthorship: "L.",
                    genus: {
                        scientificNameWithoutAuthor: "Hibiscus",
                        scientificNameAuthorship: "",
                        scientificName: "Hibiscus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Malvaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Malvaceae",
                    },
                    commonNames: ["Indian-sorrel", "Roselle", "Jamaica-sorrel"],
                    scientificName: "Hibiscus sabdariffa L.",
                },
                gbif: { id: "3152582" },
            },
            {
                score: 0.0037,
                species: {
                    scientificNameWithoutAuthor: "Abelmoschus moschatus",
                    scientificNameAuthorship: "Medik.",
                    genus: {
                        scientificNameWithoutAuthor: "Abelmoschus",
                        scientificNameAuthorship: "",
                        scientificName: "Abelmoschus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Malvaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Malvaceae",
                    },
                    commonNames: ["Musk okra", "Musk-mallow", "Tropical jewel-hibiscus"],
                    scientificName: "Abelmoschus moschatus Medik.",
                },
                gbif: { id: "8312665" },
            },
            {
                score: 0.00278,
                species: {
                    scientificNameWithoutAuthor: "Hibiscus grandiflorus",
                    scientificNameAuthorship: "Michx.",
                    genus: {
                        scientificNameWithoutAuthor: "Hibiscus",
                        scientificNameAuthorship: "",
                        scientificName: "Hibiscus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Malvaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Malvaceae",
                    },
                    commonNames: ["Swamp rosemallow", "Swamp Rose-Mallow"],
                    scientificName: "Hibiscus grandiflorus Michx.",
                },
                gbif: { id: "3152592" },
            },
            {
                score: 0.00265,
                species: {
                    scientificNameWithoutAuthor: "Hibiscus acetosella",
                    scientificNameAuthorship: "Welw. ex Hiern",
                    genus: {
                        scientificNameWithoutAuthor: "Hibiscus",
                        scientificNameAuthorship: "",
                        scientificName: "Hibiscus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Malvaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Malvaceae",
                    },
                    commonNames: ["False roselle", "Red-leaf hibiscus", "African rosemallow"],
                    scientificName: "Hibiscus acetosella Welw. ex Hiern",
                },
                gbif: { id: "3152551" },
            },
            {
                score: 0.00253,
                species: {
                    scientificNameWithoutAuthor: "Bixa orellana",
                    scientificNameAuthorship: "L.",
                    genus: {
                        scientificNameWithoutAuthor: "Bixa",
                        scientificNameAuthorship: "",
                        scientificName: "Bixa",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Bixaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Bixaceae",
                    },
                    commonNames: ["Arnatto", "Lipsticktree", "Annatto"],
                    scientificName: "Bixa orellana L.",
                },
                gbif: { id: "2874863" },
            },
            {
                score: 0.00179,
                species: {
                    scientificNameWithoutAuthor: "Malvaviscus penduliflorus",
                    scientificNameAuthorship: "Moc. & Sessé ex DC.",
                    genus: {
                        scientificNameWithoutAuthor: "Malvaviscus",
                        scientificNameAuthorship: "",
                        scientificName: "Malvaviscus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Malvaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Malvaceae",
                    },
                    commonNames: ["Mazapan"],
                    scientificName: "Malvaviscus penduliflorus Moc. & Sessé ex DC.",
                },
                gbif: { id: "3152776" },
            },
            {
                score: 0.00145,
                species: {
                    scientificNameWithoutAuthor: "Hibiscus diversifolius",
                    scientificNameAuthorship: "Jacq.",
                    genus: {
                        scientificNameWithoutAuthor: "Hibiscus",
                        scientificNameAuthorship: "",
                        scientificName: "Hibiscus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Malvaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Malvaceae",
                    },
                    commonNames: ["Cape hibiscus", "Swamp hibiscus", "Comfortroot"],
                    scientificName: "Hibiscus diversifolius Jacq.",
                },
                gbif: { id: "7279239" },
            },
            {
                score: 0.00141,
                species: {
                    scientificNameWithoutAuthor: "Hippeastrum reginae",
                    scientificNameAuthorship: "(L.) Herb.",
                    genus: {
                        scientificNameWithoutAuthor: "Hippeastrum",
                        scientificNameAuthorship: "",
                        scientificName: "Hippeastrum",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Amaryllidaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Amaryllidaceae",
                    },
                    commonNames: ["Amaryllis", "Cheryl's Treasure", "Easter lily"],
                    scientificName: "Hippeastrum reginae (L.) Herb.",
                },
                gbif: { id: "2854474" },
            },
            {
                score: 0.00114,
                species: {
                    scientificNameWithoutAuthor: "Hibiscus martianus",
                    scientificNameAuthorship: "Zucc.",
                    genus: {
                        scientificNameWithoutAuthor: "Hibiscus",
                        scientificNameAuthorship: "",
                        scientificName: "Hibiscus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Malvaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Malvaceae",
                    },
                    commonNames: [
                        "Heartleaf rosemallow",
                        "Mountain rosemallow",
                        "Heartleaf rose-mallow",
                    ],
                    scientificName: "Hibiscus martianus Zucc.",
                },
                gbif: { id: "3152578" },
            },
            {
                score: 0.00109,
                species: {
                    scientificNameWithoutAuthor: "Acalypha hispida",
                    scientificNameAuthorship: "Burm.f.",
                    genus: {
                        scientificNameWithoutAuthor: "Acalypha",
                        scientificNameAuthorship: "",
                        scientificName: "Acalypha",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Euphorbiaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Euphorbiaceae",
                    },
                    commonNames: ["Philippine-medusa", "Bristly copperleaf", "Chenilleplant"],
                    scientificName: "Acalypha hispida Burm.f.",
                },
                gbif: { id: "3056375" },
            },
            {
                score: 0.00071,
                species: {
                    scientificNameWithoutAuthor: "Hibiscus arnottianus",
                    scientificNameAuthorship: "A. Gray",
                    genus: {
                        scientificNameWithoutAuthor: "Hibiscus",
                        scientificNameAuthorship: "",
                        scientificName: "Hibiscus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Malvaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Malvaceae",
                    },
                    commonNames: [
                        "White rosemallow",
                        "Native Hawaiian White Hibiscus",
                        "Native White Rose-Mallow",
                    ],
                    scientificName: "Hibiscus arnottianus A. Gray",
                },
                gbif: { id: "3152543" },
            },
        ],
        version: "2022-06-14 (6.0)",
        remainingIdentificationRequests: 499,
    }
    public static exampleResultPrunus: PlantNetResult = {
        query: {
            project: "all",
            images: ["https://i.imgur.com/VJp1qG1.jpg"],
            organs: ["auto"],
            includeRelatedImages: false,
        },
        language: "en",
        preferedReferential: "the-plant-list",
        bestMatch: "Malus halliana Koehne",
        results: [
            {
                score: 0.23548,
                species: {
                    scientificNameWithoutAuthor: "Malus halliana",
                    scientificNameAuthorship: "Koehne",
                    genus: {
                        scientificNameWithoutAuthor: "Malus",
                        scientificNameAuthorship: "",
                        scientificName: "Malus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Hall crab apple", "Adirondack Crabapple", "Hall's crabapple"],
                    scientificName: "Malus halliana Koehne",
                },
                gbif: { id: "3001220" },
            },
            {
                score: 0.1514,
                species: {
                    scientificNameWithoutAuthor: "Prunus campanulata",
                    scientificNameAuthorship: "Maxim.",
                    genus: {
                        scientificNameWithoutAuthor: "Prunus",
                        scientificNameAuthorship: "",
                        scientificName: "Prunus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Formosan cherry", "Bellflower cherry", "Taiwan cherry"],
                    scientificName: "Prunus campanulata Maxim.",
                },
                gbif: { id: "3021408" },
            },
            {
                score: 0.14758,
                species: {
                    scientificNameWithoutAuthor: "Malus coronaria",
                    scientificNameAuthorship: "(L.) Mill.",
                    genus: {
                        scientificNameWithoutAuthor: "Malus",
                        scientificNameAuthorship: "",
                        scientificName: "Malus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Sweet crab apple", "American crabapple", "Fragrant crabapple"],
                    scientificName: "Malus coronaria (L.) Mill.",
                },
                gbif: { id: "3001166" },
            },
            {
                score: 0.13092,
                species: {
                    scientificNameWithoutAuthor: "Prunus serrulata",
                    scientificNameAuthorship: "Lindl.",
                    genus: {
                        scientificNameWithoutAuthor: "Prunus",
                        scientificNameAuthorship: "",
                        scientificName: "Prunus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: [
                        "Japanese flowering cherry",
                        "Japanese cherry",
                        "Oriental cherry",
                    ],
                    scientificName: "Prunus serrulata Lindl.",
                },
                gbif: { id: "3022609" },
            },
            {
                score: 0.10147,
                species: {
                    scientificNameWithoutAuthor: "Malus floribunda",
                    scientificNameAuthorship: "Siebold ex Van Houtte",
                    genus: {
                        scientificNameWithoutAuthor: "Malus",
                        scientificNameAuthorship: "",
                        scientificName: "Malus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: [
                        "Japanese flowering Crabapple",
                        "Japanese crab",
                        "Japanese crab apple",
                    ],
                    scientificName: "Malus floribunda Siebold ex Van Houtte",
                },
                gbif: { id: "3001365" },
            },
            {
                score: 0.05122,
                species: {
                    scientificNameWithoutAuthor: "Prunus sargentii",
                    scientificNameAuthorship: "Rehder",
                    genus: {
                        scientificNameWithoutAuthor: "Prunus",
                        scientificNameAuthorship: "",
                        scientificName: "Prunus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: [
                        "Sargent's cherry",
                        "Northern Japanese hill cherry",
                        "Sargent Cherry",
                    ],
                    scientificName: "Prunus sargentii Rehder",
                },
                gbif: { id: "3020955" },
            },
            {
                score: 0.02576,
                species: {
                    scientificNameWithoutAuthor: "Malus × spectabilis",
                    scientificNameAuthorship: "(Sol.) Borkh.",
                    genus: {
                        scientificNameWithoutAuthor: "Malus",
                        scientificNameAuthorship: "",
                        scientificName: "Malus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Asiatic apple", "Chinese crab", "Chinese flowering apple"],
                    scientificName: "Malus × spectabilis (Sol.) Borkh.",
                },
                gbif: { id: "3001108" },
            },
            {
                score: 0.01802,
                species: {
                    scientificNameWithoutAuthor: "Prunus triloba",
                    scientificNameAuthorship: "Lindl.",
                    genus: {
                        scientificNameWithoutAuthor: "Prunus",
                        scientificNameAuthorship: "",
                        scientificName: "Prunus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Flowering almond", "Flowering plum"],
                    scientificName: "Prunus triloba Lindl.",
                },
                gbif: { id: "3023130" },
            },
            {
                score: 0.01206,
                species: {
                    scientificNameWithoutAuthor: "Prunus japonica",
                    scientificNameAuthorship: "Thunb.",
                    genus: {
                        scientificNameWithoutAuthor: "Prunus",
                        scientificNameAuthorship: "",
                        scientificName: "Prunus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: [
                        "Chinese bush cherry",
                        "Japanese bush cherry",
                        "Oriental bush cherry",
                    ],
                    scientificName: "Prunus japonica Thunb.",
                },
                gbif: { id: "3020565" },
            },
            {
                score: 0.01161,
                species: {
                    scientificNameWithoutAuthor: "Prunus × yedoensis",
                    scientificNameAuthorship: "Matsum.",
                    genus: {
                        scientificNameWithoutAuthor: "Prunus",
                        scientificNameAuthorship: "",
                        scientificName: "Prunus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Yoshino cherry", "Potomac cherry", "Tokyo cherry"],
                    scientificName: "Prunus × yedoensis Matsum.",
                },
                gbif: { id: "3021335" },
            },
            {
                score: 0.00914,
                species: {
                    scientificNameWithoutAuthor: "Prunus mume",
                    scientificNameAuthorship: "(Siebold) Siebold & Zucc.",
                    genus: {
                        scientificNameWithoutAuthor: "Prunus",
                        scientificNameAuthorship: "",
                        scientificName: "Prunus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Japanese apricot", "Ume", "Chinese Plum"],
                    scientificName: "Prunus mume (Siebold) Siebold & Zucc.",
                },
                gbif: { id: "3021046" },
            },
            {
                score: 0.0088,
                species: {
                    scientificNameWithoutAuthor: "Malus niedzwetzkyana",
                    scientificNameAuthorship: "Dieck ex Koehne",
                    genus: {
                        scientificNameWithoutAuthor: "Malus",
                        scientificNameAuthorship: "",
                        scientificName: "Malus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Apple", "Paradise apple", "Kulturapfel"],
                    scientificName: "Malus niedzwetzkyana Dieck ex Koehne",
                },
                gbif: { id: "3001327" },
            },
            {
                score: 0.00734,
                species: {
                    scientificNameWithoutAuthor: "Malus hupehensis",
                    scientificNameAuthorship: "(Pamp.) Rehder",
                    genus: {
                        scientificNameWithoutAuthor: "Malus",
                        scientificNameAuthorship: "",
                        scientificName: "Malus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Chinese crab apple", "Hupeh crab", "Tea crab apple"],
                    scientificName: "Malus hupehensis (Pamp.) Rehder",
                },
                gbif: { id: "3001077" },
            },
            {
                score: 0.00688,
                species: {
                    scientificNameWithoutAuthor: "Malus angustifolia",
                    scientificNameAuthorship: "(Aiton) Michx.",
                    genus: {
                        scientificNameWithoutAuthor: "Malus",
                        scientificNameAuthorship: "",
                        scientificName: "Malus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: [
                        "Southern crab apple",
                        "Narrow-leaved crabapple",
                        "Southern crabapple",
                    ],
                    scientificName: "Malus angustifolia (Aiton) Michx.",
                },
                gbif: { id: "3001548" },
            },
            {
                score: 0.00614,
                species: {
                    scientificNameWithoutAuthor: "Prunus subhirtella",
                    scientificNameAuthorship: "Miq.",
                    genus: {
                        scientificNameWithoutAuthor: "Prunus",
                        scientificNameAuthorship: "",
                        scientificName: "Prunus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Rosebud cherry", "Spring cherry", "Autumn cherry"],
                    scientificName: "Prunus subhirtella Miq.",
                },
                gbif: { id: "3021229" },
            },
            {
                score: 0.00267,
                species: {
                    scientificNameWithoutAuthor: "Robinia viscosa",
                    scientificNameAuthorship: "Vent.",
                    genus: {
                        scientificNameWithoutAuthor: "Robinia",
                        scientificNameAuthorship: "",
                        scientificName: "Robinia",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Leguminosae",
                        scientificNameAuthorship: "",
                        scientificName: "Leguminosae",
                    },
                    commonNames: ["Clammy locust", "Rose acacia", "Clammy-bark locust"],
                    scientificName: "Robinia viscosa Vent.",
                },
                gbif: { id: "5352245" },
            },
            {
                score: 0.0026,
                species: {
                    scientificNameWithoutAuthor: "Handroanthus impetiginosus",
                    scientificNameAuthorship: "(Mart. ex DC.) Mattos",
                    genus: {
                        scientificNameWithoutAuthor: "Handroanthus",
                        scientificNameAuthorship: "",
                        scientificName: "Handroanthus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Bignoniaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Bignoniaceae",
                    },
                    commonNames: ["Pink trumpet-tree", "Taheebo", "Pink Trumpet Tree"],
                    scientificName: "Handroanthus impetiginosus (Mart. ex DC.) Mattos",
                },
                gbif: { id: "4092242" },
            },
            {
                score: 0.00187,
                species: {
                    scientificNameWithoutAuthor: "Prunus glandulosa",
                    scientificNameAuthorship: "Thunb.",
                    genus: {
                        scientificNameWithoutAuthor: "Prunus",
                        scientificNameAuthorship: "",
                        scientificName: "Prunus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: [
                        "Chinese bush cherry",
                        "Dwarf flowering almond",
                        "Flowering almond",
                    ],
                    scientificName: "Prunus glandulosa Thunb.",
                },
                gbif: { id: "3022160" },
            },
            {
                score: 0.00162,
                species: {
                    scientificNameWithoutAuthor: "Prunus persica",
                    scientificNameAuthorship: "(L.) Batsch",
                    genus: {
                        scientificNameWithoutAuthor: "Prunus",
                        scientificNameAuthorship: "",
                        scientificName: "Prunus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Peach", "هلو", "Peach tree"],
                    scientificName: "Prunus persica (L.) Batsch",
                },
                gbif: { id: "3022511" },
            },
            {
                score: 0.00162,
                species: {
                    scientificNameWithoutAuthor: "Prunus cerasifera",
                    scientificNameAuthorship: "Ehrh.",
                    genus: {
                        scientificNameWithoutAuthor: "Prunus",
                        scientificNameAuthorship: "",
                        scientificName: "Prunus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Cherry plum, myrobalan", "Cherry plum", "Myrobalan plum"],
                    scientificName: "Prunus cerasifera Ehrh.",
                },
                gbif: { id: "3021730" },
            },
            {
                score: 0.00159,
                species: {
                    scientificNameWithoutAuthor: "Malus prattii",
                    scientificNameAuthorship: "(Hemsl.) C.K.Schneid.",
                    genus: {
                        scientificNameWithoutAuthor: "Malus",
                        scientificNameAuthorship: "",
                        scientificName: "Malus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Pratt apple", "Pratt's Crab Apple"],
                    scientificName: "Malus prattii (Hemsl.) C.K.Schneid.",
                },
                gbif: { id: "3001504" },
            },
            {
                score: 0.00159,
                species: {
                    scientificNameWithoutAuthor: "Prunus pedunculata",
                    scientificNameAuthorship: "(Pall.) Maxim.",
                    genus: {
                        scientificNameWithoutAuthor: "Prunus",
                        scientificNameAuthorship: "",
                        scientificName: "Prunus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: [],
                    scientificName: "Prunus pedunculata (Pall.) Maxim.",
                },
                gbif: { id: "3022277" },
            },
            {
                score: 0.00153,
                species: {
                    scientificNameWithoutAuthor: "Cercis siliquastrum",
                    scientificNameAuthorship: "L.",
                    genus: {
                        scientificNameWithoutAuthor: "Cercis",
                        scientificNameAuthorship: "",
                        scientificName: "Cercis",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Leguminosae",
                        scientificNameAuthorship: "",
                        scientificName: "Leguminosae",
                    },
                    commonNames: ["Judastree", "Lovetree", "Judas-tree"],
                    scientificName: "Cercis siliquastrum L.",
                },
                gbif: { id: "5353590" },
            },
            {
                score: 0.00128,
                species: {
                    scientificNameWithoutAuthor: "Malus sylvestris",
                    scientificNameAuthorship: "(L.) Mill.",
                    genus: {
                        scientificNameWithoutAuthor: "Malus",
                        scientificNameAuthorship: "",
                        scientificName: "Malus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Crab apple", "European crab apple", "Lopâr"],
                    scientificName: "Malus sylvestris (L.) Mill.",
                },
                gbif: { id: "3001509" },
            },
            {
                score: 0.0012,
                species: {
                    scientificNameWithoutAuthor: "Magnolia × soulangeana",
                    scientificNameAuthorship: "Soul.-Bod.",
                    genus: {
                        scientificNameWithoutAuthor: "Magnolia",
                        scientificNameAuthorship: "",
                        scientificName: "Magnolia",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Magnoliaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Magnoliaceae",
                    },
                    commonNames: ["Chinese magnolia", "Saucer magnolia"],
                    scientificName: "Magnolia × soulangeana Soul.-Bod.",
                },
                gbif: { id: "7925303" },
            },
            {
                score: 0.00118,
                species: {
                    scientificNameWithoutAuthor: "Cercis canadensis",
                    scientificNameAuthorship: "L.",
                    genus: {
                        scientificNameWithoutAuthor: "Cercis",
                        scientificNameAuthorship: "",
                        scientificName: "Cercis",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Leguminosae",
                        scientificNameAuthorship: "",
                        scientificName: "Leguminosae",
                    },
                    commonNames: ["Eastern redbud", "Judastree", "Redbud"],
                    scientificName: "Cercis canadensis L.",
                },
                gbif: { id: "5353583" },
            },
            {
                score: 0.00114,
                species: {
                    scientificNameWithoutAuthor: "Malus × prunifolia",
                    scientificNameAuthorship: "(Willd.) Borkh.",
                    genus: {
                        scientificNameWithoutAuthor: "Malus",
                        scientificNameAuthorship: "",
                        scientificName: "Malus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Plumleaf crab apple", "Chinese apple", "Crab apple"],
                    scientificName: "Malus × prunifolia (Willd.) Borkh.",
                },
                gbif: { id: "3001157" },
            },
            {
                score: 0.00111,
                species: {
                    scientificNameWithoutAuthor: "Prunus serrula",
                    scientificNameAuthorship: "Franch.",
                    genus: {
                        scientificNameWithoutAuthor: "Prunus",
                        scientificNameAuthorship: "",
                        scientificName: "Prunus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Birchbark cherry"],
                    scientificName: "Prunus serrula Franch.",
                },
                gbif: { id: "3023582" },
            },
            {
                score: 0.00106,
                species: {
                    scientificNameWithoutAuthor: "Malus pumila",
                    scientificNameAuthorship: "Mill.",
                    genus: {
                        scientificNameWithoutAuthor: "Malus",
                        scientificNameAuthorship: "",
                        scientificName: "Malus",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Rosaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Rosaceae",
                    },
                    commonNames: ["Apple", "Paradise apple", "Kulturapfel"],
                    scientificName: "Malus pumila Mill.",
                },
                gbif: { id: "3001093" },
            },
            {
                score: 0.00101,
                species: {
                    scientificNameWithoutAuthor: "Viburnum farreri",
                    scientificNameAuthorship: "Stearn",
                    genus: {
                        scientificNameWithoutAuthor: "Viburnum",
                        scientificNameAuthorship: "",
                        scientificName: "Viburnum",
                    },
                    family: {
                        scientificNameWithoutAuthor: "Adoxaceae",
                        scientificNameAuthorship: "",
                        scientificName: "Adoxaceae",
                    },
                    commonNames: ["Fragrant viburnum", "Culver's root", "Farrer's Viburnum"],
                    scientificName: "Viburnum farreri Stearn",
                },
                gbif: { id: "6369599" },
            },
        ],
        version: "2022-06-14 (6.0)",
        remainingIdentificationRequests: 498,
    }
}

export interface PlantNetSpeciesMatch {
    score: number
    gbif: { id: string /*Actually a number*/ }
    species: {
        scientificNameWithoutAuthor: string
        scientificNameAuthorship: string
        genus: {
            scientificNameWithoutAuthor: string
            scientificNameAuthorship: string
            scientificName: string
        }
        family: {
            scientificNameWithoutAuthor: string
            scientificNameAuthorship: string
            scientificName: string
        }
        commonNames: string[]
        scientificName: string
    }
}

export interface PlantNetResult {
    query: {
        project: string
        images: string[]
        organs: string[]
        includeRelatedImages: boolean
    }
    language: string
    preferedReferential: string
    bestMatch: string
    results: PlantNetSpeciesMatch[]
    version: string
    remainingIdentificationRequests: number
}
