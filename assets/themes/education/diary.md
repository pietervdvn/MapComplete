Published as https://www.openstreetmap.org/user/Pieter%20Vander%20Vennet/diary/399339/

For my work at [anyways.eu](https://anyways.eu), I've been tasked to make sure that all schools are in OSM - especially with capacity.

No better way to do this by making it easy for contributors to add the correct data... So, I wanted to create a MapComplete theme for education. Normally, I would open up the wiki to see what tagging is needed, but for schools there is very little tagging available at the moment, which is a mess.

As it turns out, schools are diverse and this is reflected in the tagging.

This diary entry serves two goals:

1. I want to organize my thoughts on how a tagging model could look like
2. It is meant to stir up some discussion.

Hopefully, some tagging proposals will come forward from from this post.

# So, what is a school (or educational institute) anyway?

This is already a hard question. The [openstreetmap-wiki on 'education features' states](https://wiki.openstreetmap.org/wiki/Education_features):

> Education features are map objects and object features which relate to educational activities

Well, thanks, captain obvious.

Let's turn to the [International Standard Classification of Education](http://uis.unesco.org/en/files/isced-2011-operational-manual-guidelines-classifying-national-education-programmes-and-related) (from Unesco) instead:

> As national education systems vary in terms of structure and curricular content, it can be difficult to benchmark performance over time or monitor progress.

So, in other words, it is difficult as this can be highly different amonst regions. The ISCED-document however does a good job to draw some lines and to give some definitions.

## What does a standard school curriculum look like?

In most countries, the school trajectory for most people (according the the ISCED, page 21) looks more or less as following:

Before formal education starts, kids younger then about 5 or 6 go to _preschool/kindergarten_. This is optional in most countries, and some education takes place, often to prepare spelling and simple math.
ISCED calls this **level 0**

Between 6 and around 12, kids learn to read an write, learn basic math skills and other skills. This is called **primary education** and corresponds with **isced level 1**

Between 12 and 14/15, kids get lower secondary eduction and learn more skills and competencies (**isced level 2**).
Between 14/15 and 18; kids get higher secondary education (**isced level 3**).
Note that the secondary levels have a split between education preparing for (a set of) trades versus a general training which prepares for tertiary education.
These orientations are called `vocational` and `general` education.

At age of 18, someone who has obtained **upper secondary** education, could join the workforce, could follow non-tertiary education (see below) or could enroll in tertiary education.

The first cycle of tertiary education are often **bachelors** (often 3 years, but 2 years is pretty common too) and correspond with **isced level 6**, after which a **master degree** (often 2 years) which corresponds with **isced level 7** can be obtained.

The bachelors and master degrees often have an orientation too, called `professional` or `academic`

At last, a **doctorate** can be obtained which corresponds with **isced level 8**.

If, at age 18 someone does not want to enroll in tertiary education or  isn't ready yet for the labour market yet, they can also follow a **post-secondary non-tertiary** (ISCED level 4) education.
This is an education which is not sufficiently complex to qualify as tertiary eduction and often has a vocational training, thus a training which prepares for direct labour market entry. Note that the ISCED does not state typical ages for this education form, as it is often taken by adults too.

At last, **isced level 5**, officially called **short-cycle tertiary education** provides education to prepare for following bachelor degree, e.g. if the skills obtained by a vocational secondary degree are not sufficient to enter a bachelors degree.

## What if the education is non-standard?

A good tagging scheme doesn't break under special cases. Lets have a look at some of them to test the waters.


While _most_ of the people might follow a trajectory as outlined above, many don't.

The ISCED-definition leaves wiggle room by more or less defining what _skills_ one gains in a certain education level - not at what _age_ someone typically obtains these skills. While the typical ages are _stated_ in the ISCED, they are not the defining features.

Some examples of non-standard trajectories could be:

- Someone who has never had the chance on learning how to read might enroll in _primary education_ as an adult.
- Someone with a learning disability might be obtaining the _lower_secondary_ skill, even though people of their age age are in _higher_secondary_.
- Someone in their forties might wish to reorient their career and follow a vocational course of the skill level of a _vocational_upper_secondary_.
- Someone might follow a course in music, dancing, skiing or scuba diving as a hobby in an informal school during the evenings, while still working their job during the day.


This last example also touches upon specialized schools. How should these be handled? Examples of these schools are:
- driving schools or flight school.
- a secondary school which focuses on arts, but has enough general skills to be compatible with ISCED-level `upper_secondary`?  [iAnd what if this school contains a college with a bachelor degree in music too,n the same buildings?](https://en.wikipedia.org/wiki/Lemmensinstituut)

So, this implies that knowing the `isced`-level of a school is very useful and often does imply the age of the pupils, we still need a way to express whom is going to this school.

## Who is the school for?

By default, we could assume that most schools are normal schools where pupils follow age-adequate courses.

This is not always the case. Some schools focus e.g. on secondary education for adults, other focus on people with disabilities.

To tag this, I propose to introduce a tag `school:for`, e.g. `school:for=autism`, `school:for=adults`, `school:for=learning_disabilities`, ...

If this tag is missing, one can assume that the school is for normal-abled people whom follow courses typical for their age.

In some places, schools are separated by gender too. Some schools are boys/girls only, others teach both but they are separated. This might fit this tag too, but not quite.

## What does a school teach?

The further in the education system, the more specialized education gets.

Where all primary education teaches more-or-less the same subjects, secondary education already starts to specialize.

And tertiary education is extremely specialized, with faculties teaching about just one field.

I propose to introduce a `school:subject`-tag, which indicates what subjects are taught at a school.
This must be independent of the ISCED-level. For example: a school might focus on "teaching music",
which can range from evening school for adults, to a secondary school that qualifies as `isced=upper_secondary` to even a college in arts having doctorate students.

Giving an exhaustive list of possible values is impossible, but some common values could be:

- arts, music, dance, painting, ...
- driving
- flight
-  to disambiguate, a wikidata-entity could be linked
- ...

The tag `school:subject` would also remove the need for various extra amenities, such as `amenity=dance_school`, `amenity=music_school`, reducing complexity.
Other details and assumptions (e.g. target audience and offered education level) can be clarified as explained above.

Schools which do teach skills without general education (e.g. a driving school) could thus be tagged with:

```
amenity=school
school:subject=driving
isced:2011:level=post_secondary
```

A college, tagged with `amenity=college` thus implies `isced:2011:level=professional_bachelor`. Whether or not a `master`-degree can be obtained at that college can not safely be assumed.

## Schooling method

At last, there are multiple ways to teach students. Especially secondary education has a rich variety. In Flanders, we have Montessori schools, Freinet, Steiner, CLIL, ... This could be worthy of a tag too, e.g. with `educational_method` or`educational_method:wikidata`

## Other tags

Of course, there are still other well-established tags important too, such as `capacity`, contact information, ... I'm not covering them here, as these are already widely accepted.

# Conclusion

Schools are diverse in the subjects and the level of education they teach, how they teach and who they teach. This makes tagging difficult. This post describes a possible method of splitting these subjects into orthogonal tags which can be independently measured.

This blogpost attempts to give a first attempt, but of course, I'm only aware of my own environment. There must be other types of schools which I've never heard of before, so if you know of something that is considered an 'educational feature' which cannot be tagged with the tags described above, please let me know.
