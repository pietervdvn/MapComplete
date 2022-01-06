#! /bin/bash

# Requires `sudo apt-get install librsvg2-bin`
# $1 should be the file

resizeFile(){
    PTH="$(dirname "${1}")"
    FILE="$(basename "${1}")"
    echo "Path is $PTH, name is $FILE"
    

    
    if grep --quiet radialGradient $1
    then
        echo "SKIPPING $1: it has a radialGradient"
    else
        
        if grep --quiet linearGradient $1
        then
                echo "WARNING for $1: it has a linearGradient"
        fi
    
        svg-resizer -f -x 500 -y 500 -o /tmp/resized $1
        mv "/tmp/resized/$FILE" "$PTH"
    fi
}

export -f resizeFile
find . -name "*.svg" -exec bash -c 'resizeFile "$0"' {} \;
