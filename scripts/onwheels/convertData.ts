import { parse } from "csv-parse/sync";
import { readFileSync, writeFileSync } from "fs";
import { Feature, FeatureCollection, GeoJsonProperties } from "geojson";
import Constants from "./constants";

/**
 * Function to determine the tags for a category
 *
 * @param category The category of the item
 * @returns List of tags for the category
 */
function categoryTags(category: string): GeoJsonProperties {
  const tags = Constants.categories[category];
  if (!tags) {
    throw `Unknown category: ${category}`;
  }
  return tags;
}

/**
 * Rename tags to match the OSM standard
 *
 * @param item The item to convert
 * @returns GeoJsonProperties for the item
 */
function renameTags(item): GeoJsonProperties {
  const properties: GeoJsonProperties = {};
  for (const key in item) {
    if (Constants.names[key] && item[key]) {
      properties[Constants.names[key]] = item[key];
    }
  }
  return properties;
}

function convertTypes(properties: GeoJsonProperties): GeoJsonProperties {
  for (const property in properties) {
    // Determine the original tag by looking at the value in the names table
    const originalTag = Object.keys(Constants.names).find(
      (tag) => Constants.names[tag] === property
    );
    // Check if we need to convert the value
    if (Constants.types[originalTag]) {
      switch (Constants.types[originalTag]) {
        case "boolean":
          properties[property] = properties[property] === "1" ? "yes" : "no";
          break;
        default:
          break;
      }
    }
  }
  return properties;
}

/**
 * Function to add units to the properties if necessary
 *
 * @param properties The properties to add units to
 * @returns The properties with units added
 */
function addUnits(properties: GeoJsonProperties): GeoJsonProperties {
  for (const property in properties) {
    // Check if the property needs units, and doesn't already have them
    if (Constants.units[property] && property.match(/.*([A-z]).*/gi) === null) {
      properties[
        property
      ] = `${properties[property]} ${Constants.units[property]}`;
    }
  }
  return properties;
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
  };
  const file = args[0];
  const output = args[1];

  // Create an empty list to store the converted features
  var items: Feature[] = [];

  // Read CSV file
  const csv: Record<any, string>[] = parse(readFileSync(file), csvOptions);

  // Loop through all the entries
  for (var i = 0; i < csv.length; i++) {
    const item = csv[i];

    // Determine coordinates
    const lat = Number(item["Latitude"]);
    const lon = Number(item["Longitude"]);

    // Check if coordinates are valid
    if (isNaN(lat) || isNaN(lon)) {
      throw `Not a valid lat or lon for entry ${i}: ${JSON.stringify(item)}`;
    }

    // Create a new collection to store the converted properties
    var properties: GeoJsonProperties = {};

    // Add standard tags for category
    const category = item["Categorie"];
    properties = { ...properties, ...categoryTags(category) };

    // Add the rest of the needed tags
    properties = { ...properties, ...renameTags(item) };

    // Convert types
    properties = convertTypes(properties);

    // Loop through all the properties
    // for (var key in item) {
    //   // Check if we need the property, and it's not empty
    //   if (Constants.names[key] && item[key]) {
    //     // Check if the type needs to be converted
    //     if (Constants.types[key]) {
    //       // Conversion necessary, use the typeTable
    //       switch (Constants.types[key]) {
    //         case "boolean":
    //           properties[Constants.names[key]] =
    //             item[key] === "1" ? "yes" : "no";
    //           break;
    //         default:
    //           properties[Constants.names[key]] = item[key];
    //           break;
    //       }
    //     } else {
    //       // No conversion necessary, we can just add the property
    //       properties[Constants.names[key]] = item[key];
    //     }
    //   }
    // }

    // Add units if necessary
    addUnits(properties);

    // Create the new feature
    const feature: Feature = {
      type: "Feature",
      id: item["ID"],
      geometry: {
        type: "Point",
        coordinates: [lon, lat],
      },
      properties,
    };

    // Push it to the list we created earlier
    items.push(feature);
  }

  // Make a FeatureCollection out of it
  const featureCollection: FeatureCollection = {
    type: "FeatureCollection",
    features: items,
  };

  // Output the data to the console
  console.log(JSON.stringify(featureCollection));

  // Write the data to a file
  if (output) {
    writeFileSync(`${output}.geojson`, JSON.stringify(featureCollection, null, 2));
  }
}

// Execute the main function, with the stripped arguments
main(process.argv.slice(2));
