 
 Rights of contributors
 ======================

If a contributor is quite active within MapComplete, this contributor might be granted access to the main repository.

If you have access to the repository, you can make a fork of an already existing branch and push this new branch to github.
This means that this branch will be _automatically built_ and be **deployed** to `https://pietervdvn.github.io/mc/<branchname>`. You can see the deploy process on [Github Actions](https://github.com/pietervdvn/MapComplete/actions).
Don't worry about pushing too much. These deploys are free and totally automatic. They might fail if something is wrong, but this will hinder no-one.

Additionaly, some other maintainer might step in and merge the latest develop with your branch, making later pull requests easier.

Don't worry about bugs
----------------------

As a non-admin contributor, you can _not_ make changes to the `master` nor to the `develop` branch. This is because, as soon as master is changed, this is built and deployed on `mapcomplete.osm.be`, which a lot of people use. An error there will cause a lot of grieve. 

A push on `develop` is automatically deployed to [pietervdvn.github.io/mc/develop] and is used by quite some people to. People using this version should know that this is a testing ground for new features and might contain a bug every now and then.

In other words, to get your theme deployed on the main instances, you'll still have to create a pull request. The maintainers will then doublecheck and pull it in.

If you have a local repository
------------------------------

If you have made a fork earlier and have received contributor rights, you need to tell your local git repository that pushing to the main repository is possible.

To do this:

1. type `git remote add upstream git@github.com:pietervdvn/MapComplete`
2. Run `git push upstream` to push your latest changes to the main repo (and not your fork). Running `git push` will push to your fork.

Alternatively, if you don't have any unmerged changes, you can remove your local copy and clone `pietervdvn/MapComplete` again to start fresh.