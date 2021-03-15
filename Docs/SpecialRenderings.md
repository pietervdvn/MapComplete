### Special tag renderings

In a tagrendering, some special values are substituted by an advanced UI-element. This allows advanced features and visualizations to be reused by custom themes or even to query third-party API's.General usage is **{func\_name()}** or **{func\_name(arg, someotherarg)}**. Note that you _do not_ need to use quotes around your arguments, the comma is enough to seperate them. This also implies you cannot use a comma in your args

### all\_tags

Prints all key-value pairs of the object - used for debugging

**Example usage:** {all\_tags()}

### image\_carousel

Creates an image carousel for the given sources. An attempt will be made to guess what source is used. Supported: Wikidata identifiers, Wikipedia pages, Wikimedia categories, IMGUR (with attribution, direct links)

1.  **image key/prefix**: The keys given to the images, e.g. if image is given, the first picture URL will be added as image, the second as image:0, the third as image:1, etc... Default: image
2.  **smart search**: Also include images given via 'Wikidata', 'wikimedia\_commons' and 'mapillary Default: true

**Example usage:** {image\_carousel(image,true)}

### image\_upload

Creates a button where a user can upload an image to IMGUR

1.  **image-key**: Image tag to add the URL to (or image-tag:0, image-tag:1 when multiple images are added) Default: image

**Example usage:** {image\_upload(image)}

### reviews

Adds an overview of the mangrove-reviews of this object. Mangrove.Reviews needs - in order to identify the reviewed object - a coordinate and a name. By default, the name of the object is given, but this can be overwritten

1.  **subjectKey**: The key to use to determine the subject. If specified, the subject will be **tags\[subjectKey\]** Default: name
2.  **fallback**: The identifier to use, if _tags\[subjectKey\]_ as specified above is not available. This is effectively a fallback value

**Example usage:** **{reviews()} **for a vanilla review, **{reviews(name, play\_forest)}** to review a play forest. If a name is known, the name will be used as identifier, otherwise 'play\_forest' is used****

### ****opening\_hours\_table****

****Creates an opening-hours table. Usage: {opening\_hours\_table(opening\_hours)} to create a table of the tag 'opening\_hours'.

1.  **key**: The tagkey from which the table is constructed. Default: opening\_hours

**Example usage:** {opening\_hours\_table(opening\_hours)}

### live

Downloads a JSON from the given URL, e.g. '{live(example.org/data.json, shorthand:x.y.z, other:a.b.c, shorthand)}' will download the given file, will create an object {shorthand: json\[x\]\[y\]\[z\], other: json\[a\]\[b\]\[c\] out of it and will return 'other' or 'json\[a\]\[b\]\[c\]. This is made to use in combination with tags, e.g. {live({url}, {url:format}, needed\_value)}

1.  **Url**: The URL to load
2.  **Shorthands**: A list of shorthands, of the format 'shorthandname:path.path.path'. Seperated by ;
3.  **path**: The path (or shorthand) that should be returned

**Example usage:** {live({url},{url:format},hour)} {live(https://data.mobility.brussels/bike/api/counts/?request=live&featureID=CB2105,hour:data.hour\_cnt;day:data.day\_cnt;year:data.year\_cnt,hour)}

### share\_link

Creates a link that (attempts to) open the native 'share'-screen

1.  **url**: The url to share (default: current URL)

**Example usage:** {share\_link()} to share the current page, {share\_link()} to share the given url****