import TagRenderingConfig from "../../../src/Models/ThemeConfig/TagRenderingConfig"
import Locale from "../../../src/UI/i18n/Locale"
import { describe, expect, it } from "vitest"

describe("TagRenderingConfig", () => {
    describe("isKnown", () => {
        it("should give correct render values", () => {
            Locale.language.setData("nl")
            const tr = new TagRenderingConfig(
                {
                    render: { en: "Name is {name}", nl: "Ook een {name}" } as any,
                    question: "Wat is de naam van dit object?",
                    freeform: {
                        key: "name",
                    },

                    mappings: [
                        {
                            if: "noname=yes",
                            then: "Has no name",
                        },
                    ],
                    condition: "x=",
                },
                "Tests"
            )

            expect(tr.GetRenderValue({ foo: "bar" })).toBeUndefined()

            expect(tr.GetRenderValue({ noname: "yes" })?.textFor("nl")).toBe("Has no name")
            expect(tr.GetRenderValue({ name: "xyz" })?.textFor("nl")).toBe("Ook een {name}")
            expect(tr.GetRenderValue({ foo: "bar" })).toBeUndefined()
        })

        it("should give a correct indication", () => {
            // tests a regression in parsing
            const config = {
                "#": "Bottle refill",
                question: {
                    en: "How easy is it to fill water bottles?",
                    nl: "Hoe gemakkelijk is het om drinkbussen bij te vullen?",
                    de: "Wie einfach ist es, Wasserflaschen zu füllen?",
                },
                mappings: [
                    {
                        if: "bottle=yes",
                        then: {
                            en: "It is easy to refill water bottles",
                            nl: "Een drinkbus bijvullen gaat makkelijk",
                            de: "Es ist einfach, Wasserflaschen nachzufüllen",
                        },
                    },
                    {
                        if: "bottle=no",
                        then: {
                            en: "Water bottles may not fit",
                            nl: "Een drinkbus past moeilijk",
                            de: "Wasserflaschen passen möglicherweise nicht",
                        },
                    },
                ],
            }

            const tagRendering = new TagRenderingConfig(config, "test")
            expect(tagRendering.IsKnown({ bottle: "yes" })).toBe(true)
            expect(tagRendering.IsKnown({})).toBe(false)
        })
    })
})
