import csv
from datetime import datetime

from matplotlib import pyplot


def clean(s):
    return s.strip().strip("\"")


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


def build_hist(stats, keyIndex, valueIndex, condition=None):
    hist = Hist("date")
    c = 0
    for row in stats:
        if condition is not None and not condition(row):
            continue
        c += 1
        row = list(map(clean, row))
        hist.add(row[keyIndex], row[valueIndex])
    return hist


def cumulative_users(stats, year=""):
    users_hist = build_hist(stats, 0, 1, lambda row: row[0].startswith(year))
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
    dates = map(lambda dt: datetime.strptime(dt, "%Y-%m-%d"), users_hist.keys())
    return list(dates), cumul_uniq, list(unique_per_day), list(new_users)


def pyplot_init():
    pyplot.figure(figsize=(14, 8), dpi=200)
    pyplot.xticks(rotation='vertical')
    pyplot.tight_layout()


def create_usercount_graphs(stats, year="", show=False):
    print("Creating usercount graphs "+year)
    dates, cumul_uniq, unique_per_day, new_users = cumulative_users(stats, year)
    total = cumul_uniq[-1]

    if year != "":
        year = " in " + year
    pyplot_init()
    pyplot.fill_between(dates, unique_per_day, label='Unique contributors')
    pyplot.fill_between(dates, new_users, label='First time contributor via MapComplete')
    pyplot.legend()
    pyplot.title("Unique contributors" + year + ' with MapComplete (' + str(total) + ' contributors)')
    pyplot.ylabel("Number of unique contributors")
    pyplot.xlabel("Date")
    if show:
        pyplot.show()
    else:
        pyplot.savefig("Contributors" + year + ".png", dpi=400, facecolor='w', edgecolor='w', bbox_inches='tight')

    pyplot_init()
    pyplot.plot(dates, cumul_uniq, label='Cumulative unique contributors')
    pyplot.legend()
    pyplot.title("Cumulative unique contributors" + year + " with MapComplete - " + str(total) + " contributors")
    pyplot.ylabel("Number of unique contributors")
    pyplot.xlabel("Date")
    if show:
        pyplot.show()
    else:
        pyplot.savefig("CumulativeContributors" + year + ".png", dpi=400, facecolor='w', edgecolor='w',
                       bbox_inches='tight')


def create_yearly_usercount_graphs(contents):
    create_usercount_graphs(contents)
    currentYear = datetime.now().year
    for year in range(2020, currentYear + 1):
        create_usercount_graphs(contents, str(year))


theme_remappings = {
    "null": "buurtnatuur",
    "metamap": "maps",
    "wiki:mapcomplete/fritures": "fritures",
    "lits": "lit",
    "wiki:user:joost_schouppe/campersite": "campersite",
    "wiki-user-joost_schouppe-geveltuintjes": "geveltuintjes",
    "wiki-user-joost_schouppe-campersite":"campersites",
    "https://raw.githubusercontent.com/osmbe/play/master/mapcomplete/geveltuinen/geveltuinen.json": "geveltuintjes"
}


def create_theme_breakdown(stats, year="", user=None, columnIndex=3):
    print("Creating theme breakdown "+year)
    themeCounts = {}
    for row in stats:
        if not row[0].startswith(year):
            continue
        if user is not None and clean(row[1]) != user:
            continue
        theme = clean(row[columnIndex]).lower()
        if theme in theme_remappings:
            theme = theme_remappings[theme]
        if theme in themeCounts:
            themeCounts[theme] += 1
        else:
            themeCounts[theme] = 1
    themes = list(themeCounts.items())
    if len(themes) == 0:
        print("No entries found for user "+user+" in "+year)
        return
    themes.sort(key=lambda kv : kv[1], reverse=True)
    
    cutoff = 5
    if user is not None:
        cutoff = 0
    other_count = sum([theme[1] for theme in themes if theme[1] < cutoff])
    themes_filtered = [theme for theme in themes if theme[1] >= cutoff]
    keys = list(map(lambda kv : kv[0] + " (" + str(kv[1])+")", themes_filtered))
    values = list(map(lambda kv : kv[1], themes_filtered))
    total =sum(map(lambda kv:kv[1], themes))
    first_pct = themes[0][1] / total;
    if year != "":
        year = " in " + year
        
    if other_count > 0:
        keys.append("other")
        values.append(other_count)
    pyplot_init()
    pyplot.pie(values, labels=keys, startangle=(90 - 360 * first_pct/2))
    if user is None:
        user = ""
    else:
        user = " by contributor "+user
    pyplot.title("MapComplete changes per theme"+year+user+ " - "+str(total)+" total changes")
    pyplot.savefig("Theme distribution" + user+year + ".png", dpi=400, facecolor='w', edgecolor='w',
                   bbox_inches='tight')
    return themes

def gen_theme_breakdown_graphs(contents, user=None):
    create_theme_breakdown(contents, "", user)
    currentYear = datetime.now().year
    for year in range(2020, currentYear + 1):
        create_theme_breakdown(contents, str(year), user)

def changes_per_theme_daily(contents):
    hist = {}
    for row in contents:
        
        
        
def main():
    print("Creating graphs...")
    with open('stats.csv', newline='') as csvfile:
        stats = list(csv.reader(csvfile, delimiter=',', quotechar='"'))
        print("Found "+str(len(stats))+" changesets")
        create_yearly_usercount_graphs(stats)
        gen_theme_breakdown_graphs(stats)
    print("All done!")


# pyplot.fill_between(range(0,5),  [1,2,3,3,2],)
# pyplot.show()
main()
