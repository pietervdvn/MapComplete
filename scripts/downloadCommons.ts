/**
 * Script to download images from Wikimedia Commons, and save them together with license information.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { unescape } from "querystring"
import SmallLicense from "../Models/smallLicense"

interface ExtMetadataProp {
    value: string
    source: string
    hidden: string
}

interface ImageQueryAPIResponse {
    continue: {
        iistart: string
        continue: string
    }
    query: {
        normalized?: {
            from: string
            to: string
        }[]
        pages: {
            [key: string]: {
                pageid: number
                ns: number
                title: string
                imagerepository: string
                imageinfo: {
                    url: string
                    descriptionurl: string
                    descriptionshorturl: string
                    extmetadata: {
                        DateTime: ExtMetadataProp
                        ObjectName: ExtMetadataProp
                        CommonsMetadataExtension: ExtMetadataProp
                        Categories: ExtMetadataProp
                        Assessments: ExtMetadataProp
                        ImageDescription: ExtMetadataProp
                        DateTimeOriginal: ExtMetadataProp
                        Credit: ExtMetadataProp
                        Artist: ExtMetadataProp
                        LicenseShortName: ExtMetadataProp
                        UsageTerms: ExtMetadataProp
                        AttributionRequired: ExtMetadataProp
                        Copyrighted: ExtMetadataProp
                        Restrictions: ExtMetadataProp
                        License: ExtMetadataProp
                    }
                }[]
            }
        }
    }
}

interface CategoryMember {
    pageid: number
    ns: number
    title: string
}

interface CategoryQueryAPIResponse {
    batchcomplete: string
    query: {
        categorymembers: CategoryMember[]
    }
}

// Map license names of Wikimedia Commons to different names
const licenseMapping = {}

async function main(args: string[]) {
    if (args.length < 2) {
        console.log("Usage: downloadCommons.ts <output folder> <url> <?url> <?url> .. ")
        return
    }
    const [outputFolder, ...urls] = args

    for (const url of urls) {
        // Download details from the API
        const commonsFileName = url.split("/").pop().split("?").shift()
        console.log(`Processing ${commonsFileName}...`)

        // Check if it is a file or a category
        if (url.includes("Category:")) {
            // Download all files in the category
            const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=${commonsFileName}&cmlimit=250&cmtype=file`
            const response = await fetch(apiUrl)
            const apiDetails: CategoryQueryAPIResponse = await response.json()
            for (const member of apiDetails.query.categorymembers) {
                await downloadImage(member.title, outputFolder)
            }
        } else {
            await downloadImage(commonsFileName, outputFolder)
        }
    }
}

async function downloadImage(filename: string, outputFolder: string) {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&titles=${filename}`
    const response = await fetch(apiUrl)
    const apiDetails: ImageQueryAPIResponse = await response.json()

    // Harvest useful information
    const wikiPage = apiDetails.query.pages[Object.keys(apiDetails.query.pages)[0]]
    const wikiUrl = wikiPage.imageinfo[0].descriptionurl
    const fileUrl = wikiPage.imageinfo[0].url
    const author = wikiPage.imageinfo[0].extmetadata.Artist.value
    const license = wikiPage.imageinfo[0].extmetadata.LicenseShortName.value

    // Check if the output folder exists
    if (!existsSync(outputFolder)) {
        const parts = outputFolder.split("/")
        for (var i = 0; i < parts.length; i++) {
            const part = parts.slice(0, i + 1).join("/")
            if (!existsSync(part)) {
                console.log(`Creating folder ${part}`)
                mkdirSync(part)
            }
        }
    }

    // Download the file and save it
    const cleanFileName = unescape(filename).replace("File:", "")
    console.log(
        `Downloading ${cleanFileName} from ${fileUrl} and saving it to ${outputFolder}/${cleanFileName}...`
    )
    const fileResponse = await fetch(fileUrl)
    const fileBuffer = await fileResponse.arrayBuffer()
    const file = Buffer.from(fileBuffer)
    const filePath = `${outputFolder}/${cleanFileName}`
    writeFileSync(filePath, file)

    // Save the license information
    const licenseInfo: SmallLicense = {
        path: cleanFileName,
        license: licenseMapping[license] || license,
        authors: [author],
        sources: [wikiUrl],
    }

    const licensePath = `${outputFolder}/license_info.json`
    if (!existsSync(licensePath)) {
        // Create the file if it doesn't exist
        writeFileSync(licensePath, JSON.stringify([licenseInfo], null, 2))
    } else {
        // Append to the file if it does exist
        const licenseFile = await readFileSync(licensePath, "utf8")
        const licenseData = JSON.parse(licenseFile)
        licenseData.push(licenseInfo)
        writeFileSync(licensePath, JSON.stringify(licenseData, null, 2))
    }
}

main(process.argv.slice(2))
