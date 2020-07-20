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
exports.TagRenderingOptions = void 0;
var UIElement_1 = require("../UI/UIElement");
var UIEventSource_1 = require("../UI/UIEventSource");
var TagsFilter_1 = require("../Logic/TagsFilter");
var FixedUiElement_1 = require("../UI/Base/FixedUiElement");
var SaveButton_1 = require("../UI/SaveButton");
var VariableUIElement_1 = require("../UI/Base/VariableUIElement");
var OnlyShowIf_1 = require("./OnlyShowIf");
var TextField_1 = require("../UI/Input/TextField");
var InputElementWrapper_1 = require("../UI/Input/InputElementWrapper");
var FixedInputElement_1 = require("../UI/Input/FixedInputElement");
var RadioButton_1 = require("../UI/Input/RadioButton");
var TagRenderingOptions = /** @class */ (function () {
    function TagRenderingOptions(options) {
        this.options = options;
    }
    TagRenderingOptions.prototype.OnlyShowIf = function (tagsFilter) {
        return new OnlyShowIf_1.OnlyShowIfConstructor(tagsFilter, this);
    };
    TagRenderingOptions.prototype.IsQuestioning = function (tags) {
        var _a;
        var tagsKV = TagsFilter_1.TagUtils.proprtiesToKV(tags);
        for (var _i = 0, _b = (_a = this.options.mappings) !== null && _a !== void 0 ? _a : []; _i < _b.length; _i++) {
            var oneOnOneElement = _b[_i];
            if (oneOnOneElement.k === null || oneOnOneElement.k.matches(tagsKV)) {
                return false;
            }
        }
        if (this.options.freeform !== undefined && tags[this.options.freeform.key] !== undefined) {
            return false;
        }
        if (this.options.question === undefined) {
            return false;
        }
        return true;
    };
    TagRenderingOptions.prototype.construct = function (dependencies) {
        return new TagRendering(dependencies.tags, dependencies.changes, this.options);
    };
    TagRenderingOptions.prototype.IsKnown = function (properties) {
        return !this.IsQuestioning(properties);
    };
    TagRenderingOptions.prototype.Priority = function () {
        var _a;
        return (_a = this.options.priority) !== null && _a !== void 0 ? _a : 0;
    };
    return TagRenderingOptions;
}());
exports.TagRenderingOptions = TagRenderingOptions;
var TagRendering = /** @class */ (function (_super) {
    __extends(TagRendering, _super);
    function TagRendering(tags, changes, options) {
        var _a, _b, _c;
        var _this = _super.call(this, tags) || this;
        _this._questionSkipped = new UIEventSource_1.UIEventSource(false);
        _this._editMode = new UIEventSource_1.UIEventSource(false);
        var self = _this;
        _this.ListenTo(_this._questionSkipped);
        _this.ListenTo(_this._editMode);
        _this._userDetails = changes.login.userDetails;
        _this.ListenTo(_this._userDetails);
        _this._question = options.question;
        _this._priority = (_a = options.priority) !== null && _a !== void 0 ? _a : 0;
        _this._primer = (_b = options.primer) !== null && _b !== void 0 ? _b : "";
        _this._tagsPreprocessor = function (properties) {
            if (options.tagsPreprocessor === undefined) {
                return properties;
            }
            var newTags = {};
            for (var k in properties) {
                newTags[k] = properties[k];
            }
            options.tagsPreprocessor(newTags);
            return newTags;
        };
        _this._mapping = [];
        _this._renderMapping = [];
        _this._freeform = options.freeform;
        // Prepare the choices for the Radio buttons
        var choices = [];
        var usedChoices = [];
        for (var _i = 0, _d = (_c = options.mappings) !== null && _c !== void 0 ? _c : []; _i < _d.length; _i++) {
            var choice = _d[_i];
            if (choice.k === null) {
                _this._mapping.push(choice);
                continue;
            }
            var choiceSubbed = choice;
            if (choice.substitute) {
                choiceSubbed = {
                    k: choice.k.substituteValues(options.tagsPreprocessor(_this._source.data)),
                    txt: _this.ApplyTemplate(choice.txt),
                    substitute: false,
                    priority: choice.priority
                };
            }
            var txt = choiceSubbed.txt;
            // Choices is what is shown in the radio buttons
            if (usedChoices.indexOf(txt) < 0) {
                choices.push(new FixedUiElement_1.FixedUiElement(txt));
                usedChoices.push(txt);
                // This is used to convert the radio button index into tags needed to add
                _this._mapping.push(choiceSubbed);
            }
            else {
                _this._renderMapping.push(choiceSubbed); // only used while rendering
            }
        }
        // Prepare the actual input element -> pick an appropriate implementation
        _this._questionElement = _this.InputElementFor(options);
        var save = function () {
            var selection = self._questionElement.GetValue().data;
            if (selection) {
                changes.addTag(tags.data.id, selection);
            }
            self._editMode.setData(false);
        };
        var cancel = function () {
            self._questionSkipped.setData(true);
            self._editMode.setData(false);
            self._source.ping(); // Send a ping upstream to render the next question
        };
        // Setup the save button and it's action
        _this._saveButton = new SaveButton_1.SaveButton(_this._questionElement.GetValue())
            .onClick(save);
        _this._editButton = new FixedUiElement_1.FixedUiElement("");
        if (_this._question !== undefined) {
            _this._editButton = new FixedUiElement_1.FixedUiElement("<img class='editbutton' src='./assets/pencil.svg' alt='edit'>")
                .onClick(function () {
                self._questionElement.GetValue().setData(self.CurrentValue());
                self._editMode.setData(true);
            });
        }
        var cancelContents = _this._editMode.map(function (isEditing) {
            if (isEditing) {
                return "<span class='skip-button'>Annuleren</span>";
            }
            else {
                return "<span class='skip-button'>Overslaan (Ik weet het niet zeker...)</span>";
            }
        });
        // And at last, set up the skip button
        _this._skipButton = new VariableUIElement_1.VariableUiElement(cancelContents).onClick(cancel);
        return _this;
    }
    TagRendering.prototype.InputElementFor = function (options) {
        var elements = [];
        if (options.mappings !== undefined) {
            for (var _i = 0, _a = options.mappings; _i < _a.length; _i++) {
                var mapping = _a[_i];
                elements.push(this.InputElementForMapping(mapping));
            }
        }
        if (options.freeform !== undefined) {
            elements.push(this.InputForFreeForm(options.freeform));
        }
        if (elements.length == 0) {
            throw "NO TAGRENDERINGS!";
        }
        if (elements.length == 1) {
            return elements[0];
        }
        return new RadioButton_1.RadioButton(elements, false);
    };
    TagRendering.prototype.InputElementForMapping = function (mapping) {
        return new FixedInputElement_1.FixedInputElement(mapping.txt, mapping.k);
    };
    TagRendering.prototype.InputForFreeForm = function (freeform) {
        if (freeform === undefined) {
            return undefined;
        }
        var pickString = function (string) {
            if (string === "" || string === undefined) {
                return undefined;
            }
            var tag = new TagsFilter_1.Tag(freeform.key, string);
            if (freeform.extraTags === undefined) {
                return tag;
            }
            return new TagsFilter_1.And([
                freeform.extraTags,
                tag
            ]);
        };
        var toString = function (tag) {
            if (tag instanceof TagsFilter_1.And) {
                return toString(tag.and[0]);
            }
            else if (tag instanceof TagsFilter_1.Tag) {
                return tag.value;
            }
            return undefined;
        };
        var inputElement;
        var textField = new TextField_1.TextField({
            placeholder: this._freeform.placeholder,
            fromString: pickString,
            toString: toString
        });
        var prepost = freeform.template.split("$$$");
        return new InputElementWrapper_1.InputElementWrapper(prepost[0], textField, prepost[1]);
    };
    TagRendering.prototype.IsKnown = function () {
        var tags = TagsFilter_1.TagUtils.proprtiesToKV(this._source.data);
        for (var _i = 0, _a = this._mapping.concat(this._renderMapping); _i < _a.length; _i++) {
            var oneOnOneElement = _a[_i];
            if (oneOnOneElement.k === null || oneOnOneElement.k.matches(tags)) {
                return true;
            }
        }
        return this._freeform !== undefined && this._source.data[this._freeform.key] !== undefined;
    };
    TagRendering.prototype.CurrentValue = function () {
        var tags = TagsFilter_1.TagUtils.proprtiesToKV(this._source.data);
        for (var _i = 0, _a = this._mapping.concat(this._renderMapping); _i < _a.length; _i++) {
            var oneOnOneElement = _a[_i];
            if (oneOnOneElement.k === null || oneOnOneElement.k.matches(tags)) {
                return oneOnOneElement.k;
            }
        }
        if (this._freeform === undefined) {
            return undefined;
        }
        return new TagsFilter_1.Tag(this._freeform.key, this._source.data[this._freeform.key]);
    };
    TagRendering.prototype.IsQuestioning = function () {
        if (this.IsKnown()) {
            return false;
        }
        if (this._question === undefined) {
            // We don't ask this question in the first place
            return false;
        }
        if (this._questionSkipped.data) {
            // We don't ask for this question anymore, skipped by user
            return false;
        }
        return true;
    };
    TagRendering.prototype.RenderAnwser = function () {
        var _a;
        var tags = TagsFilter_1.TagUtils.proprtiesToKV(this._source.data);
        var freeform = "";
        var freeformScore = -10;
        if (this._freeform !== undefined && this._source.data[this._freeform.key] !== undefined) {
            freeform = this.ApplyTemplate(this._freeform.renderTemplate);
            freeformScore = 0;
        }
        var highestScore = -100;
        var highestTemplate = undefined;
        for (var _i = 0, _b = this._mapping.concat(this._renderMapping); _i < _b.length; _i++) {
            var oneOnOneElement = _b[_i];
            if (oneOnOneElement.k == null ||
                oneOnOneElement.k.matches(tags)) {
                // We have found a matching key -> we use the template, but only if it scores better
                var score = (_a = oneOnOneElement.priority) !== null && _a !== void 0 ? _a : (oneOnOneElement.k === null ? -1 : 0);
                if (score > highestScore) {
                    highestScore = score;
                    highestTemplate = oneOnOneElement.txt;
                }
            }
        }
        if (freeformScore > highestScore) {
            return freeform;
        }
        if (highestTemplate !== undefined) {
            // we render the found template
            return this._primer + this.ApplyTemplate(highestTemplate);
        }
    };
    TagRendering.prototype.InnerRender = function () {
        if (this.IsQuestioning() || this._editMode.data) {
            // Not yet known or questioning, we have to ask a question
            return "<div class='question'>" +
                "<span class='question-text'>" + this._question + "</span>" +
                (this._question !== "" ? "<br/>" : "") +
                this._questionElement.Render() +
                this._skipButton.Render() +
                this._saveButton.Render() +
                "</div>";
        }
        if (this.IsKnown()) {
            var html = this.RenderAnwser();
            if (html == "") {
                return "";
            }
            var editButton = "";
            if (this._userDetails.data.loggedIn) {
                editButton = this._editButton.Render();
            }
            return "<span class='answer'>" +
                "<span class='answer-text'>" + html + "</span>" +
                editButton +
                "</span>";
        }
        return "";
    };
    TagRendering.prototype.Priority = function () {
        return this._priority;
    };
    TagRendering.prototype.ApplyTemplate = function (template) {
        var tags = this._tagsPreprocessor(this._source.data);
        return TagsFilter_1.TagUtils.ApplyTemplate(template, tags);
    };
    return TagRendering;
}(UIElement_1.UIElement));
