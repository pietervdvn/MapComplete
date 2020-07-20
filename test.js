"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TextField_1 = require("./UI/Input/TextField");
var FixedInputElement_1 = require("./UI/Input/FixedInputElement");
var RadioButton_1 = require("./UI/Input/RadioButton");
var buttons = new RadioButton_1.RadioButton([new FixedInputElement_1.FixedInputElement("Five", 5),
    new FixedInputElement_1.FixedInputElement("Ten", 10), new TextField_1.TextField({
        fromString: function (str) { return parseInt(str); },
        toString: function (i) { return ("" + i); },
    })
], false).AttachTo("maindiv");
buttons.GetValue().addCallback(console.log);
