# 'Pin je Punt' - one year later

About a year ago, we launched a mapping campaign at the request from [_Visit Flanders_ (Toerisme Vlaanderen)](https://toerismevlaanderen.be/pin-je-punt). This mapping campaign is focussed on some touristical POI, such as charging stations for ebikes, benches, picnic tables, public toilets and playgrounds. FOr this, a [custom mapcomplete theme was created](https://mapcomplete.org/toerisme_vlaanderen). (For a full explanation, see the last paragraph)

A part of the campaign involved a guided import. The agency had many datasets lying around (e.g. about benches or picnic tables) which they wanted to have imported in OSM. As doing a data import is hard and the data was sometimes outdated, we opted for a crowdsourced approach: for every possible feature, a map note was created containing a friendly explanation, information links, the tags to create and instructions to open MapComplete.
When opened in mapcomplete, the user would be prompted to `import` the point or to mark it as `not found` or `duplicate`. All of these actions close the note with a small message on what the chosen action was.

Most map notes are closed by now, but the central question in this analysis today is: _should remaining map notes be closed in batch, or do we leave them open for longer_? Note that input of the local community will be gathered as well - this article will mostly serve as a point to start the discussion.

## The datasets

Various datasets were provided to upload - which were converted into notes. In the table below, you'll find a breakdown by topic, the date when they were uploaded, the number of notes created and how much of those notes were already closed and the top contributors for the category.

In this table, I'm not including if the feature has been added to OpenStreetMap, has been marked as not existing anymore or marked as being a duplicate.

Most of those notes have been opened by a [dedicated account](https://openstreetmap.org/user/Toerisme%20Vlaanderen%20-%20Pin%20je%20punt), except for two imports which accidentally did not use this account (noted in the table below).


| Feature type (source)                                                | date        | Number of features | Handled | Handled percentage | Contributor (closed notes)                                                                                                                                |
|----------------------------------------------------------------------|-------------|--------------------|---------|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------| 
| Toilets (Toerisme Limburg) __Notes created by Pieter Vander Vennet__ | January 22 | 177 | 84 | 47% | Eebie (26), Pieter Vander Vennet (11), phillipec (9)                                                                                                      |   
| Benches or maybe a picnic table (Toerisme Limburg)                   | february 22 | 730       | 722                | 99%                | Eebie (378),A127 (90), joost schouppe (36), dentonny (34), jozin-belgium (32), mjans (23), Pieter Vander Vennet (13), kersentaart (13), proudtobeevi (11) |
| Playgrounds (Toerisme Vlaams-Brabant)                                | march 22    | 51          | 46                 | 90%                | Pieter Vander Vennet (23), Joost Schouppe (6)                                                                                                             |
| Picnic tables (Toerisme Vlaams-Brabant)                              | march 22    | 222         | 172                | 77% | A127 (44), Eebie (15), Joost (15)                                                                                                                         |
| Ebike Charging station (Toerisme Vlaams-Brabant)                     | march 22    | 20          | 13                 | 65%  |                                                                                                                                                           | 
| Picnic Tables (Toerisme Oost-Vlaanderen)                             | march '22   | 33          | 28                 | 85% | Joost Schouppe (10), A127 (5), L'Imaginaire (5)                                                                                                           |
| Cycle rental (Toerisme West-Vlaanderen)                              | april '22   | 5           | 5                  | 100% |                                                                                                                                                           |
| Benches (Toerisme Antwerpen)                                         | april '22   | 54          | 44                 | 81% | pi11 (11), A127 (7)                                                                                                                                       |
| Picnic table (Toerisme Antwerpen)                                    | april '22   | 91          | 73                 | 80% | Jakka (21), wegspotter (13), pi11 (12)                                                                                                                    |
| picnictable (Westtoer) __Made by L'imaginaire__                      | april '22 | 340 | 296 | 87% | L'imaginaire (250), Jakka (10)                                                                                                                            |
| Blue bike cycle rental (website scrape by Pieter Colpaert)           | may 22      | 60          | 44                 | 73% | Pieter Vander Vennet (12), Joost Schouppe (4)                                                                                                             | 
| Benches (Toerisme Vlaanderen Kempen&Maasland)                        | may 22      | 94          | 88                 | 94% | Eebie (49), A127 (13), Joost Schouppe (8)                                                                                                                 |
| Benches (Open Data Oostende)                                         | june '22    | 1044 (!) | 686                | 66% | A127 (520), Joost Schouppe (41), L'imaginaire (36), Jakka (23)                                                                                            |


## Over time

How did the notes evolve over time? Are trends visible? 
The following graph shows the number of open notes for this campaign over time. The blueish line shows the total amount of Open Notes, which sharply jumps upwards when a new dataset was added.

Other lines represent the amount of notes closed by an individual contributor. As is visible, A127 and Eebie have done a tremendous amount of work, whereas around 20 other contributors have contributed a modest amount of points.

![](https://raw.githubusercontent.com/pietervdvn/MapComplete/develop/Docs/Reasonings/AllStatistics.png)

The amount of work represents a clear power curve, with most of the work done by a few contributors and many contributors with a few imports.

![](https://raw.githubusercontent.com/pietervdvn/MapComplete/develop/Docs/Reasonings/ContributorsPie.png)

Another interesting graph is how much of the features got imported and how much got refused. As it turns out, 53% of all features got imported. Note that, if the point gets added by using mapcomplete, the note will be closed with the message 'imported'. As many contributors used other editors, I'm checking for other keywords as well to mark them as 'imported', 'duplicate' or 'not_found'. Of course, humans are messy and the keyword-based approach is incomplete and inexact. 13% of closed notes could not be matched automatically.


About 6% of the points were marked as 'could not be found'. Some of the manually closed notes indicate that the area has changed and the feature (often a bench) is removed. As such, this is a good indicator or the staleness of the source dataset.

The fact that 6% of the features to import turned out not to exist anymore, this is a good argument for not blindly importing data into OSM! But this also poses that we should _maintain_ the map and that features such as benches should be checked regularly. Ideally, the municipality administration would integrate updating OSM into their flow...

At last, even though no notes were created if a similar feature was already in OSM, about 10% of the notes was rejected as being a duplicate. This is partly because one dataset of benches turned out to also contain picnic tables - good for 168 'duplicate' entries, yet duplicates are quite common in other datasets too.

## Some other numbers

In total, **2921** notes have been created, of which **78%** has been handled - that are 2301 that have been reviewed and imported (or closed with an indication that they cannot/should not be imported). Excluding the later benches of Oostende, only 7% (!) remains open.

That is a huge effort, of which I would like to thank all involved. Especially **A127** who closed **684** notes and **Eebie** who handled **474** notes - your work is amazing!

The work of A127 is amazing by the sheer volume of the work, but I want to give Eebie an extra thanks as he took it upon himself to search for the _toilets_. These were notoriously hard to find and to survey, as het often tried to use the actual toilet in social facilities, group nursing homes or administrative centers. These were often closed or unaware that they were listed as having a public toilet; at other times, those toilets were marked >100m away from the actual location.



## Differences between the datasets

The response on the datasets and the imports varied heavily by the type of the feature.

The **benches and picnic tables** are relatively straightforward. Visiting the place - physically or virtually with aerial imagery or Mapillary - suffices to decide if the feature still exists. As such, those tasks got handled relatively quickly. Only where no Mapillary and no aerial imagery are available, the map notes remain.

The other datasets proved to be harder. The **playgrounds** often needed some local knowledge - e.g. a playground might only be accessible to the members of the local youth organisation; or the administration eagerly labeled a patch of grass where kids could play some football as a proper playground. Some of them are hard to do remotely.

The hardest dataset to handle are the **toilets**, especially toilets in municipality buildings and social facilities. They cannot be seen on aerial imagery by definition, neither is Mapillary available. Furthermore, these facilities are often subject to opening hours and the rules about use by the public might change. In other words, a survey is necessary for pretty much every feature to import.

![](https://raw.githubusercontent.com/pietervdvn/MapComplete/develop/Docs/Reasonings/StatePie.png)

## The reaction

We had a few negative reactions on creating this amount of notes. The arguments mostly boiled down to either:

- new people will not bother to create a new note if the map is already littered with open notes
- it breaks my workflow, I want to see and handle new notes.

For the second complaint, you can use [this mapcomplete theme which shows notes and allows to filter them or create a new note](https://mapcomplete.org/notes.html#filters).

I don't agree with the first complaint as well, as the OpenStreetMap-website only shows a limited number of notes too. This can be easily seen by zooming out when the notes are open; you can see them disappear: https://imgur.com/a/PkwRe0h

![Attempt for embedding a ](https://i.imgur.com/niZDR5E.mp4)

## Conclusions

In hindsight, the guided import was a success. By creating thousands of notes, the process was very discoverable and many people helped out, including two 'hero importers', but there are social limits to the amount of notes that can be created like this. For small datasets (<100 points in a single city), I would be tempted to create this kind of notes again. For bigger datasets (especially if >500 points), I'd probably opt to use MapRoulette to store the data and to mark it as 'done', as not to pollute the notes too much with such an import.

Especially small datasets which can be armchair-mapped have good levels of completion.

As there still is some activity on the notes, there is no reason to close them. On the other hand, there isn't _much_ activity anymore. As usual with this type of project, the last 10% is also the hardest to do and will probably take a long time before being handled. At the same time, there are only 79 notes remaining from the earliest import, so they don't bother many people. (The benches-dataset of Oostende still has 334 open notes, about one third of the dataset.)

Please, [discuss this on this forum thread]( https://community.openstreetmap.org/t/should-the-import-notes-of-the-pin-je-punt-campaign-be-closed/9408). Remarks about the methodology or other musings are welcome here of course.


## The project in a nutshell

> This is what I sent to the Belgian Mailing list on the 5th of february. Note that the actual launch was later, around the 4th of March

Toerisme Vlaanderen will be launching an OpenStreetMap-based project on
the 14th of February. This is a rather big project which I'd like to
introduce to you with this email. The project consists of a few parts
which might have some impact:

- A MapComplete theme with focus on some touristical POI's will be launched
- A guided survey/data import will be started
- Toerisme Vlaanderen will ask their partners to start mapping, so
  hopefully we'll welcome a group of new mappers


This project will focus on the following POI's:

- Benches and picnic tables
- (Public) toilets
- Playgrounds,
- electrical charging stations (with a focus on charging stations for
  electrical bicycles)
- Bicycle pumps and repair stations
- and observation towers


      *What is this project about?*

/*Toerisme Vlaanderen*/ is a Flemish state agency which promotes tourism
in Flanders, together with the 5 provincial touristical offices and some
other organisations.
Historically, these 5 offices have each held their own small set of
geodata for typical items such as benches, public toilets, picnic
tables, playgrounds, ... to put those items on their maps.

And of course, these offices have kept this data in their own
spreadsheets, in their own formats (except for one - which has been
using OSM for years now).

Toerisme Vlaanderen would like to unify all these databases into
OpenStreetMap, increase the data quality of the items already there and
improve the surveying flow.

This is where MapComplete comes in. *MapComplete* <mapcomplete.org/>
is a web-app where one can show information about POI, can answer
questions about these POI and can add new points. Depending on the
chosen map, some categories of POI are shown.

For this project, a theme showing (and asking information about)
benches, picnictables, playgrounds, charging stations, ...  has been
created and will be launched on 14 februari/. (If you look around a bit,
you can already find a link to the theme, but another email will follow
when the project is live.)/


      A slow data import: methodology

Of course, there is quite a bit of geodata laying around with the
provincial offices, which ideally ends up in OpenStreetMap too.

For this, a slow data import has been started. Instead of dumping all
the data into OSM, a *map note* is created for every item that should be
checked.

This map note is structured in such a way that a contributor can use it,
but MapComplete can also pick this up to show this to a contributor.
This contributor can then quickly add/import the new feature if they
found it, or they can mark the note as a duplicate or not existing
anymore - closing the note in at the same time. These notes also link to
both the wiki page and to the mapcomplete page where they can be easily
added.

As with all things in life, this method has advantages and drawbacks:

- The biggest advantage is exposure of the import to experienced
  contributors. (Case in point: I've already had valuable response on a
  few notes within 24hours of them going live)
- The import is tracked in OSM itself, containing a lot of information
  and providing a flexible forum
- It is quick and easy to setup
- Others can make a similar note, which will be picked up by MapComplete
  too!
