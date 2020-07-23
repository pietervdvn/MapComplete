import {IntField} from "./UI/Input/PhoneField";


const f = new IntField().AttachTo("maindiv")
f.GetValue().addCallback(console.log)