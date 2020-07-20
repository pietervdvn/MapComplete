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
exports.QuestionPicker = void 0;
var UIElement_1 = require("./UIElement");
var QuestionPicker = /** @class */ (function (_super) {
    __extends(QuestionPicker, _super);
    function QuestionPicker(questions, tags) {
        var _this = _super.call(this, tags) || this;
        _this._questions = questions;
        _this.tags = tags.data;
        _this.source = tags;
        return _this;
    }
    QuestionPicker.prototype.InnerRender = function () {
        var t = this.tags;
        var highestPriority = Number.MIN_VALUE;
        var highestQ;
        for (var _i = 0, _a = this._questions; _i < _a.length; _i++) {
            var q = _a[_i];
            if (!q.Applicable(t)) {
                continue;
            }
            var priority = q.question.severity;
            if (priority > highestPriority) {
                highestPriority = priority;
                highestQ = q;
            }
        }
        if (highestQ === undefined) {
            return "Er zijn geen vragen meer!";
        }
        return "<div class='question'>" +
            highestQ.CreateHtml(this.source).Render() +
            "</div>";
    };
    return QuestionPicker;
}(UIElement_1.UIElement));
exports.QuestionPicker = QuestionPicker;
