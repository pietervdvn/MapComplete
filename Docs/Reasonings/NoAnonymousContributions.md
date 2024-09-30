# Why does MapComplete not allow anonymous contributions?

A question that many ask is why MapComplete does not allow anonymous contributions.

At first sight, it makes perfect sense: it is a user-friendly tool and making an account is a huge hurdle which a lot of people don't take.
"Many more people would contribute if an account is not needed!". And this is undeniably true! The signup-process is hard and loses a lot of people; even though we are making steps to improve this.


And this is technically possible too - a few other projects have taken this approach:

1. https://wheelmap.org/ uses [a single user account](https://www.openstreetmap.org/user/wheelmap_visitor) too add data to osm.org. [wiki page](https://wiki.openstreetmap.org/wiki/Wheelmap)
2. https://www.onosm.org/ [wiki page](https://wiki.openstreetmap.org/wiki/Onosm.org) creates an anonymous map note 

As usual, allowing anonymous contributions is a tradeoff. I (pietervdvn), as creator of MapComplete, have the opinion that having anonymous contributions for MapComplete would be a net negative.

## Anonymous notes burden the heavy mappers (or are never resolved)

In some regions, there are a few heavy contributors who try to resolve all notes. In Belgium (where I'm from and thus have knowledge of), there are oraganized efforts to bring down the number of notes. This effort is mainly carried by 4 or 5 contributors.

Adding anonymous notes would just generate a lot of extra work for them; becoming "anonymous mapping by proxy" - eventually with an extra check.

If there is no systematic note resolving in an area, this means that the data will never be added to OSM and will never be used _and_ get stale over time, being a useless contribution, for example here https://www.openstreetmap.org/note/2718428#map=13/19.95786/79.30876&layers=N; many onosm.org notes are over 1 year old.

## There is no possibility to contact the contributor...

By having an anonymous contribution, it is not possible for the community to reach out to the contributors.
This means that, in case of doubts, questions or incomplete information, it is not possible to follow up. This is currently a major grieve with anonymous map notes.

Someone who systematically makes the same mistake would be impossible to contact. It would even be impossible to know if it is one person making this mistake, or if there is something unclear in MapComplete which causes new contributors to systematically make a mistake.

### ... which hurts community building


Furthermore, OpenStreetMap is more then the data; it is also the _people_ behind it and the relations they build. Many contributor will never get in touch with the wider community, but some of them will.

In Belgium (and many other areas), core contributors systematically send a welcome message to new mappers with hints and more info. Anonymous contributions make this impossible.

## Errors and vandalism becomes easier to do and harder to clean up

Up till now, we didn't have any vandalism with MapComplete.

_Not_ having a to write down a name or to log in makes the barrier to experiment really low. People might not realize that their changes are making changes for everyone; or they might realize and intentionally change some data. We had a lot of low-quality edits via Maps.me, especially of people who didn't understand that their addition was shared (I've seen "hotels" named "grandma" because they stayed for a few days there)

We also had [one spam-campaign](https://wiki.openstreetmap.org/wiki/Organised_Editing/Activities/Trziste_prace). It would have become practically impossible to clean up this mess if this would have happened with anonymous accounts, whereas the datateam could simply revert all changes by those users now.

# To wrap it up

Anonymous accounts would indeed allow more contributions, but would shift the work to the already existing community instead of growing it.
As such, I'd rather put energy into making the signup process easier - [for which we already made some attempts](https://github.com/openstreetmap/openstreetmap-website/issues/4246)

