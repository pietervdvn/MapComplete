import {describe} from 'mocha'
import {expect} from 'chai'
import {Utils} from "../../../Utils";
import Wikidata from "../../../Logic/Web/Wikidata";

const Q140 = {
    "entities": {
        "Q140": {
            "pageid": 275,
            "ns": 0,
            "title": "Q140",
            "lastrevid": 1503881580,
            "modified": "2021-09-26T19:53:55Z",
            "type": "item",
            "id": "Q140",
            "labels": {
                "fr": {"language": "fr", "value": "lion"},
                "it": {"language": "it", "value": "leone"},
                "nb": {"language": "nb", "value": "l\u00f8ve"},
                "ru": {"language": "ru", "value": "\u043b\u0435\u0432"},
                "de": {"language": "de", "value": "L\u00f6we"},
                "es": {"language": "es", "value": "le\u00f3n"},
                "nn": {"language": "nn", "value": "l\u00f8ve"},
                "da": {"language": "da", "value": "l\u00f8ve"},
                "af": {"language": "af", "value": "leeu"},
                "ar": {"language": "ar", "value": "\u0623\u0633\u062f"},
                "bg": {"language": "bg", "value": "\u043b\u044a\u0432"},
                "bn": {"language": "bn", "value": "\u09b8\u09bf\u0982\u09b9"},
                "br": {"language": "br", "value": "leon"},
                "bs": {"language": "bs", "value": "lav"},
                "ca": {"language": "ca", "value": "lle\u00f3"},
                "cs": {"language": "cs", "value": "lev"},
                "el": {"language": "el", "value": "\u03bb\u03b9\u03bf\u03bd\u03c4\u03ac\u03c1\u03b9"},
                "fi": {"language": "fi", "value": "leijona"},
                "ga": {"language": "ga", "value": "leon"},
                "gl": {"language": "gl", "value": "Le\u00f3n"},
                "gu": {"language": "gu", "value": "\u0ab8\u0abf\u0a82\u0ab9"},
                "he": {"language": "he", "value": "\u05d0\u05e8\u05d9\u05d4"},
                "hi": {"language": "hi", "value": "\u0938\u093f\u0902\u0939"},
                "hu": {"language": "hu", "value": "oroszl\u00e1n"},
                "id": {"language": "id", "value": "Singa"},
                "ja": {"language": "ja", "value": "\u30e9\u30a4\u30aa\u30f3"},
                "ko": {"language": "ko", "value": "\uc0ac\uc790"},
                "mk": {"language": "mk", "value": "\u043b\u0430\u0432"},
                "ml": {"language": "ml", "value": "\u0d38\u0d3f\u0d02\u0d39\u0d02"},
                "mr": {"language": "mr", "value": "\u0938\u093f\u0902\u0939"},
                "my": {"language": "my", "value": "\u1001\u103c\u1004\u103a\u1039\u101e\u1031\u1037"},
                "ne": {"language": "ne", "value": "\u0938\u093f\u0902\u0939"},
                "nl": {"language": "nl", "value": "leeuw"},
                "pl": {"language": "pl", "value": "lew afryka\u0144ski"},
                "pt": {"language": "pt", "value": "le\u00e3o"},
                "pt-br": {"language": "pt-br", "value": "le\u00e3o"},
                "scn": {"language": "scn", "value": "liuni"},
                "sq": {"language": "sq", "value": "Luani"},
                "sr": {"language": "sr", "value": "\u043b\u0430\u0432"},
                "sw": {"language": "sw", "value": "simba"},
                "ta": {"language": "ta", "value": "\u0b9a\u0bbf\u0b99\u0bcd\u0b95\u0bae\u0bcd"},
                "te": {"language": "te", "value": "\u0c38\u0c3f\u0c02\u0c39\u0c02"},
                "th": {"language": "th", "value": "\u0e2a\u0e34\u0e07\u0e42\u0e15"},
                "tr": {"language": "tr", "value": "aslan"},
                "uk": {"language": "uk", "value": "\u043b\u0435\u0432"},
                "vi": {"language": "vi", "value": "s\u01b0 t\u1eed"},
                "zh": {"language": "zh", "value": "\u7345\u5b50"},
                "sco": {"language": "sco", "value": "lion"},
                "zh-hant": {"language": "zh-hant", "value": "\u7345\u5b50"},
                "fa": {"language": "fa", "value": "\u0634\u06cc\u0631"},
                "zh-hans": {"language": "zh-hans", "value": "\u72ee\u5b50"},
                "ee": {"language": "ee", "value": "Dzata"},
                "ilo": {"language": "ilo", "value": "leon"},
                "ksh": {"language": "ksh", "value": "L\u00f6hv"},
                "zh-hk": {"language": "zh-hk", "value": "\u7345\u5b50"},
                "as": {"language": "as", "value": "\u09b8\u09bf\u0982\u09b9"},
                "zh-cn": {"language": "zh-cn", "value": "\u72ee\u5b50"},
                "zh-mo": {"language": "zh-mo", "value": "\u7345\u5b50"},
                "zh-my": {"language": "zh-my", "value": "\u72ee\u5b50"},
                "zh-sg": {"language": "zh-sg", "value": "\u72ee\u5b50"},
                "zh-tw": {"language": "zh-tw", "value": "\u7345\u5b50"},
                "ast": {"language": "ast", "value": "lle\u00f3n"},
                "sat": {"language": "sat", "value": "\u1c61\u1c5f\u1c74\u1c5f\u1c60\u1c69\u1c5e"},
                "bho": {"language": "bho", "value": "\u0938\u093f\u0902\u0939"},
                "en": {"language": "en", "value": "lion"},
                "ks": {"language": "ks", "value": "\u067e\u0627\u062f\u064e\u0631 \u0633\u0655\u06c1\u06c1"},
                "be-tarask": {"language": "be-tarask", "value": "\u043b\u0435\u045e"},
                "nan": {"language": "nan", "value": "Sai"},
                "la": {"language": "la", "value": "leo"},
                "en-ca": {"language": "en-ca", "value": "Lion"},
                "en-gb": {"language": "en-gb", "value": "lion"},
                "ab": {"language": "ab", "value": "\u0410\u043b\u044b\u043c"},
                "am": {"language": "am", "value": "\u12a0\u1295\u1260\u1233"},
                "an": {"language": "an", "value": "Panthera leo"},
                "ang": {"language": "ang", "value": "L\u0113o"},
                "arc": {"language": "arc", "value": "\u0710\u072a\u071d\u0710"},
                "arz": {"language": "arz", "value": "\u0633\u0628\u0639"},
                "av": {"language": "av", "value": "\u0413\u044a\u0430\u043b\u0431\u0430\u0446\u04c0"},
                "az": {"language": "az", "value": "\u015eir"},
                "ba": {"language": "ba", "value": "\u0410\u0440\u044b\u04ab\u043b\u0430\u043d"},
                "be": {"language": "be", "value": "\u043b\u0435\u045e"},
                "bo": {"language": "bo", "value": "\u0f66\u0f7a\u0f44\u0f0b\u0f42\u0f7a\u0f0d"},
                "bpy": {"language": "bpy", "value": "\u09a8\u0982\u09b8\u09be"},
                "bxr": {"language": "bxr", "value": "\u0410\u0440\u0441\u0430\u043b\u0430\u043d"},
                "ce": {"language": "ce", "value": "\u041b\u043e\u043c"},
                "chr": {"language": "chr", "value": "\u13e2\u13d3\u13e5 \u13a4\u13cd\u13c6\u13b4\u13c2"},
                "chy": {"language": "chy", "value": "P\u00e9hpe'\u00e9nan\u00f3se'hame"},
                "ckb": {"language": "ckb", "value": "\u0634\u06ce\u0631"},
                "co": {"language": "co", "value": "Lionu"},
                "csb": {"language": "csb", "value": "Lew"},
                "cu": {"language": "cu", "value": "\u041b\u044c\u0432\u044a"},
                "cv": {"language": "cv", "value": "\u0410\u0440\u0103\u0441\u043b\u0430\u043d"},
                "cy": {"language": "cy", "value": "Llew"},
                "dsb": {"language": "dsb", "value": "law"},
                "eo": {"language": "eo", "value": "leono"},
                "et": {"language": "et", "value": "l\u00f5vi"},
                "eu": {"language": "eu", "value": "lehoi"},
                "fo": {"language": "fo", "value": "leyvur"},
                "frr": {"language": "frr", "value": "l\u00f6\u00f6w"},
                "gag": {"language": "gag", "value": "aslan"},
                "gd": {"language": "gd", "value": "le\u00f2mhann"},
                "gn": {"language": "gn", "value": "Le\u00f5"},
                "got": {"language": "got", "value": "\ud800\udf3b\ud800\udf39\ud800\udf45\ud800\udf30/Liwa"},
                "ha": {"language": "ha", "value": "Zaki"},
                "hak": {"language": "hak", "value": "S\u1e73\u0302-\u00e9"},
                "haw": {"language": "haw", "value": "Liona"},
                "hif": {"language": "hif", "value": "Ser"},
                "hr": {"language": "hr", "value": "lav"},
                "hsb": {"language": "hsb", "value": "law"},
                "ht": {"language": "ht", "value": "Lyon"},
                "hy": {"language": "hy", "value": "\u0561\u057c\u0575\u0578\u0582\u056e"},
                "ia": {"language": "ia", "value": "Panthera leo"},
                "ig": {"language": "ig", "value": "Od\u00fam"},
                "io": {"language": "io", "value": "leono"},
                "is": {"language": "is", "value": "lj\u00f3n"},
                "jbo": {"language": "jbo", "value": "cinfo"},
                "jv": {"language": "jv", "value": "Singa"},
                "ka": {"language": "ka", "value": "\u10da\u10dd\u10db\u10d8"},
                "kab": {"language": "kab", "value": "Izem"},
                "kbd": {"language": "kbd", "value": "\u0425\u044c\u044d\u0449"},
                "kg": {"language": "kg", "value": "Nkosi"},
                "kk": {"language": "kk", "value": "\u0410\u0440\u044b\u0441\u0442\u0430\u043d"},
                "kn": {"language": "kn", "value": "\u0cb8\u0cbf\u0c82\u0cb9"},
                "ku": {"language": "ku", "value": "\u015e\u00ear"},
                "lb": {"language": "lb", "value": "L\u00e9iw"},
                "lbe": {"language": "lbe", "value": "\u0410\u0441\u043b\u0430\u043d"},
                "lez": {"language": "lez", "value": "\u0410\u0441\u043b\u0430\u043d"},
                "li": {"language": "li", "value": "Liew"},
                "lij": {"language": "lij", "value": "Lion"},
                "ln": {"language": "ln", "value": "Nk\u0254\u0301si"},
                "lt": {"language": "lt", "value": "li\u016btas"},
                "ltg": {"language": "ltg", "value": "\u013bovs"},
                "lv": {"language": "lv", "value": "lauva"},
                "mdf": {"language": "mdf", "value": "\u041e\u0440\u043a\u0441\u043e\u0444\u0442\u0430"},
                "mhr": {"language": "mhr", "value": "\u0410\u0440\u044b\u0441\u043b\u0430\u043d"},
                "mn": {"language": "mn", "value": "\u0410\u0440\u0441\u043b\u0430\u043d"},
                "mrj": {"language": "mrj", "value": "\u0410\u0440\u044b\u0441\u043b\u0430\u043d"},
                "ms": {"language": "ms", "value": "Singa"},
                "mt": {"language": "mt", "value": "iljun"},
                "nah": {"language": "nah", "value": "Cu\u0101miztli"},
                "nrm": {"language": "nrm", "value": "lion"},
                "su": {"language": "su", "value": "Singa"},
                "de-ch": {"language": "de-ch", "value": "L\u00f6we"},
                "ky": {"language": "ky", "value": "\u0410\u0440\u0441\u0442\u0430\u043d"},
                "lmo": {"language": "lmo", "value": "Panthera leo"},
                "ceb": {"language": "ceb", "value": "Panthera leo"},
                "diq": {"language": "diq", "value": "\u015e\u00ear"},
                "new": {"language": "new", "value": "\u0938\u093f\u0902\u0939"},
                "nds": {"language": "nds", "value": "L\u00f6\u00f6w"},
                "ak": {"language": "ak", "value": "Gyata"},
                "cdo": {"language": "cdo", "value": "S\u0103i"},
                "ady": {"language": "ady", "value": "\u0410\u0441\u043b\u044a\u0430\u043d"},
                "azb": {"language": "azb", "value": "\u0622\u0633\u0644\u0627\u0646"},
                "lfn": {"language": "lfn", "value": "Leon"},
                "kbp": {"language": "kbp", "value": "T\u0254\u0254y\u028b\u028b"},
                "gsw": {"language": "gsw", "value": "L\u00f6we"},
                "din": {"language": "din", "value": "K\u00f6r"},
                "inh": {"language": "inh", "value": "\u041b\u043e\u043c"},
                "bm": {"language": "bm", "value": "Waraba"},
                "hyw": {"language": "hyw", "value": "\u0531\u057c\u056b\u0582\u056e"},
                "nds-nl": {"language": "nds-nl", "value": "leeuw"},
                "kw": {"language": "kw", "value": "Lew"},
                "ext": {"language": "ext", "value": "Le\u00f3n"},
                "bcl": {"language": "bcl", "value": "Leon"},
                "mg": {"language": "mg", "value": "Liona"},
                "lld": {"language": "lld", "value": "Lion"},
                "lzh": {"language": "lzh", "value": "\u7345"},
                "ary": {"language": "ary", "value": "\u0633\u0628\u0639"},
                "sv": {"language": "sv", "value": "lejon"},
                "nso": {"language": "nso", "value": "Tau"},
                "nv": {
                    "language": "nv",
                    "value": "N\u00e1shd\u00f3\u00edtsoh bitsiij\u012f\u02bc dadit\u0142\u02bcoo\u00edg\u00ed\u00ed"
                },
                "oc": {"language": "oc", "value": "panthera leo"},
                "or": {"language": "or", "value": "\u0b38\u0b3f\u0b02\u0b39"},
                "os": {"language": "os", "value": "\u0426\u043e\u043c\u0430\u0445\u044a"},
                "pa": {"language": "pa", "value": "\u0a38\u0a3c\u0a47\u0a30"},
                "pam": {"language": "pam", "value": "Leon"},
                "pcd": {"language": "pcd", "value": "Lion"},
                "pms": {"language": "pms", "value": "Lion"},
                "pnb": {"language": "pnb", "value": "\u0628\u0628\u0631 \u0634\u06cc\u0631"},
                "ps": {"language": "ps", "value": "\u0632\u0645\u0631\u06cc"},
                "qu": {"language": "qu", "value": "Liyun"},
                "rn": {"language": "rn", "value": "Intare"},
                "ro": {"language": "ro", "value": "Leul"},
                "sl": {"language": "sl", "value": "lev"},
                "sn": {"language": "sn", "value": "Shumba"},
                "so": {"language": "so", "value": "Libaax"},
                "ss": {"language": "ss", "value": "Libubesi"},
                "st": {"language": "st", "value": "Tau"},
                "stq": {"language": "stq", "value": "Leeuwe"},
                "sr-ec": {"language": "sr-ec", "value": "\u043b\u0430\u0432"},
                "sr-el": {"language": "sr-el", "value": "lav"},
                "rm": {"language": "rm", "value": "Liun"},
                "sm": {"language": "sm", "value": "Leona"},
                "tcy": {"language": "tcy", "value": "\u0cb8\u0cbf\u0cae\u0ccd\u0cae"},
                "szl": {"language": "szl", "value": "Lew"},
                "rue": {"language": "rue", "value": "\u041b\u0435\u0432"},
                "rw": {"language": "rw", "value": "Intare"},
                "sah": {"language": "sah", "value": "\u0425\u0430\u0445\u0430\u0439"},
                "sh": {"language": "sh", "value": "Lav"},
                "sk": {"language": "sk", "value": "lev p\u00fa\u0161\u0165ov\u00fd"},
                "tg": {"language": "tg", "value": "\u0428\u0435\u0440"},
                "ti": {"language": "ti", "value": "\u12a3\u1295\u1260\u1233"},
                "tl": {"language": "tl", "value": "Leon"},
                "tum": {"language": "tum", "value": "Nkhalamu"},
                "udm": {"language": "udm", "value": "\u0410\u0440\u044b\u0441\u043b\u0430\u043d"},
                "ug": {"language": "ug", "value": "\u0634\u0649\u0631"},
                "ur": {"language": "ur", "value": "\u0628\u0628\u0631"},
                "vec": {"language": "vec", "value": "Leon"},
                "vep": {"language": "vep", "value": "lev"},
                "vls": {"language": "vls", "value": "l\u00eaeuw"},
                "war": {"language": "war", "value": "leon"},
                "wo": {"language": "wo", "value": "gaynde"},
                "xal": {"language": "xal", "value": "\u0410\u0440\u0441\u043b\u04a3"},
                "xmf": {"language": "xmf", "value": "\u10dc\u10ef\u10d8\u10da\u10dd"},
                "yi": {"language": "yi", "value": "\u05dc\u05d9\u05d9\u05d1"},
                "yo": {"language": "yo", "value": "K\u00ecn\u00ec\u00fan"},
                "yue": {"language": "yue", "value": "\u7345\u5b50"},
                "zu": {"language": "zu", "value": "ibhubesi"},
                "tk": {"language": "tk", "value": "\u00ddolbars"},
                "tt": {"language": "tt", "value": "\u0430\u0440\u044b\u0441\u043b\u0430\u043d"},
                "uz": {"language": "uz", "value": "Arslon"},
                "se": {"language": "se", "value": "Ledjon"},
                "si": {"language": "si", "value": "\u0dc3\u0dd2\u0d82\u0dc4\u0dba\u0dcf"},
                "sgs": {"language": "sgs", "value": "Li\u016bts"},
                "vro": {"language": "vro", "value": "L\u00f5vi"},
                "xh": {"language": "xh", "value": "Ingonyama"},
                "sa": {"language": "sa", "value": "\u0938\u093f\u0902\u0939\u0903 \u092a\u0936\u0941\u0903"},
                "za": {"language": "za", "value": "Saeceij"},
                "sd": {"language": "sd", "value": "\u0628\u0628\u0631 \u0634\u064a\u0646\u0647\u0646"},
                "wuu": {"language": "wuu", "value": "\u72ee"},
                "shn": {"language": "shn", "value": "\u101e\u1062\u1004\u103a\u1087\u101e\u102e\u1088"},
                "alt": {"language": "alt", "value": "\u0410\u0440\u0441\u043b\u0430\u043d"},
                "avk": {"language": "avk", "value": "Krapol (Panthera leo)"},
                "dag": {"language": "dag", "value": "Gbu\u0263inli"},
                "shi": {"language": "shi", "value": "Agrzam"},
                "mni": {"language": "mni", "value": "\uabc5\uabe3\uabe1\uabc1\uabe5"}
            },
            "descriptions": {
                "fr": {"language": "fr", "value": "esp\u00e8ce de mammif\u00e8res carnivores"},
                "it": {"language": "it", "value": "mammifero carnivoro della famiglia dei Felidi"},
                "nb": {"language": "nb", "value": "kattedyr"},
                "ru": {
                    "language": "ru",
                    "value": "\u0432\u0438\u0434 \u0445\u0438\u0449\u043d\u044b\u0445 \u043c\u043b\u0435\u043a\u043e\u043f\u0438\u0442\u0430\u044e\u0449\u0438\u0445"
                },
                "de": {"language": "de", "value": "Art der Gattung Eigentliche Gro\u00dfkatzen (Panthera)"},
                "es": {"language": "es", "value": "mam\u00edfero carn\u00edvoro de la familia de los f\u00e9lidos"},
                "en": {"language": "en", "value": "species of big cat"},
                "ko": {
                    "language": "ko",
                    "value": "\uace0\uc591\uc774\uacfc\uc5d0 \uc18d\ud558\ub294 \uc721\uc2dd\ub3d9\ubb3c"
                },
                "ca": {"language": "ca", "value": "mam\u00edfer carn\u00edvor de la fam\u00edlia dels f\u00e8lids"},
                "fi": {"language": "fi", "value": "suuri kissael\u00e4in"},
                "pt-br": {
                    "language": "pt-br",
                    "value": "esp\u00e9cie de mam\u00edfero carn\u00edvoro do g\u00eanero Panthera e da fam\u00edlia Felidae"
                },
                "ta": {"language": "ta", "value": "\u0bb5\u0bbf\u0bb2\u0b99\u0bcd\u0b95\u0bc1"},
                "nl": {"language": "nl", "value": "groot roofdier uit de familie der katachtigen"},
                "he": {
                    "language": "he",
                    "value": "\u05de\u05d9\u05df \u05d1\u05e1\u05d5\u05d2 \u05e4\u05e0\u05ea\u05e8, \u05d8\u05d5\u05e8\u05e3 \u05d2\u05d3\u05d5\u05dc \u05d1\u05de\u05e9\u05e4\u05d7\u05ea \u05d4\u05d7\u05ea\u05d5\u05dc\u05d9\u05d9\u05dd"
                },
                "pt": {"language": "pt", "value": "esp\u00e9cie de felino"},
                "sco": {"language": "sco", "value": "species o big cat"},
                "zh-hans": {"language": "zh-hans", "value": "\u5927\u578b\u732b\u79d1\u52a8\u7269"},
                "uk": {
                    "language": "uk",
                    "value": "\u0432\u0438\u0434 \u043a\u043b\u0430\u0441\u0443 \u0441\u0441\u0430\u0432\u0446\u0456\u0432, \u0440\u044f\u0434\u0443 \u0445\u0438\u0436\u0438\u0445, \u0440\u043e\u0434\u0438\u043d\u0438 \u043a\u043e\u0442\u044f\u0447\u0438\u0445"
                },
                "hu": {
                    "language": "hu",
                    "value": "macskaf\u00e9l\u00e9k csal\u00e1dj\u00e1ba tartoz\u00f3 eml\u0151sfaj"
                },
                "bn": {
                    "language": "bn",
                    "value": "\u099c\u0999\u09cd\u0997\u09b2\u09c7\u09b0 \u09b0\u09be\u099c\u09be"
                },
                "hi": {"language": "hi", "value": "\u091c\u0902\u0917\u0932 \u0915\u093e \u0930\u093e\u091c\u093e"},
                "ilo": {"language": "ilo", "value": "sebbangan ti dakkel a pusa"},
                "ksh": {
                    "language": "ksh",
                    "value": "et jr\u00fch\u00dfde Kazedier op der \u00c4hd, der K\u00fcnning vun de Diehre"
                },
                "fa": {
                    "language": "fa",
                    "value": "\u06af\u0631\u0628\u0647\u200c \u0628\u0632\u0631\u06af \u0628\u0648\u0645\u06cc \u0622\u0641\u0631\u06cc\u0642\u0627 \u0648 \u0622\u0633\u06cc\u0627"
                },
                "gl": {
                    "language": "gl",
                    "value": "\u00e9 un mam\u00edfero carn\u00edvoro da familia dos f\u00e9lidos e unha das 4 especies do x\u00e9nero Panthera"
                },
                "sq": {"language": "sq", "value": "mace e madhe e familjes Felidae"},
                "el": {
                    "language": "el",
                    "value": "\u03b5\u03af\u03b4\u03bf\u03c2 \u03c3\u03b1\u03c1\u03ba\u03bf\u03c6\u03ac\u03b3\u03bf \u03b8\u03b7\u03bb\u03b1\u03c3\u03c4\u03b9\u03ba\u03cc"
                },
                "scn": {"language": "scn", "value": "specia di mamm\u00ecfiru"},
                "bg": {
                    "language": "bg",
                    "value": "\u0432\u0438\u0434 \u0431\u043e\u0437\u0430\u0439\u043d\u0438\u043a"
                },
                "ne": {
                    "language": "ne",
                    "value": "\u0920\u0942\u0932\u094b \u092c\u093f\u0930\u093e\u0932\u094b\u0915\u094b \u092a\u094d\u0930\u091c\u093e\u0924\u093f"
                },
                "pl": {"language": "pl", "value": "gatunek ssaka z rodziny kotowatych"},
                "af": {
                    "language": "af",
                    "value": "Soogdier en roofdier van die familie Felidae, een van die \"groot katte\""
                },
                "mk": {
                    "language": "mk",
                    "value": "\u0432\u0438\u0434 \u0433\u043e\u043b\u0435\u043c\u0430 \u043c\u0430\u0447\u043a\u0430"
                },
                "nn": {"language": "nn", "value": "kattedyr"},
                "zh-hant": {"language": "zh-hant", "value": "\u5927\u578b\u8c93\u79d1\u52d5\u7269"},
                "zh": {
                    "language": "zh",
                    "value": "\u4ea7\u81ea\u975e\u6d32\u548c\u4e9a\u6d32\u7684\u5927\u578b\u732b\u79d1\u52a8\u7269"
                },
                "zh-cn": {"language": "zh-cn", "value": "\u5927\u578b\u732b\u79d1\u52a8\u7269"},
                "zh-hk": {"language": "zh-hk", "value": "\u5927\u578b\u8c93\u79d1\u52d5\u7269"},
                "zh-mo": {"language": "zh-mo", "value": "\u5927\u578b\u8c93\u79d1\u52d5\u7269"},
                "zh-my": {"language": "zh-my", "value": "\u5927\u578b\u732b\u79d1\u52a8\u7269"},
                "zh-sg": {"language": "zh-sg", "value": "\u5927\u578b\u732b\u79d1\u52a8\u7269"},
                "zh-tw": {"language": "zh-tw", "value": "\u5927\u578b\u8c93\u79d1\u52d5\u7269"},
                "sw": {"language": "sw", "value": "mnyama mla nyama kama paka mkubwa"},
                "th": {
                    "language": "th",
                    "value": "\u0e0a\u0e37\u0e48\u0e2d\u0e2a\u0e31\u0e15\u0e27\u0e4c\u0e1b\u0e48\u0e32\u0e0a\u0e19\u0e34\u0e14\u0e2b\u0e19\u0e36\u0e48\u0e07 \u0e2d\u0e22\u0e39\u0e48\u0e43\u0e19\u0e2a\u0e32\u0e22\u0e1e\u0e31\u0e19\u0e18\u0e38\u0e4c\u0e02\u0e2d\u0e07\u0e41\u0e21\u0e27\u0e43\u0e2b\u0e0d\u0e48"
                },
                "ar": {
                    "language": "ar",
                    "value": "\u062d\u064a\u0648\u0627\u0646 \u0645\u0646 \u0627\u0644\u062b\u062f\u064a\u064a\u0627\u062a \u0645\u0646 \u0641\u0635\u064a\u0644\u0629 \u0627\u0644\u0633\u0646\u0648\u0631\u064a\u0627\u062a \u0648\u0623\u062d\u062f \u0627\u0644\u0633\u0646\u0648\u0631\u064a\u0627\u062a \u0627\u0644\u0623\u0631\u0628\u0639\u0629 \u0627\u0644\u0643\u0628\u064a\u0631\u0629 \u0627\u0644\u0645\u0646\u062a\u0645\u064a\u0629 \u0644\u062c\u0646\u0633 \u0627\u0644\u0646\u0645\u0631"
                },
                "ml": {
                    "language": "ml",
                    "value": "\u0d38\u0d38\u0d4d\u0d24\u0d28\u0d3f\u0d15\u0d33\u0d3f\u0d32\u0d46 \u0d2b\u0d46\u0d32\u0d3f\u0d21\u0d47 \u0d15\u0d41\u0d1f\u0d41\u0d02\u0d2c\u0d24\u0d4d\u0d24\u0d3f\u0d32\u0d46 \u0d2a\u0d3e\u0d28\u0d4d\u0d24\u0d31 \u0d1c\u0d28\u0d41\u0d38\u0d4d\u0d38\u0d3f\u0d7d \u0d09\u0d7e\u0d2a\u0d4d\u0d2a\u0d46\u0d1f\u0d4d\u0d1f \u0d12\u0d30\u0d41 \u0d35\u0d28\u0d4d\u0d2f\u0d1c\u0d40\u0d35\u0d3f\u0d2f\u0d3e\u0d23\u0d4d \u0d38\u0d3f\u0d02\u0d39\u0d02"
                },
                "cs": {"language": "cs", "value": "ko\u010dkovit\u00e1 \u0161elma"},
                "gu": {
                    "language": "gu",
                    "value": "\u0aac\u0abf\u0ab2\u0abe\u0aa1\u0ac0 \u0ab5\u0a82\u0ab6\u0aa8\u0ac1\u0a82 \u0ab8\u0ab8\u0acd\u0aa4\u0aa8 \u0aaa\u0acd\u0ab0\u0abe\u0aa3\u0ac0"
                },
                "mr": {
                    "language": "mr",
                    "value": "\u092e\u093e\u0902\u091c\u0930\u093e\u091a\u0940 \u092e\u094b\u0920\u0940 \u091c\u093e\u0924"
                },
                "sr": {
                    "language": "sr",
                    "value": "\u0432\u0435\u043b\u0438\u043a\u0438 \u0441\u0438\u0441\u0430\u0440 \u0438\u0437 \u043f\u043e\u0440\u043e\u0434\u0438\u0446\u0435 \u043c\u0430\u0447\u0430\u043a\u0430"
                },
                "ast": {"language": "ast", "value": "especie de mam\u00edferu carn\u00edvoru"},
                "te": {
                    "language": "te",
                    "value": "\u0c2a\u0c46\u0c26\u0c4d\u0c26 \u0c2a\u0c3f\u0c32\u0c4d\u0c32\u0c3f \u0c1c\u0c24\u0c3f"
                },
                "bho": {
                    "language": "bho",
                    "value": "\u092c\u093f\u0932\u093e\u0930\u092c\u0902\u0938 \u0915\u0947 \u092c\u0921\u093c\u0939\u0928 \u091c\u093e\u0928\u0935\u0930"
                },
                "da": {"language": "da", "value": "en af de fem store katte i sl\u00e6gten Panthera"},
                "vi": {"language": "vi", "value": "M\u1ed9t lo\u00e0i m\u00e8o l\u1edbn thu\u1ed9c chi Panthera"},
                "ja": {"language": "ja", "value": "\u98df\u8089\u76ee\u30cd\u30b3\u79d1\u306e\u52d5\u7269"},
                "ga": {"language": "ga", "value": "speiceas cat"},
                "bs": {"language": "bs", "value": "vrsta velike ma\u010dke"},
                "tr": {"language": "tr", "value": "Afrika ve Asya'ya \u00f6zg\u00fc b\u00fcy\u00fck bir kedi"},
                "as": {
                    "language": "as",
                    "value": "\u09b8\u09cd\u09a4\u09a8\u09cd\u09af\u09aa\u09be\u09af\u09bc\u09c0 \u09aa\u09cd\u09f0\u09be\u09a3\u09c0"
                },
                "my": {
                    "language": "my",
                    "value": "\u1014\u102d\u102f\u1037\u1010\u102d\u102f\u1000\u103a\u101e\u1010\u1039\u1010\u101d\u102b \u1019\u103b\u102d\u102f\u1038\u1005\u102d\u1010\u103a (\u1000\u103c\u1031\u102c\u1004\u103a\u1019\u103b\u102d\u102f\u1038\u101b\u1004\u103a\u1038\u101d\u1004\u103a)"
                },
                "id": {"language": "id", "value": "spesies hewan keluarga jenis kucing"},
                "ks": {
                    "language": "ks",
                    "value": "\u0628\u062c \u0628\u0631\u0627\u0631\u0646 \u06be\u0646\u062f \u06a9\u0633\u0645 \u06cc\u0633 \u0627\u0634\u06cc\u0627 \u062a\u06c1 \u0627\u0641\u0631\u06cc\u06a9\u0627 \u0645\u0646\u0632 \u0645\u0644\u0627\u0646 \u0686\u06be\u06c1"
                },
                "br": {"language": "br", "value": "bronneg kigdebrer"},
                "sat": {
                    "language": "sat",
                    "value": "\u1c75\u1c64\u1c68 \u1c68\u1c6e\u1c71 \u1c68\u1c5f\u1c61\u1c5f"
                },
                "mni": {
                    "language": "mni",
                    "value": "\uabc2\uabdd\uabc2\uabdb\uabc0\uabe4 \uabc1\uabe5\uabcd\uabe4\uabe1 \uabc6\uabe5\uabd5 \uabc1\uabe5 \uabd1\uabc6\uabe7\uabd5\uabc1\uabe4\uabe1\uabd2\uabe4 \uabc3\uabc5\uabe8\uabe1\uabd7 \uabd1\uabc3"
                },
                "ro": {"language": "ro", "value": "mamifer carnivor"}
            },
            "aliases": {
                "es": [{"language": "es", "value": "Panthera leo"}, {"language": "es", "value": "leon"}],
                "en": [{"language": "en", "value": "Asiatic Lion"}, {
                    "language": "en",
                    "value": "Panthera leo"
                }, {"language": "en", "value": "African lion"}, {
                    "language": "en",
                    "value": "the lion"
                }, {"language": "en", "value": "\ud83e\udd81"}],
                "pt-br": [{"language": "pt-br", "value": "Panthera leo"}],
                "fr": [{"language": "fr", "value": "lionne"}, {"language": "fr", "value": "lionceau"}],
                "zh": [{"language": "zh", "value": "\u9b03\u6bdb"}, {
                    "language": "zh",
                    "value": "\u72ee\u5b50"
                }, {"language": "zh", "value": "\u7345"}, {
                    "language": "zh",
                    "value": "\u525b\u679c\u7345"
                }, {"language": "zh", "value": "\u975e\u6d32\u72ee"}],
                "de": [{"language": "de", "value": "Panthera leo"}],
                "ca": [{"language": "ca", "value": "Panthera leo"}],
                "sco": [{"language": "sco", "value": "Panthera leo"}],
                "hu": [{"language": "hu", "value": "P. leo"}, {"language": "hu", "value": "Panthera leo"}],
                "ilo": [{"language": "ilo", "value": "Panthera leo"}, {"language": "ilo", "value": "Felis leo"}],
                "ksh": [{"language": "ksh", "value": "L\u00f6hw"}, {
                    "language": "ksh",
                    "value": "L\u00f6hf"
                }, {"language": "ksh", "value": "L\u00f6v"}],
                "gl": [{"language": "gl", "value": "Panthera leo"}],
                "ja": [{"language": "ja", "value": "\u767e\u7363\u306e\u738b"}, {
                    "language": "ja",
                    "value": "\u7345\u5b50"
                }, {"language": "ja", "value": "\u30b7\u30b7"}],
                "sq": [{"language": "sq", "value": "Mbreti i Kafsh\u00ebve"}],
                "el": [{"language": "el", "value": "\u03c0\u03b1\u03bd\u03b8\u03ae\u03c1"}],
                "pl": [{"language": "pl", "value": "Panthera leo"}, {"language": "pl", "value": "lew"}],
                "zh-hk": [{"language": "zh-hk", "value": "\u7345"}],
                "af": [{"language": "af", "value": "Panthera leo"}],
                "mk": [{"language": "mk", "value": "Panthera leo"}],
                "ar": [{"language": "ar", "value": "\u0644\u064a\u062b"}],
                "zh-hant": [{"language": "zh-hant", "value": "\u7345"}],
                "zh-cn": [{"language": "zh-cn", "value": "\u72ee"}],
                "zh-hans": [{"language": "zh-hans", "value": "\u72ee"}],
                "zh-mo": [{"language": "zh-mo", "value": "\u7345"}],
                "zh-my": [{"language": "zh-my", "value": "\u72ee"}],
                "zh-sg": [{"language": "zh-sg", "value": "\u72ee"}],
                "zh-tw": [{"language": "zh-tw", "value": "\u7345"}],
                "gu": [{"language": "gu", "value": "\u0ab5\u0aa8\u0ab0\u0abe\u0a9c"}, {
                    "language": "gu",
                    "value": "\u0ab8\u0abe\u0ab5\u0a9c"
                }, {"language": "gu", "value": "\u0a95\u0ac7\u0ab8\u0ab0\u0ac0"}],
                "ast": [{"language": "ast", "value": "Panthera leo"}, {
                    "language": "ast",
                    "value": "lle\u00f3n africanu"
                }],
                "hi": [{
                    "language": "hi",
                    "value": "\u092a\u0947\u0902\u0925\u0947\u0930\u093e \u0932\u093f\u092f\u094b"
                }],
                "te": [{
                    "language": "te",
                    "value": "\u0c2a\u0c3e\u0c02\u0c25\u0c47\u0c30\u0c3e \u0c32\u0c3f\u0c2f\u0c4b"
                }],
                "nl": [{"language": "nl", "value": "Panthera leo"}],
                "bho": [{
                    "language": "bho",
                    "value": "\u092a\u0948\u0928\u094d\u0925\u0947\u0930\u093e \u0932\u093f\u092f\u094b"
                }, {
                    "language": "bho",
                    "value": "\u092a\u0948\u0902\u0925\u0947\u0930\u093e \u0932\u093f\u092f\u094b"
                }],
                "ru": [{
                    "language": "ru",
                    "value": "\u0430\u0437\u0438\u0430\u0442\u0441\u043a\u0438\u0439 \u043b\u0435\u0432"
                }, {
                    "language": "ru",
                    "value": "\u0431\u043e\u043b\u044c\u0448\u0430\u044f \u043a\u043e\u0448\u043a\u0430"
                }, {
                    "language": "ru",
                    "value": "\u0446\u0430\u0440\u044c \u0437\u0432\u0435\u0440\u0435\u0439"
                }, {
                    "language": "ru",
                    "value": "\u0430\u0444\u0440\u0438\u043a\u0430\u043d\u0441\u043a\u0438\u0439 \u043b\u0435\u0432"
                }],
                "ga": [{"language": "ga", "value": "Panthera leo"}],
                "bg": [{"language": "bg", "value": "Panthera leo"}, {
                    "language": "bg",
                    "value": "\u043b\u044a\u0432\u0438\u0446\u0430"
                }],
                "sat": [{"language": "sat", "value": "\u1c60\u1c69\u1c5e"}],
                "nan": [{"language": "nan", "value": "Panthera leo"}],
                "la": [{"language": "la", "value": "Panthera leo"}],
                "nds-nl": [{"language": "nds-nl", "value": "leywe"}]
            },
            "claims": {
                "P225": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P225",
                        "hash": "e2be083a19a0c5e1a3f8341be88c5ec0e347580f",
                        "datavalue": {"value": "Panthera leo", "type": "string"},
                        "datatype": "string"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P405": [{
                            "snaktype": "value",
                            "property": "P405",
                            "hash": "a817d3670bc2f9a3586b6377a65d54fff72ef888",
                            "datavalue": {
                                "value": {"entity-type": "item", "numeric-id": 1043, "id": "Q1043"},
                                "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }],
                        "P574": [{
                            "snaktype": "value",
                            "property": "P574",
                            "hash": "506af9838b7d37b45786395b95170263f1951a31",
                            "datavalue": {
                                "value": {
                                    "time": "+1758-01-01T00:00:00Z",
                                    "timezone": 0,
                                    "before": 0,
                                    "after": 0,
                                    "precision": 9,
                                    "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                }, "type": "time"
                            },
                            "datatype": "time"
                        }],
                        "P31": [{
                            "snaktype": "value",
                            "property": "P31",
                            "hash": "60a983bb1006c765614eb370c3854e64ec50599f",
                            "datavalue": {
                                "value": {
                                    "entity-type": "item",
                                    "numeric-id": 14594740,
                                    "id": "Q14594740"
                                }, "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P405", "P574", "P31"],
                    "id": "q140$8CCA0B07-C81F-4456-ABAA-A7348C86C9B4",
                    "rank": "normal",
                    "references": [{
                        "hash": "89e96b63b05055cc80c950cf5fea109c7d453658",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "c26dbcef1202a7d198982ed24f6ea69b704f95fe",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 82575, "id": "Q82575"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P577": [{
                                "snaktype": "value",
                                "property": "P577",
                                "hash": "539fa499b6ea982e64006270bb26f52a57a8e32b",
                                "datavalue": {
                                    "value": {
                                        "time": "+1996-06-13T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "96dfb8481e184edb40553947f8fe08ce080f1553",
                                "datavalue": {
                                    "value": {
                                        "time": "+2013-09-19T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P577", "P813"]
                    }, {
                        "hash": "f2fcc71ba228fd0db2b328c938e601507006fa46",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "603c636b2210e4a74b7d40c9e969b7e503bbe252",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 1538807,
                                        "id": "Q1538807"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "6892402e621d2b47092e15284d64cdbb395e71f7",
                                "datavalue": {
                                    "value": {
                                        "time": "+2015-09-19T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P105": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P105",
                        "hash": "aebf3611b23ed90c7c0fc80f6cd1cb7be110ea59",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 7432, "id": "Q7432"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "id": "q140$CD2903E5-743A-4B4F-AE9E-9C0C83426B11",
                    "rank": "normal",
                    "references": [{
                        "hash": "89e96b63b05055cc80c950cf5fea109c7d453658",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "c26dbcef1202a7d198982ed24f6ea69b704f95fe",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 82575, "id": "Q82575"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P577": [{
                                "snaktype": "value",
                                "property": "P577",
                                "hash": "539fa499b6ea982e64006270bb26f52a57a8e32b",
                                "datavalue": {
                                    "value": {
                                        "time": "+1996-06-13T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "96dfb8481e184edb40553947f8fe08ce080f1553",
                                "datavalue": {
                                    "value": {
                                        "time": "+2013-09-19T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P577", "P813"]
                    }, {
                        "hash": "f2fcc71ba228fd0db2b328c938e601507006fa46",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "603c636b2210e4a74b7d40c9e969b7e503bbe252",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 1538807,
                                        "id": "Q1538807"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "6892402e621d2b47092e15284d64cdbb395e71f7",
                                "datavalue": {
                                    "value": {
                                        "time": "+2015-09-19T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P171": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P171",
                        "hash": "cbf0d3943e6cbac8afbec1ff11525c84ee04e442",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 127960, "id": "Q127960"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "id": "q140$C1CA40D8-39C3-4DB4-B763-207A22796D85",
                    "rank": "normal",
                    "references": [{
                        "hash": "89e96b63b05055cc80c950cf5fea109c7d453658",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "c26dbcef1202a7d198982ed24f6ea69b704f95fe",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 82575, "id": "Q82575"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P577": [{
                                "snaktype": "value",
                                "property": "P577",
                                "hash": "539fa499b6ea982e64006270bb26f52a57a8e32b",
                                "datavalue": {
                                    "value": {
                                        "time": "+1996-06-13T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "96dfb8481e184edb40553947f8fe08ce080f1553",
                                "datavalue": {
                                    "value": {
                                        "time": "+2013-09-19T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P577", "P813"]
                    }, {
                        "hash": "f2fcc71ba228fd0db2b328c938e601507006fa46",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "603c636b2210e4a74b7d40c9e969b7e503bbe252",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 1538807,
                                        "id": "Q1538807"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "6892402e621d2b47092e15284d64cdbb395e71f7",
                                "datavalue": {
                                    "value": {
                                        "time": "+2015-09-19T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P1403": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1403",
                        "hash": "baa11a4c668601014a48e2998ab76aa1ea7a5b99",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 15294488, "id": "Q15294488"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    }, "type": "statement", "id": "Q140$816d2b99-4aa5-5eb9-784b-34e2704d2927", "rank": "normal"
                }],
                "P141": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P141",
                        "hash": "80026ea5b2066a2538fee5c0897b459bb6770689",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 278113, "id": "Q278113"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "id": "q140$B12A2FD5-692F-4D9A-8FC7-144AA45A16F8",
                    "rank": "normal",
                    "references": [{
                        "hash": "355df53bb7c6d100219cd2a331afd51719337d88",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "eb153b77c6029ffa1ca09f9128b8e47fe58fce5a",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 56011232,
                                        "id": "Q56011232"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P627": [{
                                "snaktype": "value",
                                "property": "P627",
                                "hash": "3642ac96e05180279c47a035c129d3af38d85027",
                                "datavalue": {"value": "15951", "type": "string"},
                                "datatype": "string"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "76bc602d4f902d015c358223e7c0917bd65095e0",
                                "datavalue": {
                                    "value": {
                                        "time": "+2018-08-10T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P627", "P813"]
                    }]
                }],
                "P181": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P181",
                        "hash": "8467347aac1f01e518c1b94d5bb68c65f9efe84a",
                        "datavalue": {"value": "Lion distribution.png", "type": "string"},
                        "datatype": "commonsMedia"
                    }, "type": "statement", "id": "q140$12F383DD-D831-4AE9-A0ED-98C27A8C5BA7", "rank": "normal"
                }],
                "P830": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P830",
                        "hash": "8cafbfe99d80fcfabbd236d4cc01d33cc8a8b41d",
                        "datavalue": {"value": "328672", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$486d7ab8-4af8-b6e1-85bb-e0749b02c2d9",
                    "rank": "normal",
                    "references": [{
                        "hash": "7e71b7ede7931e7e2ee9ce54e832816fe948b402",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "6e81987ab11fb1740bd862639411d0700be3b22c",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 82486, "id": "Q82486"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "7c1a33cf9a0bf6cdd57b66f089065ba44b6a8953",
                                "datavalue": {
                                    "value": {
                                        "time": "+2014-10-30T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P815": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P815",
                        "hash": "27f6bd8fb4504eb79b92e6b63679b83af07d5fed",
                        "datavalue": {"value": "183803", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$71177A4F-4308-463D-B370-8B354EC2D2C3",
                    "rank": "normal",
                    "references": [{
                        "hash": "ff0dd9eabf88b0dcefa74b223d065dd644e42050",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "c26dbcef1202a7d198982ed24f6ea69b704f95fe",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 82575, "id": "Q82575"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "6b8fcfa6afb3911fecec93ae1dff2b6b6cde5659",
                                "datavalue": {
                                    "value": {
                                        "time": "+2013-12-07T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P685": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P685",
                        "hash": "c863e255c042b2b9b6a788ebd6e24f38a46dfa88",
                        "datavalue": {"value": "9689", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$A9F4ABE4-D079-4868-BC18-F685479BB244",
                    "rank": "normal",
                    "references": [{
                        "hash": "5667273d9f2899620fec2016bb2afd29aa7080ce",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "1851bc60ddfbcf6f76bd45aa7124fc0d5857a379",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 13711410,
                                        "id": "Q13711410"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "6b8fcfa6afb3911fecec93ae1dff2b6b6cde5659",
                                "datavalue": {
                                    "value": {
                                        "time": "+2013-12-07T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P959": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P959",
                        "hash": "55cab2a9d2af860a89a8d0e2eaefedb64202a3d8",
                        "datavalue": {"value": "14000228", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$A967D17D-485D-434F-BBF2-E6226E63BA42",
                    "rank": "normal",
                    "references": [{
                        "hash": "3e398e6df20323ce88e644e5a1e4ec0bc77a5f41",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "603c636b2210e4a74b7d40c9e969b7e503bbe252",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 1538807,
                                        "id": "Q1538807"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "d2bace4e146678a5e5f761e9a441b53b95dc2e87",
                                "datavalue": {
                                    "value": {
                                        "time": "+2014-01-10T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P842": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P842",
                        "hash": "991987fc3fa4d1cfd3a601dcfc9dd1f802255de7",
                        "datavalue": {"value": "49734", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$3FF45860-DBC3-4629-AAF8-F2899B6C6876",
                    "rank": "normal",
                    "references": [{
                        "hash": "1111bfc1dc63ee739fb9dd3f5534346c7fd478f0",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "00fe2206a3342fa25c0cfe1d08783c49a1986f12",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 796451,
                                        "id": "Q796451"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "14c5b75e8d3f4c43cb5b570380dd98e421bb9751",
                                "datavalue": {
                                    "value": {
                                        "time": "+2014-01-30T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P227": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P227",
                        "hash": "3343c5fd594f8f0264332d87ce95e76ffeaebffd",
                        "datavalue": {"value": "4140572-9", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$0059e08d-4308-8401-58e8-2cb683c03837", "rank": "normal"
                }],
                "P349": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P349",
                        "hash": "08812c4ef85f397bf00b015d1baf3b00d81cb9bf",
                        "datavalue": {"value": "00616831", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$B7933772-D27D-49D4-B1BB-AA36ADCA81B0", "rank": "normal"
                }],
                "P1014": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1014",
                        "hash": "3d27204feb184f21c042777dc9674150cb07ee92",
                        "datavalue": {"value": "300310388", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$8e3c9dc3-442e-2e61-8617-f4a41b5be668", "rank": "normal"
                }],
                "P646": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P646",
                        "hash": "0c053bce57fe07b05c300a09b322d9f89236884b",
                        "datavalue": {"value": "/m/096mb", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$D94D8A4F-3414-4BE0-82C1-306BD136C017",
                    "rank": "normal",
                    "references": [{
                        "hash": "2b00cb481cddcac7623114367489b5c194901c4a",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "a94b740202b097dd33355e0e6c00e54b9395e5e0",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 15241312,
                                        "id": "Q15241312"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P577": [{
                                "snaktype": "value",
                                "property": "P577",
                                "hash": "fde79ecb015112d2f29229ccc1ec514ed3e71fa2",
                                "datavalue": {
                                    "value": {
                                        "time": "+2013-10-28T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P577"]
                    }]
                }],
                "P1036": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1036",
                        "hash": "02435ba66ab8e5fb26652ae1a84695be24b3e22a",
                        "datavalue": {"value": "599.757", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$e75ed89a-408d-9bc1-8d99-41663921debd", "rank": "normal"
                }],
                "P1245": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1245",
                        "hash": "f3da4ca7d35fc3e02a9ea1662688d8f6c4658df0",
                        "datavalue": {"value": "5961", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$010e79a0-475e-fcf4-a554-375b64943783", "rank": "normal"
                }],
                "P910": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P910",
                        "hash": "056367b51cd51edd6c2840134fde01cf40469172",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 6987175, "id": "Q6987175"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    }, "type": "statement", "id": "Q140$BC4DE2D4-BF45-49AF-A9A6-C0A976F60825", "rank": "normal"
                }],
                "P373": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P373",
                        "hash": "76c006bc5e2975bcda2e7d60ddcbaaa8c84f69e5",
                        "datavalue": {"value": "Panthera leo", "type": "string"},
                        "datatype": "string"
                    }, "type": "statement", "id": "q140$939BA4B2-28D3-4C74-B143-A0EA6F423B43", "rank": "normal"
                }],
                "P846": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P846",
                        "hash": "d0428680cd2b36efde61dc69ccc5a8ff7a735cb5",
                        "datavalue": {"value": "5219404", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$4CE8E6D4-E9A1-46F1-8EEF-B469E8485F9E",
                    "rank": "normal",
                    "references": [{
                        "hash": "5b8345ffc93a361b71f5d201a97f587e5e57efe5",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "dbb8dd1efbe0158a5227213bd628eeac27a1da65",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 1531570,
                                        "id": "Q1531570"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "3eb17b10ce02d44f47540a6fbdbb3cbb7e77d5f5",
                                "datavalue": {
                                    "value": {
                                        "time": "+2015-05-15T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P487": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P487",
                        "hash": "5f93415dd33bfde6a546fdd65e5a7013e012c336",
                        "datavalue": {"value": "\ud83e\udd81", "type": "string"},
                        "datatype": "string"
                    }, "type": "statement", "id": "Q140$da5262fc-4ac5-390b-b424-4f296b2d711d", "rank": "normal"
                }],
                "P2040": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P2040",
                        "hash": "5b13a3fa0fde6ba09d8e417738c05268bd065e32",
                        "datavalue": {"value": "6353", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$E97A1A2E-D146-4C62-AE92-5AF5F7E146EF",
                    "rank": "normal",
                    "references": [{
                        "hash": "348b5187938d682071c94e22f1b30659af715dc7",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "213dc0d84ed983cbb28466ebb0c45bf8b0730ea2",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 20962955,
                                        "id": "Q20962955"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "3d2c713dec9143721ae196af88fee0fde5ae20f2",
                                "datavalue": {
                                    "value": {
                                        "time": "+2015-09-10T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P935": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P935",
                        "hash": "c3518a9944958337bcce384587f3abc3de6ddf34",
                        "datavalue": {"value": "Panthera leo", "type": "string"},
                        "datatype": "string"
                    }, "type": "statement", "id": "Q140$F7AAEE1F-4D18-4538-99F0-1A2B5AD7269F", "rank": "normal"
                }],
                "P1417": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1417",
                        "hash": "492d3483075b6915990940a4392f5ec035cbe05e",
                        "datavalue": {"value": "animal/lion", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$FE89C38F-6C79-4F06-8C15-81DCAC8D745F", "rank": "normal"
                }],
                "P244": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P244",
                        "hash": "2e41780263804dd45d7deaf7955a2d1d221f6096",
                        "datavalue": {"value": "sh85077276", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$634d86d1-45b1-920d-e9ef-78d5f4023288",
                    "rank": "normal",
                    "references": [{
                        "hash": "88d810dd1ff791aeb0b5779876b0c9f19acb59b6",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "c120f07504c77593a9d734f50361ea829f601960",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 620946,
                                        "id": "Q620946"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "0980c2f2b51e6b2d4c1dd9a77b9fb95dc282bc79",
                                "datavalue": {
                                    "value": {
                                        "time": "+2016-06-01T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P1843": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "3b1cfb68cc46255ceba7ff7893ac1cabbb4ddd92",
                        "datavalue": {"value": {"text": "Lion", "language": "en"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P7018": [{
                            "snaktype": "value",
                            "property": "P7018",
                            "hash": "40a60b39201df345ffbf5aa724269d5fd61ae028",
                            "datavalue": {
                                "value": {"entity-type": "sense", "id": "L17815-S1"},
                                "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-sense"
                        }]
                    },
                    "qualifiers-order": ["P7018"],
                    "id": "Q140$6E257597-55C7-4AF3-B3D6-0F2204FAD35C",
                    "rank": "normal",
                    "references": [{
                        "hash": "eada84c58a38325085267509899037535799e978",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "ba14d022d7e0c8b74595e7b8aaa1bc2451dd806a",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 32059, "id": "Q32059"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "3e51c3c32949f8a45f2c3331f55ea6ae68ecf3fe",
                                "datavalue": {
                                    "value": {
                                        "time": "+2016-10-21T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }, {
                        "hash": "cdc389b112247cb50b855fb86e98b7a7892e96f0",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "e17975e5c866df46673c91b2287a82cf23d14f5a",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 27310853,
                                        "id": "Q27310853"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P304": [{
                                "snaktype": "value",
                                "property": "P304",
                                "hash": "ff7ad3502ff7a4a9b0feeb4248a7bed9767a1ec6",
                                "datavalue": {"value": "166", "type": "string"},
                                "datatype": "string"
                            }]
                        },
                        "snaks-order": ["P248", "P304"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "38a9c57a5c62a707adc86decd2bd00be89eab6f3",
                        "datavalue": {"value": {"text": "Leeu", "language": "af"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$5E731B05-20D6-491B-97E7-94D90CBB70F0",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "a4455f1ef49d7d17896563760a420031c41d65c1",
                        "datavalue": {"value": {"text": "Gyata", "language": "ak"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$721B4D81-D948-4002-A13E-0B2567626FD6",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "b955c9239d6ced23c0db577e20219b0417a2dd9b",
                        "datavalue": {"value": {"text": "Ley\u00f3n", "language": "an"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$E2B52F3D-B12D-48B5-86EA-6A4DCBC091D3",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "e18a8ecb17321c203fcf8f402e82558ce0599b39",
                        "datavalue": {"value": {"text": "Li\u00f3n", "language": "an"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$339ADC90-41C6-4CDB-B6C3-DA9F952FCC15",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "297bf417fff1510d19b27c08fa9f34e2653b9510",
                        "datavalue": {
                            "value": {"text": "\u0623\u064e\u0633\u064e\u062f\u064c", "language": "ar"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$F1849268-0E70-4EC0-A630-EC0D2DCBB298",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "5577ef6920a3ade2365d878740d1d097fcdae399",
                        "datavalue": {"value": {"text": "L\u00e9we", "language": "bar"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$BDD65B40-7ECB-4725-B33F-417A83AF5102",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "de8fa35eca4e61dfb8fe2df360e734fb1cd37092",
                        "datavalue": {"value": {"text": "L\u00f6we", "language": "bar"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$486EE5F1-9AB5-4789-98AC-E435D81E784F",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "246c27f44da8bedd2e3313de393fe648b2b40ea9",
                        "datavalue": {
                            "value": {"text": "\u041b\u0435\u045e (Lew)", "language": "be"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$47AA6BD4-0B09-4B20-9092-0AEAD8056157",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "64c42db53ef288871161f0a656808f06daae817d",
                        "datavalue": {
                            "value": {"text": "\u041b\u044a\u0432 (L\u0103v)", "language": "bg"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$ADF0B08A-9626-4821-8118-0A875CBE5FB9",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "6041e2730af3095f4f0cbf331382e22b596d2305",
                        "datavalue": {
                            "value": {"text": "\u09b8\u09bf\u0982\u09b9", "language": "bn"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$8DF5BDCD-B470-46C3-A44A-7375B8A5DCDE",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "8499f437dc8678b0c4b740b40cab41031fce874d",
                        "datavalue": {"value": {"text": "Lle\u00f3", "language": "ca"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$F55C3E63-DB2C-4F6D-B10B-4C1BB70C06A0",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "b973abb618a6f17b8a9547b852e5817b5c4da00b",
                        "datavalue": {
                            "value": {"text": "\u041b\u043e\u044c\u043c", "language": "ce"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$F32B0BFA-3B85-4A26-A888-78FD8F09F943",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "62f53c7229efad1620a5cce4dc5a535d88c4989f",
                        "datavalue": {"value": {"text": "Lev", "language": "cs"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$1630DAB7-C4D0-4268-A598-8BBB9480221E",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "0df7e23666c947b42aea5572a9f5a987229718d3",
                        "datavalue": {"value": {"text": "Llew", "language": "cy"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$F33991E8-A532-47F5-B135-A13761DB2E95",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "14942ad0830a0eb7b06704234eea637f99b53a24",
                        "datavalue": {"value": {"text": "L\u00f8ve", "language": "da"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$478F0603-640A-44BE-9453-700FDD32100F",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "8af089542ef6207b918f656bcf9a96e745970915",
                        "datavalue": {"value": {"text": "L\u00f6we", "language": "de"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P7018": [{
                            "snaktype": "value",
                            "property": "P7018",
                            "hash": "2da239e18a0208847a72fbeab011c8c2fb3b4d99",
                            "datavalue": {
                                "value": {"entity-type": "sense", "id": "L41680-S1"},
                                "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-sense"
                        }]
                    },
                    "qualifiers-order": ["P7018"],
                    "id": "Q140$11F5F498-3688-4F4B-B2FA-7121BE5AA701",
                    "rank": "normal",
                    "references": [{
                        "hash": "cdc389b112247cb50b855fb86e98b7a7892e96f0",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "e17975e5c866df46673c91b2287a82cf23d14f5a",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 27310853,
                                        "id": "Q27310853"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P304": [{
                                "snaktype": "value",
                                "property": "P304",
                                "hash": "ff7ad3502ff7a4a9b0feeb4248a7bed9767a1ec6",
                                "datavalue": {"value": "166", "type": "string"},
                                "datatype": "string"
                            }]
                        },
                        "snaks-order": ["P248", "P304"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "c0c8b50001810c1ec643b88479df82ea85c819a2",
                        "datavalue": {"value": {"text": "Dzata", "language": "ee"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$8F6EC307-A293-4AFC-8154-E3FF187C0D7D",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "57a3384eeb13d1bcffeb3cf0efd0f3e3f511b35d",
                        "datavalue": {
                            "value": {
                                "text": "\u039b\u03b9\u03bf\u03bd\u03c4\u03ac\u03c1\u03b9 (Liond\u00e1ri)",
                                "language": "el"
                            }, "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$560B3341-3E06-4D09-8869-FC47C841D14C",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "ee7109a46f8259ae6f52791cfe599b7c4c272831",
                        "datavalue": {"value": {"text": "Leono", "language": "eo"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$67F2B7A6-1C81-407A-AA61-A1BFF148EC69",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "3b8f4f61c3a18792bfaff5d332f03c80932dce05",
                        "datavalue": {"value": {"text": "Le\u00f3n", "language": "es"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$DB29EAF7-4405-4030-8056-ED17089B3805",
                    "rank": "normal",
                    "references": [{
                        "hash": "d3a8e536300044db1d823eae6891b2c7baa49f66",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "ba14d022d7e0c8b74595e7b8aaa1bc2451dd806a",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 32059, "id": "Q32059"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "620d2e76d21bb1d326fc360db5bece2070115240",
                                "datavalue": {
                                    "value": {
                                        "time": "+2016-10-19T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "41fffb83f35736829d60f782bdce68463f0ab47c",
                        "datavalue": {"value": {"text": "L\u00f5vi", "language": "et"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$19B76CC4-AA11-443B-BC76-DB2D0DA5B9CB",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "b96549e5ae538fb7e0b48089508333b31aec8fe7",
                        "datavalue": {"value": {"text": "Lehoi", "language": "eu"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$88F712C1-4EEF-4E42-8C61-84E55CF2DCE0",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "b343c833d8de3dfd5c8b31336afd137380ab42dc",
                        "datavalue": {
                            "value": {"text": "\u0634\u06cc\u0631 (\u0160ayr)", "language": "fa"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$B72DB989-EF39-42F5-8FA8-5FC669079DB7",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "51aaf9a4a7c5e77ba931a5280d1fec984c91963b",
                        "datavalue": {"value": {"text": "Leijona", "language": "fi"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$6861CDE9-707D-43AD-B352-3BCD7B9D4267",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "038249fb112acc26895af45fab412395f999ae11",
                        "datavalue": {"value": {"text": "Leyva", "language": "fo"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$A044100A-C49F-4AA6-8861-F0300F28126E",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "92ec25b64605d026b07b0cda6e623fbbf2f3dfb4",
                        "datavalue": {"value": {"text": "Lion", "language": "fr"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$122623FD-3915-49E9-8890-0B6883317507",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "59be091f7839e7a6061c6d1690ed77f3b21b9ff4",
                        "datavalue": {
                            "value": {"text": "L\u00f6\u00f6w", "language": "frr"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$76B87E52-A02C-4E99-A4B3-D6105B642521",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "126b0f2c5ed11124233dfefff8bd132a1fe1218a",
                        "datavalue": {
                            "value": {"text": "Le\u00f3n-leoa", "language": "gl"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$A4864784-EED3-4898-83FE-A2FCC0C3982E",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "49e0d3858de566edce1a28b0e96f42b2d0df718f",
                        "datavalue": {
                            "value": {"text": "\u0ab8\u0abf\u0a82\u0ab9", "language": "gu"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$4EE122CE-7671-480E-86A4-4A4DDABC04BA",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "dff0c422f7403c50d28dd51ca2989d03108b7584",
                        "datavalue": {"value": {"text": "Liona", "language": "haw"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$FBB6AC65-A224-4C29-8024-079C0687E9FB",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "c174addd56c0f42f6ec3e87c72fb9651e4923a00",
                        "datavalue": {
                            "value": {"text": "\u05d0\u05e8\u05d9\u05d4", "language": "he"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$B72D9BDB-A2CC-471D-AF20-8F7FB677D533",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "c38a63a06b569fc8fee3e98c4cf8d5501990811e",
                        "datavalue": {
                            "value": {"text": "si\u1e45ha)", "language": "hi"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$9AA9171C-E912-41F2-AB26-643AA538E644",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "94f073519a5b64c48398c73a5f0f135a4f0f4306",
                        "datavalue": {
                            "value": {"text": "\u0936\u0947\u0930", "language": "hi"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$0714B97B-03E0-4ACC-80A0-6A17874DDBA8",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "1fbda5b1494db298c698fc28ed0fe68b1c137b2e",
                        "datavalue": {
                            "value": {"text": "\u0938\u093f\u0902\u0939", "language": "hi"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$3CE22F68-038C-4A94-9A1F-96B82760DEB9",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "fac41ebd8d1da777acd93720267c7a70016156e4",
                        "datavalue": {"value": {"text": "Lav", "language": "hr"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$C5351C11-E287-4D3B-A9B2-56716F0E69E5",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "71e0bda709fb17d58f4bd8e12fff7f937a61673c",
                        "datavalue": {
                            "value": {"text": "Oroszl\u00e1n", "language": "hu"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$AD06E7D2-3B1F-4D14-B2E9-DD2513BE8B4B",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "05e86680d70a2c0adf9a6e6eb51bbdf8c6ae44bc",
                        "datavalue": {
                            "value": {"text": "\u0531\u057c\u0575\u0578\u0582\u056e", "language": "hy"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$3E02B802-8F7B-4C48-A3F9-FBBFDB0D8DB3",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "979f25bee6af37e19471530c6344a0d22a0d594c",
                        "datavalue": {"value": {"text": "Lj\u00f3n", "language": "is"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$59788C31-A354-4229-AD89-361CB6076EF7",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "789e5f5a7ec6003076bc7fd2996faf8ca8468719",
                        "datavalue": {"value": {"text": "Leone", "language": "it"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$4901AE59-7749-43D1-BC65-DEEC0DFEB72F",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "4a5bdf9bb40f1cab9a92b7dba1d1d74a8440c7ed",
                        "datavalue": {
                            "value": {"text": "\u30e9\u30a4\u30aa\u30f3 (Raion)", "language": "ja"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$4CF2E0D9-5CF3-46A3-A197-938E94270CE2",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "ebba3893211c78dad7ae74a51448e8c7f6e73309",
                        "datavalue": {
                            "value": {"text": "\uc0ac\uc790 (saja)", "language": "ko"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$64B6CECD-5FFE-4612-819F-CAB2E726B228",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "ed1fe1812cee80102262dd3b7e170759fbeab86a",
                        "datavalue": {
                            "value": {"text": "\u0410\u0440\u0441\u0442\u0430\u043d", "language": "ky"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$3D9597D3-E35F-4EFF-9CAF-E013B45F283F",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "a0868f5f83bb886a408aa9b25b95dbfc59bde4dc",
                        "datavalue": {"value": {"text": "Leo", "language": "la"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$4D650414-6AFE-430F-892F-B7774AC7AF70",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "054af77b10151632045612df9b96313dfcc3550c",
                        "datavalue": {"value": {"text": "Liew", "language": "li"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$D5B466A8-AEFB-4083-BF3E-194C5CE45CD3",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "9193a46891a365ee1b0a17dd6e2591babc642811",
                        "datavalue": {"value": {"text": "Nkosi", "language": "ln"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$55F213DF-5AAB-4490-83CB-B9E5D2B894CD",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "c5952ec6b650f1c66f37194eb88c2889560740b2",
                        "datavalue": {
                            "value": {"text": "Li\u016btas", "language": "lt"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$8551F80C-A244-4351-A98A-8A9F37A736A2",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "e3541d0807682631f8fff2d224b2cb1b3d2a4c11",
                        "datavalue": {"value": {"text": "Lauva", "language": "lv"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$488A2D59-533A-4C02-8AC3-01241FE63D94",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "22e20da399aff10787267691b5211b6fc0bddf38",
                        "datavalue": {
                            "value": {"text": "\u041b\u0430\u0432 (lav)", "language": "mk"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$9E2377E9-1D37-4BBC-A409-1C40CDD99A86",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "fe4c9bc3b3cce21a779f72fae808f8ed213d226b",
                        "datavalue": {
                            "value": {
                                "text": "\u0d38\u0d3f\u0d02\u0d39\u0d02 (simham)",
                                "language": "ml"
                            }, "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$8BEA9E08-4687-434A-9FB4-4B23B2C40838",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "85aa09066722caf2181681a24575ad89ca76210e",
                        "datavalue": {
                            "value": {"text": "si\u1e45ha)", "language": "mr"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$46B51EF5-7ADB-4637-B744-89AD1E3B5D19",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "441f3832d6e3c4439c6986075096c7021a0939dd",
                        "datavalue": {
                            "value": {"text": "\u0936\u0947\u0930 (\u015a\u0113ra)", "language": "mr"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$12BBC825-32E3-4026-A5E5-0330DEB21D79",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "89b35a359c3891dce190d778e9ae0a9634cfd71f",
                        "datavalue": {
                            "value": {"text": "\u0938\u093f\u0902\u0939 (singh", "language": "mr"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$006148E2-658F-4C74-9C3E-26488B7AEB8D",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "5723b45deee51dfe5a2555f2db17bad14acb298a",
                        "datavalue": {"value": {"text": "Iljun", "language": "mt"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$13D221F5-9763-4550-9CC3-9A697286B785",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "d1ce3ab04f25af38248152eb8caa286b63366c2a",
                        "datavalue": {"value": {"text": "Leeuw", "language": "nl"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$65E80D17-6F20-4BAE-A2B4-DD934C0BE153",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "12f3384cc32e65dfb501e2fee19ccf709f9df757",
                        "datavalue": {"value": {"text": "L\u00f8ve", "language": "nn"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$78E95514-1969-4DA3-97CD-0DBADF1223E7",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "a3fedaf780a0d004ba318881f6adbe173750d09e",
                        "datavalue": {"value": {"text": "L\u00f8ve", "language": "nb"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$809DE1EA-861E-4813-BED7-D9C465341CB3",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "695d2ef10540ba13cf8b3541daa1d39fd720eea0",
                        "datavalue": {
                            "value": {
                                "text": "N\u00e1shd\u00f3\u00edtsoh bitsiij\u012f\u02bc dadit\u0142\u02bcoo\u00edg\u00ed\u00ed",
                                "language": "nv"
                            }, "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$E9EDAF16-6650-40ED-B888-C524BD00DF40",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "3c143e8a8cebf92d76d3ae2d7e3bb3f87e963fb4",
                        "datavalue": {
                            "value": {
                                "text": "\u0a2c\u0a71\u0a2c\u0a30 \u0a38\u0a3c\u0a47\u0a30",
                                "language": "pa"
                            }, "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$13AE1DAB-4B29-49A5-9893-C0014C61D21E",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "195e48d11222aec830fb1d5c2de898c9528abc57",
                        "datavalue": {
                            "value": {"text": "lew afryka\u0144ski", "language": "pl"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$6966C1C3-9DD6-48BC-B511-B0827642E41D",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "8bd3ae632e7731ae9e72c50744383006ec6eb73e",
                        "datavalue": {"value": {"text": "Le\u00e3o", "language": "pt"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$BD454649-347E-4AE5-81B8-360C16C7CDA7",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "79d3336733b7bf4b7dadffd6d6ebabdb892074d1",
                        "datavalue": {"value": {"text": "Leu", "language": "ro"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$7323EF68-7AA0-4D38-82D8-0A94E61A26F0",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "376b852a92b6472e969ae7b995c4aacea23955eb",
                        "datavalue": {
                            "value": {"text": "\u041b\u0435\u0432 (Lev)", "language": "ru"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$A7C413B9-0916-4534-941D-C24BA0334816",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "aa323e0bea79d79900227699b3d42d689a772ca1",
                        "datavalue": {"value": {"text": "Lioni", "language": "sc"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$2EF83D2C-0DB9-4D3C-8FDD-86237E566260",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "a290fe08983742eac8b5bc479022564fb6b2ce81",
                        "datavalue": {"value": {"text": "Lev", "language": "sl"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$B276673A-08C1-47E2-99A9-D0861321E157",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "d3b070ff1452d47f87c109a9e0bfa52e61b24a4e",
                        "datavalue": {"value": {"text": "Libubesi", "language": "ss"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$86BFAB38-1DB8-4903-A17D-A6B8E81819CC",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "3adea59d97f3caf9bb6b1c3d7ae6365f7f656dca",
                        "datavalue": {"value": {"text": "Tau", "language": "st"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$2FA8893D-2401-42E9-8DC3-288CC1DEDB0C",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "0e73b32fe31a107a95de83706a12f2db419c6909",
                        "datavalue": {"value": {"text": "Lejon", "language": "sv"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$1A8E006E-CC7B-4066-9DE7-9B82D096779E",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "34550af2fdc48f77cf66cabc5c59d1acf1d8afd0",
                        "datavalue": {"value": {"text": "Simba", "language": "sw"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$B02CA616-44CF-4AA6-9734-2C05810131EB",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "701f87cf9926c9af2c41434ff130dcb234a6cd95",
                        "datavalue": {
                            "value": {
                                "text": "\u0b9a\u0bbf\u0b99\u0bcd\u0b95\u0bae\u0bcd",
                                "language": "ta"
                            }, "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$DA87A994-A002-45AD-A71F-99FB72F8B92F",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "856fd4809c90e3c34c6876e4410661dc04f5da8d",
                        "datavalue": {
                            "value": {"text": "\u0e2a\u0e34\u0e07\u0e42\u0e15", "language": "th"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$BDA8E989-3537-4662-8CC3-33534705A7F1",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "f8598a8369426da0c86bf8bab356a927487eae66",
                        "datavalue": {"value": {"text": "Aslan", "language": "tr"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$AAE5F227-C0DB-4DF3-B1F4-517699BBDDF1",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "f3c8320bd46913aee164999ab7f68388c1bd9920",
                        "datavalue": {
                            "value": {"text": "\u041b\u0435\u0432 (Lev)", "language": "uk"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$494C3503-6016-4539-83AF-6344173C2DCB",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "6cc2d534293320533e15dc713f1d2c07b3811b6a",
                        "datavalue": {"value": {"text": "Leon", "language": "vec"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$E6F1DA81-9F36-4CC8-B57E-95E3BDC2F5D0",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "32553481e45abf6f5e6292baea486e978c36f8fe",
                        "datavalue": {
                            "value": {"text": "S\u01b0 t\u1eed", "language": "vi"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$11D7996C-0492-41CC-AEE7-3C136172DFC7",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "69077fc29f9251d1de124cd3f3c45cd6f0bb6b65",
                        "datavalue": {
                            "value": {"text": "\u05dc\u05d9\u05d9\u05d1", "language": "yi"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$969FEF9A-C1C7-41FE-8181-07F6D87B0346",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "e3aaa8cde18be4ea6b4af6ca62b83e7dc23d76e1",
                        "datavalue": {
                            "value": {"text": "\u72ee\u5b50 (sh\u012bzi)", "language": "zh"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$3BC22F6C-F460-4354-9BA2-28CEDA9FF170",
                    "rank": "normal",
                    "references": [{
                        "hash": "2e0c13df5b13edc9b3db9d8129e466c0894710ac",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "2b1e96d67dc01973d72472f712fd98ce87c6f0d7",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 13679, "id": "Q13679"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "98f5efae94b2bb9f8ffee6c677ee71f836743ef6",
                        "datavalue": {
                            "value": {"text": "Lion d'Afrique", "language": "fr"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$62D09BBF-718A-4139-AF50-DA4185ED67F2",
                    "rank": "normal",
                    "references": [{
                        "hash": "362e3c5d6de1d193ef97205ba38834ba075191fc",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "ba14d022d7e0c8b74595e7b8aaa1bc2451dd806a",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 32059, "id": "Q32059"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "c7813bad20c2553e26e45c37e3502ce7252312df",
                                "datavalue": {
                                    "value": {
                                        "time": "+2016-10-20T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "c584bdbd3cdc1215292a4971b920c684d103ea06",
                        "datavalue": {
                            "value": {"text": "African Lion", "language": "en"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    },
                    "type": "statement",
                    "id": "Q140$C871BB58-C689-4DBA-A088-DAC205377979",
                    "rank": "normal",
                    "references": [{
                        "hash": "eada84c58a38325085267509899037535799e978",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "ba14d022d7e0c8b74595e7b8aaa1bc2451dd806a",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 32059, "id": "Q32059"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "3e51c3c32949f8a45f2c3331f55ea6ae68ecf3fe",
                                "datavalue": {
                                    "value": {
                                        "time": "+2016-10-21T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "1d03eace9366816c6fda340c0390caac2f3cea8e",
                        "datavalue": {"value": {"text": "L\u00e9iw", "language": "lb"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    }, "type": "statement", "id": "Q140$c65c7614-4d6e-3a87-9771-4f8c13618249", "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "925c7abced1e89fa7e8000dc9dc78627cdac9769",
                        "datavalue": {
                            "value": {"text": "Lle\u00f3n", "language": "ast"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    }, "type": "statement", "id": "Q140$1024eadb-45dd-7d9a-15f6-8602946ba661", "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "0bda7868c3f498ba6fde78d46d0fbcf286e42dd8",
                        "datavalue": {
                            "value": {"text": "\u0644\u064e\u064a\u0652\u062b\u064c", "language": "ar"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    }, "type": "statement", "id": "Q140$c226ff70-48dd-7b4d-00ff-7a683fe510aa", "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "28de99c4aa35cc049cf8c9dd18af1791944137d9",
                        "datavalue": {
                            "value": {"text": "\u10da\u10dd\u10db\u10d8", "language": "ka"},
                            "type": "monolingualtext"
                        },
                        "datatype": "monolingualtext"
                    }, "type": "statement", "id": "Q140$8fe60d1a-465a-9614-cbe4-595e22429b0c", "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "4550db0f44e21c5eadeaa5a1d8fc614c9eb05f52",
                        "datavalue": {"value": {"text": "leon", "language": "ga"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    }, "type": "statement", "id": "Q140$4950cb9c-4f1e-ce27-0d8c-ba3f18096044", "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1843",
                        "hash": "9d268eb76ed921352c205b3f890d1f9428f638f3",
                        "datavalue": {"value": {"text": "Singa", "language": "ms"}, "type": "monolingualtext"},
                        "datatype": "monolingualtext"
                    }, "type": "statement", "id": "Q140$67401360-49dd-b13c-8269-e703b30c9a53", "rank": "normal"
                }],
                "P627": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P627",
                        "hash": "3642ac96e05180279c47a035c129d3af38d85027",
                        "datavalue": {"value": "15951", "type": "string"},
                        "datatype": "string"
                    },
                    "type": "statement",
                    "id": "Q140$6BE03095-BC68-4CE5-BB99-9F3E33A6F31D",
                    "rank": "normal",
                    "references": [{
                        "hash": "182efbdb9110d036ca433f3b49bd3a1ae312858b",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "ba14d022d7e0c8b74595e7b8aaa1bc2451dd806a",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 32059, "id": "Q32059"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "8c1c5174f4811115ea8a0def725fdc074c2ef036",
                                "datavalue": {
                                    "value": {
                                        "time": "+2016-07-10T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P2833": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P2833",
                        "hash": "519877b77b20416af2401e5c0645954c6700d6fd",
                        "datavalue": {"value": "panthera-leo", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$C0A723AE-ED2E-4FDC-827F-496E4CF29A52", "rank": "normal"
                }],
                "P3063": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P3063",
                        "hash": "81cdb0273eaf0a0126b62e2ff43b8e09505eea54",
                        "datavalue": {
                            "value": {
                                "amount": "+108",
                                "unit": "http://www.wikidata.org/entity/Q573",
                                "upperBound": "+116",
                                "lowerBound": "+100"
                            }, "type": "quantity"
                        },
                        "datatype": "quantity"
                    },
                    "type": "statement",
                    "id": "Q140$878ff87d-40d0-bb2b-c83d-4cef682c2687",
                    "rank": "normal",
                    "references": [{
                        "hash": "7d748004a43983fabae420123742fda0e9b52840",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "f618501ace3a6524b053661d067b775547f96f58",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 26706243,
                                        "id": "Q26706243"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P478": [{
                                "snaktype": "value",
                                "property": "P478",
                                "hash": "ca3c5e6054c169ee3d0dfaf660f3eecd77942070",
                                "datavalue": {"value": "4", "type": "string"},
                                "datatype": "string"
                            }],
                            "P304": [{
                                "snaktype": "value",
                                "property": "P304",
                                "hash": "dd1977567f22f4cf510adfaadf5e3574813b3521",
                                "datavalue": {"value": "46", "type": "string"},
                                "datatype": "string"
                            }]
                        },
                        "snaks-order": ["P248", "P478", "P304"]
                    }]
                }],
                "P3031": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P3031",
                        "hash": "e6271e8d12b20c9735d2bbd80eed58581059bf3a",
                        "datavalue": {"value": "PNTHLE", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$65AD2857-AB65-4CC0-9AB9-9D6C924784FE", "rank": "normal"
                }],
                "P3151": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P3151",
                        "hash": "e85e5599d303d9a6bb360f3133fb69a76d98d0e2",
                        "datavalue": {"value": "41964", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$15D7A4EB-F0A3-4C61-8D2B-E557D7BF5CF7", "rank": "normal"
                }],
                "P3186": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P3186",
                        "hash": "85ec7843064210afdfef6ec565a47f229c6d15e5",
                        "datavalue": {"value": "644245", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$6903E136-2DB2-42C9-98CB-82F61208FDAD",
                    "rank": "normal",
                    "references": [{
                        "hash": "5790a745e549ea7e4e6d7ca467148b544529ba96",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "c897ca3efd1604ef7b80a14ac0d2b8d6849c0856",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 26936509,
                                        "id": "Q26936509"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "555ca5385c445e4fd4762281d4873682eff2ce30",
                                "datavalue": {
                                    "value": {
                                        "time": "+2016-09-24T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }, {
                        "hash": "3edd37192f877cad0ff97acc3db56ef2cc83945b",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "4f7c4fd187630ba8cbb174c2756113983df4ce82",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 45029859,
                                        "id": "Q45029859"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "56b6aa0388c9a2711946589902bc195718bb0675",
                                "datavalue": {
                                    "value": {
                                        "time": "+2017-12-26T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }, {
                        "hash": "1318ed8ea451b84fe98461305665d8688603bab3",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "0fbeeecce08896108ed797d8ec22c7c10a6015e2",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 45029998,
                                        "id": "Q45029998"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "4bac1c0d2ffc45d91b51fc0881eb6bcc7916e854",
                                "datavalue": {
                                    "value": {
                                        "time": "+2018-01-02T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }, {
                        "hash": "6f761664a6f331d95bbaa1434447d82afd597a93",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "6c09d1d89e83bd0dfa6c94e01d24a9a47489d83e",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 58035056,
                                        "id": "Q58035056"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "03182012ca72fcd757b8a1fe05ba927cbe9ef374",
                                "datavalue": {
                                    "value": {
                                        "time": "+2018-11-02T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P3485": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P3485",
                        "hash": "df4e58fc2a196833ab3e33483099e2481e61ba9e",
                        "datavalue": {"value": {"amount": "+112", "unit": "1"}, "type": "quantity"},
                        "datatype": "quantity"
                    },
                    "type": "statement",
                    "id": "Q140$4B70AA09-AE2F-4F4C-9BAF-09890CDA11B8",
                    "rank": "normal",
                    "references": [{
                        "hash": "fa278ebfc458360e5aed63d5058cca83c46134f1",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "e4f6d9441d0600513c4533c672b5ab472dc73694",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 328, "id": "Q328"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }],
                "P3827": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P3827",
                        "hash": "6bb26d581721d7330c407259d46ab5e25cc4a6b1",
                        "datavalue": {"value": "lions", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$CCDE6F7D-B4EA-4875-A4D6-5649ACFA8E2F", "rank": "normal"
                }],
                "P268": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P268",
                        "hash": "a20cdf81e39cd47f4da30073671792380029924c",
                        "datavalue": {"value": "11932251d", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$000FDB77-C70C-4464-9F00-605787964BBA",
                    "rank": "normal",
                    "references": [{
                        "hash": "d4bd87b862b12d99d26e86472d44f26858dee639",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "f30cbd35620c4ea6d0633aaf0210a8916130469b",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 8447, "id": "Q8447"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }],
                "P3417": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P3417",
                        "hash": "e3b5d21350aef37f27ad8b24142d6b83d9eec0a6",
                        "datavalue": {"value": "Lions", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$1f96d096-4e4b-06de-740f-7b7215e5ae3f", "rank": "normal"
                }],
                "P4024": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P4024",
                        "hash": "a698e7dcd6f9b0b00ee8e02846c668db83064833",
                        "datavalue": {"value": "Panthera_leo", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$F5DC21E8-BF52-4A0D-9A15-63B89297BD70",
                    "rank": "normal",
                    "references": [{
                        "hash": "d4bd87b862b12d99d26e86472d44f26858dee639",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "f30cbd35620c4ea6d0633aaf0210a8916130469b",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 8447, "id": "Q8447"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }],
                "P1225": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1225",
                        "hash": "9af40267f10f15926877e9a3f78faeab7b0dda82",
                        "datavalue": {"value": "10665610", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$268074ED-3CD7-46C9-A8FF-8C3679C45547", "rank": "normal"
                }],
                "P4728": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P4728",
                        "hash": "37eafa980604019b327b1a3552313fb7ae256697",
                        "datavalue": {"value": "105514", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$50C24ECC-C42C-4A58-8F34-6AF0AC6C4EFE",
                    "rank": "normal",
                    "references": [{
                        "hash": "d4bd87b862b12d99d26e86472d44f26858dee639",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "f30cbd35620c4ea6d0633aaf0210a8916130469b",
                                "datavalue": {
                                    "value": {"entity-type": "item", "numeric-id": 8447, "id": "Q8447"},
                                    "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }],
                "P3219": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P3219",
                        "hash": "dedb8825588940caff5a34d04a0e69af296f05dd",
                        "datavalue": {"value": "lion", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$2A5A2CA3-AB6E-4F68-927F-042D1BD22915", "rank": "normal"
                }],
                "P1343": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1343",
                        "hash": "5b0ef3d5413cd39d887fbe70d2d3b3f4a94ea9d8",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 1138524, "id": "Q1138524"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P805": [{
                            "snaktype": "value",
                            "property": "P805",
                            "hash": "f7bf629d348040dd1a59dc5a3199edb50279e8f5",
                            "datavalue": {
                                "value": {
                                    "entity-type": "item",
                                    "numeric-id": 19997008,
                                    "id": "Q19997008"
                                }, "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P805"],
                    "id": "Q140$DFE4D4B0-0D84-41F2-B448-4A81AC982927",
                    "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1343",
                        "hash": "6bc15c6f82feca4f3b173c90209a416f99464cac",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 4086271, "id": "Q4086271"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P805": [{
                            "snaktype": "value",
                            "property": "P805",
                            "hash": "69ace59e966574e4ffb454d26940a58fb45ed7de",
                            "datavalue": {
                                "value": {
                                    "entity-type": "item",
                                    "numeric-id": 25295952,
                                    "id": "Q25295952"
                                }, "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P805"],
                    "id": "Q140$b82b0461-4ff0-10ac-9825-d4b95fc7a85a",
                    "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1343",
                        "hash": "ecb04d74140f2ee856c06658b03ec90a21c2edf2",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 1970746, "id": "Q1970746"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P805": [{
                            "snaktype": "value",
                            "property": "P805",
                            "hash": "169607f1510535f3e1c5e7debce48d1903510f74",
                            "datavalue": {
                                "value": {
                                    "entity-type": "item",
                                    "numeric-id": 30202801,
                                    "id": "Q30202801"
                                }, "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P805"],
                    "id": "Q140$bd49e319-477f-0cd2-a404-642156321081",
                    "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1343",
                        "hash": "88389772f86dcd7d415ddd029f601412e5cc894a",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 602358, "id": "Q602358"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P805": [{
                            "snaktype": "value",
                            "property": "P805",
                            "hash": "67f2e59eb3f6480bdbaa3954055dfbf8fd045bc4",
                            "datavalue": {
                                "value": {
                                    "entity-type": "item",
                                    "numeric-id": 24451091,
                                    "id": "Q24451091"
                                }, "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P805"],
                    "id": "Q140$906ae22e-4c63-d325-c91e-dc3ee6b7504d",
                    "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1343",
                        "hash": "42346dfe9209b7359c1f5db829a368b38d407797",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 19180675, "id": "Q19180675"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P805": [{
                            "snaktype": "value",
                            "property": "P805",
                            "hash": "195bd04166c04364a657fcd18abd1a082dad3cb0",
                            "datavalue": {
                                "value": {
                                    "entity-type": "item",
                                    "numeric-id": 24758519,
                                    "id": "Q24758519"
                                }, "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P805"],
                    "id": "Q140$92e7eeb1-4a72-9abf-4260-a96abc32bc42",
                    "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1343",
                        "hash": "7d6f86cef085693a10b0e0663a0960f58d0e15e2",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 4173137, "id": "Q4173137"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P805": [{
                            "snaktype": "value",
                            "property": "P805",
                            "hash": "75e5bdfbbf8498b195840749ef3a9bd309b796f7",
                            "datavalue": {
                                "value": {
                                    "entity-type": "item",
                                    "numeric-id": 25054587,
                                    "id": "Q25054587"
                                }, "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P805"],
                    "id": "Q140$6c9c319a-4e71-540e-8866-a6017f0e6bae",
                    "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1343",
                        "hash": "75dd89e79770a3e631dbba27144940f8f1bc1773",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 1768721, "id": "Q1768721"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P805": [{
                            "snaktype": "value",
                            "property": "P805",
                            "hash": "a1b448ff5f8818a2254835e0816a03a785bac665",
                            "datavalue": {
                                "value": {
                                    "entity-type": "item",
                                    "numeric-id": 96599885,
                                    "id": "Q96599885"
                                }, "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P805"],
                    "id": "Q140$A0FD93F4-A401-47A1-BC8E-F0D35A8E8BAD",
                    "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1343",
                        "hash": "4cfd4eb1fe49d401455df557a7d9b1154f22a725",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 3181656, "id": "Q3181656"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P1932": [{
                            "snaktype": "value",
                            "property": "P1932",
                            "hash": "a3f6e8ce10c4527693415dbc99b5ea285b2f411c",
                            "datavalue": {"value": "Lion, The", "type": "string"},
                            "datatype": "string"
                        }]
                    },
                    "qualifiers-order": ["P1932"],
                    "id": "Q140$100f480e-4ad9-b340-8251-4e875d00315d",
                    "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1343",
                        "hash": "d5011798f92464584d8ccfc5f19f18f3659668bb",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 106727050, "id": "Q106727050"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P1810": [{
                            "snaktype": "value",
                            "property": "P1810",
                            "hash": "7d78547303d5e9e014a7c8cef6072faee91088ce",
                            "datavalue": {"value": "Lions", "type": "string"},
                            "datatype": "string"
                        }],
                        "P585": [{
                            "snaktype": "value",
                            "property": "P585",
                            "hash": "ffb837135313cad3b2545c4b9ce5ee416deda3e2",
                            "datavalue": {
                                "value": {
                                    "time": "+2021-05-07T00:00:00Z",
                                    "timezone": 0,
                                    "before": 0,
                                    "after": 0,
                                    "precision": 11,
                                    "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                }, "type": "time"
                            },
                            "datatype": "time"
                        }]
                    },
                    "qualifiers-order": ["P1810", "P585"],
                    "id": "Q140$A4D208BD-6A69-4561-B402-2E17AAE6E028",
                    "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1343",
                        "hash": "d12a9ecb0df8fce076df898533fea0339e5881bd",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 10886720, "id": "Q10886720"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P805": [{
                            "snaktype": "value",
                            "property": "P805",
                            "hash": "52ddab8de77b01303d508a1de615ca13060ec188",
                            "datavalue": {
                                "value": {
                                    "entity-type": "item",
                                    "numeric-id": 107513600,
                                    "id": "Q107513600"
                                }, "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P805"],
                    "id": "Q140$07daf548-4c8d-fa7c-16f4-4c7062f7e48a",
                    "rank": "normal"
                }],
                "P4733": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P4733",
                        "hash": "fc789f67f6d4d9b5879a8631eefe61f51a60f979",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 3177438, "id": "Q3177438"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "id": "Q140$3773ba15-4723-261a-f9a8-544496938efa",
                    "rank": "normal",
                    "references": [{
                        "hash": "649ae5511d5389d870d19e83543fa435de796536",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "9931bb1a17358e94590f8fa0b9550de881616d97",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 784031,
                                        "id": "Q784031"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }],
                "P5019": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P5019",
                        "hash": "44aac3d8a2bd240b4bc81741a0980dc48781181b",
                        "datavalue": {"value": "l\u00f6we", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$2be40b22-49f1-c9e7-1812-8e3fd69d662d", "rank": "normal"
                }],
                "P2924": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P2924",
                        "hash": "710d75c07e28936461d03b20b2fc7455599301a1",
                        "datavalue": {"value": "2135124", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$6326B120-CE04-4F02-94CA-D7BBC2589A39", "rank": "normal"
                }],
                "P5055": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P5055",
                        "hash": "c5264fc372b7e66566d54d73f86c8ab8c43fb033",
                        "datavalue": {"value": "10196306", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$F8D43B92-CC3A-4967-A28F-C3E6308946F6",
                    "rank": "normal",
                    "references": [{
                        "hash": "7131076724beb97fed351cb7e7f6ac6d61dd05b9",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "1e3ad3cb9e0170e28b7c7c335fba55cafa6ef789",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 51885189,
                                        "id": "Q51885189"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "2b1446fcfcd471ab6d36521b4ad2ac183ff8bc0d",
                                "datavalue": {
                                    "value": {
                                        "time": "+2018-06-07T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P5221": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P5221",
                        "hash": "623ca9614dd0d8b8720bf35b4d57be91dcef5fe6",
                        "datavalue": {"value": "123566", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$472fe544-402d-2574-6b2e-98c5b01bb294", "rank": "normal"
                }],
                "P5698": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P5698",
                        "hash": "e966694183143d709403fae7baabb5fdf98d219a",
                        "datavalue": {"value": "70719", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$EF3F712D-B0E5-4151-81E4-67804D6241E6", "rank": "normal"
                }],
                "P5397": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P5397",
                        "hash": "49a827bc1853a3b5612b437dd61eb5c28dc0bab0",
                        "datavalue": {"value": "12799", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$DE37BF10-A59D-48F1-926A-7303EDEEDDD0", "rank": "normal"
                }],
                "P6033": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P6033",
                        "hash": "766727ded3adbbfec0bed77affc89ea4e5214d65",
                        "datavalue": {"value": "panthera-leo", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$A27BADCC-0F72-45A5-814B-BDE62BD7A1B4", "rank": "normal"
                }],
                "P18": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P18",
                        "hash": "d3ceb5bb683335c91781e4d52906d2fb1cc0c35d",
                        "datavalue": {"value": "Lion waiting in Namibia.jpg", "type": "string"},
                        "datatype": "commonsMedia"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P21": [{
                            "snaktype": "value",
                            "property": "P21",
                            "hash": "0576a008261e5b2544d1ff3328c94bd529379536",
                            "datavalue": {
                                "value": {"entity-type": "item", "numeric-id": 44148, "id": "Q44148"},
                                "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }],
                        "P2096": [{
                            "snaktype": "value",
                            "property": "P2096",
                            "hash": "6923fafa02794ae7d0773e565de7dd49a2694b38",
                            "datavalue": {
                                "value": {"text": "Lle\u00f3", "language": "ca"},
                                "type": "monolingualtext"
                            },
                            "datatype": "monolingualtext"
                        }, {
                            "snaktype": "value",
                            "property": "P2096",
                            "hash": "563784f05211416fda8662a0773f52165ccf6c2a",
                            "datavalue": {
                                "value": {"text": "Machu de lle\u00f3n en Namibia", "language": "ast"},
                                "type": "monolingualtext"
                            },
                            "datatype": "monolingualtext"
                        }, {
                            "snaktype": "value",
                            "property": "P2096",
                            "hash": "52722803d98964d77b79d3ed62bd24b4f25e6993",
                            "datavalue": {
                                "value": {"text": "\u043b\u044a\u0432", "language": "bg"},
                                "type": "monolingualtext"
                            },
                            "datatype": "monolingualtext"
                        }]
                    },
                    "qualifiers-order": ["P21", "P2096"],
                    "id": "q140$5903FDF3-DBBD-4527-A738-450EAEAA45CB",
                    "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P18",
                        "hash": "6907d4c168377a18d6a5eb390ab32a7da42d8218",
                        "datavalue": {"value": "Okonjima Lioness.jpg", "type": "string"},
                        "datatype": "commonsMedia"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P21": [{
                            "snaktype": "value",
                            "property": "P21",
                            "hash": "a274865baccd3ff04c28d5ffdcc12e0079f5a201",
                            "datavalue": {
                                "value": {"entity-type": "item", "numeric-id": 43445, "id": "Q43445"},
                                "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }],
                        "P2096": [{
                            "snaktype": "value",
                            "property": "P2096",
                            "hash": "a9d1363e8fc83ba822c45a81de59fe5b8eb434cf",
                            "datavalue": {
                                "value": {
                                    "text": "\u043b\u044a\u0432\u0438\u0446\u0430",
                                    "language": "bg"
                                }, "type": "monolingualtext"
                            },
                            "datatype": "monolingualtext"
                        }, {
                            "snaktype": "value",
                            "property": "P2096",
                            "hash": "b36ab7371664b7b62ee7be65db4e248074a5330c",
                            "datavalue": {
                                "value": {"text": "Lleona n'Okonjima Lodge, Namibia", "language": "ast"},
                                "type": "monolingualtext"
                            },
                            "datatype": "monolingualtext"
                        }, {
                            "snaktype": "value",
                            "property": "P2096",
                            "hash": "31c78a574eabc0426d7984aa4988752e35b71f0c",
                            "datavalue": {"value": {"text": "lwica", "language": "pl"}, "type": "monolingualtext"},
                            "datatype": "monolingualtext"
                        }]
                    },
                    "qualifiers-order": ["P21", "P2096"],
                    "id": "Q140$4da15225-f7dc-4942-a685-0669e5d3af14",
                    "rank": "normal"
                }],
                "P6573": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P6573",
                        "hash": "c27b457b12eeecb053d60af6ecf9b0baa133bef5",
                        "datavalue": {"value": "L\u00f6we", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$45B1C3EB-E335-4245-A193-8C48B4953E51", "rank": "normal"
                }],
                "P443": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P443",
                        "hash": "8a9afb9293804f976c415060900bf9afbc2cfdff",
                        "datavalue": {"value": "LL-Q188 (deu)-Sebastian Wallroth-L\u00f6we.wav", "type": "string"},
                        "datatype": "commonsMedia"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P407": [{
                            "snaktype": "value",
                            "property": "P407",
                            "hash": "46bfd327b830f66f7061ea92d1be430c135fa91f",
                            "datavalue": {
                                "value": {"entity-type": "item", "numeric-id": 188, "id": "Q188"},
                                "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P407"],
                    "id": "Q140$5EC64299-429F-45E8-B18F-19325401189C",
                    "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P443",
                        "hash": "7d058dfd1e8a41f026974faec3dc0588e29c6854",
                        "datavalue": {"value": "LL-Q150 (fra)-Ash Crow-lion.wav", "type": "string"},
                        "datatype": "commonsMedia"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P407": [{
                            "snaktype": "value",
                            "property": "P407",
                            "hash": "d197d0a5efa4b4c23a302a829dd3ef43684fe002",
                            "datavalue": {
                                "value": {"entity-type": "item", "numeric-id": 150, "id": "Q150"},
                                "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P407"],
                    "id": "Q140$A4575261-6577-4EF6-A0C9-DA5FA523D1C2",
                    "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P443",
                        "hash": "79b9f51c9b4eec305813d5bb697b403d798cf1c5",
                        "datavalue": {
                            "value": "LL-Q33965 (sat)-Joy sagar Murmu-\u1c60\u1c69\u1c5e.wav",
                            "type": "string"
                        },
                        "datatype": "commonsMedia"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P407": [{
                            "snaktype": "value",
                            "property": "P407",
                            "hash": "58ae6998321952889f733126c11c582eeef20e72",
                            "datavalue": {
                                "value": {"entity-type": "item", "numeric-id": 33965, "id": "Q33965"},
                                "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P407"],
                    "id": "Q140$7eedc8fa-4d1c-7ee9-3c67-0c89ef464d9f",
                    "rank": "normal",
                    "references": [{
                        "hash": "d0b5c88b6f49dda9160c706291a9b8645825d99c",
                        "snaks": {
                            "P854": [{
                                "snaktype": "value",
                                "property": "P854",
                                "hash": "38c1012cea9eb73cf1bd11eba0c2f745d2463340",
                                "datavalue": {"value": "https://lingualibre.org/wiki/Q403065", "type": "string"},
                                "datatype": "url"
                            }]
                        },
                        "snaks-order": ["P854"]
                    }]
                }],
                "P1296": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1296",
                        "hash": "c1f872d4cd22219a7315c0198a83c1918ded97ee",
                        "datavalue": {"value": "0120024", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$6C51384B-2EBF-4E6B-9201-A44F0A145C04", "rank": "normal"
                }],
                "P486": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P486",
                        "hash": "b7003b0fb28287301200b6b3871a5437d877913b",
                        "datavalue": {"value": "D008045", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$B2F98DD2-B679-43DD-B731-FA33FB1EE4B9", "rank": "normal"
                }],
                "P989": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P989",
                        "hash": "132884b2a696a8b56c8b1460e126f745e2fa6d01",
                        "datavalue": {"value": "Ru-Lion (intro).ogg", "type": "string"},
                        "datatype": "commonsMedia"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P407": [{
                            "snaktype": "value",
                            "property": "P407",
                            "hash": "d291ddb7cd77c94a7bd709a8395934147e0864fc",
                            "datavalue": {
                                "value": {"entity-type": "item", "numeric-id": 7737, "id": "Q7737"},
                                "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P407"],
                    "id": "Q140$857D8831-673B-427E-A182-6A9FFA980424",
                    "rank": "normal"
                }],
                "P51": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P51",
                        "hash": "73b0e8c8458ebc27374fd08d8ef5241f2f28e3e9",
                        "datavalue": {"value": "Lion raring-sound1TamilNadu178.ogg", "type": "string"},
                        "datatype": "commonsMedia"
                    }, "type": "statement", "id": "Q140$1c254aff-48b1-d3c5-930c-b360ce6fe043", "rank": "normal"
                }],
                "P4212": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P4212",
                        "hash": "e006ce3295d617a4818dc758c28f444446538019",
                        "datavalue": {"value": "pcrt5TAeZsO7W4", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$AD6CD534-1FD2-4AC7-9CF8-9D2B4C46927C", "rank": "normal"
                }],
                "P2067": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P2067",
                        "hash": "97a863433c30b47a6175abb95941d185397ea14a",
                        "datavalue": {
                            "value": {"amount": "+1.65", "unit": "http://www.wikidata.org/entity/Q11570"},
                            "type": "quantity"
                        },
                        "datatype": "quantity"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P642": [{
                            "snaktype": "value",
                            "property": "P642",
                            "hash": "f5e24bc6ec443d6cb3678e4561bc298090b54f60",
                            "datavalue": {
                                "value": {"entity-type": "item", "numeric-id": 4128476, "id": "Q4128476"},
                                "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P642"],
                    "id": "Q140$198da244-7e66-4258-9434-537e9ce0ffab",
                    "rank": "normal",
                    "references": [{
                        "hash": "94a79329d5eac70f7ddb005e0d1dc78c53e77797",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "4a7fef7ea264a7c71765ce60e3d42f4c043c9646",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 45106562,
                                        "id": "Q45106562"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P248"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P2067",
                        "hash": "ba9933059ce368e3afde1e96d78b1217172c954e",
                        "datavalue": {
                            "value": {"amount": "+188", "unit": "http://www.wikidata.org/entity/Q11570"},
                            "type": "quantity"
                        },
                        "datatype": "quantity"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P642": [{
                            "snaktype": "value",
                            "property": "P642",
                            "hash": "b388540fc86300a506b3a753ec58dec445525ffa",
                            "datavalue": {
                                "value": {
                                    "entity-type": "item",
                                    "numeric-id": 78101716,
                                    "id": "Q78101716"
                                }, "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }],
                        "P21": [{
                            "snaktype": "value",
                            "property": "P21",
                            "hash": "0576a008261e5b2544d1ff3328c94bd529379536",
                            "datavalue": {
                                "value": {"entity-type": "item", "numeric-id": 44148, "id": "Q44148"},
                                "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P642", "P21"],
                    "id": "Q140$a3092626-4295-efb8-bbb6-eed913d02fc7",
                    "rank": "normal",
                    "references": [{
                        "hash": "94a79329d5eac70f7ddb005e0d1dc78c53e77797",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "4a7fef7ea264a7c71765ce60e3d42f4c043c9646",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 45106562,
                                        "id": "Q45106562"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P248"]
                    }]
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P2067",
                        "hash": "6951281811b2a8a3a78044e2003d6c162d5ba1a3",
                        "datavalue": {
                            "value": {"amount": "+126", "unit": "http://www.wikidata.org/entity/Q11570"},
                            "type": "quantity"
                        },
                        "datatype": "quantity"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P642": [{
                            "snaktype": "value",
                            "property": "P642",
                            "hash": "b388540fc86300a506b3a753ec58dec445525ffa",
                            "datavalue": {
                                "value": {
                                    "entity-type": "item",
                                    "numeric-id": 78101716,
                                    "id": "Q78101716"
                                }, "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }],
                        "P21": [{
                            "snaktype": "value",
                            "property": "P21",
                            "hash": "a274865baccd3ff04c28d5ffdcc12e0079f5a201",
                            "datavalue": {
                                "value": {"entity-type": "item", "numeric-id": 43445, "id": "Q43445"},
                                "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P642", "P21"],
                    "id": "Q140$20d80fe2-4796-23d1-42c2-c103546aa874",
                    "rank": "normal",
                    "references": [{
                        "hash": "94a79329d5eac70f7ddb005e0d1dc78c53e77797",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "4a7fef7ea264a7c71765ce60e3d42f4c043c9646",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 45106562,
                                        "id": "Q45106562"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P248"]
                    }]
                }],
                "P7725": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P7725",
                        "hash": "e9338e052dfaa9267c2357bec2e167ca625af667",
                        "datavalue": {
                            "value": {
                                "amount": "+2.5",
                                "unit": "1",
                                "upperBound": "+4.0",
                                "lowerBound": "+1.0"
                            }, "type": "quantity"
                        },
                        "datatype": "quantity"
                    },
                    "type": "statement",
                    "id": "Q140$f1f04a23-0d34-484a-9419-78d12958170c",
                    "rank": "normal",
                    "references": [{
                        "hash": "94a79329d5eac70f7ddb005e0d1dc78c53e77797",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "4a7fef7ea264a7c71765ce60e3d42f4c043c9646",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 45106562,
                                        "id": "Q45106562"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P248"]
                    }]
                }],
                "P4214": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P4214",
                        "hash": "5a112dbdaed17b1ee3fe7a63b1f978e5fd41008a",
                        "datavalue": {
                            "value": {"amount": "+27", "unit": "http://www.wikidata.org/entity/Q577"},
                            "type": "quantity"
                        },
                        "datatype": "quantity"
                    },
                    "type": "statement",
                    "id": "Q140$ec1ccab2-f506-4c81-9179-4625bbbbbe27",
                    "rank": "normal",
                    "references": [{
                        "hash": "a8ccf5105b0e2623ae145dd8a9b927c9bd957ddf",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "5b45c23ddb076fe9c5accfe4a4bbd1c24c4c87cb",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 83566668,
                                        "id": "Q83566668"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P248"]
                    }]
                }],
                "P7862": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P7862",
                        "hash": "6e74ddb544498b93407179cc9a7f9b8610762ff5",
                        "datavalue": {
                            "value": {"amount": "+8", "unit": "http://www.wikidata.org/entity/Q5151"},
                            "type": "quantity"
                        },
                        "datatype": "quantity"
                    },
                    "type": "statement",
                    "id": "Q140$17b64a1e-4a13-9e2a-f8a2-a9317890aa53",
                    "rank": "normal",
                    "references": [{
                        "hash": "94a79329d5eac70f7ddb005e0d1dc78c53e77797",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "4a7fef7ea264a7c71765ce60e3d42f4c043c9646",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 45106562,
                                        "id": "Q45106562"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P248"]
                    }]
                }],
                "P7818": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P7818",
                        "hash": "5c7bac858cf66d079e6c13c88f3f001eb446cdce",
                        "datavalue": {"value": "Lion", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$C2D3546E-C42A-404A-A288-580F9C705E12", "rank": "normal"
                }],
                "P7829": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P7829",
                        "hash": "17fbb02db65a7e80691f58be750382d61148406e",
                        "datavalue": {"value": "Lion", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$74998F51-E783-40CB-A56A-3189647AB3D4", "rank": "normal"
                }],
                "P7827": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P7827",
                        "hash": "f85db9fe2c187554aefc51e5529d75e0c5af4767",
                        "datavalue": {"value": "Le\u00f3n", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$5DA64E1B-F1F1-4254-8629-985DFE8672A2", "rank": "normal"
                }],
                "P7822": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P7822",
                        "hash": "3cd23fddc416227c2ba85d91aa03dc80a8e95836",
                        "datavalue": {"value": "Leone", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$DF657EF2-67A8-4272-871D-E95B3719A8B6", "rank": "normal"
                }],
                "P6105": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P6105",
                        "hash": "8bbda0afe53fc428d3a0d9528c97d2145ee41dce",
                        "datavalue": {"value": "79432", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$2AE92335-1BC6-4B92-BAF3-9AB41608E638", "rank": "normal"
                }],
                "P6864": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P6864",
                        "hash": "6f87ce0800057dbe88f27748b3077938973eb5c8",
                        "datavalue": {"value": "85426", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$9089C4B9-59A8-45A6-821B-05C1BB4C107C", "rank": "normal"
                }],
                "P2347": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P2347",
                        "hash": "41e41b306cdd5e55007ac02da022d9f4ce230b03",
                        "datavalue": {"value": "7345", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$3CEB44D7-6C0B-4E66-87ED-37D723A1CCC8",
                    "rank": "normal",
                    "references": [{
                        "hash": "f9bf1a1f034ddd51bd9928ac535e0f57d748e2cf",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "7133f11674741f52cadaae6029068fad9cbb52e3",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 89345680,
                                        "id": "Q89345680"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P248"]
                    }]
                }],
                "P7033": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P7033",
                        "hash": "e31b2e07ae0ce3d3a087d3c818c7bf29c7b04b72",
                        "datavalue": {"value": "scot/9244", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$F8148EB5-7934-4491-9B40-3378B7D292A6", "rank": "normal"
                }],
                "P8408": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P8408",
                        "hash": "51c04ed4f03488e8f428256ee41eb20eabe3ff38",
                        "datavalue": {"value": "Lion", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q140$2855E519-BCD1-4AB3-B3E9-BB53C5CB2E22",
                    "rank": "normal",
                    "references": [{
                        "hash": "9a681f9dd95c90224547c404e11295f4f7dcf54e",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "9d5780dddffa8746637a9929a936ab6b0f601e24",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 64139102,
                                        "id": "Q64139102"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "622a5a27fa5b25e7e7984974e9db494cf8460990",
                                "datavalue": {
                                    "value": {
                                        "time": "+2020-07-09T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P813"]
                    }]
                }],
                "P8519": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P8519",
                        "hash": "ad8031a668b5310633a04a9223714b3482d388b2",
                        "datavalue": {"value": "64570", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$ba4fa085-0e54-4226-a46b-770f7d5a995f", "rank": "normal"
                }],
                "P279": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P279",
                        "hash": "761c3439637add8f8fe3a351d6231333693835f6",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 6667323, "id": "Q6667323"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    }, "type": "statement", "id": "Q140$cb41b7d3-46f0-e6d9-ced6-c2803e0c06b7", "rank": "normal"
                }],
                "P2670": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P2670",
                        "hash": "6563f1e596253f1574515891267de01c5c1e688e",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 17611534, "id": "Q17611534"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    }, "type": "statement", "id": "Q140$24984be4-4813-b6ad-ec83-1a37b7332c8a", "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P2670",
                        "hash": "684855138cc32d11b487d0178c194f10c63f5f86",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 98520146, "id": "Q98520146"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    }, "type": "statement", "id": "Q140$56e8c9b3-4892-e95d-f7c5-02b10ffe77e8", "rank": "normal"
                }],
                "P31": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P31",
                        "hash": "06629d890d7ab0ff85c403d8aadf57ce9809c01f",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 16521, "id": "Q16521"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    }, "type": "statement", "id": "q140$8EE98E5B-4A9C-4BF5-B456-FB77E8EE4E69", "rank": "normal"
                }],
                "P2581": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P2581",
                        "hash": "beca27cf7dd079eb27b7690e13a446d98448ae91",
                        "datavalue": {"value": "00049156n", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$90562c9a-4e9c-082d-d577-e0869524d9a1", "rank": "normal"
                }],
                "P7506": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P7506",
                        "hash": "0562f57f9a54c65a2d45711f6dd5dd53ce37f6f8",
                        "datavalue": {"value": "1107856", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$00d453bf-4786-bde9-63f4-2db9f3610e88", "rank": "normal"
                }],
                "P5184": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P5184",
                        "hash": "201d8de9b05ae85fe4f917c7e54c4a0218517888",
                        "datavalue": {"value": "b11s0701a", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$a2b832c9-4c5c-e402-e10d-cf2b08d35a56", "rank": "normal"
                }],
                "P6900": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P6900",
                        "hash": "f7218c6984cd57078497a62ad595b089bdd97c49",
                        "datavalue": {"value": "\u30e9\u30a4\u30aa\u30f3", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$d15d143d-4826-4860-9aa3-6a350d6bc36f", "rank": "normal"
                }],
                "P3553": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P3553",
                        "hash": "c82c6e1156e098d5ef396248c412371b90e0dc56",
                        "datavalue": {"value": "19563862", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$5edb95fa-4647-2e9a-9dbf-b68e1326eb79", "rank": "normal"
                }],
                "P5337": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P5337",
                        "hash": "793cfa52df3c5a6747c0cb5db959db944b04dbed",
                        "datavalue": {
                            "value": "CAAqIQgKIhtDQkFTRGdvSUwyMHZNRGsyYldJU0FtcGhLQUFQAQ",
                            "type": "string"
                        },
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$6137dbc1-4c6a-af60-00ee-2a32c63bfdfa", "rank": "normal"
                }],
                "P6200": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P6200",
                        "hash": "0ce08dd38017230d41f530f6e97baf484f607235",
                        "datavalue": {"value": "ce2gz91pyv2t", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$01ed0f16-4a4a-213d-e457-0d4d5d670d49", "rank": "normal"
                }],
                "P4527": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P4527",
                        "hash": "b07d29aa5112080a9294a7421e46ed0b73ac96c7",
                        "datavalue": {"value": "430792", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P1810": [{
                            "snaktype": "value",
                            "property": "P1810",
                            "hash": "7d78547303d5e9e014a7c8cef6072faee91088ce",
                            "datavalue": {"value": "Lions", "type": "string"},
                            "datatype": "string"
                        }]
                    },
                    "qualifiers-order": ["P1810"],
                    "id": "Q140$C37C600C-4929-4203-A06E-8D797BA9B22A",
                    "rank": "normal"
                }],
                "P8989": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P8989",
                        "hash": "37087c42c921d83773f62d77e7360dc44504c122",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 104595349, "id": "Q104595349"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    }, "type": "statement", "id": "Q140$1ece61f5-c008-4750-8b67-e15337f28e86", "rank": "normal"
                }],
                "P1552": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P1552",
                        "hash": "1aa7db66bfad11e427c40ec79f3295de877967f1",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 120446, "id": "Q120446"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    }, "type": "statement", "id": "Q140$0bd4b0d9-49ff-b5b4-5c10-9500bc0ce19d", "rank": "normal"
                }],
                "P9198": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P9198",
                        "hash": "d3ab4ab9d788dc348d16e13fc77164ea71cef2ae",
                        "datavalue": {"value": "352", "type": "string"},
                        "datatype": "external-id"
                    }, "type": "statement", "id": "Q140$C5D80C89-2862-490F-AA85-C260F32BE30B", "rank": "normal"
                }],
                "P9566": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P9566",
                        "hash": "053e0b7c15c8e5a61a71077c4cffa73b9d03005b",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 3255068, "id": "Q3255068"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "id": "Q140$C7DAEA4E-B613-48A6-BFCD-88B551D1EF7A",
                    "rank": "normal",
                    "references": [{
                        "hash": "0eedf63ac49c9b21aa7ff0a5e70b71aa6069a8ed",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "abfcfc68aa085f872d633958be83cba2ab96ce4a",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 1637051,
                                        "id": "Q1637051"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P248"]
                    }, {
                        "hash": "6db51e3163554f674ff270c93a2871c8d859a49e",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "abfcfc68aa085f872d633958be83cba2ab96ce4a",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 1637051,
                                        "id": "Q1637051"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P577": [{
                                "snaktype": "value",
                                "property": "P577",
                                "hash": "ccd6ea06a2c9c0f54f5b1f45991a659225b5f4ef",
                                "datavalue": {
                                    "value": {
                                        "time": "+2013-01-01T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 9,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P577"]
                    }]
                }],
                "P508": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P508",
                        "hash": "e87c854abf600fb5de7b9b677d94a06e18851333",
                        "datavalue": {"value": "34922", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P1810": [{
                            "snaktype": "value",
                            "property": "P1810",
                            "hash": "137692b9bcc178e7b7d232631cb607d45e2f543d",
                            "datavalue": {"value": "Leoni", "type": "string"},
                            "datatype": "string"
                        }],
                        "P4970": [{
                            "snaktype": "value",
                            "property": "P4970",
                            "hash": "271ec192bf14b9eb639120c60d5961ab8692444d",
                            "datavalue": {"value": "Panthera leo", "type": "string"},
                            "datatype": "string"
                        }]
                    },
                    "qualifiers-order": ["P1810", "P4970"],
                    "id": "Q140$52702f98-7843-4e0e-b646-76629e04e555",
                    "rank": "normal"
                }],
                "P950": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P950",
                        "hash": "f447323110fd744383394f91c2dfba2fc3187242",
                        "datavalue": {"value": "XX530613", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P1810": [{
                            "snaktype": "value",
                            "property": "P1810",
                            "hash": "e2b2bda5457e0d5f7859e5c54996e1884062dfd1",
                            "datavalue": {"value": "Leones", "type": "string"},
                            "datatype": "string"
                        }]
                    },
                    "qualifiers-order": ["P1810"],
                    "id": "Q140$773f47cf-3133-4892-80eb-9d4dc5e97582",
                    "rank": "normal",
                    "references": [{
                        "hash": "184729506e049d06de85686ede30c92b3e52451d",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "3b090a7bae73c288393b2c8b9846cc7ed9a58f91",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 16583225,
                                        "id": "Q16583225"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }],
                            "P854": [{
                                "snaktype": "value",
                                "property": "P854",
                                "hash": "b16c3ffac23bb97abe5d0c4d6ccffe4d010ab71a",
                                "datavalue": {
                                    "value": "https://thes.bncf.firenze.sbn.it/termine.php?id=34922",
                                    "type": "string"
                                },
                                "datatype": "url"
                            }],
                            "P813": [{
                                "snaktype": "value",
                                "property": "P813",
                                "hash": "7721e97431215c374db84a9df785dc964a16bd17",
                                "datavalue": {
                                    "value": {
                                        "time": "+2021-06-15T00:00:00Z",
                                        "timezone": 0,
                                        "before": 0,
                                        "after": 0,
                                        "precision": 11,
                                        "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
                                    }, "type": "time"
                                },
                                "datatype": "time"
                            }]
                        },
                        "snaks-order": ["P248", "P854", "P813"]
                    }]
                }],
                "P7603": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P7603",
                        "hash": "c86436e278d690f057cfecc86babf982948015f3",
                        "datavalue": {
                            "value": {"entity-type": "item", "numeric-id": 2851528, "id": "Q2851528"},
                            "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "qualifiers": {
                        "P17": [{
                            "snaktype": "value",
                            "property": "P17",
                            "hash": "18fb076bdc1c07e578546d1670ba193b768531ac",
                            "datavalue": {
                                "value": {"entity-type": "item", "numeric-id": 668, "id": "Q668"},
                                "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        }]
                    },
                    "qualifiers-order": ["P17"],
                    "id": "Q140$64262d09-4a19-3945-8a09-c2195b7614a7",
                    "rank": "normal"
                }],
                "P6800": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P6800",
                        "hash": "1da99908e2ffdf6de901a1b8a2dbab0c62886565",
                        "datavalue": {"value": "http://www.ensembl.org/Panthera_leo", "type": "string"},
                        "datatype": "url"
                    },
                    "type": "statement",
                    "id": "Q140$87DC0D37-FC9E-4FFE-B92D-1A3A7C019A1D",
                    "rank": "normal",
                    "references": [{
                        "hash": "53eb51e25c6356d2d4673dc249ea837dd14feca0",
                        "snaks": {
                            "P248": [{
                                "snaktype": "value",
                                "property": "P248",
                                "hash": "4ec639fccc9ddb8e079f7d27ca43220e3c512c20",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 1344256,
                                        "id": "Q1344256"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P248"]
                    }]
                }]
            },
            "sitelinks": {
                "abwiki": {
                    "site": "abwiki",
                    "title": "\u0410\u043b\u044b\u043c",
                    "badges": [],
                    "url": "https://ab.wikipedia.org/wiki/%D0%90%D0%BB%D1%8B%D0%BC"
                },
                "adywiki": {
                    "site": "adywiki",
                    "title": "\u0410\u0441\u043b\u044a\u0430\u043d",
                    "badges": [],
                    "url": "https://ady.wikipedia.org/wiki/%D0%90%D1%81%D0%BB%D1%8A%D0%B0%D0%BD"
                },
                "afwiki": {
                    "site": "afwiki",
                    "title": "Leeu",
                    "badges": ["Q17437796"],
                    "url": "https://af.wikipedia.org/wiki/Leeu"
                },
                "alswiki": {
                    "site": "alswiki",
                    "title": "L\u00f6we",
                    "badges": [],
                    "url": "https://als.wikipedia.org/wiki/L%C3%B6we"
                },
                "altwiki": {
                    "site": "altwiki",
                    "title": "\u0410\u0440\u0441\u043b\u0430\u043d",
                    "badges": [],
                    "url": "https://alt.wikipedia.org/wiki/%D0%90%D1%80%D1%81%D0%BB%D0%B0%D0%BD"
                },
                "amwiki": {
                    "site": "amwiki",
                    "title": "\u12a0\u1295\u1260\u1233",
                    "badges": [],
                    "url": "https://am.wikipedia.org/wiki/%E1%8A%A0%E1%8A%95%E1%89%A0%E1%88%B3"
                },
                "angwiki": {
                    "site": "angwiki",
                    "title": "L\u0113o",
                    "badges": [],
                    "url": "https://ang.wikipedia.org/wiki/L%C4%93o"
                },
                "anwiki": {
                    "site": "anwiki",
                    "title": "Panthera leo",
                    "badges": [],
                    "url": "https://an.wikipedia.org/wiki/Panthera_leo"
                },
                "arcwiki": {
                    "site": "arcwiki",
                    "title": "\u0710\u072a\u071d\u0710",
                    "badges": [],
                    "url": "https://arc.wikipedia.org/wiki/%DC%90%DC%AA%DC%9D%DC%90"
                },
                "arwiki": {
                    "site": "arwiki",
                    "title": "\u0623\u0633\u062f",
                    "badges": ["Q17437796"],
                    "url": "https://ar.wikipedia.org/wiki/%D8%A3%D8%B3%D8%AF"
                },
                "arywiki": {
                    "site": "arywiki",
                    "title": "\u0633\u0628\u0639",
                    "badges": [],
                    "url": "https://ary.wikipedia.org/wiki/%D8%B3%D8%A8%D8%B9"
                },
                "arzwiki": {
                    "site": "arzwiki",
                    "title": "\u0633\u0628\u0639",
                    "badges": [],
                    "url": "https://arz.wikipedia.org/wiki/%D8%B3%D8%A8%D8%B9"
                },
                "astwiki": {
                    "site": "astwiki",
                    "title": "Panthera leo",
                    "badges": [],
                    "url": "https://ast.wikipedia.org/wiki/Panthera_leo"
                },
                "aswiki": {
                    "site": "aswiki",
                    "title": "\u09b8\u09bf\u0982\u09b9",
                    "badges": [],
                    "url": "https://as.wikipedia.org/wiki/%E0%A6%B8%E0%A6%BF%E0%A6%82%E0%A6%B9"
                },
                "avkwiki": {
                    "site": "avkwiki",
                    "title": "Krapol (Panthera leo)",
                    "badges": [],
                    "url": "https://avk.wikipedia.org/wiki/Krapol_(Panthera_leo)"
                },
                "avwiki": {
                    "site": "avwiki",
                    "title": "\u0413\u044a\u0430\u043b\u0431\u0430\u0446\u04c0",
                    "badges": [],
                    "url": "https://av.wikipedia.org/wiki/%D0%93%D1%8A%D0%B0%D0%BB%D0%B1%D0%B0%D1%86%D3%80"
                },
                "azbwiki": {
                    "site": "azbwiki",
                    "title": "\u0622\u0633\u0644\u0627\u0646",
                    "badges": [],
                    "url": "https://azb.wikipedia.org/wiki/%D8%A2%D8%B3%D9%84%D8%A7%D9%86"
                },
                "azwiki": {
                    "site": "azwiki",
                    "title": "\u015eir",
                    "badges": [],
                    "url": "https://az.wikipedia.org/wiki/%C5%9Eir"
                },
                "bat_smgwiki": {
                    "site": "bat_smgwiki",
                    "title": "Li\u016bts",
                    "badges": [],
                    "url": "https://bat-smg.wikipedia.org/wiki/Li%C5%ABts"
                },
                "bawiki": {
                    "site": "bawiki",
                    "title": "\u0410\u0440\u044b\u04ab\u043b\u0430\u043d",
                    "badges": [],
                    "url": "https://ba.wikipedia.org/wiki/%D0%90%D1%80%D1%8B%D2%AB%D0%BB%D0%B0%D0%BD"
                },
                "bclwiki": {
                    "site": "bclwiki",
                    "title": "Leon",
                    "badges": [],
                    "url": "https://bcl.wikipedia.org/wiki/Leon"
                },
                "be_x_oldwiki": {
                    "site": "be_x_oldwiki",
                    "title": "\u041b\u0435\u045e",
                    "badges": [],
                    "url": "https://be-tarask.wikipedia.org/wiki/%D0%9B%D0%B5%D1%9E"
                },
                "bewiki": {
                    "site": "bewiki",
                    "title": "\u041b\u0435\u045e",
                    "badges": [],
                    "url": "https://be.wikipedia.org/wiki/%D0%9B%D0%B5%D1%9E"
                },
                "bgwiki": {
                    "site": "bgwiki",
                    "title": "\u041b\u044a\u0432",
                    "badges": [],
                    "url": "https://bg.wikipedia.org/wiki/%D0%9B%D1%8A%D0%B2"
                },
                "bhwiki": {
                    "site": "bhwiki",
                    "title": "\u0938\u093f\u0902\u0939",
                    "badges": [],
                    "url": "https://bh.wikipedia.org/wiki/%E0%A4%B8%E0%A4%BF%E0%A4%82%E0%A4%B9"
                },
                "bmwiki": {
                    "site": "bmwiki",
                    "title": "Waraba",
                    "badges": [],
                    "url": "https://bm.wikipedia.org/wiki/Waraba"
                },
                "bnwiki": {
                    "site": "bnwiki",
                    "title": "\u09b8\u09bf\u0982\u09b9",
                    "badges": [],
                    "url": "https://bn.wikipedia.org/wiki/%E0%A6%B8%E0%A6%BF%E0%A6%82%E0%A6%B9"
                },
                "bowiki": {
                    "site": "bowiki",
                    "title": "\u0f66\u0f7a\u0f44\u0f0b\u0f42\u0f7a\u0f0d",
                    "badges": [],
                    "url": "https://bo.wikipedia.org/wiki/%E0%BD%A6%E0%BD%BA%E0%BD%84%E0%BC%8B%E0%BD%82%E0%BD%BA%E0%BC%8D"
                },
                "bpywiki": {
                    "site": "bpywiki",
                    "title": "\u09a8\u0982\u09b8\u09be",
                    "badges": [],
                    "url": "https://bpy.wikipedia.org/wiki/%E0%A6%A8%E0%A6%82%E0%A6%B8%E0%A6%BE"
                },
                "brwiki": {
                    "site": "brwiki",
                    "title": "Leon (loen)",
                    "badges": [],
                    "url": "https://br.wikipedia.org/wiki/Leon_(loen)"
                },
                "bswiki": {
                    "site": "bswiki",
                    "title": "Lav",
                    "badges": [],
                    "url": "https://bs.wikipedia.org/wiki/Lav"
                },
                "bswikiquote": {
                    "site": "bswikiquote",
                    "title": "Lav",
                    "badges": [],
                    "url": "https://bs.wikiquote.org/wiki/Lav"
                },
                "bxrwiki": {
                    "site": "bxrwiki",
                    "title": "\u0410\u0440\u0441\u0430\u043b\u0430\u043d",
                    "badges": [],
                    "url": "https://bxr.wikipedia.org/wiki/%D0%90%D1%80%D1%81%D0%B0%D0%BB%D0%B0%D0%BD"
                },
                "cawiki": {
                    "site": "cawiki",
                    "title": "Lle\u00f3",
                    "badges": ["Q17437796"],
                    "url": "https://ca.wikipedia.org/wiki/Lle%C3%B3"
                },
                "cawikiquote": {
                    "site": "cawikiquote",
                    "title": "Lle\u00f3",
                    "badges": [],
                    "url": "https://ca.wikiquote.org/wiki/Lle%C3%B3"
                },
                "cdowiki": {
                    "site": "cdowiki",
                    "title": "S\u0103i (m\u00e0-ku\u014f d\u00f4ng-\u016dk)",
                    "badges": [],
                    "url": "https://cdo.wikipedia.org/wiki/S%C4%83i_(m%C3%A0-ku%C5%8F_d%C3%B4ng-%C5%ADk)"
                },
                "cebwiki": {
                    "site": "cebwiki",
                    "title": "Panthera leo",
                    "badges": [],
                    "url": "https://ceb.wikipedia.org/wiki/Panthera_leo"
                },
                "cewiki": {
                    "site": "cewiki",
                    "title": "\u041b\u043e\u043c",
                    "badges": [],
                    "url": "https://ce.wikipedia.org/wiki/%D0%9B%D0%BE%D0%BC"
                },
                "chrwiki": {
                    "site": "chrwiki",
                    "title": "\u13e2\u13d3\u13e5 \u13a4\u13c3\u13d5\u13be",
                    "badges": [],
                    "url": "https://chr.wikipedia.org/wiki/%E1%8F%A2%E1%8F%93%E1%8F%A5_%E1%8E%A4%E1%8F%83%E1%8F%95%E1%8E%BE"
                },
                "chywiki": {
                    "site": "chywiki",
                    "title": "P\u00e9hpe'\u00e9nan\u00f3se'hame",
                    "badges": [],
                    "url": "https://chy.wikipedia.org/wiki/P%C3%A9hpe%27%C3%A9nan%C3%B3se%27hame"
                },
                "ckbwiki": {
                    "site": "ckbwiki",
                    "title": "\u0634\u06ce\u0631",
                    "badges": [],
                    "url": "https://ckb.wikipedia.org/wiki/%D8%B4%DB%8E%D8%B1"
                },
                "commonswiki": {
                    "site": "commonswiki",
                    "title": "Panthera leo",
                    "badges": [],
                    "url": "https://commons.wikimedia.org/wiki/Panthera_leo"
                },
                "cowiki": {
                    "site": "cowiki",
                    "title": "Lionu",
                    "badges": [],
                    "url": "https://co.wikipedia.org/wiki/Lionu"
                },
                "csbwiki": {
                    "site": "csbwiki",
                    "title": "Lew",
                    "badges": [],
                    "url": "https://csb.wikipedia.org/wiki/Lew"
                },
                "cswiki": {
                    "site": "cswiki",
                    "title": "Lev",
                    "badges": [],
                    "url": "https://cs.wikipedia.org/wiki/Lev"
                },
                "cswikiquote": {
                    "site": "cswikiquote",
                    "title": "Lev",
                    "badges": [],
                    "url": "https://cs.wikiquote.org/wiki/Lev"
                },
                "cuwiki": {
                    "site": "cuwiki",
                    "title": "\u041b\u044c\u0432\u044a",
                    "badges": [],
                    "url": "https://cu.wikipedia.org/wiki/%D0%9B%D1%8C%D0%B2%D1%8A"
                },
                "cvwiki": {
                    "site": "cvwiki",
                    "title": "\u0410\u0440\u0103\u0441\u043b\u0430\u043d",
                    "badges": [],
                    "url": "https://cv.wikipedia.org/wiki/%D0%90%D1%80%C4%83%D1%81%D0%BB%D0%B0%D0%BD"
                },
                "cywiki": {
                    "site": "cywiki",
                    "title": "Llew",
                    "badges": [],
                    "url": "https://cy.wikipedia.org/wiki/Llew"
                },
                "dagwiki": {
                    "site": "dagwiki",
                    "title": "Gbu\u0263inli",
                    "badges": [],
                    "url": "https://dag.wikipedia.org/wiki/Gbu%C9%A3inli"
                },
                "dawiki": {
                    "site": "dawiki",
                    "title": "L\u00f8ve",
                    "badges": ["Q17559452"],
                    "url": "https://da.wikipedia.org/wiki/L%C3%B8ve"
                },
                "dewiki": {
                    "site": "dewiki",
                    "title": "L\u00f6we",
                    "badges": ["Q17437796"],
                    "url": "https://de.wikipedia.org/wiki/L%C3%B6we"
                },
                "dewikiquote": {
                    "site": "dewikiquote",
                    "title": "L\u00f6we",
                    "badges": [],
                    "url": "https://de.wikiquote.org/wiki/L%C3%B6we"
                },
                "dinwiki": {
                    "site": "dinwiki",
                    "title": "K\u00f6r",
                    "badges": [],
                    "url": "https://din.wikipedia.org/wiki/K%C3%B6r"
                },
                "diqwiki": {
                    "site": "diqwiki",
                    "title": "\u015e\u00ear",
                    "badges": [],
                    "url": "https://diq.wikipedia.org/wiki/%C5%9E%C3%AAr"
                },
                "dsbwiki": {
                    "site": "dsbwiki",
                    "title": "Law",
                    "badges": [],
                    "url": "https://dsb.wikipedia.org/wiki/Law"
                },
                "eewiki": {
                    "site": "eewiki",
                    "title": "Dzata",
                    "badges": [],
                    "url": "https://ee.wikipedia.org/wiki/Dzata"
                },
                "elwiki": {
                    "site": "elwiki",
                    "title": "\u039b\u03b9\u03bf\u03bd\u03c4\u03ac\u03c1\u03b9",
                    "badges": [],
                    "url": "https://el.wikipedia.org/wiki/%CE%9B%CE%B9%CE%BF%CE%BD%CF%84%CE%AC%CF%81%CE%B9"
                },
                "enwiki": {
                    "site": "enwiki",
                    "title": "Lion",
                    "badges": ["Q17437796"],
                    "url": "https://en.wikipedia.org/wiki/Lion"
                },
                "enwikiquote": {
                    "site": "enwikiquote",
                    "title": "Lions",
                    "badges": [],
                    "url": "https://en.wikiquote.org/wiki/Lions"
                },
                "eowiki": {
                    "site": "eowiki",
                    "title": "Leono",
                    "badges": [],
                    "url": "https://eo.wikipedia.org/wiki/Leono"
                },
                "eowikiquote": {
                    "site": "eowikiquote",
                    "title": "Leono",
                    "badges": [],
                    "url": "https://eo.wikiquote.org/wiki/Leono"
                },
                "eswiki": {
                    "site": "eswiki",
                    "title": "Panthera leo",
                    "badges": ["Q17437796"],
                    "url": "https://es.wikipedia.org/wiki/Panthera_leo"
                },
                "eswikiquote": {
                    "site": "eswikiquote",
                    "title": "Le\u00f3n",
                    "badges": [],
                    "url": "https://es.wikiquote.org/wiki/Le%C3%B3n"
                },
                "etwiki": {
                    "site": "etwiki",
                    "title": "L\u00f5vi",
                    "badges": [],
                    "url": "https://et.wikipedia.org/wiki/L%C3%B5vi"
                },
                "etwikiquote": {
                    "site": "etwikiquote",
                    "title": "L\u00f5vi",
                    "badges": [],
                    "url": "https://et.wikiquote.org/wiki/L%C3%B5vi"
                },
                "euwiki": {
                    "site": "euwiki",
                    "title": "Lehoi",
                    "badges": [],
                    "url": "https://eu.wikipedia.org/wiki/Lehoi"
                },
                "extwiki": {
                    "site": "extwiki",
                    "title": "Li\u00f3n (animal)",
                    "badges": [],
                    "url": "https://ext.wikipedia.org/wiki/Li%C3%B3n_(animal)"
                },
                "fawiki": {
                    "site": "fawiki",
                    "title": "\u0634\u06cc\u0631 (\u06af\u0631\u0628\u0647\u200c\u0633\u0627\u0646)",
                    "badges": ["Q17437796"],
                    "url": "https://fa.wikipedia.org/wiki/%D8%B4%DB%8C%D8%B1_(%DA%AF%D8%B1%D8%A8%D9%87%E2%80%8C%D8%B3%D8%A7%D9%86)"
                },
                "fawikiquote": {
                    "site": "fawikiquote",
                    "title": "\u0634\u06cc\u0631",
                    "badges": [],
                    "url": "https://fa.wikiquote.org/wiki/%D8%B4%DB%8C%D8%B1"
                },
                "fiu_vrowiki": {
                    "site": "fiu_vrowiki",
                    "title": "L\u00f5vi",
                    "badges": [],
                    "url": "https://fiu-vro.wikipedia.org/wiki/L%C3%B5vi"
                },
                "fiwiki": {
                    "site": "fiwiki",
                    "title": "Leijona",
                    "badges": ["Q17437796"],
                    "url": "https://fi.wikipedia.org/wiki/Leijona"
                },
                "fowiki": {
                    "site": "fowiki",
                    "title": "Leyva",
                    "badges": [],
                    "url": "https://fo.wikipedia.org/wiki/Leyva"
                },
                "frrwiki": {
                    "site": "frrwiki",
                    "title": "L\u00f6\u00f6w",
                    "badges": [],
                    "url": "https://frr.wikipedia.org/wiki/L%C3%B6%C3%B6w"
                },
                "frwiki": {
                    "site": "frwiki",
                    "title": "Lion",
                    "badges": ["Q17437796"],
                    "url": "https://fr.wikipedia.org/wiki/Lion"
                },
                "frwikiquote": {
                    "site": "frwikiquote",
                    "title": "Lion",
                    "badges": [],
                    "url": "https://fr.wikiquote.org/wiki/Lion"
                },
                "gagwiki": {
                    "site": "gagwiki",
                    "title": "Aslan",
                    "badges": [],
                    "url": "https://gag.wikipedia.org/wiki/Aslan"
                },
                "gawiki": {
                    "site": "gawiki",
                    "title": "Leon",
                    "badges": [],
                    "url": "https://ga.wikipedia.org/wiki/Leon"
                },
                "gdwiki": {
                    "site": "gdwiki",
                    "title": "Le\u00f2mhann",
                    "badges": [],
                    "url": "https://gd.wikipedia.org/wiki/Le%C3%B2mhann"
                },
                "glwiki": {
                    "site": "glwiki",
                    "title": "Le\u00f3n",
                    "badges": [],
                    "url": "https://gl.wikipedia.org/wiki/Le%C3%B3n"
                },
                "gnwiki": {
                    "site": "gnwiki",
                    "title": "Le\u00f5",
                    "badges": [],
                    "url": "https://gn.wikipedia.org/wiki/Le%C3%B5"
                },
                "gotwiki": {
                    "site": "gotwiki",
                    "title": "\ud800\udf3b\ud800\udf39\ud800\udf45\ud800\udf30",
                    "badges": [],
                    "url": "https://got.wikipedia.org/wiki/%F0%90%8C%BB%F0%90%8C%B9%F0%90%8D%85%F0%90%8C%B0"
                },
                "guwiki": {
                    "site": "guwiki",
                    "title": "\u0a8f\u0ab6\u0abf\u0aaf\u0abe\u0a87 \u0ab8\u0abf\u0a82\u0ab9",
                    "badges": [],
                    "url": "https://gu.wikipedia.org/wiki/%E0%AA%8F%E0%AA%B6%E0%AA%BF%E0%AA%AF%E0%AA%BE%E0%AA%87_%E0%AA%B8%E0%AA%BF%E0%AA%82%E0%AA%B9"
                },
                "hakwiki": {
                    "site": "hakwiki",
                    "title": "S\u1e73\u0302-\u00e9",
                    "badges": [],
                    "url": "https://hak.wikipedia.org/wiki/S%E1%B9%B3%CC%82-%C3%A9"
                },
                "hawiki": {
                    "site": "hawiki",
                    "title": "Zaki",
                    "badges": [],
                    "url": "https://ha.wikipedia.org/wiki/Zaki"
                },
                "hawwiki": {
                    "site": "hawwiki",
                    "title": "Liona",
                    "badges": [],
                    "url": "https://haw.wikipedia.org/wiki/Liona"
                },
                "hewiki": {
                    "site": "hewiki",
                    "title": "\u05d0\u05e8\u05d9\u05d4",
                    "badges": [],
                    "url": "https://he.wikipedia.org/wiki/%D7%90%D7%A8%D7%99%D7%94"
                },
                "hewikiquote": {
                    "site": "hewikiquote",
                    "title": "\u05d0\u05e8\u05d9\u05d4",
                    "badges": [],
                    "url": "https://he.wikiquote.org/wiki/%D7%90%D7%A8%D7%99%D7%94"
                },
                "hifwiki": {
                    "site": "hifwiki",
                    "title": "Ser",
                    "badges": [],
                    "url": "https://hif.wikipedia.org/wiki/Ser"
                },
                "hiwiki": {
                    "site": "hiwiki",
                    "title": "\u0938\u093f\u0902\u0939 (\u092a\u0936\u0941)",
                    "badges": [],
                    "url": "https://hi.wikipedia.org/wiki/%E0%A4%B8%E0%A4%BF%E0%A4%82%E0%A4%B9_(%E0%A4%AA%E0%A4%B6%E0%A5%81)"
                },
                "hrwiki": {
                    "site": "hrwiki",
                    "title": "Lav",
                    "badges": [],
                    "url": "https://hr.wikipedia.org/wiki/Lav"
                },
                "hrwikiquote": {
                    "site": "hrwikiquote",
                    "title": "Lav",
                    "badges": [],
                    "url": "https://hr.wikiquote.org/wiki/Lav"
                },
                "hsbwiki": {
                    "site": "hsbwiki",
                    "title": "Law",
                    "badges": [],
                    "url": "https://hsb.wikipedia.org/wiki/Law"
                },
                "htwiki": {
                    "site": "htwiki",
                    "title": "Lyon",
                    "badges": [],
                    "url": "https://ht.wikipedia.org/wiki/Lyon"
                },
                "huwiki": {
                    "site": "huwiki",
                    "title": "Oroszl\u00e1n",
                    "badges": [],
                    "url": "https://hu.wikipedia.org/wiki/Oroszl%C3%A1n"
                },
                "hywiki": {
                    "site": "hywiki",
                    "title": "\u0531\u057c\u0575\u0578\u0582\u056e",
                    "badges": [],
                    "url": "https://hy.wikipedia.org/wiki/%D4%B1%D5%BC%D5%B5%D5%B8%D6%82%D5%AE"
                },
                "hywikiquote": {
                    "site": "hywikiquote",
                    "title": "\u0531\u057c\u0575\u0578\u0582\u056e",
                    "badges": [],
                    "url": "https://hy.wikiquote.org/wiki/%D4%B1%D5%BC%D5%B5%D5%B8%D6%82%D5%AE"
                },
                "hywwiki": {
                    "site": "hywwiki",
                    "title": "\u0531\u057c\u056b\u0582\u056e",
                    "badges": [],
                    "url": "https://hyw.wikipedia.org/wiki/%D4%B1%D5%BC%D5%AB%D6%82%D5%AE"
                },
                "iawiki": {
                    "site": "iawiki",
                    "title": "Leon",
                    "badges": [],
                    "url": "https://ia.wikipedia.org/wiki/Leon"
                },
                "idwiki": {
                    "site": "idwiki",
                    "title": "Singa",
                    "badges": [],
                    "url": "https://id.wikipedia.org/wiki/Singa"
                },
                "igwiki": {
                    "site": "igwiki",
                    "title": "Od\u00fam",
                    "badges": [],
                    "url": "https://ig.wikipedia.org/wiki/Od%C3%BAm"
                },
                "ilowiki": {
                    "site": "ilowiki",
                    "title": "Leon",
                    "badges": [],
                    "url": "https://ilo.wikipedia.org/wiki/Leon"
                },
                "inhwiki": {
                    "site": "inhwiki",
                    "title": "\u041b\u043e\u043c",
                    "badges": [],
                    "url": "https://inh.wikipedia.org/wiki/%D0%9B%D0%BE%D0%BC"
                },
                "iowiki": {
                    "site": "iowiki",
                    "title": "Leono (mamifero)",
                    "badges": [],
                    "url": "https://io.wikipedia.org/wiki/Leono_(mamifero)"
                },
                "iswiki": {
                    "site": "iswiki",
                    "title": "Lj\u00f3n",
                    "badges": [],
                    "url": "https://is.wikipedia.org/wiki/Lj%C3%B3n"
                },
                "itwiki": {
                    "site": "itwiki",
                    "title": "Panthera leo",
                    "badges": [],
                    "url": "https://it.wikipedia.org/wiki/Panthera_leo"
                },
                "itwikiquote": {
                    "site": "itwikiquote",
                    "title": "Leone",
                    "badges": [],
                    "url": "https://it.wikiquote.org/wiki/Leone"
                },
                "jawiki": {
                    "site": "jawiki",
                    "title": "\u30e9\u30a4\u30aa\u30f3",
                    "badges": [],
                    "url": "https://ja.wikipedia.org/wiki/%E3%83%A9%E3%82%A4%E3%82%AA%E3%83%B3"
                },
                "jawikiquote": {
                    "site": "jawikiquote",
                    "title": "\u7345\u5b50",
                    "badges": [],
                    "url": "https://ja.wikiquote.org/wiki/%E7%8D%85%E5%AD%90"
                },
                "jbowiki": {
                    "site": "jbowiki",
                    "title": "cinfo",
                    "badges": [],
                    "url": "https://jbo.wikipedia.org/wiki/cinfo"
                },
                "jvwiki": {
                    "site": "jvwiki",
                    "title": "Singa",
                    "badges": [],
                    "url": "https://jv.wikipedia.org/wiki/Singa"
                },
                "kabwiki": {
                    "site": "kabwiki",
                    "title": "Izem",
                    "badges": [],
                    "url": "https://kab.wikipedia.org/wiki/Izem"
                },
                "kawiki": {
                    "site": "kawiki",
                    "title": "\u10da\u10dd\u10db\u10d8",
                    "badges": [],
                    "url": "https://ka.wikipedia.org/wiki/%E1%83%9A%E1%83%9D%E1%83%9B%E1%83%98"
                },
                "kbdwiki": {
                    "site": "kbdwiki",
                    "title": "\u0425\u044c\u044d\u0449",
                    "badges": [],
                    "url": "https://kbd.wikipedia.org/wiki/%D0%A5%D1%8C%D1%8D%D1%89"
                },
                "kbpwiki": {
                    "site": "kbpwiki",
                    "title": "T\u0254\u0254y\u028b\u028b",
                    "badges": [],
                    "url": "https://kbp.wikipedia.org/wiki/T%C9%94%C9%94y%CA%8B%CA%8B"
                },
                "kgwiki": {
                    "site": "kgwiki",
                    "title": "Nkosi",
                    "badges": [],
                    "url": "https://kg.wikipedia.org/wiki/Nkosi"
                },
                "kkwiki": {
                    "site": "kkwiki",
                    "title": "\u0410\u0440\u044b\u0441\u0442\u0430\u043d",
                    "badges": [],
                    "url": "https://kk.wikipedia.org/wiki/%D0%90%D1%80%D1%8B%D1%81%D1%82%D0%B0%D0%BD"
                },
                "knwiki": {
                    "site": "knwiki",
                    "title": "\u0cb8\u0cbf\u0c82\u0cb9",
                    "badges": [],
                    "url": "https://kn.wikipedia.org/wiki/%E0%B2%B8%E0%B2%BF%E0%B2%82%E0%B2%B9"
                },
                "kowiki": {
                    "site": "kowiki",
                    "title": "\uc0ac\uc790",
                    "badges": [],
                    "url": "https://ko.wikipedia.org/wiki/%EC%82%AC%EC%9E%90"
                },
                "kowikiquote": {
                    "site": "kowikiquote",
                    "title": "\uc0ac\uc790",
                    "badges": [],
                    "url": "https://ko.wikiquote.org/wiki/%EC%82%AC%EC%9E%90"
                },
                "kswiki": {
                    "site": "kswiki",
                    "title": "\u067e\u0627\u062f\u064e\u0631 \u0633\u0655\u06c1\u06c1",
                    "badges": [],
                    "url": "https://ks.wikipedia.org/wiki/%D9%BE%D8%A7%D8%AF%D9%8E%D8%B1_%D8%B3%D9%95%DB%81%DB%81"
                },
                "kuwiki": {
                    "site": "kuwiki",
                    "title": "\u015e\u00ear",
                    "badges": [],
                    "url": "https://ku.wikipedia.org/wiki/%C5%9E%C3%AAr"
                },
                "kwwiki": {
                    "site": "kwwiki",
                    "title": "Lew",
                    "badges": [],
                    "url": "https://kw.wikipedia.org/wiki/Lew"
                },
                "kywiki": {
                    "site": "kywiki",
                    "title": "\u0410\u0440\u0441\u0442\u0430\u043d",
                    "badges": [],
                    "url": "https://ky.wikipedia.org/wiki/%D0%90%D1%80%D1%81%D1%82%D0%B0%D0%BD"
                },
                "lawiki": {
                    "site": "lawiki",
                    "title": "Leo",
                    "badges": [],
                    "url": "https://la.wikipedia.org/wiki/Leo"
                },
                "lawikiquote": {
                    "site": "lawikiquote",
                    "title": "Leo",
                    "badges": [],
                    "url": "https://la.wikiquote.org/wiki/Leo"
                },
                "lbewiki": {
                    "site": "lbewiki",
                    "title": "\u0410\u0441\u043b\u0430\u043d",
                    "badges": [],
                    "url": "https://lbe.wikipedia.org/wiki/%D0%90%D1%81%D0%BB%D0%B0%D0%BD"
                },
                "lbwiki": {
                    "site": "lbwiki",
                    "title": "L\u00e9iw",
                    "badges": [],
                    "url": "https://lb.wikipedia.org/wiki/L%C3%A9iw"
                },
                "lezwiki": {
                    "site": "lezwiki",
                    "title": "\u0410\u0441\u043b\u0430\u043d",
                    "badges": [],
                    "url": "https://lez.wikipedia.org/wiki/%D0%90%D1%81%D0%BB%D0%B0%D0%BD"
                },
                "lfnwiki": {
                    "site": "lfnwiki",
                    "title": "Leon",
                    "badges": [],
                    "url": "https://lfn.wikipedia.org/wiki/Leon"
                },
                "lijwiki": {
                    "site": "lijwiki",
                    "title": "Lion (bestia)",
                    "badges": [],
                    "url": "https://lij.wikipedia.org/wiki/Lion_(bestia)"
                },
                "liwiki": {
                    "site": "liwiki",
                    "title": "Liew",
                    "badges": ["Q17437796"],
                    "url": "https://li.wikipedia.org/wiki/Liew"
                },
                "lldwiki": {
                    "site": "lldwiki",
                    "title": "Lion",
                    "badges": [],
                    "url": "https://lld.wikipedia.org/wiki/Lion"
                },
                "lmowiki": {
                    "site": "lmowiki",
                    "title": "Panthera leo",
                    "badges": [],
                    "url": "https://lmo.wikipedia.org/wiki/Panthera_leo"
                },
                "lnwiki": {
                    "site": "lnwiki",
                    "title": "Nk\u0254\u0301si",
                    "badges": [],
                    "url": "https://ln.wikipedia.org/wiki/Nk%C9%94%CC%81si"
                },
                "ltgwiki": {
                    "site": "ltgwiki",
                    "title": "\u013bovs",
                    "badges": [],
                    "url": "https://ltg.wikipedia.org/wiki/%C4%BBovs"
                },
                "ltwiki": {
                    "site": "ltwiki",
                    "title": "Li\u016btas",
                    "badges": [],
                    "url": "https://lt.wikipedia.org/wiki/Li%C5%ABtas"
                },
                "ltwikiquote": {
                    "site": "ltwikiquote",
                    "title": "Li\u016btas",
                    "badges": [],
                    "url": "https://lt.wikiquote.org/wiki/Li%C5%ABtas"
                },
                "lvwiki": {
                    "site": "lvwiki",
                    "title": "Lauva",
                    "badges": ["Q17437796"],
                    "url": "https://lv.wikipedia.org/wiki/Lauva"
                },
                "mdfwiki": {
                    "site": "mdfwiki",
                    "title": "\u041e\u0440\u043a\u0441\u043e\u0444\u0442\u0430",
                    "badges": ["Q17437796"],
                    "url": "https://mdf.wikipedia.org/wiki/%D0%9E%D1%80%D0%BA%D1%81%D0%BE%D1%84%D1%82%D0%B0"
                },
                "mgwiki": {
                    "site": "mgwiki",
                    "title": "Liona",
                    "badges": [],
                    "url": "https://mg.wikipedia.org/wiki/Liona"
                },
                "mhrwiki": {
                    "site": "mhrwiki",
                    "title": "\u0410\u0440\u044b\u0441\u043b\u0430\u043d",
                    "badges": [],
                    "url": "https://mhr.wikipedia.org/wiki/%D0%90%D1%80%D1%8B%D1%81%D0%BB%D0%B0%D0%BD"
                },
                "mkwiki": {
                    "site": "mkwiki",
                    "title": "\u041b\u0430\u0432",
                    "badges": [],
                    "url": "https://mk.wikipedia.org/wiki/%D0%9B%D0%B0%D0%B2"
                },
                "mlwiki": {
                    "site": "mlwiki",
                    "title": "\u0d38\u0d3f\u0d02\u0d39\u0d02",
                    "badges": [],
                    "url": "https://ml.wikipedia.org/wiki/%E0%B4%B8%E0%B4%BF%E0%B4%82%E0%B4%B9%E0%B4%82"
                },
                "mniwiki": {
                    "site": "mniwiki",
                    "title": "\uabc5\uabe3\uabe1\uabc1\uabe5",
                    "badges": [],
                    "url": "https://mni.wikipedia.org/wiki/%EA%AF%85%EA%AF%A3%EA%AF%A1%EA%AF%81%EA%AF%A5"
                },
                "mnwiki": {
                    "site": "mnwiki",
                    "title": "\u0410\u0440\u0441\u043b\u0430\u043d",
                    "badges": [],
                    "url": "https://mn.wikipedia.org/wiki/%D0%90%D1%80%D1%81%D0%BB%D0%B0%D0%BD"
                },
                "mrjwiki": {
                    "site": "mrjwiki",
                    "title": "\u0410\u0440\u044b\u0441\u043b\u0430\u043d",
                    "badges": [],
                    "url": "https://mrj.wikipedia.org/wiki/%D0%90%D1%80%D1%8B%D1%81%D0%BB%D0%B0%D0%BD"
                },
                "mrwiki": {
                    "site": "mrwiki",
                    "title": "\u0938\u093f\u0902\u0939",
                    "badges": [],
                    "url": "https://mr.wikipedia.org/wiki/%E0%A4%B8%E0%A4%BF%E0%A4%82%E0%A4%B9"
                },
                "mswiki": {
                    "site": "mswiki",
                    "title": "Singa",
                    "badges": ["Q17437796"],
                    "url": "https://ms.wikipedia.org/wiki/Singa"
                },
                "mtwiki": {
                    "site": "mtwiki",
                    "title": "Iljun",
                    "badges": [],
                    "url": "https://mt.wikipedia.org/wiki/Iljun"
                },
                "mywiki": {
                    "site": "mywiki",
                    "title": "\u1001\u103c\u1004\u103a\u1039\u101e\u1031\u1037",
                    "badges": [],
                    "url": "https://my.wikipedia.org/wiki/%E1%80%81%E1%80%BC%E1%80%84%E1%80%BA%E1%80%B9%E1%80%9E%E1%80%B1%E1%80%B7"
                },
                "newiki": {
                    "site": "newiki",
                    "title": "\u0938\u093f\u0902\u0939",
                    "badges": [],
                    "url": "https://ne.wikipedia.org/wiki/%E0%A4%B8%E0%A4%BF%E0%A4%82%E0%A4%B9"
                },
                "newwiki": {
                    "site": "newwiki",
                    "title": "\u0938\u093f\u0902\u0939",
                    "badges": [],
                    "url": "https://new.wikipedia.org/wiki/%E0%A4%B8%E0%A4%BF%E0%A4%82%E0%A4%B9"
                },
                "nlwiki": {
                    "site": "nlwiki",
                    "title": "Leeuw (dier)",
                    "badges": [],
                    "url": "https://nl.wikipedia.org/wiki/Leeuw_(dier)"
                },
                "nnwiki": {
                    "site": "nnwiki",
                    "title": "L\u00f8ve",
                    "badges": [],
                    "url": "https://nn.wikipedia.org/wiki/L%C3%B8ve"
                },
                "nowiki": {
                    "site": "nowiki",
                    "title": "L\u00f8ve",
                    "badges": [],
                    "url": "https://no.wikipedia.org/wiki/L%C3%B8ve"
                },
                "nrmwiki": {
                    "site": "nrmwiki",
                    "title": "Lion",
                    "badges": [],
                    "url": "https://nrm.wikipedia.org/wiki/Lion"
                },
                "nsowiki": {
                    "site": "nsowiki",
                    "title": "Tau",
                    "badges": [],
                    "url": "https://nso.wikipedia.org/wiki/Tau"
                },
                "nvwiki": {
                    "site": "nvwiki",
                    "title": "N\u00e1shd\u00f3\u00edtsoh bitsiij\u012f\u02bc dadit\u0142\u02bcoo\u00edg\u00ed\u00ed",
                    "badges": [],
                    "url": "https://nv.wikipedia.org/wiki/N%C3%A1shd%C3%B3%C3%ADtsoh_bitsiij%C4%AF%CA%BC_dadit%C5%82%CA%BCoo%C3%ADg%C3%AD%C3%AD"
                },
                "ocwiki": {
                    "site": "ocwiki",
                    "title": "Panthera leo",
                    "badges": [],
                    "url": "https://oc.wikipedia.org/wiki/Panthera_leo"
                },
                "orwiki": {
                    "site": "orwiki",
                    "title": "\u0b38\u0b3f\u0b02\u0b39",
                    "badges": [],
                    "url": "https://or.wikipedia.org/wiki/%E0%AC%B8%E0%AC%BF%E0%AC%82%E0%AC%B9"
                },
                "oswiki": {
                    "site": "oswiki",
                    "title": "\u0426\u043e\u043c\u0430\u0445\u044a",
                    "badges": [],
                    "url": "https://os.wikipedia.org/wiki/%D0%A6%D0%BE%D0%BC%D0%B0%D1%85%D1%8A"
                },
                "pamwiki": {
                    "site": "pamwiki",
                    "title": "Leon (animal)",
                    "badges": ["Q17437796"],
                    "url": "https://pam.wikipedia.org/wiki/Leon_(animal)"
                },
                "pawiki": {
                    "site": "pawiki",
                    "title": "\u0a2c\u0a71\u0a2c\u0a30 \u0a38\u0a3c\u0a47\u0a30",
                    "badges": [],
                    "url": "https://pa.wikipedia.org/wiki/%E0%A8%AC%E0%A9%B1%E0%A8%AC%E0%A8%B0_%E0%A8%B8%E0%A8%BC%E0%A9%87%E0%A8%B0"
                },
                "pcdwiki": {
                    "site": "pcdwiki",
                    "title": "Lion",
                    "badges": [],
                    "url": "https://pcd.wikipedia.org/wiki/Lion"
                },
                "plwiki": {
                    "site": "plwiki",
                    "title": "Lew afryka\u0144ski",
                    "badges": ["Q17437796"],
                    "url": "https://pl.wikipedia.org/wiki/Lew_afryka%C5%84ski"
                },
                "plwikiquote": {
                    "site": "plwikiquote",
                    "title": "Lew",
                    "badges": [],
                    "url": "https://pl.wikiquote.org/wiki/Lew"
                },
                "pmswiki": {
                    "site": "pmswiki",
                    "title": "Lion",
                    "badges": [],
                    "url": "https://pms.wikipedia.org/wiki/Lion"
                },
                "pnbwiki": {
                    "site": "pnbwiki",
                    "title": "\u0628\u0628\u0631 \u0634\u06cc\u0631",
                    "badges": [],
                    "url": "https://pnb.wikipedia.org/wiki/%D8%A8%D8%A8%D8%B1_%D8%B4%DB%8C%D8%B1"
                },
                "pswiki": {
                    "site": "pswiki",
                    "title": "\u0632\u0645\u0631\u06cc",
                    "badges": [],
                    "url": "https://ps.wikipedia.org/wiki/%D8%B2%D9%85%D8%B1%DB%8C"
                },
                "ptwiki": {
                    "site": "ptwiki",
                    "title": "Le\u00e3o",
                    "badges": [],
                    "url": "https://pt.wikipedia.org/wiki/Le%C3%A3o"
                },
                "ptwikiquote": {
                    "site": "ptwikiquote",
                    "title": "Le\u00e3o",
                    "badges": [],
                    "url": "https://pt.wikiquote.org/wiki/Le%C3%A3o"
                },
                "quwiki": {
                    "site": "quwiki",
                    "title": "Liyun",
                    "badges": [],
                    "url": "https://qu.wikipedia.org/wiki/Liyun"
                },
                "rmwiki": {
                    "site": "rmwiki",
                    "title": "Liun",
                    "badges": [],
                    "url": "https://rm.wikipedia.org/wiki/Liun"
                },
                "rnwiki": {
                    "site": "rnwiki",
                    "title": "Intare",
                    "badges": [],
                    "url": "https://rn.wikipedia.org/wiki/Intare"
                },
                "rowiki": {
                    "site": "rowiki",
                    "title": "Leu",
                    "badges": [],
                    "url": "https://ro.wikipedia.org/wiki/Leu"
                },
                "ruewiki": {
                    "site": "ruewiki",
                    "title": "\u041b\u0435\u0432",
                    "badges": [],
                    "url": "https://rue.wikipedia.org/wiki/%D0%9B%D0%B5%D0%B2"
                },
                "ruwiki": {
                    "site": "ruwiki",
                    "title": "\u041b\u0435\u0432",
                    "badges": ["Q17437798"],
                    "url": "https://ru.wikipedia.org/wiki/%D0%9B%D0%B5%D0%B2"
                },
                "ruwikinews": {
                    "site": "ruwikinews",
                    "title": "\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f:\u041b\u044c\u0432\u044b",
                    "badges": [],
                    "url": "https://ru.wikinews.org/wiki/%D0%9A%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D1%8F:%D0%9B%D1%8C%D0%B2%D1%8B"
                },
                "rwwiki": {
                    "site": "rwwiki",
                    "title": "Intare",
                    "badges": [],
                    "url": "https://rw.wikipedia.org/wiki/Intare"
                },
                "sahwiki": {
                    "site": "sahwiki",
                    "title": "\u0425\u0430\u0445\u0430\u0439",
                    "badges": [],
                    "url": "https://sah.wikipedia.org/wiki/%D0%A5%D0%B0%D1%85%D0%B0%D0%B9"
                },
                "satwiki": {
                    "site": "satwiki",
                    "title": "\u1c61\u1c5f\u1c74\u1c5f\u1c60\u1c69\u1c5e",
                    "badges": [],
                    "url": "https://sat.wikipedia.org/wiki/%E1%B1%A1%E1%B1%9F%E1%B1%B4%E1%B1%9F%E1%B1%A0%E1%B1%A9%E1%B1%9E"
                },
                "sawiki": {
                    "site": "sawiki",
                    "title": "\u0938\u093f\u0902\u0939\u0903 \u092a\u0936\u0941\u0903",
                    "badges": [],
                    "url": "https://sa.wikipedia.org/wiki/%E0%A4%B8%E0%A4%BF%E0%A4%82%E0%A4%B9%E0%A4%83_%E0%A4%AA%E0%A4%B6%E0%A5%81%E0%A4%83"
                },
                "scnwiki": {
                    "site": "scnwiki",
                    "title": "Panthera leo",
                    "badges": [],
                    "url": "https://scn.wikipedia.org/wiki/Panthera_leo"
                },
                "scowiki": {
                    "site": "scowiki",
                    "title": "Lion",
                    "badges": ["Q17437796"],
                    "url": "https://sco.wikipedia.org/wiki/Lion"
                },
                "sdwiki": {
                    "site": "sdwiki",
                    "title": "\u0628\u0628\u0631 \u0634\u064a\u0646\u0647\u0646",
                    "badges": [],
                    "url": "https://sd.wikipedia.org/wiki/%D8%A8%D8%A8%D8%B1_%D8%B4%D9%8A%D9%86%D9%87%D9%86"
                },
                "sewiki": {
                    "site": "sewiki",
                    "title": "Ledjon",
                    "badges": [],
                    "url": "https://se.wikipedia.org/wiki/Ledjon"
                },
                "shiwiki": {
                    "site": "shiwiki",
                    "title": "Agrzam",
                    "badges": [],
                    "url": "https://shi.wikipedia.org/wiki/Agrzam"
                },
                "shnwiki": {
                    "site": "shnwiki",
                    "title": "\u101e\u1062\u1004\u103a\u1087\u101e\u102e\u1088",
                    "badges": [],
                    "url": "https://shn.wikipedia.org/wiki/%E1%80%9E%E1%81%A2%E1%80%84%E1%80%BA%E1%82%87%E1%80%9E%E1%80%AE%E1%82%88"
                },
                "shwiki": {
                    "site": "shwiki",
                    "title": "Lav",
                    "badges": [],
                    "url": "https://sh.wikipedia.org/wiki/Lav"
                },
                "simplewiki": {
                    "site": "simplewiki",
                    "title": "Lion",
                    "badges": [],
                    "url": "https://simple.wikipedia.org/wiki/Lion"
                },
                "siwiki": {
                    "site": "siwiki",
                    "title": "\u0dc3\u0dd2\u0d82\u0dc4\u0dba\u0dcf",
                    "badges": [],
                    "url": "https://si.wikipedia.org/wiki/%E0%B7%83%E0%B7%92%E0%B6%82%E0%B7%84%E0%B6%BA%E0%B7%8F"
                },
                "skwiki": {
                    "site": "skwiki",
                    "title": "Lev p\u00fa\u0161\u0165ov\u00fd",
                    "badges": [],
                    "url": "https://sk.wikipedia.org/wiki/Lev_p%C3%BA%C5%A1%C5%A5ov%C3%BD"
                },
                "skwikiquote": {
                    "site": "skwikiquote",
                    "title": "Lev",
                    "badges": [],
                    "url": "https://sk.wikiquote.org/wiki/Lev"
                },
                "slwiki": {
                    "site": "slwiki",
                    "title": "Lev",
                    "badges": [],
                    "url": "https://sl.wikipedia.org/wiki/Lev"
                },
                "smwiki": {
                    "site": "smwiki",
                    "title": "Leona",
                    "badges": [],
                    "url": "https://sm.wikipedia.org/wiki/Leona"
                },
                "snwiki": {
                    "site": "snwiki",
                    "title": "Shumba",
                    "badges": [],
                    "url": "https://sn.wikipedia.org/wiki/Shumba"
                },
                "sowiki": {
                    "site": "sowiki",
                    "title": "Libaax",
                    "badges": [],
                    "url": "https://so.wikipedia.org/wiki/Libaax"
                },
                "specieswiki": {
                    "site": "specieswiki",
                    "title": "Panthera leo",
                    "badges": [],
                    "url": "https://species.wikimedia.org/wiki/Panthera_leo"
                },
                "sqwiki": {
                    "site": "sqwiki",
                    "title": "Luani",
                    "badges": [],
                    "url": "https://sq.wikipedia.org/wiki/Luani"
                },
                "srwiki": {
                    "site": "srwiki",
                    "title": "\u041b\u0430\u0432",
                    "badges": [],
                    "url": "https://sr.wikipedia.org/wiki/%D0%9B%D0%B0%D0%B2"
                },
                "sswiki": {
                    "site": "sswiki",
                    "title": "Libhubesi",
                    "badges": [],
                    "url": "https://ss.wikipedia.org/wiki/Libhubesi"
                },
                "stqwiki": {
                    "site": "stqwiki",
                    "title": "Leeuwe",
                    "badges": [],
                    "url": "https://stq.wikipedia.org/wiki/Leeuwe"
                },
                "stwiki": {
                    "site": "stwiki",
                    "title": "Tau",
                    "badges": [],
                    "url": "https://st.wikipedia.org/wiki/Tau"
                },
                "suwiki": {
                    "site": "suwiki",
                    "title": "Singa",
                    "badges": [],
                    "url": "https://su.wikipedia.org/wiki/Singa"
                },
                "svwiki": {
                    "site": "svwiki",
                    "title": "Lejon",
                    "badges": [],
                    "url": "https://sv.wikipedia.org/wiki/Lejon"
                },
                "swwiki": {
                    "site": "swwiki",
                    "title": "Simba",
                    "badges": [],
                    "url": "https://sw.wikipedia.org/wiki/Simba"
                },
                "szlwiki": {
                    "site": "szlwiki",
                    "title": "Lew",
                    "badges": [],
                    "url": "https://szl.wikipedia.org/wiki/Lew"
                },
                "tawiki": {
                    "site": "tawiki",
                    "title": "\u0b9a\u0bbf\u0b99\u0bcd\u0b95\u0bae\u0bcd",
                    "badges": [],
                    "url": "https://ta.wikipedia.org/wiki/%E0%AE%9A%E0%AE%BF%E0%AE%99%E0%AF%8D%E0%AE%95%E0%AE%AE%E0%AF%8D"
                },
                "tcywiki": {
                    "site": "tcywiki",
                    "title": "\u0cb8\u0cbf\u0c82\u0cb9",
                    "badges": [],
                    "url": "https://tcy.wikipedia.org/wiki/%E0%B2%B8%E0%B2%BF%E0%B2%82%E0%B2%B9"
                },
                "tewiki": {
                    "site": "tewiki",
                    "title": "\u0c38\u0c3f\u0c02\u0c39\u0c02",
                    "badges": [],
                    "url": "https://te.wikipedia.org/wiki/%E0%B0%B8%E0%B0%BF%E0%B0%82%E0%B0%B9%E0%B0%82"
                },
                "tgwiki": {
                    "site": "tgwiki",
                    "title": "\u0428\u0435\u0440",
                    "badges": [],
                    "url": "https://tg.wikipedia.org/wiki/%D0%A8%D0%B5%D1%80"
                },
                "thwiki": {
                    "site": "thwiki",
                    "title": "\u0e2a\u0e34\u0e07\u0e42\u0e15",
                    "badges": [],
                    "url": "https://th.wikipedia.org/wiki/%E0%B8%AA%E0%B8%B4%E0%B8%87%E0%B9%82%E0%B8%95"
                },
                "tiwiki": {
                    "site": "tiwiki",
                    "title": "\u12a3\u1295\u1260\u1233",
                    "badges": [],
                    "url": "https://ti.wikipedia.org/wiki/%E1%8A%A3%E1%8A%95%E1%89%A0%E1%88%B3"
                },
                "tkwiki": {
                    "site": "tkwiki",
                    "title": "\u00ddolbars",
                    "badges": [],
                    "url": "https://tk.wikipedia.org/wiki/%C3%9Dolbars"
                },
                "tlwiki": {
                    "site": "tlwiki",
                    "title": "Leon",
                    "badges": [],
                    "url": "https://tl.wikipedia.org/wiki/Leon"
                },
                "trwiki": {
                    "site": "trwiki",
                    "title": "Aslan",
                    "badges": [],
                    "url": "https://tr.wikipedia.org/wiki/Aslan"
                },
                "ttwiki": {
                    "site": "ttwiki",
                    "title": "\u0410\u0440\u044b\u0441\u043b\u0430\u043d",
                    "badges": [],
                    "url": "https://tt.wikipedia.org/wiki/%D0%90%D1%80%D1%8B%D1%81%D0%BB%D0%B0%D0%BD"
                },
                "tumwiki": {
                    "site": "tumwiki",
                    "title": "Nkhalamu",
                    "badges": [],
                    "url": "https://tum.wikipedia.org/wiki/Nkhalamu"
                },
                "udmwiki": {
                    "site": "udmwiki",
                    "title": "\u0410\u0440\u044b\u0441\u043b\u0430\u043d",
                    "badges": [],
                    "url": "https://udm.wikipedia.org/wiki/%D0%90%D1%80%D1%8B%D1%81%D0%BB%D0%B0%D0%BD"
                },
                "ugwiki": {
                    "site": "ugwiki",
                    "title": "\u0634\u0649\u0631",
                    "badges": [],
                    "url": "https://ug.wikipedia.org/wiki/%D8%B4%D9%89%D8%B1"
                },
                "ukwiki": {
                    "site": "ukwiki",
                    "title": "\u041b\u0435\u0432",
                    "badges": [],
                    "url": "https://uk.wikipedia.org/wiki/%D0%9B%D0%B5%D0%B2"
                },
                "ukwikiquote": {
                    "site": "ukwikiquote",
                    "title": "\u041b\u0435\u0432",
                    "badges": [],
                    "url": "https://uk.wikiquote.org/wiki/%D0%9B%D0%B5%D0%B2"
                },
                "urwiki": {
                    "site": "urwiki",
                    "title": "\u0628\u0628\u0631 \u0634\u06cc\u0631",
                    "badges": ["Q17437796"],
                    "url": "https://ur.wikipedia.org/wiki/%D8%A8%D8%A8%D8%B1_%D8%B4%DB%8C%D8%B1"
                },
                "uzwiki": {
                    "site": "uzwiki",
                    "title": "Arslon",
                    "badges": [],
                    "url": "https://uz.wikipedia.org/wiki/Arslon"
                },
                "vecwiki": {
                    "site": "vecwiki",
                    "title": "Leon",
                    "badges": [],
                    "url": "https://vec.wikipedia.org/wiki/Leon"
                },
                "vepwiki": {
                    "site": "vepwiki",
                    "title": "Lev",
                    "badges": [],
                    "url": "https://vep.wikipedia.org/wiki/Lev"
                },
                "viwiki": {
                    "site": "viwiki",
                    "title": "S\u01b0 t\u1eed",
                    "badges": [],
                    "url": "https://vi.wikipedia.org/wiki/S%C6%B0_t%E1%BB%AD"
                },
                "vlswiki": {
                    "site": "vlswiki",
                    "title": "L\u00eaeuw (b\u00eaeste)",
                    "badges": [],
                    "url": "https://vls.wikipedia.org/wiki/L%C3%AAeuw_(b%C3%AAeste)"
                },
                "warwiki": {
                    "site": "warwiki",
                    "title": "Leon",
                    "badges": [],
                    "url": "https://war.wikipedia.org/wiki/Leon"
                },
                "wowiki": {
                    "site": "wowiki",
                    "title": "Gaynde",
                    "badges": [],
                    "url": "https://wo.wikipedia.org/wiki/Gaynde"
                },
                "wuuwiki": {
                    "site": "wuuwiki",
                    "title": "\u72ee",
                    "badges": [],
                    "url": "https://wuu.wikipedia.org/wiki/%E7%8B%AE"
                },
                "xalwiki": {
                    "site": "xalwiki",
                    "title": "\u0410\u0440\u0441\u043b\u04a3",
                    "badges": [],
                    "url": "https://xal.wikipedia.org/wiki/%D0%90%D1%80%D1%81%D0%BB%D2%A3"
                },
                "xhwiki": {
                    "site": "xhwiki",
                    "title": "Ingonyama",
                    "badges": [],
                    "url": "https://xh.wikipedia.org/wiki/Ingonyama"
                },
                "xmfwiki": {
                    "site": "xmfwiki",
                    "title": "\u10dc\u10ef\u10d8\u10da\u10dd",
                    "badges": [],
                    "url": "https://xmf.wikipedia.org/wiki/%E1%83%9C%E1%83%AF%E1%83%98%E1%83%9A%E1%83%9D"
                },
                "yiwiki": {
                    "site": "yiwiki",
                    "title": "\u05dc\u05d9\u05d9\u05d1",
                    "badges": [],
                    "url": "https://yi.wikipedia.org/wiki/%D7%9C%D7%99%D7%99%D7%91"
                },
                "yowiki": {
                    "site": "yowiki",
                    "title": "K\u00ecn\u00ec\u00fan",
                    "badges": [],
                    "url": "https://yo.wikipedia.org/wiki/K%C3%ACn%C3%AC%C3%BAn"
                },
                "zawiki": {
                    "site": "zawiki",
                    "title": "Saeceij",
                    "badges": [],
                    "url": "https://za.wikipedia.org/wiki/Saeceij"
                },
                "zh_min_nanwiki": {
                    "site": "zh_min_nanwiki",
                    "title": "Sai",
                    "badges": [],
                    "url": "https://zh-min-nan.wikipedia.org/wiki/Sai"
                },
                "zh_yuewiki": {
                    "site": "zh_yuewiki",
                    "title": "\u7345\u5b50",
                    "badges": ["Q17437796"],
                    "url": "https://zh-yue.wikipedia.org/wiki/%E7%8D%85%E5%AD%90"
                },
                "zhwiki": {
                    "site": "zhwiki",
                    "title": "\u72ee",
                    "badges": [],
                    "url": "https://zh.wikipedia.org/wiki/%E7%8B%AE"
                },
                "zuwiki": {
                    "site": "zuwiki",
                    "title": "Ibhubesi",
                    "badges": [],
                    "url": "https://zu.wikipedia.org/wiki/Ibhubesi"
                }
            }
        }
    }
}
Utils.injectJsonDownloadForTests(    "https://www.wikidata.org/wiki/Special:EntityData/Q140.json", Q140)
const Q14517013 = {
    "entities": {
        "Q14517013": {
            "pageid": 16187848,
            "ns": 0,
            "title": "Q14517013",
            "lastrevid": 1408823680,
            "modified": "2021-04-26T07:35:01Z",
            "type": "item",
            "id": "Q14517013",
            "labels": {
                "nl": {"language": "nl", "value": "Vredesmolen"},
                "en": {"language": "en", "value": "Peace Mill"}
            },
            "descriptions": {"nl": {"language": "nl", "value": "molen in West-Vlaanderen"}},
            "aliases": {},
            "claims": {
                "P625": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P625",
                        "hash": "d86538f14e8cca00bbf30fb029829aacbc6903a0",
                        "datavalue": {
                            "value": {
                                "latitude": 50.99444,
                                "longitude": 2.92528,
                                "altitude": null,
                                "precision": 0.0001,
                                "globe": "http://www.wikidata.org/entity/Q2"
                            }, "type": "globecoordinate"
                        },
                        "datatype": "globe-coordinate"
                    },
                    "type": "statement",
                    "id": "Q14517013$DBFBFD69-F54D-4C92-A7F4-A44F876E5776",
                    "rank": "normal",
                    "references": [{
                        "hash": "732ec1c90a6f0694c7db9a71bf09fe7f2b674172",
                        "snaks": {
                            "P143": [{
                                "snaktype": "value",
                                "property": "P143",
                                "hash": "9123b0de1cc9c3954366ba797d598e4e1ea4146f",
                                "datavalue": {
                                    "value": {
                                        "entity-type": "item",
                                        "numeric-id": 10000,
                                        "id": "Q10000"
                                    }, "type": "wikibase-entityid"
                                },
                                "datatype": "wikibase-item"
                            }]
                        },
                        "snaks-order": ["P143"]
                    }]
                }],
                "P17": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P17",
                        "hash": "c2859f311753176d6bdfa7da54ceeeac7acb52c8",
                        "datavalue": {
                            "value": {
                                "entity-type": "item",
                                "numeric-id": 31,
                                "id": "Q31"
                            }, "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "id": "Q14517013$C12E4DA5-44E1-41ED-BF3D-C84381246429",
                    "rank": "normal"
                }],
                "P18": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P18",
                        "hash": "af765166ecaa7d01ea800812b5b356886b8849a0",
                        "datavalue": {
                            "value": "Klerken Vredesmolen R01.jpg",
                            "type": "string"
                        },
                        "datatype": "commonsMedia"
                    },
                    "type": "statement",
                    "id": "Q14517013$5291801E-11BE-4CE7-8F42-D0D6A120F390",
                    "rank": "normal"
                }],
                "P2867": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P2867",
                        "hash": "b1c627972ba2cc71e3567d2fb56cb5f90dd64007",
                        "datavalue": {"value": "893", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q14517013$2aff9dcd-4d24-cd92-b5af-f6268425695f",
                    "rank": "normal"
                }],
                "P31": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P31",
                        "hash": "9b48263bb51c506553aac2281ae331353b5c9002",
                        "datavalue": {
                            "value": {
                                "entity-type": "item",
                                "numeric-id": 38720,
                                "id": "Q38720"
                            }, "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "id": "Q14517013$46dd9d89-4999-eee6-20a4-c4f6650b1d9c",
                    "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P31",
                        "hash": "a1d6f3409c57de0361c68263c9397a99dabe19ea",
                        "datavalue": {
                            "value": {
                                "entity-type": "item",
                                "numeric-id": 3851468,
                                "id": "Q3851468"
                            }, "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "id": "Q14517013$C83A8B1F-7798-493A-86C9-EC0EFEE356B3",
                    "rank": "normal"
                }, {
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P31",
                        "hash": "ee5ba9185bdf9f0eb80b52e1cdc70c5883fac95a",
                        "datavalue": {
                            "value": {
                                "entity-type": "item",
                                "numeric-id": 623605,
                                "id": "Q623605"
                            }, "type": "wikibase-entityid"
                        },
                        "datatype": "wikibase-item"
                    },
                    "type": "statement",
                    "id": "Q14517013$CF74DC2E-6814-4755-9BAD-6EE9FEF637DD",
                    "rank": "normal"
                }],
                "P2671": [{
                    "mainsnak": {
                        "snaktype": "value",
                        "property": "P2671",
                        "hash": "83fb38a3c6407f7d0d7bb051d1c31cea8ae26975",
                        "datavalue": {"value": "/g/121cb15z", "type": "string"},
                        "datatype": "external-id"
                    },
                    "type": "statement",
                    "id": "Q14517013$E6FFEF32-0131-42FD-9C66-1A406B68059A",
                    "rank": "normal"
                }]
            },
            "sitelinks": {
                "commonswiki": {
                    "site": "commonswiki",
                    "title": "Category:Vredesmolen, Klerken",
                    "badges": [],
                    "url": "https://commons.wikimedia.org/wiki/Category:Vredesmolen,_Klerken"
                },
                "nlwiki": {
                    "site": "nlwiki",
                    "title": "Vredesmolen",
                    "badges": [],
                    "url": "https://nl.wikipedia.org/wiki/Vredesmolen"
                }
            }
        }
    }
}
Utils.injectJsonDownloadForTests(                "https://www.wikidata.org/wiki/Special:EntityData/Q14517013.json",                Q14517013            )

const L614072={
    "entities": {
        "L614072": {
            "pageid": 104085278,
            "ns": 146,
            "title": "Lexeme:L614072",
            "lastrevid": 1509989280,
            "modified": "2021-10-09T18:43:52Z",
            "type": "lexeme",
            "id": "L614072",
            "lemmas": {"nl": {"language": "nl", "value": "Groen"}},
            "lexicalCategory": "Q34698",
            "language": "Q7411",
            "claims": {},
            "forms": [],
            "senses": [{
                "id": "L614072-S1",
                "glosses": {"nl": {"language": "nl", "value": "Nieuw"}},
                "claims": {}
            }, {
                "id": "L614072-S2",
                "glosses": {"nl": {"language": "nl", "value": "Jong"}},
                "claims": {}
            }, {
                "id": "L614072-S3",
                "glosses": {"nl": {"language": "nl", "value": "Pril"}},
                "claims": {}
            }]
        }
    }
}
Utils.injectJsonDownloadForTests(    "https://www.wikidata.org/wiki/Special:EntityData/L614072.json",L614072)

describe("Wikidata", () => {

    it("Download lion", 
        async () => {
           
            const wikidata = await Wikidata.LoadWikidataEntryAsync("Q140")
            expect(wikidata.claims.get("P18")).length(2)
        }
    )
    
    it("download wikidata",
        async () => {
            const wdata = await Wikidata.LoadWikidataEntryAsync(14517013)
            expect(wdata.wikisites).to.have.key("nl")
            expect(wdata.wikisites.get("nl")).eq("Vredesmolen")
        })
    
    it("Download a lexeme", async () => {

        const response = await Wikidata.LoadWikidataEntryAsync("https://www.wikidata.org/wiki/Lexeme:L614072")
        expect(response).not.undefined
        expect(response.labels).to.have.key("nl")
        expect(response.labels).to.contains("Groen")
    })
    
})
