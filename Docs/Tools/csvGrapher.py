import csv
import string
from datetime import datetime

from matplotlib import pyplot
import re


def counts(lst):
    counts = {}
    for v in lst:
        if not v in counts:
            counts[v] = 0
        counts[v] += 1
    return counts


class Hist:

    def __init__(self, firstcolumn):
        self.key = "\"" + firstcolumn + "\""
        self.dictionary = {}
        self.key = ""

    def add(self, key, value):
        if not key in self.dictionary:
            self.dictionary[key] = []
        self.dictionary[key].append(value)

    def values(self):
        allV = []
        for v in self.dictionary.values():
            allV += list(set(v))
        return list(set(allV))

    def keys(self):
        return self.dictionary.keys()

    def get(self, key):
        if key in self.dictionary:
            return self.dictionary[key]
        return None

    # Returns (keys, values.map(f)). To be used with e.g. pyplot.plot
    def map(self, f):
        vals = []
        keys = self.keys()
        for key in keys:
            vals.append(f(self.get(key)))
        return vals

    def mapcumul(self, f, add, zero):
        vals = []
        running_value = zero
        keys = self.keys()
        for key in keys:
            v = f(self.get(key))
            running_value = add(running_value, v)
            vals.append(running_value)
        return vals

    def csv(self):
        csv = self.key + "," + ",".join(self.values())
        header = self.values()
        for k in self.dictionary.keys():
            csv += k
            values = counts(self.dictionary[k])
            for head in header:
                if head in values:
                    csv += "," + str(values[head])
                else:
                    csv += ",0"
            csv += "\n"
        return csv

    def __str__(self):
        return str(self.dictionary)


def build_hist(stats, keyIndex, valueIndex):
    hist = Hist("date")
    c = 0
    for row in stats:
        c += 1
        hist.add(row[keyIndex], row[valueIndex])
    return hist


def as_date(str):
    return datetime.strptime(str, "%Y-%m-%d")


def cumulative_users(stats):
    users_hist = build_hist(stats, 0, 1)
    all_users_per_day = users_hist.mapcumul(
        lambda users: set(users),
        lambda a, b: a.union(b),
        set([])
    )
    cumul_uniq = list(map(len, all_users_per_day))
    unique_per_day = users_hist.map(lambda users: len(set(users)))
    new_users = [0]
    for i in range(len(cumul_uniq) - 1):
        new_users.append(cumul_uniq[i + 1] - cumul_uniq[i])
    dates = map(as_date, users_hist.keys())
    return list(dates), cumul_uniq, list(unique_per_day), list(new_users)


def pyplot_init():
    pyplot.figure(figsize=(14, 8), dpi=200)
    pyplot.xticks(rotation='vertical')


def create_usercount_graphs(stats, extra_text=""):
    print("Creating usercount graphs " + extra_text)
    dates, cumul_uniq, unique_per_day, new_users = cumulative_users(stats)
    total = cumul_uniq[-1]

    pyplot_init()
    pyplot.fill_between(dates, unique_per_day, label='Unique contributors')
    pyplot.fill_between(dates, new_users, label='First time contributor via MapComplete')
    pyplot.legend()
    pyplot.title("Unique contributors" + extra_text + ' with MapComplete (' + str(total) + ' contributors)')
    pyplot.ylabel("Number of unique contributors")
    pyplot.xlabel("Date")
    pyplot.savefig("Contributors" + extra_text + ".png", dpi=400, facecolor='w', edgecolor='w')

    pyplot_init()
    pyplot.plot(dates, cumul_uniq, label='Cumulative unique contributors')
    pyplot.legend()
    pyplot.title("Cumulative unique contributors" + extra_text + " with MapComplete - " + str(total) + " contributors")
    pyplot.ylabel("Number of unique contributors")
    pyplot.xlabel("Date")
    pyplot.savefig("CumulativeContributors" + extra_text + ".png", dpi=400, facecolor='w', edgecolor='w')


def create_theme_breakdown(stats, fileExtra="", cutoff=5):
    print("Creating theme breakdown " + fileExtra)
    themeCounts = {}
    for row in stats:
        theme = row[3].lower()
        if theme in theme_remappings:
            theme = theme_remappings[theme]
        if theme in themeCounts:
            themeCounts[theme] += 1
        else:
            themeCounts[theme] = 1
    themes = list(themeCounts.items())
    if len(themes) == 0:
        print("No entries found for theme breakdown (extra: " + str(fileExtra) + ")")
        return
    themes.sort(key=lambda kv: kv[1], reverse=True)
    other_count = sum([theme[1] for theme in themes if theme[1] < cutoff])
    themes_filtered = [theme for theme in themes if theme[1] >= cutoff]
    keys = list(map(lambda kv: kv[0] + " (" + str(kv[1]) + ")", themes_filtered))
    values = list(map(lambda kv: kv[1], themes_filtered))
    total = sum(map(lambda kv: kv[1], themes))
    first_pct = themes[0][1] / total;
    if other_count > 0:
        keys.append("other")
        values.append(other_count)
    pyplot_init()
    pyplot.pie(values, labels=keys, startangle=(90 - 360 * first_pct / 2))
    pyplot.title("MapComplete changes per theme" + fileExtra + " - " + str(total) + " total changes")
    pyplot.savefig("Theme distribution" + fileExtra + ".png", dpi=400, facecolor='w', edgecolor='w',
                   bbox_inches='tight')
    return themes


def cumulative_changes_per(contents, index, subject, filenameextra="", cutoff=5, cumulative=True, sort=True):
    print("Creating graph about " + subject + filenameextra)
    themes = Hist("date")
    dates_per_theme = Hist("theme")
    all_themes = set()
    for row in contents:
        th = row[index]
        all_themes.add(th)
        themes.add(as_date(row[0]), th)
        dates_per_theme.add(th, row[0])
    per_theme_count = list(zip(dates_per_theme.keys(), dates_per_theme.map(len)))
    # PerThemeCount gives the most popular theme first
    if sort == True:
        per_theme_count.sort(key=lambda kv: kv[1], reverse=False)
    elif sort is not None:
        per_theme_count.sort(key=sort)
    values_to_show = []  # (theme name, value to fill between - this is stacked, with the first layer to print last)
    running_totals = None
    other_total = 0
    other_theme_count = 0
    other_cumul = None

    for kv in per_theme_count:
        theme = kv[0]
        total_for_this_theme = kv[1]
        if cumulative:
            edits_per_day_cumul = themes.mapcumul(
                lambda themes_for_date: len([x for x in themes_for_date if theme == x]),
                lambda a, b: a + b, 0)
        else:
            edits_per_day_cumul = themes.map(lambda themes_for_date: len([x for x in themes_for_date if theme == x]))

        if (not cumulative) or (running_totals is None):
            running_totals = edits_per_day_cumul
        else:
            running_totals = list(map(lambda ab: ab[0] + ab[1], zip(running_totals, edits_per_day_cumul)))

        if total_for_this_theme >= cutoff:
            values_to_show.append((theme, running_totals))
        else:
            other_total += total_for_this_theme
            other_theme_count += 1
            if other_cumul is None:
                other_cumul = edits_per_day_cumul
            else:
                other_cumul = list(map(lambda ab: ab[0] + ab[1], zip(other_cumul, edits_per_day_cumul)))

    keys = list(themes.keys())
    values_to_show.reverse()
    values_to_show.append(("other", other_cumul))
    totals = dict(per_theme_count)
    total = sum(totals.values())
    totals["other"] = other_total

    pyplot_init()
    for kv in values_to_show:
        if kv[1] is None:
            continue  # No 'other' graph
        msg = kv[0] + " (" + str(totals[kv[0]]) + ")"
        if kv[0] == "other":
            msg = str(other_theme_count) + " small " + subject + "s (" + str(other_total) + " changes)"
        if cumulative:
            pyplot.fill_between(keys, kv[1], label=msg)
        else:
            pyplot.plot(keys, kv[1], label=msg)

    if cumulative:
        cumulative_txt = "Cumulative changesets"
    else:
        cumulative_txt = "Changesets"
    pyplot.title(cumulative_txt + " per " + subject + filenameextra + " (" + str(total) + " changesets)")
    pyplot.legend(loc="upper left", ncol=3)
    pyplot.savefig(cumulative_txt + " per " + subject + filenameextra + ".png")


def contents_where(contents, index, starts_with, invert=False):
    for row in contents:
        if row[index].startswith(starts_with) is not invert:
            yield row


def sortable_user_number(kv):
    str = kv[0]
    ls = list(map(lambda str : "0"+str if len(str) < 2 else str, re.findall("[0-9]+", str)))
    return ".".join(ls)


def create_graphs(contents):
    cumulative_changes_per(contents, 4, "version number", cutoff=1, sort=sortable_user_number)
    create_usercount_graphs(contents)
    create_theme_breakdown(contents)
    cumulative_changes_per(contents, 3, "theme", cutoff=10)
    cumulative_changes_per(contents, 3, "theme", cutoff=10, cumulative=False)
    cumulative_changes_per(contents, 1, "contributor", cutoff=15)
    cumulative_changes_per(contents, 2, "language", cutoff=1)
    cumulative_changes_per(contents, 8, "host", cutoff=1)

    currentYear = datetime.now().year
    for year in range(2020, currentYear + 1):
        contents_filtered = list(contents_where(contents, 0, str(year)))
        extratext = " in " + str(year)
        create_usercount_graphs(contents_filtered, extratext)
        create_theme_breakdown(contents_filtered, extratext)
        cumulative_changes_per(contents_filtered, 3, "theme", extratext, cutoff=5)
        cumulative_changes_per(contents_filtered, 3, "theme", extratext, cutoff=5, cumulative=False)
        cumulative_changes_per(contents_filtered, 1, "contributor", extratext, cutoff=10)
        cumulative_changes_per(contents_filtered, 2, "language", extratext, cutoff=1)
        cumulative_changes_per(contents_filtered, 4, "version number", extratext, cutoff=1, cumulative=False,
                               sort=sortable_user_number)
        cumulative_changes_per(contents_filtered, 4, "version number", extratext, cutoff=1, sort=sortable_user_number)
        cumulative_changes_per(contents_filtered, 8, "host", extratext, cutoff=1)


def create_per_theme_graphs(contents):
    all_themes = set(map(lambda row: row[3], contents))
    for theme in all_themes:
        filtered = list(contents_where(contents, 3, theme))
        if len(filtered) < 10:
            # less then 10 changesets - we do not map it
            continue
        contributors = set(map(lambda row: row[1], filtered))
        if len(contributors) < 2:
            continue  # one contributor makes a boring graph
        cumulative_changes_per(filtered, 1, "contributor", " for theme " + theme, cutoff=1)


def create_per_contributor_graphs(contents, least_needed_changesets):
    all_contributors = set(map(lambda row: row[1], contents))
    for contrib in all_contributors:
        filtered = list(contents_where(contents, 1, contrib))
        if len(filtered) < least_needed_changesets:
            continue
        themes = set(map(lambda row: row[3], filtered))
        if len(themes) < 2:
            continue  # one theme makes a boring graph
        cumulative_changes_per(filtered, 3, "theme", " for contributor " + contrib, cutoff=1)


theme_remappings = {
    "metamap": "maps",
    "groen": "buurtnatuur",
    "wiki:mapcomplete/fritures": "fritures",
    "wiki:MapComplete/Fritures": "fritures",
    "lits": "lit",
    "pomp": "cyclofix",
    "wiki:user:joost_schouppe/campersite": "campersite",
    "wiki-user-joost_schouppe-geveltuintjes": "geveltuintjes",
    "wiki-user-joost_schouppe-campersite": "campersite",
    "wiki-User-joost_schouppe-campersite": "campersite",
    "wiki-User-joost_schouppe-geveltuintjes": "geveltuintjes",
    "wiki:User:joost_schouppe/campersite": "campersite",
    "https://raw.githubusercontent.com/osmbe/play/master/mapcomplete/geveltuinen/geveltuinen.json": "geveltuintjes"
}


def clean_input(contents):
    for row in contents:
        theme = row[3].strip().strip("\"").lower()
        if theme == "null":
            # The theme metadata has only been set later on - we fetch this from the comment
            i = row[7].rfind("#")
            theme = row[7][i + 1:-1].lower()
        if theme in theme_remappings:
            theme = theme_remappings[theme]
        row[3] = theme
        row[4] = row[4].strip().strip("\"")[len("MapComplete "):]
        row[4] = re.findall("[0-9]*\.[0-9]*\.[0-9]*", row[4])[0]
        yield [data.strip().strip("\"") for data in row]


def main():
    print("Creating graphs...")
    with open('stats.csv', newline='') as csvfile:
        stats = list(clean_input(csv.reader(csvfile, delimiter=',', quotechar='"')))
        print("Found " + str(len(stats)) + " changesets")
        create_graphs(stats)
        create_per_theme_graphs(stats)
        create_per_contributor_graphs(stats, 50)
    print("All done!")


# pyplot.fill_between(range(0,5),  [1,2,3,3,2],)
# pyplot.show()
main()
