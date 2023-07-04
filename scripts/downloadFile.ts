// SPDX-FileCopyrightText: 2023 MapComplete  <https://mapcomplete.osm.be/>
//
// SPDX-License-Identifier: GPL-3.0-ONLY

const http = require("https")
const fs = require("fs")

// Could use yargs to have more validation but wanted to keep it simple
const args = process.argv.slice(2)
const FILE_URL = args[0]
const DESTINATION = args[1]

console.log(`Downloading ${FILE_URL} to ${DESTINATION}`)

const file = fs.createWriteStream(DESTINATION)
http.get(FILE_URL, (response) => response.pipe(file))
