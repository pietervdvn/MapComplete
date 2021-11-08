

### Special tag renderings 



In a tagrendering, some special values are substituted by an advanced UI-element. This allows advanced features and visualizations to be reused by custom themes or even to query third-party API's.

General usage is `{func_name()}`, `{func_name(arg, someotherarg)}` or `{func_name(args):cssStyle}`. Note that you _do not_ need to use quotes around your arguments, the comma is enough to separate them. This also implies you cannot use a comma in your args



  - [all_tags](#all_tags)
  - [image_carousel](#image_carousel)
  - [image_upload](#image_upload)
  - [wikipedia](#wikipedia)
  - [minimap](#minimap)
  - [sided_minimap](#sided_minimap)
  - [reviews](#reviews)
  - [opening_hours_table](#opening_hours_table)
  - [live](#live)
  - [histogram](#histogram)
  - [share_link](#share_link)
  - [canonical](#canonical)
  - [import_button](#import_button)
  - [multi_apply](#multi_apply)
  - [tag_apply](#tag_apply)




### all_tags 

 Prints all key-value pairs of the object - used for debugging 

#### Example usage 

 `{all_tags()}`



### image_carousel 

 Creates an image carousel for the given sources. An attempt will be made to guess what source is used. Supported: Wikidata identifiers, Wikipedia pages, Wikimedia categories, IMGUR (with attribution, direct links) 

name | default | description
------ | --------- | -------------
image key/prefix (multiple values allowed if comma-seperated) | image,mapillary,image,wikidata,wikimedia_commons,image,image | The keys given to the images, e.g. if <span class='literal-code'>image</span> is given, the first picture URL will be added as <span class='literal-code'>image</span>, the second as <span class='literal-code'>image:0</span>, the third as <span class='literal-code'>image:1</span>, etc... 
 

#### Example usage 

 `{image_carousel(image,mapillary,image,wikidata,wikimedia_commons,image,image)}`



### image_upload 

 Creates a button where a user can upload an image to IMGUR 

name | default | description
------ | --------- | -------------
image-key | image | Image tag to add the URL to (or image-tag:0, image-tag:1 when multiple images are added)
label | Add image | The text to show on the button
 

#### Example usage 

 `{image_upload(image,Add image)}`



### wikipedia 

 A box showing the corresponding wikipedia article - based on the wikidata tag 

name | default | description
------ | --------- | -------------
keyToShowWikipediaFor | wikidata | Use the wikidata entry from this key to show the wikipedia article for
 

#### Example usage 

 `{wikipedia()}` is a basic example, `{wikipedia(name:etymology:wikidata)}` to show the wikipedia page of whom the feature was named after. Also remember that these can be styled, e.g. `{wikipedia():max-height: 10rem}` to limit the height



### minimap 

 A small map showing the selected feature. 

name | default | description
------ | --------- | -------------
zoomlevel | 18 | The (maximum) zoomlevel: the target zoomlevel after fitting the entire feature. The minimap will fit the entire feature, then zoom out to this zoom level. The higher, the more zoomed in with 1 being the entire world and 19 being really close
idKey | id | (Matches all resting arguments) This argument should be the key of a property of the feature. The corresponding value is interpreted as either the id or the a list of ID's. The features with these ID's will be shown on this minimap.
 

#### Example usage 

 `{minimap()}`, `{minimap(17, id, _list_of_embedded_feature_ids_calculated_by_calculated_tag):height:10rem; border: 2px solid black}`



### sided_minimap 

 A small map showing _only one side_ the selected feature. *This features requires to have linerenderings with offset* as only linerenderings with a postive or negative offset will be shown. Note: in most cases, this map will be automatically introduced 

name | default | description
------ | --------- | -------------
side | _undefined_ | The side to show, either `left` or `right`
 

#### Example usage 

 `{sided_minimap(left)}`



### reviews 

 Adds an overview of the mangrove-reviews of this object. Mangrove.Reviews needs - in order to identify the reviewed object - a coordinate and a name. By default, the name of the object is given, but this can be overwritten 

name | default | description
------ | --------- | -------------
subjectKey | name | The key to use to determine the subject. If specified, the subject will be <b>tags[subjectKey]</b>
fallback | _undefined_ | The identifier to use, if <i>tags[subjectKey]</i> as specified above is not available. This is effectively a fallback value
 

#### Example usage 

 `{reviews()}` for a vanilla review, `{reviews(name, play_forest)}` to review a play forest. If a name is known, the name will be used as identifier, otherwise 'play_forest' is used



### opening_hours_table 

 Creates an opening-hours table. Usage: {opening_hours_table(opening_hours)} to create a table of the tag 'opening_hours'. 

name | default | description
------ | --------- | -------------
key | opening_hours | The tagkey from which the table is constructed.
prefix | _empty string_ | Remove this string from the start of the value before parsing. __Note: use `&LPARENs` to indicate `(` if needed__
postfix | _empty string_ | Remove this string from the end of the value before parsing. __Note: use `&RPARENs` to indicate `)` if needed__
 

#### Example usage 

 A normal opening hours table can be invoked with `{opening_hours_table()}`. A table for e.g. conditional access with opening hours can be `{opening_hours_table(access:conditional, no @ &LPARENS, &RPARENS)}`



### live 

 Downloads a JSON from the given URL, e.g. '{live(example.org/data.json, shorthand:x.y.z, other:a.b.c, shorthand)}' will download the given file, will create an object {shorthand: json[x][y][z], other: json[a][b][c] out of it and will return 'other' or 'json[a][b][c]. This is made to use in combination with tags, e.g. {live({url}, {url:format}, needed_value)} 

name | default | description
------ | --------- | -------------
Url | _undefined_ | The URL to load
Shorthands | _undefined_ | A list of shorthands, of the format 'shorthandname:path.path.path'. separated by ;
path | _undefined_ | The path (or shorthand) that should be returned
 

#### Example usage 

 {live({url},{url:format},hour)} {live(https://data.mobility.brussels/bike/api/counts/?request=live&featureID=CB2105,hour:data.hour_cnt;day:data.day_cnt;year:data.year_cnt,hour)}



### histogram 

 Create a histogram for a list of given values, read from the properties. 

name | default | description
------ | --------- | -------------
key | _undefined_ | The key to be read and to generate a histogram from
title | _empty string_ | The text to put above the given values column
countHeader | _empty string_ | The text to put above the counts
colors* | _undefined_ | (Matches all resting arguments - optional) Matches a regex onto a color value, e.g. `3[a-zA-Z+-]*:#33cc33`
 

#### Example usage 

 `{histogram('some_key')}` with properties being `{some_key: ['a','b','a','c']} to create a histogram



### share_link 

 Creates a link that (attempts to) open the native 'share'-screen 

name | default | description
------ | --------- | -------------
url | _undefined_ | The url to share (default: current URL)
 

#### Example usage 

 {share_link()} to share the current page, {share_link(<some_url>)} to share the given url



### canonical 

 Converts a short, canonical value into the long, translated text 

name | default | description
------ | --------- | -------------
key | _undefined_ | The key of the tag to give the canonical text for
 

#### Example usage 

 {canonical(length)} will give 42 metre (in french)



### import_button 

 This button will copy the data from an external dataset into OpenStreetMap. It is only functional in official themes but can be tested in unofficial themes.

#### Importing a dataset into OpenStreetMap: requirements

If you want to import a dataset, make sure that:

1. The dataset to import has a suitable license
2. The community has been informed of the import
3. All other requirements of the [import guidelines](https://wiki.openstreetmap.org/wiki/Import/Guidelines) have been followed

There are also some technicalities in your theme to keep in mind:

1. The new feature will be added and will flow through the program as any other new point as if it came from OSM.
    This means that there should be a layer which will match the new tags and which will display it.
2. The original feature from your geojson layer will gain the tag '_imported=yes'.
    This should be used to change the appearance or even to hide it (eg by changing the icon size to zero)
3. There should be a way for the theme to detect previously imported points, even after reloading.
    A reference number to the original dataset is an excellent way to do this
4. When importing ways, the theme creator is also responsible of avoiding overlapping ways. 
    
#### Disabled in unofficial themes

The import button can be tested in an unofficial theme by adding `test=true` or `backend=osm-test` as [URL-paramter](URL_Parameters.md). 
The import button will show up then. If in testmode, you can read the changeset-XML directly in the web console.
In the case that MapComplete is pointed to the testing grounds, the edit will be made on https://master.apis.dev.openstreetmap.org


#### Specifying which tags to copy or add

The argument `tags` of the import button takes a `;`-seperated list of tags to add.

These can either be a tag to add, such as `amenity=fast_food` or can use a substitution, e.g. `addr:housenumber=$number`. 
This new point will then have the tags `amenity=fast_food` and `addr:housenumber` with the value that was saved in `number` in the original feature. 

If a value to substitute is undefined, empty string will be used instead.

This supports multiple values, e.g. `ref=$source:geometry:type/$source:geometry:ref`

Remark that the syntax is slightly different then expected; it uses '$' to note a value to copy, followed by a name (matched with `[a-zA-Z0-9_:]*`). Sadly, delimiting with `{}` as these already mark the boundaries of the special rendering...

Note that these values can be prepare with javascript in the theme by using a [calculatedTag](calculatedTags.md#calculating-tags-with-javascript)
 

  
 

name | default | description
------ | --------- | -------------
targetLayer | _undefined_ | The id of the layer where this point should end up. This is not very strict, it will simply result in checking that this layer is shown preventing possible duplicate elements
tags | _undefined_ | The tags to add onto the new object - see specification above
text | Import this data into OpenStreetMap | The text to show on the button
icon | ./assets/svg/addSmall.svg | A nice icon to show in the button
minzoom | 18 | How far the contributor must zoom in before being able to import the point
Snap onto layer(s)/replace geometry with this other way | _undefined_ |  - If the value corresponding with this key starts with 'way/' and the feature is a LineString or Polygon, the original OSM-way geometry will be changed to match the new geometry
 - If a way of the given layer(s) is closeby, will snap the new point onto this way (similar as preset might snap). To show multiple layers to snap onto, use a `;`-seperated list
snap max distance | 5 | The maximum distance that this point will move to snap onto a layer (in meters)
 

#### Example usage 

 `{import_button(,,Import this data into OpenStreetMap,./assets/svg/addSmall.svg,18,,5)}`



### multi_apply 

 A button to apply the tagging of this object onto a list of other features. This is an advanced feature for which you'll need calculatedTags 

name | default | description
------ | --------- | -------------
feature_ids | _undefined_ | A JSOn-serialized list of IDs of features to apply the tagging on
keys | _undefined_ | One key (or multiple keys, seperated by ';') of the attribute that should be copied onto the other features.
text | _undefined_ | The text to show on the button
autoapply | _undefined_ | A boolean indicating wether this tagging should be applied automatically if the relevant tags on this object are changed. A visual element indicating the multi_apply is still shown
overwrite | _undefined_ | If set to 'true', the tags on the other objects will always be overwritten. The default behaviour will be to only change the tags on other objects if they are either undefined or had the same value before the change
 

#### Example usage 

 {multi_apply(_features_with_the_same_name_within_100m, name:etymology:wikidata;name:etymology, Apply etymology information on all nearby objects with the same name)}



### tag_apply 

 Shows a big button; clicking this button will apply certain tags onto the feature.

The first argument takes a specification of which tags to add.
These can either be a tag to add, such as `amenity=fast_food` or can use a substitution, e.g. `addr:housenumber=$number`. 
This new point will then have the tags `amenity=fast_food` and `addr:housenumber` with the value that was saved in `number` in the original feature. 

If a value to substitute is undefined, empty string will be used instead.

This supports multiple values, e.g. `ref=$source:geometry:type/$source:geometry:ref`

Remark that the syntax is slightly different then expected; it uses '$' to note a value to copy, followed by a name (matched with `[a-zA-Z0-9_:]*`). Sadly, delimiting with `{}` as these already mark the boundaries of the special rendering...

Note that these values can be prepare with javascript in the theme by using a [calculatedTag](calculatedTags.md#calculating-tags-with-javascript)
  

name | default | description
------ | --------- | -------------
tags_to_apply | _undefined_ | A specification of the tags to apply
message | _undefined_ | The text to show to the contributor
image | _undefined_ | An image to show to the contributor on the button
id_of_object_to_apply_this_one | _undefined_ | If specified, applies the the tags onto _another_ object. The id will be read from properties[id_of_object_to_apply_this_one] of the selected object. The tags are still calculated based on the tags of the _selected_ element
 

#### Example usage 

 `{tag_apply(survey_date:=$_now:date, Surveyed today!)}` 

This document is autogenerated from UI/SpecialVisualisations.ts