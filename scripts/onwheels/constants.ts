// SPDX-FileCopyrightText: 2023 MapComplete  <https://mapcomplete.osm.be/>
//
// SPDX-License-Identifier: GPL-3.0-ONLY

/**
 * Class containing all constants and tables used in the script
 *
 * @class Constants
 */
export default class Constants {
    /**
     * Table used to determine tags for the category
     *
     * Keys are the original category names,
     * values are an object containing the tags
     */
    public static categories = {
        restaurant: {
            amenity: "restaurant",
        },
        parking: {
            amenity: "parking",
        },
        hotel: {
            tourism: "hotel",
        },
        wc: {
            amenity: "toilets",
        },
        winkel: {
            shop: "yes",
        },
        apotheek: {
            amenity: "pharmacy",
            healthcare: "pharmacy",
        },
        ziekenhuis: {
            amenity: "hospital",
            healthcare: "hospital",
        },
        bezienswaardigheid: {
            tourism: "attraction",
        },
        ontspanning: {
            fixme: "Needs proper tags",
        },
        cafe: {
            amenity: "cafe",
        },
        dienst: {
            fixme: "Needs proper tags",
        },
        bank: {
            amenity: "bank",
        },
        gas: {
            amenity: "fuel",
        },
        medical: {
            fixme: "Needs proper tags",
        },
        obstacle: {
            fixme: "Needs proper tags",
        },
    }

    /**
     * Table used to rename original Onwheels properties to their corresponding OSM properties
     *
     * Keys are the original Onwheels properties, values are the corresponding OSM properties
     */
    public static names = {
        ID: "id",
        Naam: "name",
        Straat: "addr:street",
        Nummer: "addr:housenumber",
        Postcode: "addr:postcode",
        Plaats: "addr:city",
        Website: "website",
        Email: "email",
        "Aantal aangepaste parkeerplaatsen": "capacity:disabled",
        "Aantal treden": "step_count",
        "Hellend vlak aanwezig": "ramp",
        "Baby verzorging aanwezig": "changing_table",
        "Totale hoogte van de treden": "kerb:height",
        Deurbreedte: "door:width",
    }

    /**
     * In some cases types might need to be converted as well
     *
     * Keys are the OSM properties, values are the wanted type
     */
    public static types = {
        "Hellend vlak aanwezig": "boolean",
        "Baby verzorging aanwezig": "boolean",
    }

    /**
     * Some tags also need to have units added
     */
    public static units = {
        "Totale hoogte van de treden": "cm",
        Deurbreedte: "cm",
    }
}
