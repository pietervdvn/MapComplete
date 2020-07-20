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
exports.RadioButton = void 0;
var UIEventSource_1 = require("../UIEventSource");
var InputElement_1 = require("./InputElement");
var RadioButton = /** @class */ (function (_super) {
    __extends(RadioButton, _super);
    function RadioButton(elements, selectFirstAsDefault) {
        if (selectFirstAsDefault === void 0) { selectFirstAsDefault = true; }
        var _this = _super.call(this, undefined) || this;
        _this._selectedElementIndex = new UIEventSource_1.UIEventSource(null);
        _this._elements = elements;
        _this._selectFirstAsDefault = selectFirstAsDefault;
        var self = _this;
        _this.value =
            UIEventSource_1.UIEventSource.flatten(_this._selectedElementIndex.map(function (selectedIndex) {
                if (selectedIndex !== undefined && selectedIndex !== null) {
                    return elements[selectedIndex].GetValue();
                }
            }), elements.map(function (e) { return e.GetValue(); }));
        _this.value.addCallback(function (t) {
            self.SetCorrectValue(t);
        });
        var _loop_1 = function (i) {
            // If an element is clicked, the radio button corresponding with it should be selected as well
            elements[i].onClick(function () {
                self._selectedElementIndex.setData(i);
            });
        };
        for (var i = 0; i < elements.length; i++) {
            _loop_1(i);
        }
        return _this;
    }
    RadioButton.prototype.IsValid = function (t) {
        for (var _i = 0, _a = this._elements; _i < _a.length; _i++) {
            var inputElement = _a[_i];
            if (inputElement.IsValid(t)) {
                return true;
            }
        }
        return false;
    };
    RadioButton.prototype.GetValue = function () {
        return this.value;
    };
    RadioButton.prototype.IdFor = function (i) {
        return 'radio-' + this.id + '-' + i;
    };
    RadioButton.prototype.InnerRender = function () {
        var body = "";
        var i = 0;
        for (var _i = 0, _a = this._elements; _i < _a.length; _i++) {
            var el = _a[_i];
            var htmlElement = '<input type="radio" id="' + this.IdFor(i) + '" name="radiogroup-' + this.id + '">' +
                '<label for="' + this.IdFor(i) + '">' + el.Render() + '</label>' +
                '<br>';
            body += htmlElement;
            i++;
        }
        return "<form id='" + this.id + "-form'>" + body + "</form>";
    };
    RadioButton.prototype.SetCorrectValue = function (t) {
        if (t === undefined) {
            return;
        }
        // We check that what is selected matches the previous rendering
        for (var i = 0; i < this._elements.length; i++) {
            var e = this._elements[i];
            if (e.IsValid(t)) {
                this._selectedElementIndex.setData(i);
                e.GetValue().setData(t);
                // @ts-ignore
                document.getElementById(this.IdFor(i)).checked = true;
                return;
            }
        }
    };
    RadioButton.prototype.InnerUpdate = function (htmlElement) {
        var self = this;
        function checkButtons() {
            for (var i = 0; i < self._elements.length; i++) {
                var el_1 = document.getElementById(self.IdFor(i));
                // @ts-ignore
                if (el_1.checked) {
                    self._selectedElementIndex.setData(i);
                }
            }
        }
        var el = document.getElementById(this.id);
        el.addEventListener("change", function () {
            checkButtons();
        });
        if (this._selectFirstAsDefault) {
            this.SetCorrectValue(this.value.data);
            if (this._selectedElementIndex.data === null || this._selectedElementIndex.data === undefined) {
                var el_2 = document.getElementById(this.IdFor(0));
                if (el_2) {
                    // @ts-ignore
                    el_2.checked = true;
                    checkButtons();
                }
            }
        }
    };
    ;
    return RadioButton;
}(InputElement_1.InputElement));
exports.RadioButton = RadioButton;
