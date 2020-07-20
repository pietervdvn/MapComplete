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
exports.OnlyShowIfConstructor = void 0;
var TagsFilter_1 = require("../Logic/TagsFilter");
var UIElement_1 = require("../UI/UIElement");
var OnlyShowIfConstructor = /** @class */ (function () {
    function OnlyShowIfConstructor(tagsFilter, embedded) {
        this._tagsFilter = tagsFilter;
        this._embedded = embedded;
    }
    OnlyShowIfConstructor.prototype.construct = function (dependencies) {
        return new OnlyShowIf(dependencies.tags, this._embedded.construct(dependencies), this._tagsFilter);
    };
    OnlyShowIfConstructor.prototype.IsKnown = function (properties) {
        if (!this.Matches(properties)) {
            return true;
        }
        return this._embedded.IsKnown(properties);
    };
    OnlyShowIfConstructor.prototype.IsQuestioning = function (properties) {
        if (!this.Matches(properties)) {
            return false;
        }
        return this._embedded.IsQuestioning(properties);
    };
    OnlyShowIfConstructor.prototype.Priority = function () {
        return this._embedded.Priority();
    };
    OnlyShowIfConstructor.prototype.Matches = function (properties) {
        return this._tagsFilter.matches(TagsFilter_1.TagUtils.proprtiesToKV(properties));
    };
    return OnlyShowIfConstructor;
}());
exports.OnlyShowIfConstructor = OnlyShowIfConstructor;
var OnlyShowIf = /** @class */ (function (_super) {
    __extends(OnlyShowIf, _super);
    function OnlyShowIf(tags, embedded, filter) {
        var _this = _super.call(this, tags) || this;
        _this._filter = filter;
        _this._embedded = embedded;
        return _this;
    }
    OnlyShowIf.prototype.Matches = function () {
        return this._filter.matches(TagsFilter_1.TagUtils.proprtiesToKV(this._source.data));
    };
    OnlyShowIf.prototype.InnerRender = function () {
        if (this.Matches()) {
            return this._embedded.Render();
        }
        else {
            return "";
        }
    };
    OnlyShowIf.prototype.Priority = function () {
        return this._embedded.Priority();
    };
    OnlyShowIf.prototype.IsKnown = function () {
        if (!this.Matches()) {
            return false;
        }
        return this._embedded.IsKnown();
    };
    OnlyShowIf.prototype.IsQuestioning = function () {
        if (!this.Matches()) {
            return false;
        }
        return this._embedded.IsQuestioning();
    };
    OnlyShowIf.prototype.Activate = function () {
        this._embedded.Activate();
    };
    OnlyShowIf.prototype.Update = function () {
        this._embedded.Update();
    };
    return OnlyShowIf;
}(UIElement_1.UIElement));
