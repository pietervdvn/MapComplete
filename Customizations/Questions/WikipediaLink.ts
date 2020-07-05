import {TagRenderingOptions} from "../TagRendering";


export class WikipediaLink extends TagRenderingOptions {

    private static FixLink(value: string): string {
        // @ts-ignore
        if (value.startsWith("https")) {
            return value;
        } else {

            const splitted = value.split(":");
            const language = splitted[0];
            splitted.shift();
            const page = splitted.join(":");
            return 'https://' + language + '.wikipedia.org/wiki/' + page;
        }
    }

    static options = {
        priority: 10,
        // question: "Wat is het overeenstemmende wkipedia-artikel?",
        freeform: {
            key: "wikipedia",
            template: "$$$",
            renderTemplate:
                "<span class='wikipedialink'>" +
                "<a href='{wikipedia}' target='_blank'>" +
                "<img width='64px' src='./assets/wikipedia.svg' alt='wikipedia'>" +
                "</a></span>",
            placeholder: "",
            tagsPreprocessor: (tags) => {

                const newTags = {};
                for (const k in tags) {
                    if (k === "wikipedia") {
                        newTags["wikipedia"] = WikipediaLink.FixLink(tags[k]);
                    } else {
                        newTags[k] = tags[k];
                    }
                }
                return newTags;
            }
        },

    }

    constructor() {
        super(WikipediaLink.options);
    }


}