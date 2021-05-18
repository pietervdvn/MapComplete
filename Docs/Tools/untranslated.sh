#!/bin/sh
# Find and add missing translations (compared to english)
#
# Warning: please escape your string yourself
#
# Usage: (from repo root)
#   ./Docs/Tools/untranslated.sh LANG
#
# Dependencies: find, jq, fzf, optionally bash or zsh for advanced line editing

TRLANG="$1"
QUERY='..|select(has("en"))?|select((has("'"$TRLANG"'")|not))?'

count () {
    jq "[$QUERY]|length" < $1
}

listpath () {
    jq -r "path($QUERY)|map(if type == \"string\" then \".\"+. else \"[\\(.)]\" end)|add" < $1
}

listfiles () {
    for file in $(find . -name "*.json") ; do
        count="$(count "$file")"
        if [[ "$count" -gt 0 ]] ; then
            echo "$file: $count"
        fi
    done
}

selfile () {
    listfiles | fzf --preview="cat \$(echo {} | cut -f1 -d:) | jq '$QUERY'"
}

selpath () {
    listpath "$FILE" | fzf --preview="cat $FILE | jq {}"
}


FILE=$(selfile | cut -f1 -d:)

while [[ -f "$FILE" ]] ; do
    strpath=$(selpath)
    while [[ -n "$strpath" ]] ; do
        echo -e "\e[1mAvailable translations:\e[0m"
        jq "$strpath" < "$FILE"

        echo -e "\e[1m$TRLANG version: \e[0m"
        if [[ -n "$BASH" ]] || [[ -n "$ZSH_VERSION" ]] ; then
            read -re translation
        else
            read -r translation
        fi

        if [[ -n "$translation" ]] ; then
            jq "$strpath.$TRLANG = \"$translation\"" < "$FILE" > "$FILE.new" && mv "$FILE.new" "$FILE"
        fi
        strpath=$(selpath)
    done
    FILE=$(selfile)
done

