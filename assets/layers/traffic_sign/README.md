# Traffic sign layer

As you might have noticed, the traffic sign theme and this layer is quite complex and large.
To keep this manageable, this is generated from a JSON file per country.

## Adding a new country

Adding a country is as easy as creating a new JSON(`.protojson`) file in the `signs` folder named after the country code and adding the required images in a subfolder named after the country code.

## Regenerating the layer

To regenerate the layer, run `npm run generate:traffic_signs`.

## The JSON file format

The JSON files are formatted formatted based on [this](https://osm.rlin.eu/traffic_sign/schema/schema.json) JSON schema.
A small example, not showing all properties is shown below.

```jsonc
{
  // Indication for the JSON schema
  "$schema": "https://osm.rlin.eu/traffic_sign/schema/schema.json",
  // Name of the file
  "name": "Dutch Traffic Signs",
  // Country code
  "country": "NL",
  // Description of the file
  "description": "Traffic signs in the Netherlands",
  // Version of the file, can be either a date, a version number or something else
  "version": "1.0",
  // Object containing all traffic signs
  "traffic_signs": [
    {
      // ID of the traffic sign, as to be used in OSM
      "id": "NL:G11",
      // English name of the traffic sign
      "name": "Mandatory cycleway",
      // Image object, can be remote or as in this case local
      "image": {
        // File path of the image starting from the country folder in the images folder
        "file": "G/Nederlands_verkeersbord_G11.svg"
      }
    }
  ]
}
```
