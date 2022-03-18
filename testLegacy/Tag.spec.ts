import {equal} from "assert";
import T from "./TestHelper";
import Locale from "../UI/i18n/Locale";
import {OH, OpeningHour} from "../UI/OpeningHours/OpeningHours";
import {Tag} from "../Logic/Tags/Tag";
import {And} from "../Logic/Tags/And";
import {TagUtils} from "../Logic/Tags/TagUtils";
import TagRenderingConfig from "../Models/ThemeConfig/TagRenderingConfig";
import {RegexTag} from "../Logic/Tags/RegexTag";

export default class TagSpec extends T {

    constructor() {
        super([
            ["Parse tag rendering", (() => {
                Locale.language.setData("nl");
                const tr = new TagRenderingConfig({
                    render: ({"en": "Name is {name}", "nl": "Ook een {name}"} as any),
                    question: "Wat is de naam van dit object?",
                    freeform: {
                        key: "name",
                    },

                    mappings: [
                        {
                            if: "noname=yes",
                            "then": "Has no name"
                        }
                    ],
                    condition: "x="
                }, "Tests");

                equal(undefined, tr.GetRenderValue({"foo": "bar"}));
                equal("Has no name", tr.GetRenderValue({"noname": "yes"})?.txt);
                equal("Ook een {name}", tr.GetRenderValue({"name": "xyz"})?.txt);
                equal(undefined, tr.GetRenderValue({"foo": "bar"}));

            })],
            [
                "Merge touching opening hours",
                () => {
                    const oh1: OpeningHour = {
                        weekday: 0,
                        startHour: 10,
                        startMinutes: 0,
                        endHour: 11,
                        endMinutes: 0
                    };
                    const oh0: OpeningHour = {
                        weekday: 0,
                        startHour: 11,
                        startMinutes: 0,
                        endHour: 12,
                        endMinutes: 0
                    };

                    const merged = OH.MergeTimes([oh0, oh1]);
                    const r = merged[0];
                    equal(merged.length, 1);
                    equal(r.startHour, 10);
                    equal(r.endHour, 12)

                }
            ],
            [
                "Merge overlapping opening hours",
                () => {
                    const oh1: OpeningHour = {
                        weekday: 0,
                        startHour: 10,
                        startMinutes: 0,
                        endHour: 11,
                        endMinutes: 0
                    };
                    const oh0: OpeningHour = {
                        weekday: 0,
                        startHour: 10,
                        startMinutes: 30,
                        endHour: 12,
                        endMinutes: 0
                    };

                    const merged = OH.MergeTimes([oh0, oh1]);
                    const r = merged[0];
                    equal(merged.length, 1);
                    equal(r.startHour, 10);
                    equal(r.endHour, 12)

                }],
           
            ["JOIN OH 1", () => {
                const rules = OH.ToString([
                    {
                        weekday: 0,
                        endHour: 12,
                        endMinutes: 0,
                        startHour: 10,
                        startMinutes: 0
                    },
                    {
                        weekday: 0,
                        endHour: 17,
                        endMinutes: 0,
                        startHour: 13,
                        startMinutes: 0
                    },


                    {
                        weekday: 1,
                        endHour: 17,
                        endMinutes: 0,
                        startHour: 13,
                        startMinutes: 0
                    }, {
                        weekday: 1,
                        endHour: 12,
                        endMinutes: 0,
                        startHour: 10,
                        startMinutes: 0
                    },

                ]);
                equal(rules, "Mo-Tu 10:00-12:00, 13:00-17:00");
            }],
            ["JOIN OH 2", () => {
                const rules = OH.ToString([

                    {
                        weekday: 1,
                        endHour: 17,
                        endMinutes: 0,
                        startHour: 13,
                        startMinutes: 0
                    }, {
                        weekday: 1,
                        endHour: 12,
                        endMinutes: 0,
                        startHour: 10,
                        startMinutes: 0
                    },

                ]);
                equal(rules, "Tu 10:00-12:00, 13:00-17:00");
            }],
            ["JOIN OH 3", () => {
                const rules = OH.ToString([

                    {
                        weekday: 3,
                        endHour: 17,
                        endMinutes: 0,
                        startHour: 13,
                        startMinutes: 0
                    }, {
                        weekday: 1,
                        endHour: 12,
                        endMinutes: 0,
                        startHour: 10,
                        startMinutes: 0
                    },

                ]);
                equal(rules, "Tu 10:00-12:00; Th 13:00-17:00");
            }],
            ["JOIN OH 3", () => {
                const rules = OH.ToString([

                    {
                        weekday: 6,
                        endHour: 17,
                        endMinutes: 0,
                        startHour: 13,
                        startMinutes: 0
                    }, {
                        weekday: 1,
                        endHour: 12,
                        endMinutes: 0,
                        startHour: 10,
                        startMinutes: 0
                    },

                ]);
                equal(rules, "Tu 10:00-12:00; Su 13:00-17:00");
            }],
            ["JOIN OH with end hours", () => {
                const rules = OH.ToString(
                    OH.MergeTimes([

                        {
                            weekday: 1,
                            endHour: 23,
                            endMinutes: 30,
                            startHour: 23,
                            startMinutes: 0
                        }, {
                            weekday: 1,
                            endHour: 24,
                            endMinutes: 0,
                            startHour: 23,
                            startMinutes: 30
                        },

                    ]));
                equal(rules, "Tu 23:00-00:00");
            }],
            ["JOIN OH with overflowed hours", () => {
                const rules = OH.ToString(
                    OH.MergeTimes([

                        {
                            weekday: 1,
                            endHour: 23,
                            endMinutes: 30,
                            startHour: 23,
                            startMinutes: 0
                        }, {
                            weekday: 1,
                            endHour: 0,
                            endMinutes: 0,
                            startHour: 23,
                            startMinutes: 30
                        },

                    ]));
                equal(rules, "Tu 23:00-00:00");
            }],
            ["Regression", () => {

                const config = {
                    "#": "Bottle refill",
                    "question": {
                        "en": "How easy is it to fill water bottles?",
                        "nl": "Hoe gemakkelijk is het om drinkbussen bij te vullen?",
                        "de": "Wie einfach ist es, Wasserflaschen zu füllen?"
                    },
                    "mappings": [
                        {
                            "if": "bottle=yes",
                            "then": {
                                "en": "It is easy to refill water bottles",
                                "nl": "Een drinkbus bijvullen gaat makkelijk",
                                "de": "Es ist einfach, Wasserflaschen nachzufüllen"
                            }
                        },
                        {
                            "if": "bottle=no",
                            "then": {
                                "en": "Water bottles may not fit",
                                "nl": "Een drinkbus past moeilijk",
                                "de": "Wasserflaschen passen möglicherweise nicht"
                            }
                        }
                    ]
                };

                const tagRendering = new TagRenderingConfig(config, "test");
                equal(true, tagRendering.IsKnown({bottle: "yes"}))
                equal(false, tagRendering.IsKnown({}))
            }],
            [
                "Tag matches a lazy property",
                () => {
                    const properties = {}
                    const key = "_key"
                    Object.defineProperty(properties, key, {
                        configurable: true,
                        get: function () {
                            delete properties[key]
                            properties[key] = "yes"
                            return "yes"
                        }
                    })
                    const filter = new Tag("_key", "yes")
                    T.isTrue(filter.matchesProperties(properties), "Lazy value not matched")
                }
            ],
            [
                "RegextTag matches a lazy property",
                () => {
                    const properties = {}
                    const key = "_key"
                    Object.defineProperty(properties, key, {
                        configurable: true,
                        get: function () {
                            delete properties[key]
                            properties[key] = "yes"
                            return "yes"
                        }
                    })
                    const filter = TagUtils.Tag("_key~*")
                    T.isTrue(filter.matchesProperties(properties), "Lazy value not matched")
                }
            ]]);
    }

}
