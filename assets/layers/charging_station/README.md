The charging station theme
==========================

As you might have noticed, the charging station theme is complicated and large.

There are a ton of repititive questions. Luckily, we can generate those.

If you want to add a missing socket type, then:

- Add all the properties in 'types.csv'
- Add an icon. (Note: icons are way better as pictures as they are perceived more abstractly)
- Update license_info.json with the copyright info of the new icon. Note that we strive to have Creative-commons icons only (though there are exceptions)

AT this point, most of the work should be done; feel free to send a PR. If you would like to test it locally first (which is recommended) and have a working dev environment, then run:

- Run 'ts-node csvToJson.ts' which will generate a new charging_station.json based on the protojson
- Run`npm run query:licenses` to get an interactive program to add the license of your artwork, followed by `npm run generate:licenses` 
- Run `npm run generate:layeroverview` to generate the layer files
- Run `npm run start` to run the instance