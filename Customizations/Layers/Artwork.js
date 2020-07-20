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
exports.Artwork = void 0;
var LayerDefinition_1 = require("../LayerDefinition");
var Question_1 = require("../../Logic/Question");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var leaflet_1 = require("leaflet");
var Artwork = /** @class */ (function (_super) {
    __extends(Artwork, _super);
    function Artwork() {
        var _this = _super.call(this) || this;
        _this.name = "artwork";
        _this.newElementTags = [new TagsFilter_1.Tag("tourism", "artwork")];
        _this.icon = "./assets/statue.svg";
        _this.overpassFilter = new TagsFilter_1.Tag("tourism", "artwork");
        _this.minzoom = 13;
        _this.questions = [
            Question_1.QuestionDefinition.radioAndTextQuestion("What kind of artwork is this?", 10, "artwork_type", [
                { text: "A statue", value: "statue" },
                { text: "A bust (thus a statue, but only of the head and shoulders)", value: "bust" },
                { text: "A sculpture", value: "sculpture" },
                { text: "A mural painting", value: "mural" },
                { text: "A painting", value: "painting" },
                { text: "A graffiti", value: "graffiti" },
                { text: "A relief", value: "relief" },
                { text: "An installation", value: "installation" }
            ]),
            Question_1.QuestionDefinition.textQuestion("Whom or what is depicted in this statue?", "subject", 20).addUnrequiredTag("subject:wikidata", "*"),
            Question_1.QuestionDefinition.textQuestion("Is there an inscription on this artwork?", "inscription", 16),
            Question_1.QuestionDefinition.textQuestion("What is the name of this artwork? If there is no explicit name, skip the question", "name", 15),
        ];
        _this.style = function (tags) {
            return {
                icon: new leaflet_1.default.icon({
                    iconUrl: "assets/statue.svg",
                    iconSize: [40, 40],
                    text: "hi"
                }),
                color: "#0000ff"
            };
        };
        _this.elementsToShow = [
            new TagMappingOptions({
                key: "name",
                template: "<h2>Artwork '{name}'</h2>",
                missing: "Artwork"
            }),
            new TagMappingOptions({
                key: "artwork_type",
                template: "This artwork is a {artwork_type}"
            }),
            new TagMappingOptions({
                key: "artist_name",
                template: "This artwork was made by {artist_name}"
            }),
            new TagMappingOptions({
                key: "subject",
                template: "This artwork depicts {subject}"
            }),
            new TagMappingOptions({
                key: "subject:wikidata",
                template: "<a href='https://www.wikidata.org/wiki/{subject:wikidata}' target='_blank'>See more data about the subject</a>"
            }),
            new TagMappingOptions({
                key: "website",
                template: "<a href='{website}' target='_blank'>Website of the statue</a>"
            }),
            new TagMappingOptions({ key: "image", template: "<img class='popupImg' alt='image' src='{image}' />" })
        ];
        return _this;
    }
    return Artwork;
}(LayerDefinition_1.LayerDefinition));
exports.Artwork = Artwork;
