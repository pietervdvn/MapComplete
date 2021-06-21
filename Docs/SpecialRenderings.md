
### Special tag renderings 

 In a tagrendering, some special values are substituted by an advanced UI-element. This allows advanced features and visualizations to be reused by custom themes or even to query third-party API's. General usage is <b>{func_name()}</b> or <b>{func_name(arg, someotherarg)}</b>. Note that you <i>do not</i> need to use quotes around your arguments, the comma is enough to seperate them. This also implies you cannot use a comma in your args 
### all_tags 

 Prints all key-value pairs of the object - used for debugging 

name | default | description
------ | --------- | -------------

 
#### Example usage 

 {all_tags()} 
### image_carousel 

 Creates an image carousel for the given sources. An attempt will be made to guess what source is used. Supported: Wikidata identifiers, Wikipedia pages, Wikimedia categories, IMGUR (with attribution, direct links) 

name | default | description
------ | --------- | -------------
image key/prefix | image | The keys given to the images, e.g. if <span class='literal-code'>image</span> is given, the first picture URL will be added as <span class='literal-code'>image</span>, the second as <span class='literal-code'>image:0</span>, the third as <span class='literal-code'>image:1</span>, etc... 
smart search | true | Also include images given via 'Wikidata', 'wikimedia_commons' and 'mapillary
 
#### Example usage 

 {image_carousel(image,true)} 
### image_upload 

 Creates a button where a user can upload an image to IMGUR 

name | default | description
------ | --------- | -------------
image-key | image | Image tag to add the URL to (or image-tag:0, image-tag:1 when multiple images are added)
 
#### Example usage 

 {image_upload(image)} 
### reviews 

 Adds an overview of the mangrove-reviews of this object. Mangrove.Reviews needs - in order to identify the reviewed object - a coordinate and a name. By default, the name of the object is given, but this can be overwritten 

name | default | description
------ | --------- | -------------
subjectKey | name | The key to use to determine the subject. If specified, the subject will be <b>tags[subjectKey]</b>
fallback | undefined | The identifier to use, if <i>tags[subjectKey]</i> as specified above is not available. This is effectively a fallback value
 
#### Example usage 

 <b>{reviews()}<b> for a vanilla review, <b>{reviews(name, play_forest)}</b> to review a play forest. If a name is known, the name will be used as identifier, otherwise 'play_forest' is used 
### opening_hours_table 

 Creates an opening-hours table. Usage: {opening_hours_table(opening_hours)} to create a table of the tag 'opening_hours'. 

name | default | description
------ | --------- | -------------
key | opening_hours | The tagkey from which the table is constructed.
 
#### Example usage 

 {opening_hours_table(opening_hours)} 
### live 

 Downloads a JSON from the given URL, e.g. '{live(example.org/data.json, shorthand:x.y.z, other:a.b.c, shorthand)}' will download the given file, will create an object {shorthand: json[x][y][z], other: json[a][b][c] out of it and will return 'other' or 'json[a][b][c]. This is made to use in combination with tags, e.g. {live({url}, {url:format}, needed_value)} 

name | default | description
------ | --------- | -------------
Url | undefined | The URL to load
Shorthands | undefined | A list of shorthands, of the format 'shorthandname:path.path.path'. Seperated by ;
path | undefined | The path (or shorthand) that should be returned
 
#### Example usage 

 {live({url},{url:format},hour)} {live(https://data.mobility.brussels/bike/api/counts/?request=live&featureID=CB2105,hour:data.hour_cnt;day:data.day_cnt;year:data.year_cnt,hour)} 
### histogram 

 Create a histogram for a list of given values, read from the properties. 

name | default | description
------ | --------- | -------------
key | undefined | The key to be read and to generate a histogram from
title |  | The text to put above the given values column
countHeader |  | The text to put above the counts
colors | undefined | (Matches all resting arguments - optional) Matches a regex onto a color value, e.g. `3[a-zA-Z+-]*:#33cc33`
 
#### Example usage 

 `{histogram('some_key')}` with properties being `{some_key: ['a','b','a','c']} to create a histogram 
### share_link 

 Creates a link that (attempts to) open the native 'share'-screen 

name | default | description
------ | --------- | -------------
url | undefined | The url to share (default: current URL)
 
#### Example usage 

 {share_link()} to share the current page, {share_link(<some_url>)} to share the given url Generated from UI/SpecialVisualisations.ts