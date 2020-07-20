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
exports.TagUtils = exports.Not = exports.And = exports.Or = exports.Tag = exports.Regex = exports.TagsFilter = void 0;
var TagsFilter = /** @class */ (function () {
    function TagsFilter() {
    }
    TagsFilter.prototype.matchesProperties = function (properties) {
        return this.matches(TagUtils.proprtiesToKV(properties));
    };
    return TagsFilter;
}());
exports.TagsFilter = TagsFilter;
var Regex = /** @class */ (function (_super) {
    __extends(Regex, _super);
    function Regex(k, r) {
        var _this = _super.call(this) || this;
        _this._k = k;
        _this._r = r;
        return _this;
    }
    Regex.prototype.asOverpass = function () {
        return ["['" + this._k + "'~'" + this._r + "']"];
    };
    Regex.prototype.matches = function (tags) {
        var _a;
        if (!(tags instanceof Array)) {
            throw "You used 'matches' on something that is not a list. Did you mean to use 'matchesProperties'?";
        }
        for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
            var tag = tags_1[_i];
            if (tag.k === this._k) {
                if (tag.v === "") {
                    // This tag has been removed
                    return false;
                }
                if (this._r === "*") {
                    // Any is allowed
                    return true;
                }
                var matchCount = (_a = tag.v.match(this._r)) === null || _a === void 0 ? void 0 : _a.length;
                return (matchCount !== null && matchCount !== void 0 ? matchCount : 0) > 0;
            }
        }
        return false;
    };
    Regex.prototype.substituteValues = function (tags) {
        throw "Substituting values is not supported on regex tags";
    };
    return Regex;
}(TagsFilter));
exports.Regex = Regex;
var Tag = /** @class */ (function (_super) {
    __extends(Tag, _super);
    function Tag(key, value) {
        var _this = _super.call(this) || this;
        _this.key = key;
        _this.value = value;
        return _this;
    }
    Tag.prototype.matches = function (tags) {
        for (var _i = 0, tags_2 = tags; _i < tags_2.length; _i++) {
            var tag = tags_2[_i];
            if (tag.k === this.key) {
                if (tag.v === "") {
                    // This tag has been removed
                    return this.value === "";
                }
                if (this.value === "*") {
                    // Any is allowed
                    return true;
                }
                return this.value === tag.v;
            }
        }
        if (this.value === "") {
            return true;
        }
        return false;
    };
    Tag.prototype.asOverpass = function () {
        if (this.value === "*") {
            return ['["' + this.key + '"]'];
        }
        if (this.value === "") {
            // NOT having this key
            return ['[!"' + this.key + '"]'];
        }
        return ['["' + this.key + '"="' + this.value + '"]'];
    };
    Tag.prototype.substituteValues = function (tags) {
        return new Tag(this.key, TagUtils.ApplyTemplate(this.value, tags));
    };
    return Tag;
}(TagsFilter));
exports.Tag = Tag;
var Or = /** @class */ (function (_super) {
    __extends(Or, _super);
    function Or(or) {
        var _this = _super.call(this) || this;
        _this.or = or;
        return _this;
    }
    Or.prototype.matches = function (tags) {
        for (var _i = 0, _a = this.or; _i < _a.length; _i++) {
            var tagsFilter = _a[_i];
            if (tagsFilter.matches(tags)) {
                return true;
            }
        }
        return false;
    };
    Or.prototype.asOverpass = function () {
        var choices = [];
        for (var _i = 0, _a = this.or; _i < _a.length; _i++) {
            var tagsFilter = _a[_i];
            var subChoices = tagsFilter.asOverpass();
            for (var _b = 0, subChoices_1 = subChoices; _b < subChoices_1.length; _b++) {
                var subChoice = subChoices_1[_b];
                choices.push(subChoice);
            }
        }
        return choices;
    };
    Or.prototype.substituteValues = function (tags) {
        var newChoices = [];
        for (var _i = 0, _a = this.or; _i < _a.length; _i++) {
            var c = _a[_i];
            newChoices.push(c.substituteValues(tags));
        }
        return new Or(newChoices);
    };
    return Or;
}(TagsFilter));
exports.Or = Or;
var And = /** @class */ (function (_super) {
    __extends(And, _super);
    function And(and) {
        var _this = _super.call(this) || this;
        _this.and = and;
        return _this;
    }
    And.prototype.matches = function (tags) {
        for (var _i = 0, _a = this.and; _i < _a.length; _i++) {
            var tagsFilter = _a[_i];
            if (!tagsFilter.matches(tags)) {
                return false;
            }
        }
        return true;
    };
    And.prototype.combine = function (filter, choices) {
        var values = [];
        for (var _i = 0, choices_1 = choices; _i < choices_1.length; _i++) {
            var or = choices_1[_i];
            values.push(filter + or);
        }
        return values;
    };
    And.prototype.asOverpass = function () {
        var allChoices = null;
        for (var _i = 0, _a = this.and; _i < _a.length; _i++) {
            var andElement = _a[_i];
            var andElementFilter = andElement.asOverpass();
            if (allChoices === null) {
                allChoices = andElementFilter;
                continue;
            }
            var newChoices = [];
            for (var _b = 0, allChoices_1 = allChoices; _b < allChoices_1.length; _b++) {
                var choice = allChoices_1[_b];
                newChoices.push(this.combine(choice, andElementFilter));
            }
            allChoices = newChoices;
        }
        return allChoices;
    };
    And.prototype.substituteValues = function (tags) {
        var newChoices = [];
        for (var _i = 0, _a = this.and; _i < _a.length; _i++) {
            var c = _a[_i];
            newChoices.push(c.substituteValues(tags));
        }
        return new And(newChoices);
    };
    return And;
}(TagsFilter));
exports.And = And;
var Not = /** @class */ (function (_super) {
    __extends(Not, _super);
    function Not(not) {
        var _this = _super.call(this) || this;
        _this.not = not;
        return _this;
    }
    Not.prototype.asOverpass = function () {
        throw "Not supported yet";
    };
    Not.prototype.matches = function (tags) {
        return !this.not.matches(tags);
    };
    Not.prototype.substituteValues = function (tags) {
        return new Not(this.not.substituteValues(tags));
    };
    return Not;
}(TagsFilter));
exports.Not = Not;
var TagUtils = /** @class */ (function () {
    function TagUtils() {
    }
    TagUtils.proprtiesToKV = function (properties) {
        var result = [];
        for (var k in properties) {
            result.push({ k: k, v: properties[k] });
        }
        return result;
    };
    TagUtils.ApplyTemplate = function (template, tags) {
        for (var k in tags) {
            while (template.indexOf("{" + k + "}") >= 0) {
                template = template.replace("{" + k + "}", tags[k]);
            }
        }
        return template;
    };
    return TagUtils;
}());
exports.TagUtils = TagUtils;
