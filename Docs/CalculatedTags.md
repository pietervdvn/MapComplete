### \_lat, \_lon

The latitude and longitude of the point (or centerpoint in the case of a way/area)

### \_surface, \_surface:ha

The surface area of the feature, in square meters and in hectare. Not set on points and ways

### \_country

The country code of the property (with latlon2country)

### \_isOpen, \_isOpen:description

If 'opening\_hours' is present, it will add the current state of the feature (being 'yes' or 'no')

### \_width:needed, \_width:needed:no\_pedestrians, \_width:difference

Legacy for a specific project calculating the needed width for safe traffic on a road. Only activated if 'width:carriageway' is present

### \_direction:simplified, \_direction:leftright

\_direction:simplified turns 'camera:direction' and 'direction' into either 0, 45, 90, 135, 180, 225, 270 or 315, whichever is closest. \_direction:leftright is either 'left' or 'right', which is left-looking on the map or 'right-looking' on the map

### \_now:date, \_now:datetime, \_loaded:date, \_loaded:\_datetime

Adds the time that the data got loaded - pretty much the time of downloading from overpass. The format is YYYY-MM-DD hh:mm, aka 'sortable' aka ISO-8601-but-not-entirely