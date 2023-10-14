Contributing to MapComplete
===========================

Hi! Thanks for checking out how to contribute to MapComplete!

There are multiple ways to contribute:

- Translating MapComplete to your own language can be done
  on [the Weblate website](https://hosted.weblate.org/projects/mapcomplete/)
- If you encounter a bug, the [issue tracker](https://github.com/pietervdvn/MapComplete/issues) is the place to be
- A good start to contribute is to create a single map layer showing features which interest you. Read more about [making your own theme](/Docs/Making_Your_Own_Theme.md).
- If you want to improve a theme, create a new theme, spot a typo in the repo... the best way is to open a pull request. 

People who stick around and contribute in a meaningful way, _might_ be granted write access to the repository (except the branches *master* and *develop*). This is
done on a purely subjective basis, e.g. after a few pull requests and if you are a member of the OSM community.

Rights of contributors
-----------------------

If you have write access to the repository, you can make a fork of an already existing branch and push this new branch
to GitHub. This means that this branch will be _automatically built_ and be **deployed**
to `https://pietervdvn.github.io/mc/<branchname>`. You can see the deploy process
on [GitHub Actions](https://github.com/pietervdvn/MapComplete/actions). Don't worry about pushing too much. These
deploys are free and totally automatic. They might fail if something is wrong, but this will hinder no one.

Additionaly, some other maintainer might step in and merge the latest develop with your branch, making later pull
requests easier.

Don't worry about bugs
----------------------

As a non-admin contributor, you can _not_ make changes to the `master` nor to the `develop` branch. This is because, as
soon as master is changed, this is built and deployed on `mapcomplete.org`, which a lot of people use. An error there
will cause a lot of grieve.

A push on `develop` is automatically deployed to [pietervdvn.github.io/mc/develop] which is used by quite some
contributors. However, people using this version should know that this is a testing ground for new features and might
contain a bug every now and then.

In other words, to get your theme deployed on the main instances, you'll still have to create a pull request. The
maintainers will then doublecheck and pull it in.

If you have a local repository
------------------------------

If you have made a fork earlier and have received contributor rights, you need to tell your local git repository that
pushing to the main repository is possible.

To do this:

1. type `git remote add upstream git@github.com:pietervdvn/MapComplete`
2. Run `git push upstream` to push your latest changes to the main repo (and not your fork). Running `git push` will
   push to your fork.

Alternatively, if you don't have any unmerged changes, you can remove your local copy and clone `pietervdvn/MapComplete`
again to start fresh.

What not to contribute
----------------------

I'm currently _not_ accepting files for integration with some text editor. There are hundreds of editors out there, if every single one of them needs a file in the repo, this ends up as a mess.
Furthermore, MapComplete doesn't want to encourage or discourage some text editors.
At last, these files are hard to maintain and are hard to detect if they have fallen out of use.
