import { existsSync, renameSync, readFileSync, writeFileSync } from "fs"
import SmallLicense from "../src/Models/smallLicense"

/**
 * Script to move/rename image files
 * Useful after downloading images from wikimedia commons
 * Apart from moving the image files, this will also update the license file
 *
 * This will NOT update any images in the theme
 */

function main(args: string[]) {
    // Check if the correct number of arguments are passed
    if (args.length != 2) {
        console.log("Usage: moveImage.ts oldPath newPath")
        console.log("You passed in the arguments: " + args.join(","))
        console.log("Example: npx vite-node scripts/moveImage.ts images/old.jpg images/new.jpg")
        return
    }
    const [oldPath, newPath] = args

    // Check if the oldPath exists
    if (!existsSync(oldPath)) {
        console.log("The oldPath does not exist: " + oldPath)
        return
    }

    // Move file
    renameSync(oldPath, newPath)

    // If it exists also move the .license file
    const oldLicensePath = oldPath + ".license"
    if (existsSync(oldLicensePath)) {
        const newLicensePath = newPath + ".license"
        renameSync(oldLicensePath, newLicensePath)
    }

    console.log("Moved file from " + oldPath + " to " + newPath)

    // Open license_info.json in the same directory as the old file
    const licensePath = oldPath.replace(/\/[^/]+$/, "/license_info.json")
    if (!existsSync(licensePath)) {
        console.log(
            "The license file does not exist: " +
                licensePath +
                ". Skipping writing to license file."
        )
        return
    }

    // Read license file
    const licenseFile = readFileSync(licensePath, "utf8")
    const licenseInfo = JSON.parse(licenseFile) as SmallLicense[]

    // Find correct license item
    const licenseItem = licenseInfo.find((item) => item.path === oldPath.replace(/.*\//, ""))

    // Filter out license item
    const newLicenseInfo = licenseInfo.filter((item) => item.path !== oldPath.replace(/.*\//, ""))
    const newLicenseFile = JSON.stringify(newLicenseInfo, null, 2)

    // Write new license file
    writeFileSync(licensePath, newLicenseFile)

    // Look for a license_info.json file in the new path
    const newLicensePath = newPath.replace(/\/[^/]+$/, "/license_info.json")
    if (!existsSync(newLicensePath) && licenseItem) {
        console.log("License file doesn't exist yet, creating new one: " + newLicensePath)

        // Create new license item
        const newLicenseItem = licenseItem
        newLicenseItem.path = newPath.replace(/.*\//, "")

        // Create file
        writeFileSync(newLicensePath, JSON.stringify([newLicenseItem], null, 2))
    } else if (licenseItem) {
        console.log("Appending to existing license file: " + newLicensePath)

        // Create new license item
        const newLicenseItem = licenseItem
        newLicenseItem.path = newPath.replace(/.*\//, "")

        // Append to existing file
        const newLicenseFile = readFileSync(newLicensePath, "utf8")
        const newLicenseInfo = JSON.parse(newLicenseFile) as SmallLicense[]
        newLicenseInfo.push(newLicenseItem)
        writeFileSync(newLicensePath, JSON.stringify(newLicenseInfo, null, 2))
    }
}

main(process.argv.slice(2))
