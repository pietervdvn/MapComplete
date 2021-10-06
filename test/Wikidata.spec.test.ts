import Wikidata from "../Logic/Web/Wikidata";
import * as assert from "assert";
import {equal} from "assert";
import T from "./TestHelper";
import {Utils} from "../Utils";

export default class WikidataSpecTest extends T {
    constructor() {
        super("Wikidata",
            [
                ["download wikidata",
                    async () => {

                        Utils.injectJsonDownloadForTests(
                            "https://www.wikidata.org/wiki/Special:EntityData/Q14517013.json",
                            {
                                "entities": {
                                    "Q14517013": {
                                        "pageid": 16187848,
                                        "ns": 0,
                                        "title": "Q14517013",
                                        "lastrevid": 1408823680,
                                        "modified": "2021-04-26T07:35:01Z",
                                        "type": "item",
                                        "id": "Q14517013",
                                        "labels": {
                                            "nl": {"language": "nl", "value": "Vredesmolen"},
                                            "en": {"language": "en", "value": "Peace Mill"}
                                        },
                                        "descriptions": {"nl": {"language": "nl", "value": "molen in West-Vlaanderen"}},
                                        "aliases": {},
                                        "claims": {
                                            "P625": [{
                                                "mainsnak": {
                                                    "snaktype": "value",
                                                    "property": "P625",
                                                    "hash": "d86538f14e8cca00bbf30fb029829aacbc6903a0",
                                                    "datavalue": {
                                                        "value": {
                                                            "latitude": 50.99444,
                                                            "longitude": 2.92528,
                                                            "altitude": null,
                                                            "precision": 0.0001,
                                                            "globe": "http://www.wikidata.org/entity/Q2"
                                                        }, "type": "globecoordinate"
                                                    },
                                                    "datatype": "globe-coordinate"
                                                },
                                                "type": "statement",
                                                "id": "Q14517013$DBFBFD69-F54D-4C92-A7F4-A44F876E5776",
                                                "rank": "normal",
                                                "references": [{
                                                    "hash": "732ec1c90a6f0694c7db9a71bf09fe7f2b674172",
                                                    "snaks": {
                                                        "P143": [{
                                                            "snaktype": "value",
                                                            "property": "P143",
                                                            "hash": "9123b0de1cc9c3954366ba797d598e4e1ea4146f",
                                                            "datavalue": {
                                                                "value": {
                                                                    "entity-type": "item",
                                                                    "numeric-id": 10000,
                                                                    "id": "Q10000"
                                                                }, "type": "wikibase-entityid"
                                                            },
                                                            "datatype": "wikibase-item"
                                                        }]
                                                    },
                                                    "snaks-order": ["P143"]
                                                }]
                                            }],
                                            "P17": [{
                                                "mainsnak": {
                                                    "snaktype": "value",
                                                    "property": "P17",
                                                    "hash": "c2859f311753176d6bdfa7da54ceeeac7acb52c8",
                                                    "datavalue": {
                                                        "value": {
                                                            "entity-type": "item",
                                                            "numeric-id": 31,
                                                            "id": "Q31"
                                                        }, "type": "wikibase-entityid"
                                                    },
                                                    "datatype": "wikibase-item"
                                                },
                                                "type": "statement",
                                                "id": "Q14517013$C12E4DA5-44E1-41ED-BF3D-C84381246429",
                                                "rank": "normal"
                                            }],
                                            "P18": [{
                                                "mainsnak": {
                                                    "snaktype": "value",
                                                    "property": "P18",
                                                    "hash": "af765166ecaa7d01ea800812b5b356886b8849a0",
                                                    "datavalue": {
                                                        "value": "Klerken Vredesmolen R01.jpg",
                                                        "type": "string"
                                                    },
                                                    "datatype": "commonsMedia"
                                                },
                                                "type": "statement",
                                                "id": "Q14517013$5291801E-11BE-4CE7-8F42-D0D6A120F390",
                                                "rank": "normal"
                                            }],
                                            "P2867": [{
                                                "mainsnak": {
                                                    "snaktype": "value",
                                                    "property": "P2867",
                                                    "hash": "b1c627972ba2cc71e3567d2fb56cb5f90dd64007",
                                                    "datavalue": {"value": "893", "type": "string"},
                                                    "datatype": "external-id"
                                                },
                                                "type": "statement",
                                                "id": "Q14517013$2aff9dcd-4d24-cd92-b5af-f6268425695f",
                                                "rank": "normal"
                                            }],
                                            "P31": [{
                                                "mainsnak": {
                                                    "snaktype": "value",
                                                    "property": "P31",
                                                    "hash": "9b48263bb51c506553aac2281ae331353b5c9002",
                                                    "datavalue": {
                                                        "value": {
                                                            "entity-type": "item",
                                                            "numeric-id": 38720,
                                                            "id": "Q38720"
                                                        }, "type": "wikibase-entityid"
                                                    },
                                                    "datatype": "wikibase-item"
                                                },
                                                "type": "statement",
                                                "id": "Q14517013$46dd9d89-4999-eee6-20a4-c4f6650b1d9c",
                                                "rank": "normal"
                                            }, {
                                                "mainsnak": {
                                                    "snaktype": "value",
                                                    "property": "P31",
                                                    "hash": "a1d6f3409c57de0361c68263c9397a99dabe19ea",
                                                    "datavalue": {
                                                        "value": {
                                                            "entity-type": "item",
                                                            "numeric-id": 3851468,
                                                            "id": "Q3851468"
                                                        }, "type": "wikibase-entityid"
                                                    },
                                                    "datatype": "wikibase-item"
                                                },
                                                "type": "statement",
                                                "id": "Q14517013$C83A8B1F-7798-493A-86C9-EC0EFEE356B3",
                                                "rank": "normal"
                                            }, {
                                                "mainsnak": {
                                                    "snaktype": "value",
                                                    "property": "P31",
                                                    "hash": "ee5ba9185bdf9f0eb80b52e1cdc70c5883fac95a",
                                                    "datavalue": {
                                                        "value": {
                                                            "entity-type": "item",
                                                            "numeric-id": 623605,
                                                            "id": "Q623605"
                                                        }, "type": "wikibase-entityid"
                                                    },
                                                    "datatype": "wikibase-item"
                                                },
                                                "type": "statement",
                                                "id": "Q14517013$CF74DC2E-6814-4755-9BAD-6EE9FEF637DD",
                                                "rank": "normal"
                                            }],
                                            "P2671": [{
                                                "mainsnak": {
                                                    "snaktype": "value",
                                                    "property": "P2671",
                                                    "hash": "83fb38a3c6407f7d0d7bb051d1c31cea8ae26975",
                                                    "datavalue": {"value": "/g/121cb15z", "type": "string"},
                                                    "datatype": "external-id"
                                                },
                                                "type": "statement",
                                                "id": "Q14517013$E6FFEF32-0131-42FD-9C66-1A406B68059A",
                                                "rank": "normal"
                                            }]
                                        },
                                        "sitelinks": {
                                            "commonswiki": {
                                                "site": "commonswiki",
                                                "title": "Category:Vredesmolen, Klerken",
                                                "badges": [],
                                                "url": "https://commons.wikimedia.org/wiki/Category:Vredesmolen,_Klerken"
                                            },
                                            "nlwiki": {
                                                "site": "nlwiki",
                                                "title": "Vredesmolen",
                                                "badges": [],
                                                "url": "https://nl.wikipedia.org/wiki/Vredesmolen"
                                            }
                                        }
                                    }
                                }
                            }
                        )


                        const wdata = await Wikidata.LoadWikidataEntryAsync(14517013)
                        T.isTrue(wdata.wikisites.has("nl"), "dutch for wikisite not found")
                        equal("Vredesmolen", wdata.wikisites.get("nl"))
                    }

                ],
                ["Download Prince", async () => {

                    Utils.injectJsonDownloadForTests(
                        "https://www.wikidata.org/wiki/Special:EntityData/Q2747456.json",
                        {
                            "entities": {
                                "Q2747456": {
                                    "pageid": 2638026,
                                    "ns": 0,
                                    "title": "Q2747456",
                                    "lastrevid": 1507566187,
                                    "modified": "2021-10-03T20:26:12Z",
                                    "type": "item",
                                    "id": "Q2747456",
                                    "labels": {
                                        "nl": {"language": "nl", "value": "prins"},
                                        "am": {"language": "am", "value": "\u120d\u12d1\u120d"},
                                        "ar": {"language": "ar", "value": "\u0623\u0645\u064a\u0631"},
                                        "be": {"language": "be", "value": "\u043f\u0440\u044b\u043d\u0446"},
                                        "bg": {"language": "bg", "value": "\u043f\u0440\u0438\u043d\u0446"},
                                        "ca": {"language": "ca", "value": "pr\u00edncep"},
                                        "cs": {"language": "cs", "value": "princ"},
                                        "cy": {"language": "cy", "value": "tywysog"},
                                        "da": {"language": "da", "value": "prins"},
                                        "de": {"language": "de", "value": "Prinz"},
                                        "en": {"language": "en", "value": "prince"},
                                        "eo": {"language": "eo", "value": "princo"},
                                        "es": {"language": "es", "value": "pr\u00edncipe"},
                                        "fa": {"language": "fa", "value": "\u0634\u0627\u0647\u0632\u0627\u062f\u0647"},
                                        "fi": {"language": "fi", "value": "prinssi"},
                                        "fr": {"language": "fr", "value": "prince"},
                                        "he": {"language": "he", "value": "\u05e0\u05e1\u05d9\u05da"},
                                        "hr": {"language": "hr", "value": "princ"},
                                        "id": {"language": "id", "value": "pangeran"},
                                        "it": {"language": "it", "value": "principe"},
                                        "ja": {"language": "ja", "value": "\u30d7\u30ea\u30f3\u30b9"},
                                        "ka": {
                                            "language": "ka",
                                            "value": "\u10e3\u10e4\u10da\u10d8\u10e1\u10ec\u10e3\u10da\u10d8"
                                        },
                                        "lv": {"language": "lv", "value": "princis"},
                                        "ms": {"language": "ms", "value": "putera"},
                                        "ne": {
                                            "language": "ne",
                                            "value": "\u0930\u093e\u091c\u0915\u0941\u092e\u093e\u0930"
                                        },
                                        "nn": {"language": "nn", "value": "prins"},
                                        "pt": {"language": "pt", "value": "pr\u00edncipe"},
                                        "ro": {"language": "ro", "value": "prin\u021b"},
                                        "ru": {"language": "ru", "value": "\u043f\u0440\u0438\u043d\u0446"},
                                        "scn": {"language": "scn", "value": "pr\u00ecncipi"},
                                        "sk": {"language": "sk", "value": "princ"},
                                        "sl": {"language": "sl", "value": "princ"},
                                        "sv": {"language": "sv", "value": "prins"},
                                        "tr": {"language": "tr", "value": "prens"},
                                        "uk": {"language": "uk", "value": "\u043f\u0440\u0438\u043d\u0446"},
                                        "vec": {"language": "vec", "value": "principe"},
                                        "vi": {"language": "vi", "value": "v\u01b0\u01a1ng"},
                                        "ko": {"language": "ko", "value": "\uc655\uc790"},
                                        "th": {"language": "th", "value": "\u0e40\u0e08\u0e49\u0e32"},
                                        "la": {"language": "la", "value": "princeps"},
                                        "gl": {"language": "gl", "value": "pr\u00edncipe"},
                                        "nb": {"language": "nb", "value": "prins"},
                                        "el": {
                                            "language": "el",
                                            "value": "\u03c0\u03c1\u03af\u03b3\u03ba\u03b9\u03c0\u03b1\u03c2"
                                        },
                                        "is": {"language": "is", "value": "prins"},
                                        "pl": {"language": "pl", "value": "ksi\u0105\u017c\u0119 (princeps)"},
                                        "nan": {"language": "nan", "value": "th\u00e2u-l\u00e2ng"},
                                        "be-tarask": {
                                            "language": "be-tarask",
                                            "value": "\u043f\u0440\u044b\u043d\u0446"
                                        },
                                        "ur": {"language": "ur", "value": "\u0634\u06c1\u0632\u0627\u062f\u06c1"},
                                        "sco": {"language": "sco", "value": "prince"},
                                        "zh": {"language": "zh", "value": "\u738b\u7235"},
                                        "sr": {"language": "sr", "value": "\u043f\u0440\u0438\u043d\u0446"},
                                        "sh": {"language": "sh", "value": "princ"},
                                        "hy": {
                                            "language": "hy",
                                            "value": "\u0561\u0580\u0584\u0561\u0575\u0561\u0566\u0576"
                                        },
                                        "et": {"language": "et", "value": "prints"},
                                        "bxr": {
                                            "language": "bxr",
                                            "value": "\u0445\u0430\u043d \u0445\u04af\u0431\u04af\u04af\u043d"
                                        },
                                        "fy": {"language": "fy", "value": "prins"},
                                        "diq": {"language": "diq", "value": "prens"},
                                        "ba": {"language": "ba", "value": "\u043f\u0440\u0438\u043d\u0446"},
                                        "eu": {"language": "eu", "value": "printze"},
                                        "gd": {"language": "gd", "value": "prionnsa"},
                                        "gu": {"language": "gu", "value": "\u0a95\u0ac1\u0a82\u0ab5\u0ab0"},
                                        "lb": {"language": "lb", "value": "Pr\u00ebnz"},
                                        "ga": {"language": "ga", "value": "prionsa"},
                                        "hu": {"language": "hu", "value": "herceg"},
                                        "su": {"language": "su", "value": "pang\u00e9ran"},
                                        "ast": {"language": "ast", "value": "pr\u00edncipe"},
                                        "rmy": {"language": "rmy", "value": "rayon"},
                                        "yue": {"language": "yue", "value": "\u89aa\u738b"},
                                        "jv": {"language": "jv", "value": "pang\u00e9ran"},
                                        "zh-hant": {"language": "zh-hant", "value": "\u738b\u7235"},
                                        "se": {"language": "se", "value": "prinsa"},
                                        "smj": {"language": "smj", "value": "prinssa"},
                                        "smn": {"language": "smn", "value": "prinss\u00e2"},
                                        "sms": {"language": "sms", "value": "prinss"},
                                        "az": {"language": "az", "value": "Prens"},
                                        "wuu": {"language": "wuu", "value": "\u738b\u7235"},
                                        "yi": {"language": "yi", "value": "\u05e4\u05e8\u05d9\u05e0\u05e5"}
                                    },
                                    "descriptions": {
                                        "fr": {"language": "fr", "value": "titre de noblesse"},
                                        "es": {"language": "es", "value": "t\u00edtulo nobiliario"},
                                        "en": {
                                            "language": "en",
                                            "value": "son of a prince, king, queen, emperor or empress, or other high-ranking person (such as a grand duke)"
                                        },
                                        "el": {
                                            "language": "el",
                                            "value": "\u03c4\u03af\u03c4\u03bb\u03bf\u03c2 \u03b5\u03c5\u03b3\u03b5\u03bd\u03b5\u03af\u03b1\u03c2"
                                        },
                                        "de": {
                                            "language": "de",
                                            "value": "Adels-Titel, m\u00e4nnliches Mitglied der K\u00f6nigsfamilie"
                                        },
                                        "pl": {"language": "pl", "value": "tytu\u0142 szlachecki"},
                                        "ca": {"language": "ca", "value": "t\u00edtol de noblesa"},
                                        "vi": {
                                            "language": "vi",
                                            "value": "con trai c\u1ee7a ho\u00e0ng t\u1eed, vua, ho\u00e0ng h\u1eadu, ho\u00e0ng \u0111\u1ebf, ho\u00e0ng h\u1eadu ho\u1eb7c nh\u1eefng ng\u01b0\u1eddi c\u00f3 \u0111\u1ecba v\u1ecb cao kh\u00e1c"
                                        },
                                        "da": {"language": "da", "value": "kongelig titel"},
                                        "eu": {"language": "eu", "value": "noblezia titulu"},
                                        "hu": {"language": "hu", "value": "nemesi c\u00edm"},
                                        "zh": {"language": "zh", "value": "\u8cb4\u65cf\u982d\u929c"},
                                        "ar": {
                                            "language": "ar",
                                            "value": "\u0644\u0642\u0628 \u0646\u0628\u064a\u0644"
                                        },
                                        "ast": {"language": "ast", "value": "t\u00edtulu de nobleza"},
                                        "ru": {"language": "ru", "value": "\u0442\u0438\u0442\u0443\u043b"},
                                        "be-tarask": {
                                            "language": "be-tarask",
                                            "value": "\u0448\u043b\u044f\u0445\u0435\u0446\u043a\u0456 \u0442\u044b\u0442\u0443\u043b"
                                        },
                                        "zh-hant": {"language": "zh-hant", "value": "\u8cb4\u65cf\u982d\u929c"},
                                        "it": {
                                            "language": "it",
                                            "value": "figlio di un principe, re, regina, imperatore o imperatrice o altra persona di alto rango (come un granduca)"
                                        },
                                        "nl": {
                                            "language": "nl",
                                            "value": "zoon van een prins(es), koning(in), keizer(in) of andere persoon met een adellijke rang (zoals een groothertog)"
                                        },
                                        "ro": {
                                            "language": "ro",
                                            "value": "titlu nobiliar acordat \u00een general membrilor unei familii imperiale, regale, princiare etc."
                                        },
                                        "lb": {"language": "lb", "value": "Adelstitel"},
                                        "id": {
                                            "language": "id",
                                            "value": "putra seorang pangeran, raja, ratu, kaisar atau permaisuri, atau orang berpangkat tinggi lainnya (seperti adipati agung)"
                                        },
                                        "he": {
                                            "language": "he",
                                            "value": "\u05ea\u05d5\u05d0\u05e8 \u05d0\u05e6\u05d5\u05dc\u05d4"
                                        },
                                        "fi": {
                                            "language": "fi",
                                            "value": "ylh\u00e4isaatelisarvo, monesti monarkin poika"
                                        },
                                        "cs": {
                                            "language": "cs",
                                            "value": "titul potomka prince/princezny, kn\u00ed\u017eete/kn\u011b\u017eny, (velko)v\u00e9vody/v\u00e9vodkyn\u011b, kr\u00e1le/kr\u00e1lovny \u010di c\u00edsa\u0159e/c\u00edsa\u0159ovny"
                                        },
                                        "uk": {
                                            "language": "uk",
                                            "value": "\u0434\u0438\u0442\u0438\u043d\u0430 \u043f\u0440\u0438\u043d\u0446\u0430(-\u0435\u0441\u0438), \u043a\u043e\u0440\u043e\u043b\u044f (\u043a\u043e\u0440\u043e\u043b\u0435\u0432\u0438), \u0456\u043d\u043c\u0435\u0440\u0430\u0442\u043e\u0440\u0430(-\u043a\u0438) \u0447\u0438 \u0456\u043d\u0448\u043e\u0457 \u0437\u043d\u0430\u0442\u043d\u043e\u0457 \u043e\u0441\u043e\u0431\u0438"
                                        }
                                    },
                                    "aliases": {
                                        "es": [{"language": "es", "value": "princesa"}, {
                                            "language": "es",
                                            "value": "principe"
                                        }],
                                        "ru": [{
                                            "language": "ru",
                                            "value": "\u043f\u0440\u0438\u043d\u0446\u0435\u0441\u0441\u0430"
                                        }, {"language": "ru", "value": "\u0446\u0430\u0440\u0435\u0432\u0438\u0447"}],
                                        "ca": [{"language": "ca", "value": "princesa"}],
                                        "ba": [{
                                            "language": "ba",
                                            "value": "\u043f\u0440\u0438\u043d\u0446\u0435\u0441\u0441\u0430"
                                        }],
                                        "gu": [{
                                            "language": "gu",
                                            "value": "\u0aae\u0ab9\u0abe\u0ab0\u0abe\u0a9c \u0a95\u0ac1\u0a82\u0ab5\u0ab0"
                                        }, {"language": "gu", "value": "\u0aae. \u0a95\u0ac1."}, {
                                            "language": "gu",
                                            "value": "\u0a8f\u0aae. \u0a95\u0ac7."
                                        }],
                                        "he": [{"language": "he", "value": "\u05e0\u05e1\u05d9\u05db\u05d4"}],
                                        "de": [{"language": "de", "value": "Prinzessin"}],
                                        "ast": [{"language": "ast", "value": "princesa"}],
                                        "be-tarask": [{
                                            "language": "be-tarask",
                                            "value": "\u043f\u0440\u044b\u043d\u0446\u044d\u0441\u0430"
                                        }],
                                        "nl": [{"language": "nl", "value": "prinsje"}],
                                        "it": [{"language": "it", "value": "principessa"}],
                                        "se": [{"language": "se", "value": "gonagasb\u00e1rdni"}],
                                        "pl": [{"language": "pl", "value": "ksi\u0105\u017c\u0119"}],
                                        "vi": [{"language": "vi", "value": "v\u01b0\u01a1ng t\u01b0\u1edbc"}],
                                        "cs": [{"language": "cs", "value": "princezna"}]
                                    },
                                    "claims": {
                                        "P31": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P31",
                                                "hash": "a456372c8e6a681381eca31ab0662159db12ab1e",
                                                "datavalue": {
                                                    "value": {
                                                        "entity-type": "item",
                                                        "numeric-id": 355567,
                                                        "id": "Q355567"
                                                    }, "type": "wikibase-entityid"
                                                },
                                                "datatype": "wikibase-item"
                                            },
                                            "type": "statement",
                                            "id": "q2747456$ff8e76c2-47b8-d2b7-a192-9af298c36c8e",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P31",
                                                "hash": "0ec7ed0637d631867884c8c0553e2de4b90b63ca",
                                                "datavalue": {
                                                    "value": {
                                                        "entity-type": "item",
                                                        "numeric-id": 3320743,
                                                        "id": "Q3320743"
                                                    }, "type": "wikibase-entityid"
                                                },
                                                "datatype": "wikibase-item"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$7b3a375d-48d8-18db-12db-9be699a1c34f",
                                            "rank": "normal"
                                        }],
                                        "P910": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P910",
                                                "hash": "ee5be4ad914a3f79dc30c6a6ac320404d7b6bf65",
                                                "datavalue": {
                                                    "value": {
                                                        "entity-type": "item",
                                                        "numeric-id": 7214172,
                                                        "id": "Q7214172"
                                                    }, "type": "wikibase-entityid"
                                                },
                                                "datatype": "wikibase-item"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$92971E9D-FA6B-4CFA-88C9-91EF27DDE2DC",
                                            "rank": "normal"
                                        }],
                                        "P508": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P508",
                                                "hash": "36109efdac97e7f035d386101fb85a397380f9ee",
                                                "datavalue": {"value": "8468", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$cdaad4c5-4ec8-54b2-3dac-4db04f994fda",
                                            "rank": "normal"
                                        }],
                                        "P1001": [{
                                            "mainsnak": {
                                                "snaktype": "somevalue",
                                                "property": "P1001",
                                                "hash": "be44552ae528f03d39720570854717fa0ebedcef",
                                                "datatype": "wikibase-item"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$5eea869d-4f5d-99ee-90bb-471cccbf4b84",
                                            "rank": "normal"
                                        }],
                                        "P373": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P373",
                                                "hash": "e766c6be546f129979614c185bb172cd237a626a",
                                                "datavalue": {"value": "Princes", "type": "string"},
                                                "datatype": "string"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$D4EEC77F-1F89-46DA-BD9E-FA15F29B686A",
                                            "rank": "normal",
                                            "references": [{
                                                "hash": "fa278ebfc458360e5aed63d5058cca83c46134f1",
                                                "snaks": {
                                                    "P143": [{
                                                        "snaktype": "value",
                                                        "property": "P143",
                                                        "hash": "e4f6d9441d0600513c4533c672b5ab472dc73694",
                                                        "datavalue": {
                                                            "value": {
                                                                "entity-type": "item",
                                                                "numeric-id": 328,
                                                                "id": "Q328"
                                                            }, "type": "wikibase-entityid"
                                                        },
                                                        "datatype": "wikibase-item"
                                                    }]
                                                },
                                                "snaks-order": ["P143"]
                                            }]
                                        }],
                                        "P2521": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "3ac9f3b0f1b60d0fbeac8ce587b3f74470a2ea00",
                                                "datavalue": {
                                                    "value": {"text": "princesse", "language": "fr"},
                                                    "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$9c9a7d8e-4fea-87b1-0d41-7efd98922665",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "8eef33f2c1e8a583fd498d380838e5f72cc06491",
                                                "datavalue": {
                                                    "value": {"text": "princess", "language": "en"},
                                                    "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$e0281f91-4b2c-053b-9900-57d12d7d4211",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "1a86a592d40223b73b7f0686672650d48c997806",
                                                "datavalue": {
                                                    "value": {"text": "princino", "language": "eo"},
                                                    "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$1cb248ea-490c-b5f7-b011-06845ccac2b4",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "abbaf9a41f548f9a7c58e38f91db34cb370c876a",
                                                "datavalue": {
                                                    "value": {"text": "prinses", "language": "nl"},
                                                    "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$1d636ed1-4f4d-0851-ca7f-66c847e7c4be",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "37efe8398a055d9ace75c625cdc286b9aadb5ab0",
                                                "datavalue": {
                                                    "value": {"text": "princesa", "language": "ca"},
                                                    "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$316855ff-4047-0ffb-76fb-90057b0840ef",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "7810d8cabaaaeb41fad675cd9c3bfb39ab41d00f",
                                                "datavalue": {
                                                    "value": {
                                                        "text": "\u043f\u0440\u0438\u043d\u0446\u0435\u0441\u0441\u0430",
                                                        "language": "ru"
                                                    }, "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$fa60cb7b-460d-c8ff-b99c-c2bf515b12a0",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "e18f093988121762e3b247104eb626501d14ad2e",
                                                "datavalue": {
                                                    "value": {
                                                        "text": "\u05e0\u05e1\u05d9\u05db\u05d4",
                                                        "language": "he"
                                                    }, "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$03851c85-4db0-ff39-7608-1dc63852b6c8",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "3f8c2d8b4e28c17d49cc1bff30990657e0ab485a",
                                                "datavalue": {
                                                    "value": {
                                                        "text": "n\u1eef v\u01b0\u01a1ng",
                                                        "language": "vi"
                                                    }, "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$6115764d-4391-6997-ecb2-7768f18b2b45",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "106d96fa708baf606b060bdc8c6b545f477eee32",
                                                "datavalue": {
                                                    "value": {"text": "Prinzessin", "language": "de"},
                                                    "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$6f2c129e-413c-dead-3404-146368643ab8",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "69a2a841f26ab197dca7c5a6e2dd595b67e4188c",
                                                "datavalue": {
                                                    "value": {
                                                        "text": "\u03c0\u03c1\u03b9\u03b3\u03ba\u03af\u03c0\u03b9\u03c3\u03c3\u03b1",
                                                        "language": "el"
                                                    }, "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$9b901d48-4e41-ba93-344e-299c69a27ac6",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "560ecce28fcadaf0e2b8a584519fe94ffbf25ec1",
                                                "datavalue": {
                                                    "value": {"text": "princesa", "language": "ast"},
                                                    "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$520756e7-476d-a435-bc1c-0a56fa7851a1",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "44f2eb3f4fee6f4b4b3b992407bda0f6caed2536",
                                                "datavalue": {
                                                    "value": {"text": "tywysoges", "language": "cy"},
                                                    "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$698beb10-4e2c-b535-a89b-e29210f2be75",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "006e13a77c798832882c84070fe8f76cdc48611c",
                                                "datavalue": {
                                                    "value": {
                                                        "text": "\u0623\u0645\u064a\u0631\u0629",
                                                        "language": "ar"
                                                    }, "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$b75e51e5-48e5-1f4c-d99c-d83dde03e91d",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "25eb24e42c0a566023ceb354777cb1ec14492ef1",
                                                "datavalue": {
                                                    "value": {
                                                        "text": "\u043f\u0440\u044b\u043d\u0446\u044d\u0441\u0430",
                                                        "language": "be-tarask"
                                                    }, "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$075f0038-475e-e4ba-9801-52aac2067799",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "e72b1dd598ce40db3f7e9b195a3e9345b4ae4ba5",
                                                "datavalue": {
                                                    "value": {"text": "princezna", "language": "cs"},
                                                    "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$1085cbb9-4cd4-8a2f-a4c7-6f29fafea206",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "70d88bc577587e2732cf37a66dfd0920b175211a",
                                                "datavalue": {
                                                    "value": {"text": "prinsesse", "language": "da"},
                                                    "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$33d2e452-4ca2-8dea-4f98-242c53ef1811",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "eebf786f7c2b0963b9db4c2876bb24c6afc4ce1c",
                                                "datavalue": {
                                                    "value": {"text": "principessa", "language": "it"},
                                                    "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$3098804a-4758-d07f-8443-24ebe96c56ec",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2521",
                                                "hash": "649307549f96bfe54f16e9130f014bf018cc46c4",
                                                "datavalue": {
                                                    "value": {
                                                        "text": "\u043f\u0440\u0438\u043d\u0446\u0435\u0441\u0430",
                                                        "language": "uk"
                                                    }, "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$ff433d7c-4e07-f7c0-14af-3b3f31f8ae9a",
                                            "rank": "normal"
                                        }],
                                        "P3827": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P3827",
                                                "hash": "22ee9c46325acd0a1ca54f27bff5d75331211f8a",
                                                "datavalue": {"value": "princes", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$6C64B5EA-8B74-4BF6-BB90-81C28320200A",
                                            "rank": "normal"
                                        }],
                                        "P1343": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P1343",
                                                "hash": "eda63bed5c3d7a3460033092338ab321a2374c7f",
                                                "datavalue": {
                                                    "value": {
                                                        "entity-type": "item",
                                                        "numeric-id": 2041543,
                                                        "id": "Q2041543"
                                                    }, "type": "wikibase-entityid"
                                                },
                                                "datatype": "wikibase-item"
                                            },
                                            "type": "statement",
                                            "qualifiers": {
                                                "P805": [{
                                                    "snaktype": "value",
                                                    "property": "P805",
                                                    "hash": "a83263a5d43ce3636971eac0d25071e09746ed50",
                                                    "datavalue": {
                                                        "value": {
                                                            "entity-type": "item",
                                                            "numeric-id": 23858844,
                                                            "id": "Q23858844"
                                                        }, "type": "wikibase-entityid"
                                                    },
                                                    "datatype": "wikibase-item"
                                                }]
                                            },
                                            "qualifiers-order": ["P805"],
                                            "id": "Q2747456$BC72E96E-6B05-4437-97F4-2BC0AC5DFA6D",
                                            "rank": "normal",
                                            "references": [{
                                                "hash": "c454383fe86a434f02006970b5c8b8f3f9b6714d",
                                                "snaks": {
                                                    "P3452": [{
                                                        "snaktype": "value",
                                                        "property": "P3452",
                                                        "hash": "482b5f23c034bd9eb5565e3869de4856bd9d5311",
                                                        "datavalue": {
                                                            "value": {
                                                                "entity-type": "item",
                                                                "numeric-id": 23858844,
                                                                "id": "Q23858844"
                                                            }, "type": "wikibase-entityid"
                                                        },
                                                        "datatype": "wikibase-item"
                                                    }]
                                                },
                                                "snaks-order": ["P3452"]
                                            }]
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P1343",
                                                "hash": "d5011798f92464584d8ccfc5f19f18f3659668bb",
                                                "datavalue": {
                                                    "value": {
                                                        "entity-type": "item",
                                                        "numeric-id": 106727050,
                                                        "id": "Q106727050"
                                                    }, "type": "wikibase-entityid"
                                                },
                                                "datatype": "wikibase-item"
                                            },
                                            "type": "statement",
                                            "qualifiers": {
                                                "P1810": [{
                                                    "snaktype": "value",
                                                    "property": "P1810",
                                                    "hash": "03c80cb894e30b3c675b60c14a8c96334cbb474c",
                                                    "datavalue": {"value": "Princes", "type": "string"},
                                                    "datatype": "string"
                                                }],
                                                "P585": [{
                                                    "snaktype": "value",
                                                    "property": "P585",
                                                    "hash": "ffb837135313cad3b2545c4b9ce5ee416deda3e2",
                                                    "datavalue": {
                                                        "value": {
                                                            "time": "+2021-05-07T00:00:00Z",
                                                            "timezone": 0,
                                                            "before": 0,
                                                            "after": 0,
                                                            "precision": 11,
                                                            "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                                        }, "type": "time"
                                                    },
                                                    "datatype": "time"
                                                }]
                                            },
                                            "qualifiers-order": ["P1810", "P585"],
                                            "id": "Q2747456$D6FEFF9B-75B5-4D37-B4CE-4DB70C6254C9",
                                            "rank": "normal"
                                        }],
                                        "P1889": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P1889",
                                                "hash": "6999c7ae15eaea290cccb76ffdd06bc0677d0238",
                                                "datavalue": {
                                                    "value": {
                                                        "entity-type": "item",
                                                        "numeric-id": 18244,
                                                        "id": "Q18244"
                                                    }, "type": "wikibase-entityid"
                                                },
                                                "datatype": "wikibase-item"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$F24DA145-D17F-4574-AA66-6985CB25F420",
                                            "rank": "normal"
                                        }],
                                        "P460": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P460",
                                                "hash": "6615255f4b0abf58e9bbf71279496fb1a0b511fa",
                                                "datavalue": {
                                                    "value": {
                                                        "entity-type": "item",
                                                        "numeric-id": 863048,
                                                        "id": "Q863048"
                                                    }, "type": "wikibase-entityid"
                                                },
                                                "datatype": "wikibase-item"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$838f53a3-4fd7-a6b9-48bd-ee70d9e91dc1",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P460",
                                                "hash": "5f65f50d44d2a5b28655dc0b966f518e2106d3e1",
                                                "datavalue": {
                                                    "value": {
                                                        "entity-type": "item",
                                                        "numeric-id": 147925,
                                                        "id": "Q147925"
                                                    }, "type": "wikibase-entityid"
                                                },
                                                "datatype": "wikibase-item"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$4c67b4d9-4a6f-dfe4-65c1-3aa104506737",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P460",
                                                "hash": "2a1ef20476a8fa0d78b0bdfcdb34c88a72e4424f",
                                                "datavalue": {
                                                    "value": {
                                                        "entity-type": "item",
                                                        "numeric-id": 11572959,
                                                        "id": "Q11572959"
                                                    }, "type": "wikibase-entityid"
                                                },
                                                "datatype": "wikibase-item"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$14b54a7e-4c22-fae3-81b2-1bd50ebca9e3",
                                            "rank": "normal"
                                        }],
                                        "P2924": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P2924",
                                                "hash": "5fd70a45453598d8cbd3f35682444dffb93ef183",
                                                "datavalue": {"value": "3167678", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$D2F12FF3-B07F-408D-BAD1-87F8666ADBA6",
                                            "rank": "normal"
                                        }],
                                        "P1417": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P1417",
                                                "hash": "b55bafafbccecce645f2a5f3ccfe4f1a93d5c797",
                                                "datavalue": {"value": "topic/prince-title", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$3825CF57-55DE-4718-90B4-79DED5864AC4",
                                            "rank": "normal"
                                        }],
                                        "P4212": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P4212",
                                                "hash": "18175f20026e3c7967427cbf8230be7b80ba428b",
                                                "datavalue": {"value": "pcrtSqFZmJvcTu", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$9791794A-44F1-4FC2-BA56-BA56D2B3578A",
                                            "rank": "normal"
                                        }],
                                        "P279": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P279",
                                                "hash": "05fb47e9bcde5c8dc864b788fbcab6eece27147b",
                                                "datavalue": {
                                                    "value": {
                                                        "entity-type": "item",
                                                        "numeric-id": 2478141,
                                                        "id": "Q2478141"
                                                    }, "type": "wikibase-entityid"
                                                },
                                                "datatype": "wikibase-item"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$d68be51e-4bef-c388-920f-c76313d767a4",
                                            "rank": "normal"
                                        }],
                                        "P6573": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P6573",
                                                "hash": "a3dd889f664f66353f3bdc1217a652bf779f0882",
                                                "datavalue": {"value": "Prinz", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$6DCF9C3D-9898-4C78-A58F-FDC8400CCCA1",
                                            "rank": "normal"
                                        }],
                                        "P3321": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P3321",
                                                "hash": "83853e4f2ae83443c17c417de86f13d7adf2c6de",
                                                "datavalue": {
                                                    "value": {
                                                        "text": "\u0623\u0645\u064a\u0631",
                                                        "language": "ar"
                                                    }, "type": "monolingualtext"
                                                },
                                                "datatype": "monolingualtext"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$e5768817-48a9-44bc-637e-2137393ea3ff",
                                            "rank": "normal"
                                        }],
                                        "P244": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P244",
                                                "hash": "3484a6a7868e031d3d479ecf0dd02abd5ad5df67",
                                                "datavalue": {"value": "sh85106721", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$2BEAAB19-60A8-4B69-85B2-80E522D88798",
                                            "rank": "normal",
                                            "references": [{
                                                "hash": "ac5d47e9fbcc281bc0d27a205ae02e22ad24ce31",
                                                "snaks": {
                                                    "P854": [{
                                                        "snaktype": "value",
                                                        "property": "P854",
                                                        "hash": "b560dc6b281a39d061e189d2eb299a426a06f1a2",
                                                        "datavalue": {
                                                            "value": "https://github.com/JohnMarkOckerbloom/ftl/blob/master/data/wikimap",
                                                            "type": "string"
                                                        },
                                                        "datatype": "url"
                                                    }],
                                                    "P813": [{
                                                        "snaktype": "value",
                                                        "property": "P813",
                                                        "hash": "0dcf4f64e93fdcc654e2c7534285881fe48b9f3d",
                                                        "datavalue": {
                                                            "value": {
                                                                "time": "+2019-04-03T00:00:00Z",
                                                                "timezone": 0,
                                                                "before": 0,
                                                                "after": 0,
                                                                "precision": 11,
                                                                "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                                            }, "type": "time"
                                                        },
                                                        "datatype": "time"
                                                    }]
                                                },
                                                "snaks-order": ["P854", "P813"]
                                            }]
                                        }],
                                        "P7033": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P7033",
                                                "hash": "bbeb07d3dd6a36a1b4ff44294353090777d3f68f",
                                                "datavalue": {"value": "scot/9663", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$7D6E3549-7ABD-43B0-BCF2-572F271FBE61",
                                            "rank": "normal"
                                        }],
                                        "P6404": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P6404",
                                                "hash": "b73a884b2dbc4d181d68748eb0a1369a60b6779a",
                                                "datavalue": {"value": "principe", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "qualifiers": {
                                                "P1810": [{
                                                    "snaktype": "value",
                                                    "property": "P1810",
                                                    "hash": "aa57b954447e129789c598d135f12a17358aecac",
                                                    "datavalue": {"value": "principe", "type": "string"},
                                                    "datatype": "string"
                                                }],
                                                "P577": [{
                                                    "snaktype": "value",
                                                    "property": "P577",
                                                    "hash": "d2a40d22655021267a9386d3086e000722b5a2d3",
                                                    "datavalue": {
                                                        "value": {
                                                            "time": "+2011-01-01T00:00:00Z",
                                                            "timezone": 0,
                                                            "before": 0,
                                                            "after": 0,
                                                            "precision": 9,
                                                            "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                                        }, "type": "time"
                                                    },
                                                    "datatype": "time"
                                                }]
                                            },
                                            "qualifiers-order": ["P1810", "P577"],
                                            "id": "Q2747456$B0237EEF-F865-48E1-B40C-6078B365CA08",
                                            "rank": "normal"
                                        }],
                                        "P1245": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P1245",
                                                "hash": "96bd0f2ac61d64e0c7f70fc77dbc936887d30178",
                                                "datavalue": {"value": "5814", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$CA27EF8B-8DE0-4B3D-98F2-2ED0857103E3",
                                            "rank": "normal"
                                        }],
                                        "P487": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P487",
                                                "hash": "14725f4cf317ce7d4b1a0e750232b59d06b5072c",
                                                "datavalue": {"value": "\ud83e\udd34", "type": "string"},
                                                "datatype": "string"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$1df4cace-4275-e6a6-0c5a-edd013874f47",
                                            "rank": "normal"
                                        }],
                                        "P8408": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P8408",
                                                "hash": "1959b085f955100ebf2128c228f5a48c527b3066",
                                                "datavalue": {"value": "Prince", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$DE4D8776-C78F-4ECC-A2AB-FF4C3C605B3D",
                                            "rank": "normal",
                                            "references": [{
                                                "hash": "9a681f9dd95c90224547c404e11295f4f7dcf54e",
                                                "snaks": {
                                                    "P248": [{
                                                        "snaktype": "value",
                                                        "property": "P248",
                                                        "hash": "9d5780dddffa8746637a9929a936ab6b0f601e24",
                                                        "datavalue": {
                                                            "value": {
                                                                "entity-type": "item",
                                                                "numeric-id": 64139102,
                                                                "id": "Q64139102"
                                                            }, "type": "wikibase-entityid"
                                                        },
                                                        "datatype": "wikibase-item"
                                                    }],
                                                    "P813": [{
                                                        "snaktype": "value",
                                                        "property": "P813",
                                                        "hash": "622a5a27fa5b25e7e7984974e9db494cf8460990",
                                                        "datavalue": {
                                                            "value": {
                                                                "time": "+2020-07-09T00:00:00Z",
                                                                "timezone": 0,
                                                                "before": 0,
                                                                "after": 0,
                                                                "precision": 11,
                                                                "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                                            }, "type": "time"
                                                        },
                                                        "datatype": "time"
                                                    }]
                                                },
                                                "snaks-order": ["P248", "P813"]
                                            }]
                                        }],
                                        "P646": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P646",
                                                "hash": "e2a702b2c25f7f56f203253d626302e897f59a8e",
                                                "datavalue": {"value": "/m/0dl76", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$C85A80F8-BBE5-4036-B390-FE2D440662CE",
                                            "rank": "normal"
                                        }],
                                        "P9486": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P9486",
                                                "hash": "8112e14818e95883f0df779234ffa2b5bd7544ef",
                                                "datavalue": {"value": "2114", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$03DF860D-8766-4A8E-BA39-CA20E7748101",
                                            "rank": "normal"
                                        }],
                                        "P268": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P268",
                                                "hash": "6c26a220e139d739b090f743a20ceec3b2b13d36",
                                                "datavalue": {"value": "11934545s", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "qualifiers": {
                                                "P1810": [{
                                                    "snaktype": "value",
                                                    "property": "P1810",
                                                    "hash": "03c80cb894e30b3c675b60c14a8c96334cbb474c",
                                                    "datavalue": {"value": "Princes", "type": "string"},
                                                    "datatype": "string"
                                                }]
                                            },
                                            "qualifiers-order": ["P1810"],
                                            "id": "Q2747456$58ba630c-6458-4a5a-8913-a294e6124d7b",
                                            "rank": "normal",
                                            "references": [{
                                                "hash": "7c27b83b9977dcc1e39904c165117c33f6d4d258",
                                                "snaks": {
                                                    "P248": [{
                                                        "snaktype": "value",
                                                        "property": "P248",
                                                        "hash": "3b090a7bae73c288393b2c8b9846cc7ed9a58f91",
                                                        "datavalue": {
                                                            "value": {
                                                                "entity-type": "item",
                                                                "numeric-id": 16583225,
                                                                "id": "Q16583225"
                                                            }, "type": "wikibase-entityid"
                                                        },
                                                        "datatype": "wikibase-item"
                                                    }],
                                                    "P854": [{
                                                        "snaktype": "value",
                                                        "property": "P854",
                                                        "hash": "42ed86952731f89f4c99b0a5091aa580a24bf41f",
                                                        "datavalue": {
                                                            "value": "https://thes.bncf.firenze.sbn.it/termine.php?id=8468",
                                                            "type": "string"
                                                        },
                                                        "datatype": "url"
                                                    }],
                                                    "P813": [{
                                                        "snaktype": "value",
                                                        "property": "P813",
                                                        "hash": "fa626481f5288f46170160e657d94c0b692e3140",
                                                        "datavalue": {
                                                            "value": {
                                                                "time": "+2021-06-13T00:00:00Z",
                                                                "timezone": 0,
                                                                "before": 0,
                                                                "after": 0,
                                                                "precision": 11,
                                                                "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                                            }, "type": "time"
                                                        },
                                                        "datatype": "time"
                                                    }]
                                                },
                                                "snaks-order": ["P248", "P854", "P813"]
                                            }]
                                        }],
                                        "P950": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P950",
                                                "hash": "cffc5e803a428e4e1c294de58122f1d3ed126bcd",
                                                "datavalue": {"value": "XX542448", "type": "string"},
                                                "datatype": "external-id"
                                            },
                                            "type": "statement",
                                            "qualifiers": {
                                                "P1810": [{
                                                    "snaktype": "value",
                                                    "property": "P1810",
                                                    "hash": "c1ce0e3e614f65130d263d0a08d806a912624221",
                                                    "datavalue": {"value": "Pr\u00edncipes", "type": "string"},
                                                    "datatype": "string"
                                                }]
                                            },
                                            "qualifiers-order": ["P1810"],
                                            "id": "Q2747456$c8094f9b-d4b1-4050-9be0-252f7a070d8b",
                                            "rank": "normal",
                                            "references": [{
                                                "hash": "7c27b83b9977dcc1e39904c165117c33f6d4d258",
                                                "snaks": {
                                                    "P248": [{
                                                        "snaktype": "value",
                                                        "property": "P248",
                                                        "hash": "3b090a7bae73c288393b2c8b9846cc7ed9a58f91",
                                                        "datavalue": {
                                                            "value": {
                                                                "entity-type": "item",
                                                                "numeric-id": 16583225,
                                                                "id": "Q16583225"
                                                            }, "type": "wikibase-entityid"
                                                        },
                                                        "datatype": "wikibase-item"
                                                    }],
                                                    "P854": [{
                                                        "snaktype": "value",
                                                        "property": "P854",
                                                        "hash": "42ed86952731f89f4c99b0a5091aa580a24bf41f",
                                                        "datavalue": {
                                                            "value": "https://thes.bncf.firenze.sbn.it/termine.php?id=8468",
                                                            "type": "string"
                                                        },
                                                        "datatype": "url"
                                                    }],
                                                    "P813": [{
                                                        "snaktype": "value",
                                                        "property": "P813",
                                                        "hash": "fa626481f5288f46170160e657d94c0b692e3140",
                                                        "datavalue": {
                                                            "value": {
                                                                "time": "+2021-06-13T00:00:00Z",
                                                                "timezone": 0,
                                                                "before": 0,
                                                                "after": 0,
                                                                "precision": 11,
                                                                "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                                            }, "type": "time"
                                                        },
                                                        "datatype": "time"
                                                    }]
                                                },
                                                "snaks-order": ["P248", "P854", "P813"]
                                            }]
                                        }],
                                        "P527": [{
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P527",
                                                "hash": "1f078eae805dfe58ac01a303b2a5474a99df8a48",
                                                "datavalue": {
                                                    "value": {
                                                        "entity-type": "item",
                                                        "numeric-id": 28495701,
                                                        "id": "Q28495701"
                                                    }, "type": "wikibase-entityid"
                                                },
                                                "datatype": "wikibase-item"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$6a3b7447-4721-18a4-578e-97af51eeb4a5",
                                            "rank": "normal"
                                        }, {
                                            "mainsnak": {
                                                "snaktype": "value",
                                                "property": "P527",
                                                "hash": "168b349e75ce98b28c0f65998a2fe2d2f1e0f7f5",
                                                "datavalue": {
                                                    "value": {
                                                        "entity-type": "item",
                                                        "numeric-id": 3403409,
                                                        "id": "Q3403409"
                                                    }, "type": "wikibase-entityid"
                                                },
                                                "datatype": "wikibase-item"
                                            },
                                            "type": "statement",
                                            "id": "Q2747456$d2253d2b-4584-2367-122e-557303f41540",
                                            "rank": "normal"
                                        }]
                                    },
                                    "sitelinks": {
                                        "amwiki": {
                                            "site": "amwiki",
                                            "title": "\u120d\u12d1\u120d",
                                            "badges": [],
                                            "url": "https://am.wikipedia.org/wiki/%E1%88%8D%E1%8B%91%E1%88%8D"
                                        },
                                        "arwiki": {
                                            "site": "arwiki",
                                            "title": "\u0623\u0645\u064a\u0631 (\u0644\u0642\u0628)",
                                            "badges": [],
                                            "url": "https://ar.wikipedia.org/wiki/%D8%A3%D9%85%D9%8A%D8%B1_(%D9%84%D9%82%D8%A8)"
                                        },
                                        "astwiki": {
                                            "site": "astwiki",
                                            "title": "Pr\u00edncipe",
                                            "badges": [],
                                            "url": "https://ast.wikipedia.org/wiki/Pr%C3%ADncipe"
                                        },
                                        "azwiki": {
                                            "site": "azwiki",
                                            "title": "Prens",
                                            "badges": [],
                                            "url": "https://az.wikipedia.org/wiki/Prens"
                                        },
                                        "be_x_oldwiki": {
                                            "site": "be_x_oldwiki",
                                            "title": "\u041f\u0440\u044b\u043d\u0446",
                                            "badges": [],
                                            "url": "https://be-tarask.wikipedia.org/wiki/%D0%9F%D1%80%D1%8B%D0%BD%D1%86"
                                        },
                                        "bewiki": {
                                            "site": "bewiki",
                                            "title": "\u041f\u0440\u044b\u043d\u0446",
                                            "badges": [],
                                            "url": "https://be.wikipedia.org/wiki/%D0%9F%D1%80%D1%8B%D0%BD%D1%86"
                                        },
                                        "bgwiki": {
                                            "site": "bgwiki",
                                            "title": "\u041f\u0440\u0438\u043d\u0446",
                                            "badges": [],
                                            "url": "https://bg.wikipedia.org/wiki/%D0%9F%D1%80%D0%B8%D0%BD%D1%86"
                                        },
                                        "bxrwiki": {
                                            "site": "bxrwiki",
                                            "title": "\u0425\u0430\u043d \u0445\u04af\u0431\u04af\u04af\u043d",
                                            "badges": [],
                                            "url": "https://bxr.wikipedia.org/wiki/%D0%A5%D0%B0%D0%BD_%D1%85%D2%AF%D0%B1%D2%AF%D2%AF%D0%BD"
                                        },
                                        "cawiki": {
                                            "site": "cawiki",
                                            "title": "Pr\u00edncep",
                                            "badges": [],
                                            "url": "https://ca.wikipedia.org/wiki/Pr%C3%ADncep"
                                        },
                                        "cswiki": {
                                            "site": "cswiki",
                                            "title": "Princ",
                                            "badges": [],
                                            "url": "https://cs.wikipedia.org/wiki/Princ"
                                        },
                                        "cywiki": {
                                            "site": "cywiki",
                                            "title": "Tywysog",
                                            "badges": [],
                                            "url": "https://cy.wikipedia.org/wiki/Tywysog"
                                        },
                                        "dawiki": {
                                            "site": "dawiki",
                                            "title": "Prins",
                                            "badges": [],
                                            "url": "https://da.wikipedia.org/wiki/Prins"
                                        },
                                        "dewiki": {
                                            "site": "dewiki",
                                            "title": "Prinz",
                                            "badges": [],
                                            "url": "https://de.wikipedia.org/wiki/Prinz"
                                        },
                                        "dewikiquote": {
                                            "site": "dewikiquote",
                                            "title": "Prinz",
                                            "badges": [],
                                            "url": "https://de.wikiquote.org/wiki/Prinz"
                                        },
                                        "diqwiki": {
                                            "site": "diqwiki",
                                            "title": "Prens",
                                            "badges": [],
                                            "url": "https://diq.wikipedia.org/wiki/Prens"
                                        },
                                        "elwiki": {
                                            "site": "elwiki",
                                            "title": "\u03a0\u03c1\u03af\u03b3\u03ba\u03b9\u03c0\u03b1\u03c2",
                                            "badges": [],
                                            "url": "https://el.wikipedia.org/wiki/%CE%A0%CF%81%CE%AF%CE%B3%CE%BA%CE%B9%CF%80%CE%B1%CF%82"
                                        },
                                        "enwiki": {
                                            "site": "enwiki",
                                            "title": "Prince",
                                            "badges": [],
                                            "url": "https://en.wikipedia.org/wiki/Prince"
                                        },
                                        "enwikiquote": {
                                            "site": "enwikiquote",
                                            "title": "Prince",
                                            "badges": [],
                                            "url": "https://en.wikiquote.org/wiki/Prince"
                                        },
                                        "eowiki": {
                                            "site": "eowiki",
                                            "title": "Princo",
                                            "badges": [],
                                            "url": "https://eo.wikipedia.org/wiki/Princo"
                                        },
                                        "eswiki": {
                                            "site": "eswiki",
                                            "title": "Pr\u00edncipe",
                                            "badges": [],
                                            "url": "https://es.wikipedia.org/wiki/Pr%C3%ADncipe"
                                        },
                                        "etwiki": {
                                            "site": "etwiki",
                                            "title": "Prints (j\u00e4reltulija)",
                                            "badges": [],
                                            "url": "https://et.wikipedia.org/wiki/Prints_(j%C3%A4reltulija)"
                                        },
                                        "etwikiquote": {
                                            "site": "etwikiquote",
                                            "title": "Prints",
                                            "badges": [],
                                            "url": "https://et.wikiquote.org/wiki/Prints"
                                        },
                                        "euwiki": {
                                            "site": "euwiki",
                                            "title": "Printze",
                                            "badges": [],
                                            "url": "https://eu.wikipedia.org/wiki/Printze"
                                        },
                                        "fawiki": {
                                            "site": "fawiki",
                                            "title": "\u0634\u0627\u0647\u0632\u0627\u062f\u0647",
                                            "badges": [],
                                            "url": "https://fa.wikipedia.org/wiki/%D8%B4%D8%A7%D9%87%D8%B2%D8%A7%D8%AF%D9%87"
                                        },
                                        "fiwiki": {
                                            "site": "fiwiki",
                                            "title": "Prinssi",
                                            "badges": [],
                                            "url": "https://fi.wikipedia.org/wiki/Prinssi"
                                        },
                                        "frwiki": {
                                            "site": "frwiki",
                                            "title": "Prince (dignit\u00e9)",
                                            "badges": [],
                                            "url": "https://fr.wikipedia.org/wiki/Prince_(dignit%C3%A9)"
                                        },
                                        "fywiki": {
                                            "site": "fywiki",
                                            "title": "Prins",
                                            "badges": [],
                                            "url": "https://fy.wikipedia.org/wiki/Prins"
                                        },
                                        "gawiki": {
                                            "site": "gawiki",
                                            "title": "Prionsa",
                                            "badges": [],
                                            "url": "https://ga.wikipedia.org/wiki/Prionsa"
                                        },
                                        "glwiki": {
                                            "site": "glwiki",
                                            "title": "Pr\u00edncipe",
                                            "badges": [],
                                            "url": "https://gl.wikipedia.org/wiki/Pr%C3%ADncipe"
                                        },
                                        "hewiki": {
                                            "site": "hewiki",
                                            "title": "\u05e0\u05e1\u05d9\u05da",
                                            "badges": [],
                                            "url": "https://he.wikipedia.org/wiki/%D7%A0%D7%A1%D7%99%D7%9A"
                                        },
                                        "hewikiquote": {
                                            "site": "hewikiquote",
                                            "title": "\u05e0\u05e1\u05d9\u05da",
                                            "badges": [],
                                            "url": "https://he.wikiquote.org/wiki/%D7%A0%D7%A1%D7%99%D7%9A"
                                        },
                                        "hrwiki": {
                                            "site": "hrwiki",
                                            "title": "Princ",
                                            "badges": [],
                                            "url": "https://hr.wikipedia.org/wiki/Princ"
                                        },
                                        "idwiki": {
                                            "site": "idwiki",
                                            "title": "Pangeran",
                                            "badges": [],
                                            "url": "https://id.wikipedia.org/wiki/Pangeran"
                                        },
                                        "iswiki": {
                                            "site": "iswiki",
                                            "title": "Prins",
                                            "badges": [],
                                            "url": "https://is.wikipedia.org/wiki/Prins"
                                        },
                                        "itwiki": {
                                            "site": "itwiki",
                                            "title": "Principe",
                                            "badges": [],
                                            "url": "https://it.wikipedia.org/wiki/Principe"
                                        },
                                        "itwikiquote": {
                                            "site": "itwikiquote",
                                            "title": "Principe",
                                            "badges": [],
                                            "url": "https://it.wikiquote.org/wiki/Principe"
                                        },
                                        "jawiki": {
                                            "site": "jawiki",
                                            "title": "\u30d7\u30ea\u30f3\u30b9",
                                            "badges": [],
                                            "url": "https://ja.wikipedia.org/wiki/%E3%83%97%E3%83%AA%E3%83%B3%E3%82%B9"
                                        },
                                        "jvwiki": {
                                            "site": "jvwiki",
                                            "title": "Pang\u00e9ran",
                                            "badges": [],
                                            "url": "https://jv.wikipedia.org/wiki/Pang%C3%A9ran"
                                        },
                                        "kawiki": {
                                            "site": "kawiki",
                                            "title": "\u10e3\u10e4\u10da\u10d8\u10e1\u10ec\u10e3\u10da\u10d8",
                                            "badges": [],
                                            "url": "https://ka.wikipedia.org/wiki/%E1%83%A3%E1%83%A4%E1%83%9A%E1%83%98%E1%83%A1%E1%83%AC%E1%83%A3%E1%83%9A%E1%83%98"
                                        },
                                        "kowiki": {
                                            "site": "kowiki",
                                            "title": "\ud504\ub9b0\uc2a4",
                                            "badges": [],
                                            "url": "https://ko.wikipedia.org/wiki/%ED%94%84%EB%A6%B0%EC%8A%A4"
                                        },
                                        "lawiki": {
                                            "site": "lawiki",
                                            "title": "Princeps",
                                            "badges": [],
                                            "url": "https://la.wikipedia.org/wiki/Princeps"
                                        },
                                        "lawikiquote": {
                                            "site": "lawikiquote",
                                            "title": "Princeps",
                                            "badges": [],
                                            "url": "https://la.wikiquote.org/wiki/Princeps"
                                        },
                                        "lvwiki": {
                                            "site": "lvwiki",
                                            "title": "Princis",
                                            "badges": [],
                                            "url": "https://lv.wikipedia.org/wiki/Princis"
                                        },
                                        "mswiki": {
                                            "site": "mswiki",
                                            "title": "Putera",
                                            "badges": [],
                                            "url": "https://ms.wikipedia.org/wiki/Putera"
                                        },
                                        "newiki": {
                                            "site": "newiki",
                                            "title": "\u0930\u093e\u091c\u0915\u0941\u092e\u093e\u0930",
                                            "badges": [],
                                            "url": "https://ne.wikipedia.org/wiki/%E0%A4%B0%E0%A4%BE%E0%A4%9C%E0%A4%95%E0%A5%81%E0%A4%AE%E0%A4%BE%E0%A4%B0"
                                        },
                                        "nlwiki": {
                                            "site": "nlwiki",
                                            "title": "Prins",
                                            "badges": [],
                                            "url": "https://nl.wikipedia.org/wiki/Prins"
                                        },
                                        "nnwiki": {
                                            "site": "nnwiki",
                                            "title": "Prins",
                                            "badges": [],
                                            "url": "https://nn.wikipedia.org/wiki/Prins"
                                        },
                                        "nowiki": {
                                            "site": "nowiki",
                                            "title": "Prins",
                                            "badges": [],
                                            "url": "https://no.wikipedia.org/wiki/Prins"
                                        },
                                        "plwiki": {
                                            "site": "plwiki",
                                            "title": "Ksi\u0105\u017c\u0119",
                                            "badges": [],
                                            "url": "https://pl.wikipedia.org/wiki/Ksi%C4%85%C5%BC%C4%99"
                                        },
                                        "plwikiquote": {
                                            "site": "plwikiquote",
                                            "title": "Ksi\u0105\u017c\u0119",
                                            "badges": [],
                                            "url": "https://pl.wikiquote.org/wiki/Ksi%C4%85%C5%BC%C4%99"
                                        },
                                        "ptwiki": {
                                            "site": "ptwiki",
                                            "title": "Pr\u00edncipe",
                                            "badges": [],
                                            "url": "https://pt.wikipedia.org/wiki/Pr%C3%ADncipe"
                                        },
                                        "ptwikiquote": {
                                            "site": "ptwikiquote",
                                            "title": "Pr\u00edncipe",
                                            "badges": [],
                                            "url": "https://pt.wikiquote.org/wiki/Pr%C3%ADncipe"
                                        },
                                        "rmywiki": {
                                            "site": "rmywiki",
                                            "title": "Rayon",
                                            "badges": [],
                                            "url": "https://rmy.wikipedia.org/wiki/Rayon"
                                        },
                                        "rowiki": {
                                            "site": "rowiki",
                                            "title": "Prin\u021b",
                                            "badges": [],
                                            "url": "https://ro.wikipedia.org/wiki/Prin%C8%9B"
                                        },
                                        "ruwiki": {
                                            "site": "ruwiki",
                                            "title": "\u041f\u0440\u0438\u043d\u0446",
                                            "badges": [],
                                            "url": "https://ru.wikipedia.org/wiki/%D0%9F%D1%80%D0%B8%D0%BD%D1%86"
                                        },
                                        "scnwiki": {
                                            "site": "scnwiki",
                                            "title": "Pr\u00ecncipi",
                                            "badges": [],
                                            "url": "https://scn.wikipedia.org/wiki/Pr%C3%ACncipi"
                                        },
                                        "scowiki": {
                                            "site": "scowiki",
                                            "title": "Prince",
                                            "badges": [],
                                            "url": "https://sco.wikipedia.org/wiki/Prince"
                                        },
                                        "shwiki": {
                                            "site": "shwiki",
                                            "title": "Princ",
                                            "badges": [],
                                            "url": "https://sh.wikipedia.org/wiki/Princ"
                                        },
                                        "simplewiki": {
                                            "site": "simplewiki",
                                            "title": "Prince",
                                            "badges": [],
                                            "url": "https://simple.wikipedia.org/wiki/Prince"
                                        },
                                        "skwiki": {
                                            "site": "skwiki",
                                            "title": "Princ",
                                            "badges": [],
                                            "url": "https://sk.wikipedia.org/wiki/Princ"
                                        },
                                        "slwiki": {
                                            "site": "slwiki",
                                            "title": "Princ",
                                            "badges": [],
                                            "url": "https://sl.wikipedia.org/wiki/Princ"
                                        },
                                        "srwiki": {
                                            "site": "srwiki",
                                            "title": "Princ",
                                            "badges": [],
                                            "url": "https://sr.wikipedia.org/wiki/Princ"
                                        },
                                        "suwiki": {
                                            "site": "suwiki",
                                            "title": "Pang\u00e9ran",
                                            "badges": [],
                                            "url": "https://su.wikipedia.org/wiki/Pang%C3%A9ran"
                                        },
                                        "svwiki": {
                                            "site": "svwiki",
                                            "title": "Prins",
                                            "badges": [],
                                            "url": "https://sv.wikipedia.org/wiki/Prins"
                                        },
                                        "thwiki": {
                                            "site": "thwiki",
                                            "title": "\u0e40\u0e08\u0e49\u0e32",
                                            "badges": [],
                                            "url": "https://th.wikipedia.org/wiki/%E0%B9%80%E0%B8%88%E0%B9%89%E0%B8%B2"
                                        },
                                        "trwiki": {
                                            "site": "trwiki",
                                            "title": "Prens",
                                            "badges": [],
                                            "url": "https://tr.wikipedia.org/wiki/Prens"
                                        },
                                        "ukwiki": {
                                            "site": "ukwiki",
                                            "title": "\u041f\u0440\u0438\u043d\u0446",
                                            "badges": [],
                                            "url": "https://uk.wikipedia.org/wiki/%D0%9F%D1%80%D0%B8%D0%BD%D1%86"
                                        },
                                        "urwiki": {
                                            "site": "urwiki",
                                            "title": "\u0634\u06c1\u0632\u0627\u062f\u06c1",
                                            "badges": [],
                                            "url": "https://ur.wikipedia.org/wiki/%D8%B4%DB%81%D8%B2%D8%A7%D8%AF%DB%81"
                                        },
                                        "vecwiki": {
                                            "site": "vecwiki",
                                            "title": "Principe",
                                            "badges": [],
                                            "url": "https://vec.wikipedia.org/wiki/Principe"
                                        },
                                        "viwiki": {
                                            "site": "viwiki",
                                            "title": "V\u01b0\u01a1ng t\u01b0\u1edbc",
                                            "badges": [],
                                            "url": "https://vi.wikipedia.org/wiki/V%C6%B0%C6%A1ng_t%C6%B0%E1%BB%9Bc"
                                        },
                                        "wuuwiki": {
                                            "site": "wuuwiki",
                                            "title": "\u738b\u7235",
                                            "badges": [],
                                            "url": "https://wuu.wikipedia.org/wiki/%E7%8E%8B%E7%88%B5"
                                        },
                                        "zh_min_nanwiki": {
                                            "site": "zh_min_nanwiki",
                                            "title": "Prince",
                                            "badges": [],
                                            "url": "https://zh-min-nan.wikipedia.org/wiki/Prince"
                                        },
                                        "zh_yuewiki": {
                                            "site": "zh_yuewiki",
                                            "title": "\u89aa\u738b",
                                            "badges": [],
                                            "url": "https://zh-yue.wikipedia.org/wiki/%E8%A6%AA%E7%8E%8B"
                                        },
                                        "zhwiki": {
                                            "site": "zhwiki",
                                            "title": "\u738b\u7235",
                                            "badges": [],
                                            "url": "https://zh.wikipedia.org/wiki/%E7%8E%8B%E7%88%B5"
                                        }
                                    }
                                }
                            }
                        }
                    )

                    const wikidata = await Wikidata.LoadWikidataEntryAsync("2747456")
                }]
            ]);
    }

}