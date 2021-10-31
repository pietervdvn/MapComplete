import {Utils} from "./Utils";
import FullNodeDatabaseSource from "./Logic/FeatureSource/TiledFeatureSource/FullNodeDatabaseSource";


const data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<osm version=\"0.6\" generator=\"CGImap 0.8.5 (2610109 spike-08.openstreetmap.org)\" copyright=\"OpenStreetMap and contributors\" attribution=\"http://www.openstreetmap.org/copyright\" license=\"http://opendatacommons.org/licenses/odbl/1-0/\">\n" +
    " <bounds minlat=\"51.2154864\" minlon=\"3.2176208\" maxlat=\"51.2163466\" maxlon=\"3.2189941\"/>\n" +
    " <node id=\"315739208\" visible=\"true\" version=\"6\" changeset=\"11063832\" timestamp=\"2012-03-22T15:12:47Z\" user=\"zors1843\" uid=\"233248\" lat=\"51.2149470\" lon=\"3.2183010\"/>\n" +
    " <node id=\"315739215\" visible=\"true\" version=\"8\" changeset=\"7350988\" timestamp=\"2011-02-21T09:50:46Z\" user=\"zors1843\" uid=\"233248\" lat=\"51.2160281\" lon=\"3.2174966\"/>\n" +
    " <node id=\"315739216\" visible=\"true\" version=\"7\" changeset=\"11037951\" timestamp=\"2012-03-20T06:38:28Z\" user=\"zors1843\" uid=\"233248\" lat=\"51.2152977\" lon=\"3.2195995\"/>\n" +
    " <node id=\"315739242\" visible=\"true\" version=\"2\" changeset=\"11037951\" timestamp=\"2012-03-20T06:38:29Z\" user=\"zors1843\" uid=\"233248\" lat=\"51.2164491\" lon=\"3.2187218\"/>\n" +
    " <node id=\"315739243\" visible=\"true\" version=\"9\" changeset=\"11037951\" timestamp=\"2012-03-20T06:38:29Z\" user=\"zors1843\" uid=\"233248\" lat=\"51.2166162\" lon=\"3.2182807\"/>\n" +
    " <node id=\"1682824800\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2154405\" lon=\"3.2193489\"/>\n" +
    " <node id=\"1682824805\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2154354\" lon=\"3.2193255\"/>\n" +
    " <node id=\"1682824813\" visible=\"true\" version=\"3\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2155117\" lon=\"3.2192071\"/>\n" +
    " <node id=\"1682824815\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2154693\" lon=\"3.2193015\"/>\n" +
    " <node id=\"1682824817\" visible=\"true\" version=\"3\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2153821\" lon=\"3.2193628\"/>\n" +
    " <node id=\"1682832761\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2159858\" lon=\"3.2190646\"/>\n" +
    " <node id=\"1682832762\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157564\" lon=\"3.2191917\"/>\n" +
    " <node id=\"1682832764\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157971\" lon=\"3.2187018\"/>\n" +
    " <node id=\"1682832775\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2153841\" lon=\"3.2186735\"/>\n" +
    " <node id=\"1682832777\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2156194\" lon=\"3.2188368\"/>\n" +
    " <node id=\"1682832780\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2153013\" lon=\"3.2188337\"/>\n" +
    " <node id=\"1682832782\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157716\" lon=\"3.2190346\"/>\n" +
    " <node id=\"1682832784\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2153225\" lon=\"3.2189135\"/>\n" +
    " <node id=\"1682832786\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2154508\" lon=\"3.2187894\"/>\n" +
    " <node id=\"1682832789\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2159305\" lon=\"3.2188530\"/>\n" +
    " <node id=\"1682832791\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157323\" lon=\"3.2180624\"/>\n" +
    " <node id=\"1682832793\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:21Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2159622\" lon=\"3.2188025\"/>\n" +
    " <node id=\"1682832795\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2159076\" lon=\"3.2189725\"/>\n" +
    " <node id=\"1682832804\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157453\" lon=\"3.2186489\"/>\n" +
    " <node id=\"1682832808\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157935\" lon=\"3.2186116\"/>\n" +
    " <node id=\"1682832813\" visible=\"true\" version=\"3\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2152199\" lon=\"3.2186903\"/>\n" +
    " <node id=\"1682832815\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2160796\" lon=\"3.2189893\"/>\n" +
    " <node id=\"1682832817\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2154484\" lon=\"3.2188760\"/>\n" +
    " <node id=\"1682832818\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2152395\" lon=\"3.2187686\"/>\n" +
    " <node id=\"1682832819\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2153621\" lon=\"3.2185962\"/>\n" +
    " <node id=\"1682832820\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2155109\" lon=\"3.2184903\"/>\n" +
    " <node id=\"1682832821\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2155922\" lon=\"3.2187693\"/>\n" +
    " <node id=\"1682832825\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2154945\" lon=\"3.2191530\"/>\n" +
    " <node id=\"1682832826\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157122\" lon=\"3.2192275\"/>\n" +
    " <node id=\"1682832827\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2154505\" lon=\"3.2187683\"/>\n" +
    " <node id=\"1682832828\" visible=\"true\" version=\"3\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2160312\" lon=\"3.2188379\"/>\n" +
    " <node id=\"1682832829\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2160071\" lon=\"3.2188563\"/>\n" +
    " <node id=\"1682832830\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2158432\" lon=\"3.2189346\"/>\n" +
    " <node id=\"1682832831\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157027\" lon=\"3.2184476\"/>\n" +
    " <node id=\"1682832832\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2159424\" lon=\"3.2189018\"/>\n" +
    " <node id=\"1682832833\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:22Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2156684\" lon=\"3.2191183\"/>\n" +
    " <node id=\"1682832834\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2158295\" lon=\"3.2185829\"/>\n" +
    " <node id=\"1682832835\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2156820\" lon=\"3.2180867\"/>\n" +
    " <node id=\"1682832836\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2155219\" lon=\"3.2191313\"/>\n" +
    " <node id=\"1682832837\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2158056\" lon=\"3.2190810\"/>\n" +
    " <node id=\"1682832838\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157585\" lon=\"3.2190453\"/>\n" +
    " <node id=\"1682832839\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2153634\" lon=\"3.2186009\"/>\n" +
    " <node id=\"1682832840\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157257\" lon=\"3.2185567\"/>\n" +
    " <node id=\"1682832841\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2159207\" lon=\"3.2190210\"/>\n" +
    " <node id=\"1682832842\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2160295\" lon=\"3.2190298\"/>\n" +
    " <node id=\"1682832843\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2156835\" lon=\"3.2183577\"/>\n" +
    " <node id=\"1682832846\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2158946\" lon=\"3.2189083\"/>\n" +
    " <node id=\"1682832848\" visible=\"true\" version=\"1\" changeset=\"11037951\" timestamp=\"2012-03-20T06:38:23Z\" user=\"zors1843\" uid=\"233248\" lat=\"51.2162257\" lon=\"3.2189152\"/>\n" +
    " <node id=\"1682832850\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2156455\" lon=\"3.2189033\"/>\n" +
    " <node id=\"1682832851\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157814\" lon=\"3.2191010\"/>\n" +
    " <node id=\"1682832852\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2158297\" lon=\"3.2191463\"/>\n" +
    " <node id=\"1682832853\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2153884\" lon=\"3.2186848\"/>\n" +
    " <node id=\"1682832854\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2155190\" lon=\"3.2191206\"/>\n" +
    " <node id=\"1682832856\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2156298\" lon=\"3.2190100\"/>\n" +
    " <node id=\"1682832858\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2156874\" lon=\"3.2190086\"/>\n" +
    " <node id=\"1682832859\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2159818\" lon=\"3.2188688\"/>\n" +
    " <node id=\"1682832860\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2159413\" lon=\"3.2190997\"/>\n" +
    " <node id=\"1682832861\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2159831\" lon=\"3.2187874\"/>\n" +
    " <node id=\"1682832862\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:23Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157432\" lon=\"3.2189602\"/>\n" +
    " <node id=\"1682837112\" visible=\"true\" version=\"3\" changeset=\"113131738\" timestamp=\"2021-10-29T16:20:51Z\" user=\"Pieter Vander Vennet\" uid=\"3818858\" lat=\"51.2160077\" lon=\"3.2187651\"/>\n" +
    " <node id=\"1682837113\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2161667\" lon=\"3.2187271\"/>\n" +
    " <node id=\"1682837114\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2162728\" lon=\"3.2185965\"/>\n" +
    " <node id=\"1682837115\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2161349\" lon=\"3.2185984\"/>\n" +
    " <node id=\"1682837120\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2163153\" lon=\"3.2187451\"/>\n" +
    " <node id=\"1682837122\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2164091\" lon=\"3.2186697\"/>\n" +
    " <node id=\"1682837124\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2161535\" lon=\"3.2183166\"/>\n" +
    " <node id=\"1682837126\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2162789\" lon=\"3.2187745\"/>\n" +
    " <node id=\"1682837128\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2161929\" lon=\"3.2185504\"/>\n" +
    " <node id=\"1682837130\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2162296\" lon=\"3.2186760\"/>\n" +
    " <node id=\"1682837132\" visible=\"true\" version=\"3\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2165327\" lon=\"3.2183323\"/>\n" +
    " <node id=\"1682837133\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2163805\" lon=\"3.2186936\"/>\n" +
    " <node id=\"1682837134\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2162456\" lon=\"3.2186644\"/>\n" +
    " <node id=\"1682837135\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2162404\" lon=\"3.2188053\"/>\n" +
    " <node id=\"1682837136\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2162428\" lon=\"3.2184412\"/>\n" +
    " <node id=\"1682837138\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2162938\" lon=\"3.2185770\"/>\n" +
    " <node id=\"1682837142\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2161321\" lon=\"3.2183620\"/>\n" +
    " <node id=\"1682837143\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2161991\" lon=\"3.2188378\"/>\n" +
    " <node id=\"1682837145\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2160656\" lon=\"3.2189444\"/>\n" +
    " <node id=\"1682837146\" visible=\"true\" version=\"3\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2163975\" lon=\"3.2181513\"/>\n" +
    " <node id=\"1682837147\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2161668\" lon=\"3.2185723\"/>\n" +
    " <node id=\"1682837148\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2161842\" lon=\"3.2187118\"/>\n" +
    " <node id=\"1682837149\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2160893\" lon=\"3.2186362\"/>\n" +
    " <node id=\"1682837150\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2161619\" lon=\"3.2188670\"/>\n" +
    " <node id=\"1682874140\" visible=\"true\" version=\"2\" changeset=\"50433000\" timestamp=\"2017-07-20T13:11:32Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2163477\" lon=\"3.2191243\"/>\n" +
    " <node id=\"1682874141\" visible=\"true\" version=\"2\" changeset=\"50433000\" timestamp=\"2017-07-20T13:11:32Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2160579\" lon=\"3.2190935\"/>\n" +
    " <node id=\"1682874142\" visible=\"true\" version=\"2\" changeset=\"50433000\" timestamp=\"2017-07-20T13:11:32Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2161979\" lon=\"3.2193991\"/>\n" +
    " <node id=\"1682874143\" visible=\"true\" version=\"2\" changeset=\"50433000\" timestamp=\"2017-07-20T13:11:32Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2162760\" lon=\"3.2189217\"/>\n" +
    " <node id=\"1682874144\" visible=\"true\" version=\"2\" changeset=\"50433000\" timestamp=\"2017-07-20T13:11:32Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2163468\" lon=\"3.2188607\"/>\n" +
    " <node id=\"1682874150\" visible=\"true\" version=\"2\" changeset=\"50433000\" timestamp=\"2017-07-20T13:11:32Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2163835\" lon=\"3.2190937\"/>\n" +
    " <node id=\"1682874151\" visible=\"true\" version=\"2\" changeset=\"50433000\" timestamp=\"2017-07-20T13:11:32Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2164206\" lon=\"3.2190633\"/>\n" +
    " <node id=\"1682874161\" visible=\"true\" version=\"2\" changeset=\"50433000\" timestamp=\"2017-07-20T13:11:33Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2161339\" lon=\"3.2194350\"/>\n" +
    " <node id=\"1682874164\" visible=\"true\" version=\"2\" changeset=\"50433000\" timestamp=\"2017-07-20T13:11:33Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2163293\" lon=\"3.2191391\"/>\n" +
    " <node id=\"1682874165\" visible=\"true\" version=\"2\" changeset=\"50433000\" timestamp=\"2017-07-20T13:11:33Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2160741\" lon=\"3.2191659\"/>\n" +
    " <node id=\"1682874166\" visible=\"true\" version=\"2\" changeset=\"50433000\" timestamp=\"2017-07-20T13:11:33Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2163108\" lon=\"3.2188917\"/>\n" +
    " <node id=\"1682875368\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2159045\" lon=\"3.2178572\"/>\n" +
    " <node id=\"1682875370\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2158354\" lon=\"3.2179572\"/>\n" +
    " <node id=\"1682875372\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2158939\" lon=\"3.2176815\"/>\n" +
    " <node id=\"1682875373\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:24Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2158483\" lon=\"3.2179326\"/>\n" +
    " <node id=\"1682875374\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157153\" lon=\"3.2177946\"/>\n" +
    " <node id=\"1682875381\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2158748\" lon=\"3.2178159\"/>\n" +
    " <node id=\"1682875385\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2158683\" lon=\"3.2179618\"/>\n" +
    " <node id=\"1682875387\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2158782\" lon=\"3.2179443\"/>\n" +
    " <node id=\"1682875389\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2158141\" lon=\"3.2177312\"/>\n" +
    " <node id=\"1682875395\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157649\" lon=\"3.2177632\"/>\n" +
    " <node id=\"1682876085\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2155829\" lon=\"3.2178849\"/>\n" +
    " <node id=\"1682876086\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2156324\" lon=\"3.2178513\"/>\n" +
    " <node id=\"1682876088\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2156714\" lon=\"3.2180361\"/>\n" +
    " <node id=\"1682876091\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2156926\" lon=\"3.2178103\"/>\n" +
    " <node id=\"1682876092\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2156297\" lon=\"3.2178592\"/>\n" +
    " <node id=\"1682876099\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157351\" lon=\"3.2180027\"/>\n" +
    " <node id=\"1682876100\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2156190\" lon=\"3.2180623\"/>\n" +
    " <node id=\"1682876102\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2157232\" lon=\"3.2179435\"/>\n" +
    " <node id=\"1682877254\" visible=\"true\" version=\"3\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2154254\" lon=\"3.2179953\"/>\n" +
    " <node id=\"1682877255\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2155716\" lon=\"3.2180819\"/>\n" +
    " <node id=\"1682877256\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2155250\" lon=\"3.2179243\"/>\n" +
    " <node id=\"1682877257\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2154821\" lon=\"3.2181863\"/>\n" +
    " <node id=\"1682879309\" visible=\"true\" version=\"2\" changeset=\"50435292\" timestamp=\"2017-07-20T15:06:25Z\" user=\"catweazle67\" uid=\"1976209\" lat=\"51.2154292\" lon=\"3.2182116\"/>\n" +
    " </osm>"

const url = "https://www.openstreetmap.org/api/0.6/map?bbox=3.217620849609375,51.21548639922819,3.218994140625,51.21634661126673"
Utils.downloadJson(url).then(data =>{
    const osmSource = {
        rawDataHandlers : []
    }
    new FullNodeDatabaseSource(osmSource)
    osmSource.rawDataHandlers[0]( data, 0)
})