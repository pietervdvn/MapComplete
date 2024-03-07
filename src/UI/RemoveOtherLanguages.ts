export {}
let lang = (
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    navigator["userLanguage"] ||
    "en"
).substr(0, 2)

function filterLangs(maindiv) {
    let foundLangs = 0
    for (const child of Array.from(maindiv.children)) {
        if (child.attributes.getNamedItem("lang")?.value === lang) {
            foundLangs++
        }
    }
    if (foundLangs === 0) {
        lang = "en"
    }
    for (const child of Array.from(maindiv.children)) {
        const childLang = child.attributes.getNamedItem("lang")
        if (childLang === undefined) {
            continue
        }
        if (childLang.value === lang) {
            continue
        }
        child.parentElement.removeChild(child)
    }
}

filterLangs(document.getElementById("descriptions-while-loading"))
filterLangs(document.getElementById("default-title"))
