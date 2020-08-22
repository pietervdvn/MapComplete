import {TextField, ValidatedTextField} from "./UI/Input/TextField";

ValidatedTextField.TagTextField().AttachTo("maindiv")
    .GetValue().addCallback(console.log);