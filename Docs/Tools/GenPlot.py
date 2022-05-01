import json
import sys
from datetime import datetime
from matplotlib import pyplot


def pyplot_init():
    pyplot.close('all')
    pyplot.figure(figsize=(14, 8), dpi=200)
    pyplot.xticks(rotation='vertical')
    pyplot.grid()


def genKeys(data, type):
    keys = map(lambda kv: kv["key"], data)
    if type == "date":
        keys = map(lambda key: datetime.strptime(key, "%Y-%m-%dT%H:%M:%S.000Z"), keys)
    return list(keys)


def createPie(options):
    data = options["plot"]["count"]
    keys = genKeys(data, options["interpetKeysAs"])
    values = list(map(lambda kv: kv["value"], data))

    total = sum(map(lambda kv: kv["value"], data))
    first_pct = data[0]["value"] / total

    pyplot_init()
    pyplot.pie(values, labels=keys, startangle=(90 - 360 * first_pct / 2))


def createBar(options):
    data = options["plot"]["count"]
    keys = genKeys(data, options["interpetKeysAs"])
    values = list(map(lambda kv: kv["value"], data))

    color = None
    if "color" in options["plot"]:
    	color = options["plot"]["color"] 
    pyplot.bar(keys, values, label=options["name"], color=color)
    pyplot.legend()


def createLine(options):
    data = options["plot"]["count"]
    keys = genKeys(data, options["interpetKeysAs"])
    values = list(map(lambda kv: kv["value"], data))

    pyplot.plot(keys, values, label=options["name"])
    pyplot.legend()


pyplot_init()
title = sys.argv[1]
pyplot.title = title
names = []
while (True):
    line = sys.stdin.readline()
    if line == "" or line == "\n":
        if (len(names) > 1):
            pyplot.legend(loc="upper left", ncol=3)
        pyplot.savefig(title + ".png", dpi=400, facecolor='w', edgecolor='w',
                       bbox_inches='tight')
        break

    options = json.loads(line)
    print("Creating " + options["plot"]["type"] + " '" + options["name"] + "'")
    names.append(options["name"])
    if (options["plot"]["type"] == "pie"):
        createPie(options)
    elif (options["plot"]["type"] == "bar"):
        createBar(options)
    elif (options["plot"]["type"] == "line"):
        createLine(options)
    else:
        print("Unkown type: " + options.type)
print("Plot generated")
