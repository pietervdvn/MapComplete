import {RadioButton} from "./UI/Input/RadioButton";
import {FixedInputElement} from "./UI/Input/FixedInputElement";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import ValidatedTextField from "./UI/Input/ValidatedTextField";
import {And, Tag, TagsFilter} from "./Logic/Tags";


const type = "string";


if(ValidatedTextField.AllTypes[type] === undefined){
    console.error("Type:",type, ValidatedTextField.AllTypes)
    throw "Unkown type: "+type;
}

const freeform = {
    key: "x",
    extraTags: undefined,
    placeholder: "Placeholder"
}


const pickString =
    (string: any) => {
        if (string === "" || string === undefined) {
            return undefined;
        }

        const tag = new Tag(freeform.key, string);

        if (freeform.extraTags === undefined) {
            return tag;
        }
        return new And([
                tag,
                freeform.extraTags
            ]
        );
    };

const toString = (tag) => {
    if (tag instanceof And) {
        for (const subtag of tag.and) {
            if (subtag instanceof Tag && subtag.key === freeform.key) {
                return subtag.value;
            }
        }

        return undefined;
    } else if (tag instanceof Tag) {
        return tag.value
    }
    return undefined;
}

const tf = ValidatedTextField.Mapped(pickString, toString, {
    placeholder: freeform.placeholder,
    type: type,
    isValid: (str) => (str.length <= 255),
    textArea: false,
    country: "be"
})

const rb = new RadioButton([
    new FixedInputElement("Value A", new Tag("x","a")),
    tf
]);

rb.AttachTo('maindiv');
new VariableUiElement(rb.GetValue().map((tf:TagsFilter) => tf.asHumanString(false, false))).AttachTo('extradiv')