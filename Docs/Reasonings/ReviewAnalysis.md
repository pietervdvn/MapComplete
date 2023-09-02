# Analysis a reviews on Mangrove.reviews

MapComplete has - for some thematic maps - the ability to leave a review on an entity with Mangrove.Reviews..
Up till now, I had no idea how much this feature was used. However, due to technical reasons I had another look to the reviews module and discovered the ['download all'-option](https://api.mangrove.reviews/reviews) on [mangrove.reviews](https://mangrove.reviews)

## Mangrove Clients

The analysis was made with data from 20 january 2023, downloaded around 17:00 UTC time.

This data contained 660 reviews. As the website making the review is recorded, we can make a breakdown of the top websites:

- https://mangrove.reviews is unsuprisingly the most popular website to make reviews on, with 318 reviews made
- MapComplete is the second (and the biggest 'external' website), with 192 reviews (of which 13 are made with the development version)
- toggenburg.swiss is third, with 35 reviews

A variety of smaller websites follows, each with a few reviews made. At first glance, most of them seem to be swiss or german.
Furthermore, there are 5 reviews made by `localhost:1234` and 7 by `localhost:5000`. The former is probably me, testing the creation of reviews while developing.

The full table is listed below.

| Client website                         | Number of reviews |
|----------------------------------------|-------------------|
| https://mangrove.reviews               | 318               |
| https://mapcomplete.org             | 179               |
| https://toggenburg.swiss               | 35                |
| https://thurgau-bodensee.ch            | 29                |
| https://pietervdvn.github.io           | 13                |
| https://open-reviews.orderingstack.com | 13                |
| https://heidiland.com                  | 12                |
| https://open-reviews.net               | 12                |
| https://winterthur.com                 | 9                 |
| https://ostschweiz.ch                  | 7                 |
| https://localhost:5000                 | 7                 |
| https://actuallyfoods.com              | 5                 |
| https://staging.mangrove.reviews       | 5                 |
| https://localhost:1234                 | 5                 |
| https://examples.twblue.cms.tso.ch     | 3                 |
| https://ivydog.art (has NSFW content)  | 2                 |
| https://toggenburg-aktiv.ch            | 1                 |
| https://modernmount.blogspot.com       | 1                 |

## Themes

It seems that pet owners gave reviews the most. The 'pets'-theme - first known as the 'dog' theme - yielded 35 reviews in total (if summed).
The 'Pin je Punt'-campagin by Visit Flanders (which included pubs and cafés) is a close second with 29 reviews, followed by the shops theme.

While it might be surprising that the pets-theme has such a high number of reviews, the reason for this is straight-forward:
the review-module is placed on top of the infobox for vets, whereas most other layers do have the images block there.


| Theme                                                                                | Review count |
|--------------------------------------------------------------------------------------|--------------|
| https://mapcomplete.org/pets (incl 14 reviews made under the previous name 'dog') | 35           |
| https://mapcomplete.org/toerisme_vlaanderen                                       | 29           |
| https://mapcomplete.org/shops                                                     | 28           |
| https://mapcomplete.org/food                                                      | 18           |
| https://mapcomplete.org/playgrounds                                               | 16           |
| https://mapcomplete.org/cafes_and_pubs                                            | 14           |
| https://mapcomplete.org/personal                                                  | 14           |
| https://mapcomplete.org/campersite                                                | 9            |
| https://mapcomplete.org/sport_pitches                                             | 9            |
| https://mapcomplete.org/fritures                                                  | 8            |
| https://mapcomplete.org/climbing                                                  | 7            |
| https://mapcomplete.org/onwheels                                                  | 3            |
| https://mapcomplete.org/hackerspaces                                              | 1            |
| lgbtmap (theme on a fork)                                                            | 1            |

## Language

At last, due to the full client URL being saved, we also know what language the user interface was in when the review was made:

| language | count |
|----------|-------|
| en       | 77    | 
| nl       | 37    | 
| de       | 27    | 
| ru       | 13    | 
| fr       | 9     | 
| da       | 6     | 
| es       | 2     |
| unkown   | 21    | 

## Locations

And as map makers, a quick geolocation-analysis can't miss as well.

Unsurprisingly, most of the reviews are in Europe:

![All reviews](https://raw.githubusercontent.com/pietervdvn/MapComplete-data/main/reviewsAnalysis/AllReviewsGlobal.png)

When zooming in, a clear cluster in Switzerland and Flanders is visible:

![All reviews in europe](https://raw.githubusercontent.com/pietervdvn/MapComplete-data/main/reviewsAnalysis/ReviewsEuropeAll.png)

When keeping only the Reviews made with MapComplete, the cluster in Flanders remains:

![All reviews in europe made with MapComplete](https://raw.githubusercontent.com/pietervdvn/MapComplete-data/main/reviewsAnalysis/ReviewsMCOnly.png)


(Copyright: pins are Mangrove Reviews, background map is OpenStreetMap of course)

# Conclusions

So, no big conclusions and surprises in this little analysis.
The reviews are being used - but not very much, especially in comparison with the image-upload feature.
Placing the reviews higher up might help or including in into the questions flow.
The core question is how important reviews are within the vision of MapComplete.

As usual, data is available online [here](https://github.com/pietervdvn/MapComplete-data/blob/main/reviewsAnalysis), script is [here](./scripts/generateReviewsAnalysis.ts)
