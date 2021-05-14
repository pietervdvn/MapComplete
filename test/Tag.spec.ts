import {Utils} from "../Utils";
import {equal} from "assert";
import T from "./TestHelper";
import {FromJSON} from "../Customizations/JSON/FromJSON";
import Locale from "../UI/i18n/Locale";
import Translations from "../UI/i18n/Translations";
import {UIEventSource} from "../Logic/UIEventSource";
import TagRenderingConfig from "../Customizations/JSON/TagRenderingConfig";
import EditableTagRendering from "../UI/Popup/EditableTagRendering";
import {Translation} from "../UI/i18n/Translation";
import {OH, OpeningHour} from "../UI/OpeningHours/OpeningHours";
import PublicHolidayInput from "../UI/OpeningHours/PublicHolidayInput";
import {SubstitutedTranslation} from "../UI/SubstitutedTranslation";
import {Tag} from "../Logic/Tags/Tag";
import {And} from "../Logic/Tags/And";

Utils.runningFromConsole = true;

export default class    TagSpec extends  T{
    
    constructor() {
        super("Tags", [
            ["Tag replacement works in translation", () => {
                const tr = new Translation({
                    "en": "Test {key} abc"
                }).replace("{key}", "value");
                equal(tr.txt, "Test value abc");

            }],
            ["Parse tag config", (() => {
                const tag = FromJSON.Tag("key=value") as Tag;
                equal(tag.key, "key");
                equal(tag.value, "value");
                equal(tag.matchesProperties({"key": "value"}), true)
                equal(tag.matchesProperties({"key": "z"}), false)
                equal(tag.matchesProperties({"key": ""}), false)
                equal(tag.matchesProperties({"other_key": ""}), false)
                equal(tag.matchesProperties({"other_key": "value"}), false)

                const isEmpty = FromJSON.Tag("key=") as Tag;
                equal(isEmpty.matchesProperties({"key": "value"}), false)
                equal(isEmpty.matchesProperties({"key": ""}), true)
                equal(isEmpty.matchesProperties({"other_key": ""}), true)
                equal(isEmpty.matchesProperties({"other_key": "value"}), true)

                const isNotEmpty = FromJSON.Tag("key!=");
                equal(isNotEmpty.matchesProperties({"key": "value"}), true)
                equal(isNotEmpty.matchesProperties({"key": "other_value"}), true)
                equal(isNotEmpty.matchesProperties({"key": ""}), false)
                equal(isNotEmpty.matchesProperties({"other_key": ""}), false)
                equal(isNotEmpty.matchesProperties({"other_key": "value"}), false)


                const and = FromJSON.Tag({"and": ["key=value", "x=y"]}) as And;
                equal((and.and[0] as Tag).key, "key");
                equal((and.and[1] as Tag).value, "y");


                const notReg = FromJSON.Tag("x!~y") as And;
                equal(notReg.matchesProperties({"x": "y"}), false)
                equal(notReg.matchesProperties({"x": "z"}), true)
                equal(notReg.matchesProperties({"x": ""}), true)
                equal(notReg.matchesProperties({}), true)

                const noMatch = FromJSON.Tag("key!=value") as Tag;
                equal(noMatch.matchesProperties({"key": "value"}), false)
                equal(noMatch.matchesProperties({"key": "otherValue"}), true)
                equal(noMatch.matchesProperties({"key": ""}), true)
                equal(noMatch.matchesProperties({"otherKey": ""}), true)


                const multiMatch = FromJSON.Tag("vending~.*bicycle_tube.*") as Tag;
                equal(multiMatch.matchesProperties({"vending": "bicycle_tube"}), true)
                equal(multiMatch.matchesProperties({"vending": "something;bicycle_tube"}), true)
                equal(multiMatch.matchesProperties({"vending": "bicycle_tube;something"}), true)
                equal(multiMatch.matchesProperties({"vending": "xyz;bicycle_tube;something"}), true)

                const nameStartsWith = FromJSON.Tag("name~[sS]peelbos.*")
                equal(nameStartsWith.matchesProperties({"name": "Speelbos Sint-Anna"}), true)
                equal(nameStartsWith.matchesProperties({"name": "speelbos Sint-Anna"}), true)
                equal(nameStartsWith.matchesProperties({"name": "Sint-Anna"}), false)
                equal(nameStartsWith.matchesProperties({"name": ""}), false)


                const assign = FromJSON.Tag("survey:date:={_date:now}")
                equal(assign.matchesProperties({"survey:date": "2021-03-29", "_date:now": "2021-03-29"}), true);
                equal(assign.matchesProperties({"survey:date": "2021-03-29", "_date:now": "2021-01-01"}), false);
                equal(assign.matchesProperties({"survey:date": "2021-03-29"}), false);
                equal(assign.matchesProperties({"_date:now": "2021-03-29"}), false);
                equal(assign.matchesProperties({"some_key": "2021-03-29"}), false);

            })],
            ["Is equivalent test", (() => {

                const t0 = new And([
                    new Tag("valves:special", "A"),
                    new Tag("valves", "A")
                ])
                const t1 = new And([
                    new Tag("valves", "A")
                ])
                const t2 = new And([
                    new Tag("valves", "B")
                ])
                equal(true, t0.isEquivalent(t0))
                equal(true, t1.isEquivalent(t1))
                equal(true, t2.isEquivalent(t2))

                equal(false, t0.isEquivalent(t1))
                equal(false, t0.isEquivalent(t2))
                equal(false, t1.isEquivalent(t0))

                equal(false, t1.isEquivalent(t2))
                equal(false, t2.isEquivalent(t0))
                equal(false, t2.isEquivalent(t1))
            })],
            ["Parse translation map", (() => {

                const json: any = {"en": "English", "nl": "Nederlands"};
                const translation = Translations.WT(new Translation(json));
                Locale.language.setData("en");
                equal(translation.txt, "English");
                Locale.language.setData("nl");
                equal(translation.txt, "Nederlands");
            })],
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
                }, undefined, "");

                equal(undefined, tr.GetRenderValue({"foo": "bar"}));
                equal("Has no name", tr.GetRenderValue({"noname": "yes"})?.txt);
                equal("Ook een {name}", tr.GetRenderValue({"name": "xyz"})?.txt);
                equal("Ook een xyz", SubstitutedTranslation.construct(tr.GetRenderValue({"name": "xyz"}),
                    new UIEventSource<any>({"name": "xyz"})).InnerRender());
                equal(undefined, tr.GetRenderValue({"foo": "bar"}));

            })],

            [
                "Empty match test",
                () => {
                    const t = new Tag("key", "");
                    equal(false, t.matchesProperties({"key": "somevalue"}))
                }
            ],
            [
                "Tagrendering test",
                () => {

                    const def = {
                        "render": {
                            "nl": "De toegankelijkheid van dit gebied is: {access:description}"
                        },
                        "question": {
                            "nl": "Is dit gebied toegankelijk?"
                        },
                        "freeform": {
                            "key": "access:description"
                        },
                        "mappings": [
                            {
                                "if": {
                                    "and": [
                                        "access:description=",
                                        "access=",
                                        "leisure=park"
                                    ]
                                },
                                "then": {
                                    "nl": "Dit gebied is vrij toegankelijk"
                                },
                                "hideInAnswer": true
                            },
                            {
                                "if": "access=no",
                                "then": "Niet toegankelijk"
                            }
                        ]
                    };

                    const constr = new TagRenderingConfig(def, undefined, "test");
                    const uiEl = new EditableTagRendering(new UIEventSource<any>(
                        {leisure: "park", "access": "no"}), constr
                    );
                    const rendered = uiEl.InnerRender();
                    equal(true, rendered.indexOf("Niet toegankelijk") > 0)

                }
            ], [
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
            ], [
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
            ["Parse OH 1", () => {
                const rules = OH.ParseRule("11:00-19:00");
                equal(rules.length, 7);
                equal(rules[0].weekday, 0);
                equal(rules[0].startHour, 11);
                equal(rules[3].endHour, 19);

            }],
            ["Parse OH 2", () => {
                const rules = OH.ParseRule("Mo-Th 11:00-19:00");
                equal(rules.length, 4);
                equal(rules[0].weekday, 0);
                equal(rules[0].startHour, 11);
                equal(rules[3].endHour, 19);
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
            ["OH 24/7", () => {
                const rules = OH.Parse("24/7");
                equal(rules.length, 7);
                equal(rules[0].startHour, 0);
                const asStr = OH.ToString(rules);
                equal(asStr, "24/7");
            }],
            ["OH Th[-1] off", () => {
                const rules = OH.ParseRule("Th[-1] off");
                equal(rules, null);
            }],
            ["OHNo parsePH 12:00-17:00", () => {
                const rules = OH.ParseRule("PH 12:00-17:00");
                equal(rules, null);
            }],
            ["OH Parse PH 12:00-17:00", () => {
                const rules = PublicHolidayInput.LoadValue("PH 12:00-17:00");
                equal(rules.mode, " ");
            }],
            ["Round", () => {
                equal(Utils.Round(15), "15.0")
                equal(Utils.Round(1), "1.0")
                equal(Utils.Round(1.5), "1.5")
                equal(Utils.Round(0.5), "0.5")
                equal(Utils.Round(1.6), "1.6")

                equal(Utils.Round(-15), "-15.0")
                equal(Utils.Round(-1), "-1.0")
                equal(Utils.Round(-1.5), "-1.5")
                equal(Utils.Round(-0.5), "-0.5")
                equal(Utils.Round(-1.6), "-1.6")

            }
            ],
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

                const tagRendering = new TagRenderingConfig(config, null,  "test");
                equal(true, tagRendering.IsKnown({bottle: "yes"}))
                equal(false, tagRendering.IsKnown({}))
            }]]);
    }
    
}
