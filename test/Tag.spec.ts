import {UIElement} from "../UI/UIElement";

UIElement.runningFromConsole = true;

import {equal} from "assert";
import Translation from "../UI/i18n/Translation";
import T from "./TestHelper";
import {FromJSON} from "../Customizations/JSON/FromJSON";
import {And, Tag} from "../Logic/Tags";
import Locale from "../UI/i18n/Locale";
import Translations from "../UI/i18n/Translations";


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
        });

        equal(true, tr.IsKnown({"noname": "yes"}));
        equal(true, tr.IsKnown({"name": "ABC"}));
        equal(false, tr.IsKnown({"foo": "bar"}));
        equal("Has no name", tr.GetContent({"noname": "yes"}));
        equal("Ook een xyz", tr.GetContent({"name": "xyz"}));
        equal("Ook een {name}", tr.GetContent({"foo": "bar"}));

    })]
]);
