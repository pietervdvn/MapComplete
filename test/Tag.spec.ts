import {Utils} from "../Utils";
Utils.runningFromConsole = true;
import {equal} from "assert";
import T from "./TestHelper";
import {FromJSON} from "../Customizations/JSON/FromJSON";
import {And, Tag} from "../Logic/Tags";
import Locale from "../UI/i18n/Locale";
import Translations from "../UI/i18n/Translations";
import {UIEventSource} from "../Logic/UIEventSource";
import TagRenderingConfig from "../Customizations/JSON/TagRenderingConfig";
import EditableTagRendering from "../UI/Popup/EditableTagRendering";
import {SubstitutedTranslation} from "../UI/SpecialVisualizations";
import {Translation} from "../UI/i18n/Translation";
import {OH, OpeningHour} from "../UI/OpeningHours/OpeningHours";
import PublicHolidayInput from "../UI/OpeningHours/PublicHolidayInput";


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


        const notReg = FromJSON.Tag("x!~y") as And;
        equal(notReg.matches([{k:"x",v:"y"}]), false)
        equal(notReg.matches([{k:"x",v:"z"}]), true)
        equal(notReg.matches([{k:"x",v:""}]), true)

        equal(notReg.matches([]), true)
        
        
        const noMatch = FromJSON.Tag("key!=value") as Tag;
        equal(noMatch.matches([{k:"key",v:"value"}]), false)
        equal(noMatch.matches([{k:"key",v:"otherValue"}]), true)
        equal(noMatch.matches([{k:"key",v:""}]), true)
        equal(noMatch.matches([{k:"otherKey",v:""}]), true)


    })],
    ["Is equivalent test", (() => {

        const t0 = new And([
            new Tag("valves:special","A"),
            new Tag("valves","A")
        ])
        const t1 = new And([
            new Tag("valves","A")
        ])
        const t2 = new And([
            new Tag("valves","B")
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
        }, undefined,"");

        equal(undefined, tr.GetRenderValue({"foo": "bar"}));
        equal("Has no name", tr.GetRenderValue({"noname": "yes"})?.txt);
        equal("Ook een {name}", tr.GetRenderValue({"name": "xyz"})?.txt);
        equal("Ook een xyz", new SubstitutedTranslation( tr.GetRenderValue({"name": "xyz"}),
            new UIEventSource<any>({"name":"xyz"})).InnerRender());
        equal(undefined, tr.GetRenderValue({"foo": "bar"}));

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

            const constr = new TagRenderingConfig(def,  undefined,"test");
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
    }],
    ["Round", () => {
        equal(Utils.Round(15),  "15.0")
        equal(Utils.Round(1),  "1.0")
        equal(Utils.Round(1.5),  "1.5")
        equal(Utils.Round(0.5),  "0.5")
        equal(Utils.Round(1.6),  "1.6")

        equal(Utils.Round(-15),  "-15.0")
        equal(Utils.Round(-1),  "-1.0")
        equal(Utils.Round(-1.5),  "-1.5")
        equal(Utils.Round(-0.5),  "-0.5")
        equal(Utils.Round(-1.6),  "-1.6")

    }]
]);
