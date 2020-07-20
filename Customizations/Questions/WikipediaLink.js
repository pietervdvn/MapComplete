"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WikipediaLink = void 0;
var TagRendering_1 = require("../TagRendering");
var WikipediaLink = /** @class */ (function (_super) {
    __extends(WikipediaLink, _super);
    function WikipediaLink() {
        return _super.call(this, WikipediaLink.options) || this;
    }
    WikipediaLink.FixLink = function (value) {
        if (value === undefined) {
            return undefined;
        }
        // @ts-ignore
        if (value.startsWith("https")) {
            return value;
        }
        else {
            var splitted = value.split(":");
            var language = splitted[0];
            splitted.shift();
            var page = splitted.join(":");
            return 'https://' + language + '.wikipedia.org/wiki/' + page;
        }
    };
    WikipediaLink.options = {
        priority: 10,
        // question: "Wat is het overeenstemmende wkipedia-artikel?",
        tagsPreprocessor: function (tags) {
            if (tags.wikipedia !== undefined) {
                tags.wikipedia = WikipediaLink.FixLink(tags.wikipedia);
            }
        },
        freeform: {
            key: "wikipedia",
            template: "$$$",
            renderTemplate: "<span class='wikipedialink'>" +
                "<a href='{wikipedia}' target='_blank'>" +
                "<img width='64px' src='./assets/wikipedia.svg' alt='wikipedia'>" +
                "</a></span>",
            placeholder: ""
        },
    };
    return WikipediaLink;
}(TagRendering_1.TagRenderingOptions));
exports.WikipediaLink = WikipediaLink;
