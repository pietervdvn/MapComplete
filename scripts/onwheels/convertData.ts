import { parse } from "csv-parse/sync"
import { readFileSync, writeFileSync } from "fs"
import { Feature, FeatureCollection, GeoJsonProperties } from "geojson"
import Constants from "./constants"

/**
 * Function to determine the tags for a category
 *
 * @param category The category of the item
 * @returns List of tags for the category
 */
function categoryTags(category: string): GeoJsonProperties {
    const tags = {
        tags: Object.keys(Constants.categories[category]).map((tag) => {
            return `${tag}=${Constants.categories[category][tag]}`
        }),
    }
    if (!tags) {
        throw `Unknown category: ${category}`
    }
    return tags
}

/**
 * Rename tags to match the OSM standard
 *
 * @param item The item to convert
 * @returns GeoJsonProperties for the item
 */
function renameTags(item): GeoJsonProperties {
    const properties: GeoJsonProperties = {}
    properties.tags = []
    // Loop through the original item tags
    for (const key in item) {
        // Check if we need it and it's not a null value
        if (Constants.names[key] && item[key]) {
            // Name and id tags need to be in the properties
            if (Constants.names[key] == "name" || Constants.names[key] == "id") {
                properties[Constants.names[key]] = item[key]
            }
            // Other tags need to be in the tags variable
            if (Constants.names[key] !== "id") {
                // Website needs to have at least any = encoded
                if (Constants.names[key] == "website") {
                    let website = item[key]
                    // Encode URL
                    website = website.replace("=", "%3D")
                    item[key] = website
                }
                properties.tags.push(Constants.names[key] + "=" + item[key])
            }
        }
    }
    return properties
}

/**
 * Convert types to match the OSM standard
 *
 * @param properties The properties to convert
 * @returns The converted properties
 */
function convertTypes(properties: GeoJsonProperties): GeoJsonProperties {
    // Split the tags into a list
    let tags = properties.tags.split(";")

    for (const tag in tags) {
        // Split the tag into key and value
        const key = tags[tag].split("=")[0]
        const value = tags[tag].split("=")[1]
        const originalKey = Object.keys(Constants.names).find((tag) => Constants.names[tag] === key)

        if (Constants.types[originalKey]) {
            // We need to convert the value to the correct type
            let newValue
            switch (Constants.types[originalKey]) {
                case "boolean":
                    newValue = value === "1" ? "yes" : "no"
                    break
                default:
                    newValue = value
                    break
            }
            tags[tag] = `${key}=${newValue}`
        }
    }

    // Rejoin the tags
    properties.tags = tags.join(";")

    // Return the properties
    return properties
}

/**
 * Function to add units to the properties if necessary
 *
 * @param properties The properties to add units to
 * @returns The properties with units added
 */
function addUnits(properties: GeoJsonProperties): GeoJsonProperties {
    // Split the tags into a list
    let tags = properties.tags.split(";")

    for (const tag in tags) {
        const key = tags[tag].split("=")[0]
        const value = tags[tag].split("=")[1]
        const originalKey = Object.keys(Constants.names).find((tag) => Constants.names[tag] === key)

        // Check if the property needs units, and doesn't already have them
        if (Constants.units[originalKey] && value.match(/.*([A-z]).*/gi) === null) {
            tags[tag] = `${key}=${value} ${Constants.units[originalKey]}`
        }
    }

    // Rejoin the tags
    properties.tags = tags.join(";")

    // Return the properties
    return properties
}

/**
 * Function that adds Maproulette instructions and blurb to each item
 *
 * @param properties The properties to add Maproulette tags to
 * @param item The original CSV item
 */
function addMaprouletteTags(properties: GeoJsonProperties, item: any): GeoJsonProperties {
    properties["blurb"] = `This is feature out of the ${item["Categorie"]} category.
  It may match another OSM item, if so, you can add any missing tags to it.
  If it doesn't match any other OSM item, you can create a new one.
  Here is a list of tags that can be added:
  ${properties["tags"].split(";").join("\n")}
  You can also easily import this item using MapComplete: https://mapcomplete.org/onwheels.html#${
      properties["id"]
  }`
    return properties
}

/**
 * Main function to convert original CSV into GeoJSON
 *
 * @param args List of arguments [input.csv]
 */
function main(args: string[]): void {
    const csvOptions = {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }
    const file = args[0]
    const output = args[1]

    // Create an empty list to store the converted features
    var items: Feature[] = []

    // Read CSV file
    const csv: Record<any, string>[] = parse(readFileSync(file), csvOptions)

    // Loop through all the entries
    for (var i = 0; i < csv.length; i++) {
        const item = csv[i]

        // Determine coordinates
        const lat = Number(item["Latitude"])
        const lon = Number(item["Longitude"])

        // Check if coordinates are valid
        if (isNaN(lat) || isNaN(lon)) {
            throw `Not a valid lat or lon for entry ${i}: ${JSON.stringify(item)}`
        }

        // Create a new collection to store the converted properties
        var properties: GeoJsonProperties = {}

        // Add standard tags for category
        const category = item["Categorie"]
        const tagsCategory = categoryTags(category)

        // Add the rest of the needed tags
        properties = { ...properties, ...renameTags(item) }

        // Merge them together
        properties.tags = [...tagsCategory.tags, ...properties.tags]
        properties.tags = properties.tags.join(";")

        // Convert types
        properties = convertTypes(properties)

        // Add units if necessary
        properties = addUnits(properties)

        // Add Maproulette tags
        properties = addMaprouletteTags(properties, item)

        // Create the new feature
        const feature: Feature = {
            type: "Feature",
            id: item["ID"],
            geometry: {
                type: "Point",
                coordinates: [lon, lat],
            },
            properties,
        }

        // Push it to the list we created earlier
        items.push(feature)
    }

    // Make a FeatureCollection out of it
    const featureCollection: FeatureCollection = {
        type: "FeatureCollection",
        features: items,
    }

    // Write the data to a file or output to the console
    if (output) {
        writeFileSync(`${output}.geojson`, JSON.stringify(featureCollection, null, 2))
    } else {
        console.log(JSON.stringify(featureCollection))
    }
}

// Execute the main function, with the stripped arguments
main(process.argv.slice(2))
