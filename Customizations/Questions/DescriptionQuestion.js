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
exports.DescriptionQuestion = void 0;
var TagRendering_1 = require("../TagRendering");
var DescriptionQuestion = /** @class */ (function (_super) {
    __extends(DescriptionQuestion, _super);
    function DescriptionQuestion(category) {
        return _super.call(this, {
            question: "Zijn er bijzonderheden die we moeten weten over dit " + category + "?<br>" +
                "<span class='question-subtext'>Je hoeft niet te herhalen wat je net hebt aangeduid.<br/>" +
                "Een <i>naam</i> wordt in de volgende stap gevraagd.<br/>" +
                "Voel je vrij om dit veld over te slaan.</span>",
            freeform: {
                key: "description:0",
                renderTemplate: "{description:0}",
                template: "$$$"
            },
            priority: 14
        }) || this;
    }
    return DescriptionQuestion;
}(TagRendering_1.TagRenderingOptions));
exports.DescriptionQuestion = DescriptionQuestion;
