import $ from "jquery"
import {LicenseInfo} from "./Wikimedia";

export class Mapillary {


    static getDescriptionOfImage(key: string,
                                 handleDescription: ((license: LicenseInfo) => void)) {
        const url = `https://a.mapillary.com/v3/images/${key}?client_id=TXhLaWthQ1d4RUg0czVxaTVoRjFJZzowNDczNjUzNmIyNTQyYzI2`

        const settings = {
            async: true,
            type: 'GET',
            url: url
        };
        $.getJSON(url, function(data) {
            const license = new LicenseInfo();
            license.artist = data.properties?.username;
            license.licenseShortName = "CC BY-SA 4.0";
            license.license = "Creative Commons Attribution-ShareAlike 4.0 International License";
            license.attributionRequired = true;
            handleDescription(license);
        })

    }
}