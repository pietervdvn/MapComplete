"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIEventSource = void 0;
var UIEventSource = /** @class */ (function () {
    function UIEventSource(data) {
        this._callbacks = [];
        this.data = data;
    }
    UIEventSource.prototype.addCallback = function (callback) {
        this._callbacks.push(callback);
        return this;
    };
    UIEventSource.prototype.setData = function (t) {
        if (this.data === t) {
            return;
        }
        this.data = t;
        this.ping();
    };
    UIEventSource.prototype.ping = function () {
        for (var _i = 0, _a = this._callbacks; _i < _a.length; _i++) {
            var callback = _a[_i];
            callback(this.data);
        }
    };
    UIEventSource.flatten = function (source, possibleSources) {
        var _a;
        var sink = new UIEventSource((_a = source.data) === null || _a === void 0 ? void 0 : _a.data);
        source.addCallback(function (latestData) {
            sink.setData(latestData === null || latestData === void 0 ? void 0 : latestData.data);
        });
        for (var _i = 0, possibleSources_1 = possibleSources; _i < possibleSources_1.length; _i++) {
            var possibleSource = possibleSources_1[_i];
            possibleSource.addCallback(function () {
                var _a;
                sink.setData((_a = source.data) === null || _a === void 0 ? void 0 : _a.data);
            });
        }
        return sink;
    };
    UIEventSource.prototype.map = function (f, extraSources) {
        if (extraSources === void 0) { extraSources = []; }
        var self = this;
        var update = function () {
            newSource.setData(f(self.data));
            newSource.ping();
        };
        this.addCallback(update);
        for (var _i = 0, extraSources_1 = extraSources; _i < extraSources_1.length; _i++) {
            var extraSource = extraSources_1[_i];
            extraSource.addCallback(update);
        }
        var newSource = new UIEventSource(f(this.data));
        return newSource;
    };
    return UIEventSource;
}());
exports.UIEventSource = UIEventSource;
