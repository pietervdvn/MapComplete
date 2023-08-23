(To rerun the analysis: use 'scripts/generateImageAnalysis'. Delete 'features_with_*.geojson' first to force updating the OSM-dataset)

# What licenses are used?

Now that MapComplete is three-and-a-half year old, it's a good time to see what license people are using to upload their images.

## Why do I care?

The first reason to do this research is curiosity. How much pictures are uploaded with what license?

The second reason is a very practical and UX-driven: if a significant portion of contributors doesn't bother to change the license,
then the license picker can be moved from the 'infobox' into the 'user settings', freeing up valuable space there.
User tests have pointed out that this is valuable.

## Methodology

MapComplete uploads images to `imgur.com` and then links to this image using `image=https://i.imgur.com/aBcDeF123.jpg`.
Some metadata (most notably the author and chosen license) is added as 'description' to the image on Imgur.
If multiple images are added, then keys `image:0`, `image:1`, `image:2`... is used.

At last, themes can also add images under a specific key. For now, only the [etymology-map](https://mapcomplete.org/etymology) does this with `image:streetsign`.

Overpass was used to download all features with a tag matching one of the described keys and matching an imgur-url.

Then, the description of all those images is downloaded and parsed, yielding the needed metadata.

Even though some people did add images to imgur to link them to OpenStreetMap before, we assume that (nearly) no images will also have the license information encoded as MapComplete does.
Furthermore, this does not keep images of now-deleted features into account, nor does it take images into account that have been deleted in the mean time.
I don't think it'll make a big difference though.

The resulting datasets are [here](https://github.com/pietervdvn/MapComplete-data/tree/main/ImageLicenseInfo).
The script to download this all is in the MapComplete repository. Keep in mind that using this script will exhaust the daily IMGUR rate limit; so please use a different access token or spread the download over two days as was done for this research.

## Results

In total, 12516 images with a parsable license were found - this is a huge amount of pictures, which I did not expect!
This was done by 439 contributors in total

Unsurpisingly, the vast majority was uploaded with the default license, being CC0/public domain.
This is about 10635 total pictures (or 84.9% of all pictures), taken by precisely 400 different contributors - 91.1% of contributors.

The second most popular license is the _creative commons with attribution and sharealike_ license (CC-BY-SA), with 1707 images in total, or about 13.6% of all images.
However, only 32 authors choose this license, or 7.2% of the photographers. Striking is that those are way more active, with an average of 53 images/person!

At last, the _creative commons with attribution_ (CC-BY) is not popular at all. Only 117 pictures in total - 0.9% of all pictures - used this license.
Only 10 authors picked this option, which also indicates that they are below-average in number of pictures taken with 11 images/contributor.

When the authors which used CC-BY and CC-BY-SA are summed, only 42 are found. This indicates that there is a big overlap between contributors that used the CC-BY license.
Personally, I contributed under CC0 first, then a bit under CC-BY to switch to CC-BY-SA for the most part of my pictures. Other contributors probably did a similar trajectory.

Oh, and due to a bug, the license of some images got saved as `"undefined"` instead of the actual license.
This bug only impacted 57 pictures (0.4% of all) taken by 20 authors. As we don't know the license they took, we should stick to the most restrictive of the available licenses to reuse those images.

### Averages and medians

On average, a contributor with at least one image, makes about half, namely 28.5 pictures/person!
However, this is a typical power curve, with a few powerhouses that add tons of images.
The median contributor with at least one image contributes _two_ images.


## Conclusion

First of all, I'm absolutely flabbergasted by the total amount of pictures taken!
I knew it had to be in the thousands, but never realised it would be over 10k!

As only 42 contributors ever contributed under a different license, I feel comfortable to move the license-picker away into the user settings panel.
Freeing this place will improve the experience of thousands of people at the cost of a few clicks that only a handful of people have to make - even though that this handful of people are the most active contributors.

I'm also very positively surprised by the high number of average pictures per person - even though the median is a bit more modest.

And the fact that someone has uploaded twice as much pictures then I did is really cool to.
It's also the only contributor (so far) to go over 1000 pictures and is even getting close to breaking the 2000-boundary...
Congratulations, Awo!

The second place is for me (Pieter Vander Vennet), with 859 pictures added. (Damn, this much already?)

The third place is for vjyblauw, another power mapper in Belgium with 746 pictures. Congratulations as well!

At last: I've attachted the top 50 of contributors below.

But before showing it to you, I'd like to tell you all one more thing:

# Thank you for contributing!
## This wouldn't be possible without all of you




| Position | Username | Total number of pictures |
| -------- | -------- | ------------------------ |
| 1 | [Awo](https://openstreetmap.org/user/Awo) | 1953 |
| 2 | [Pieter Vander Vennet](https://openstreetmap.org/user/Pieter%20Vander%20Vennet) | 859 |
| 3 | [vjyblauw](https://openstreetmap.org/user/vjyblauw) | 746 |
| 4 | [JLZIMMERMANN](https://openstreetmap.org/user/JLZIMMERMANN) | 645 |
| 5 | [Thierry1030](https://openstreetmap.org/user/Thierry1030) | 622 |
| 6 | [L'imaginaire](https://openstreetmap.org/user/L'imaginaire) | 589 |
| 7 | [Jose Luis Infante](https://openstreetmap.org/user/Jose%20Luis%20Infante) | 575 |
| 8 | [Toni Serra](https://openstreetmap.org/user/Toni%20Serra) | 446 |
| 9 | [APneunzehn74](https://openstreetmap.org/user/APneunzehn74) | 439 |
| 10 | [joost schouppe](https://openstreetmap.org/user/joost%20schouppe) | 310 |
| 11 | [Maarten O](https://openstreetmap.org/user/Maarten%20O) | 301 |
| 12 | [5R-MFT](https://openstreetmap.org/user/5R-MFT) | 254 |
| 13 | [Wolfram Hoppe](https://openstreetmap.org/user/Wolfram%20Hoppe) | 250 |
| 14 | [Koen Rijnsent](https://openstreetmap.org/user/Koen%20Rijnsent) | 234 |
| 15 | [WimBau](https://openstreetmap.org/user/WimBau) | 229 |
| 16 | [dentonny](https://openstreetmap.org/user/dentonny) | 212 |
| 17 | [Stijn Matthys](https://openstreetmap.org/user/Stijn%20Matthys) | 137 |
| 18 | [Polardfront](https://openstreetmap.org/user/Polardfront) | 126 |
| 19 | [TauvicR](https://openstreetmap.org/user/TauvicR) | 119 |
| 20 | [Locatus_Jori](https://openstreetmap.org/user/Locatus_Jori) | 109 |
| 21 | [Locatus_Raf](https://openstreetmap.org/user/Locatus_Raf) | 100 |
| 22 | [Robin van der Linde](https://openstreetmap.org/user/Robin%20van%20der%20Linde) | 98 |
| 23 | [wjtje](https://openstreetmap.org/user/wjtje) | 88 |
| 24 | [Marival](https://openstreetmap.org/user/Marival) | 75 |
| 25 | [Pieter Nuytinck](https://openstreetmap.org/user/Pieter%20Nuytinck) | 71 |
| 26 | [Vincent Bombaerts](https://openstreetmap.org/user/Vincent%20Bombaerts) | 68 |
| 27 | [Rober castro](https://openstreetmap.org/user/Rober%20castro) | 65 |
| 28 | [349499](https://openstreetmap.org/user/349499) | 58 |
| 29 | [Frans_Napaters](https://openstreetmap.org/user/Frans_Napaters) | 57 |
| 30 | [Thibaultmol](https://openstreetmap.org/user/Thibaultmol) | 57 |
| 31 | [philippec](https://openstreetmap.org/user/philippec) | 56 |
| 32 | [StefDeGreef](https://openstreetmap.org/user/StefDeGreef) | 52 |
| 33 | [borgofumo](https://openstreetmap.org/user/borgofumo) | 52 |
| 34 | [ClarissaWAM](https://openstreetmap.org/user/ClarissaWAM) | 48 |
| 35 | [jospyck](https://openstreetmap.org/user/jospyck) | 48 |
| 36 | [escobrice](https://openstreetmap.org/user/escobrice) | 44 |
| 37 | [KaiPankrath](https://openstreetmap.org/user/KaiPankrath) | 43 |
| 38 | [Ninopiña10](https://openstreetmap.org/user/Ninopiña10) | 43 |
| 39 | [Niels Elgaard Larsen](https://openstreetmap.org/user/Niels%20Elgaard%20Larsen) | 42 |
| 40 | [RodrigoKiger](https://openstreetmap.org/user/RodrigoKiger) | 41 |
| 41 | [MAGONA](https://openstreetmap.org/user/MAGONA) | 39 |
| 42 | [sjokomoeske](https://openstreetmap.org/user/sjokomoeske) | 37 |
| 43 | [ccasado](https://openstreetmap.org/user/ccasado) | 36 |
| 44 | [Piotr Barczak](https://openstreetmap.org/user/Piotr%20Barczak) | 34 |
| 45 | [lololailo](https://openstreetmap.org/user/lololailo) | 34 |
| 46 | [Manuel C Arco Martos](https://openstreetmap.org/user/Manuel%20C%20Arco%20Martos) | 33 |
| 47 | [reginaldc](https://openstreetmap.org/user/reginaldc) | 33 |
| 48 | [Hilde OSM](https://openstreetmap.org/user/Hilde%20OSM) | 32 |
| 49 | [paunofu](https://openstreetmap.org/user/paunofu) | 32 |
| 50 | [Gruppe 24(2)](https://openstreetmap.org/user/Gruppe%2024(2)) | 30 |

