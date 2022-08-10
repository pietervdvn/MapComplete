#! /usr/bin/env bash

# Automerge translations automatically fetches the translations from weblate

git fetch weblate-github
git merge --no-commit weblate-github/weblate-mapcomplete-layers weblate-github/weblate-mapcomplete-layer-translations weblate-github/weblate-mapcomplete-core

npm run generate:translations
 if [ "$?" = "0" ]; then
  # Translation generation went fine - commit
  git add langs/
  git add assets/
  git commit -m "Merge weblate translations and regenerate translations"
  git push
 else
  echo "Generation of translations failed!"
  git merge --abort
 fi
