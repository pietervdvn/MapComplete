import {TagRenderingOptions} from "../TagRendering";


export class WikipediaLink extends TagRenderingOptions {

    private static FixLink(value: string): string {
        if (value === undefined) {
            return undefined;
        }
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
        tagsPreprocessor: (tags) => {
            if (tags.wikipedia !== undefined) {
                tags.wikipedia = WikipediaLink.FixLink(tags.wikipedia);
            }
        },
        freeform: {
            key: "wikipedia",
            template: "$$$",
            renderTemplate:
                "<span class='wikipedialink'>" +
                "<a href='{wikipedia}' target='_blank'>" +
                "<img width='64px' src='./assets/wikipedia.svg' alt='wikipedia'>" +
                "</a></span>",
            placeholder: ""

        },

    }

    constructor() {
        super(WikipediaLink.options);
    }


}