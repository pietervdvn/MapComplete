import {UIElement} from "../UI/UIElement";
import {equal} from "assert";
import Translation from "../UI/i18n/Translation";
import T from "./TestHelper";
import {FromJSON} from "../Customizations/JSON/FromJSON";
import {And, Tag} from "../Logic/Tags";
import Locale from "../UI/i18n/Locale";
import Translations from "../UI/i18n/Translations";
import {UIEventSource} from "../Logic/UIEventSource";
import {OH, OpeningHour} from "../Logic/OpeningHours";
import PublicHolidayInput from "../UI/Input/OpeningHours/PublicHolidayInput";
import {TagRendering} from "../UI/Popup/TagRendering";

UIElement.runningFromConsole = true;


new T([
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

        const and = FromJSON.Tag({"and": ["key=value", "x=y"]}) as And;
        equal((and.and[0] as Tag).key, "key");
        equal((and.and[1] as Tag).value, "y");

    })],
    ["Parse translation map", (() => {

        const json: any = {"en": "English", "nl": "Nederlands"};
        const translation = Translations.WT(FromJSON.Translation(json));
        Locale.language.setData("en");
        equal(translation.txt, "English");
        Locale.language.setData("nl");
        equal(translation.txt, "Nederlands");
    })],
    ["Parse tag rendering", (() => {
        Locale.language.setData("nl");
        const tr = FromJSON.TagRendering({
            render: ({"en":"Name is {name}", "nl":"Ook een {name}"} as any),
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
        }, "");

        equal(true, tr.IsKnown({"noname": "yes"}));
        equal(true, tr.IsKnown({"name": "ABC"}));
        equal(false, tr.IsKnown({"foo": "bar"}));
        equal("Has no name", tr.GetContent({"noname": "yes"})?.txt);
        equal("Ook een xyz", tr.GetContent({"name": "xyz"})?.txt);
        equal(undefined, tr.GetContent({"foo": "bar"}));

    })],
    
    [
        "Empty match test",
        () => {
            const t = new Tag("key","");
            equal(false, t.matches([{k: "key", v:"somevalue"}]))
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

            const constr = FromJSON.TagRendering(def, "test");
            TagRendering.injectFunction();
            const uiEl = constr.construct(new UIEventSource<any>(
                {leisure: "park", "access": "no"})
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
            equal( merged.length, 1);
            equal(r.startHour,10 );
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
            equal( merged.length, 1);
            equal(r.startHour,10 );
            equal(r.endHour, 12)

        }
    ],
    ["Parse OH 1",() => {
        const rules = OH.ParseRule("11:00-19:00");
        equal(rules.length, 7);
        equal(rules[0].weekday, 0);
        equal(rules[0].startHour, 11);
        equal(rules[3].endHour, 19);

    }],
    ["Parse OH 2",() => {
        const rules = OH.ParseRule("Mo-Th 11:00-19:00");
        equal(rules.length, 4);
        equal(rules[0].weekday, 0);
        equal(rules[0].startHour, 11);
        equal(rules[3].endHour, 19);
    }],
    ["JOIN OH 1",() => {
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
            },{
                weekday: 1,
                endHour: 12,
                endMinutes: 0,
                startHour: 10,
                startMinutes: 0
            },

        ]);
        equal(rules, "Mo-Tu 10:00-12:00, 13:00-17:00");
    }],
    ["JOIN OH 2",() => {
        const rules = OH.ToString([

            {
                weekday: 1,
                endHour: 17,
                endMinutes: 0,
                startHour: 13,
                startMinutes: 0
            },{
                weekday: 1,
                endHour: 12,
                endMinutes: 0,
                startHour: 10,
                startMinutes: 0
            },

        ]);
        equal(rules, "Tu 10:00-12:00, 13:00-17:00");
    }],
    ["JOIN OH 3",() => {
        const rules = OH.ToString([

            {
                weekday: 3,
                endHour: 17,
                endMinutes: 0,
                startHour: 13,
                startMinutes: 0
            },{
                weekday: 1,
                endHour: 12,
                endMinutes: 0,
                startHour: 10,
                startMinutes: 0
            },

        ]);
        equal(rules, "Tu 10:00-12:00; Th 13:00-17:00");
    }],
    ["JOIN OH 3",() => {
        const rules = OH.ToString([

            {
                weekday: 6,
                endHour: 17,
                endMinutes: 0,
                startHour: 13,
                startMinutes: 0
            },{
                weekday: 1,
                endHour: 12,
                endMinutes: 0,
                startHour: 10,
                startMinutes: 0
            },

        ]);
        equal(rules, "Tu 10:00-12:00; Su 13:00-17:00");
    }],
    ["OH 24/7",() => {
        const rules = OH.Parse("24/7");
        equal(rules.length, 7);
        equal(rules[0].startHour, 0);
        const asStr = OH.ToString(rules);
        equal(asStr, "24/7");
    }],
    ["OH Th[-1] off",() => {
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
    }]
]);
