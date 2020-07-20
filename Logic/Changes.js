"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Changes = void 0;
var OsmObject_1 = require("./OsmObject");
var UIEventSource_1 = require("../UI/UIEventSource");
var TagsFilter_1 = require("./TagsFilter");
var Changes = /** @class */ (function () {
    function Changes(changesetComment, login, allElements) {
        this._pendingChanges = []; // Gets reset on uploadAll
        this.newElements = []; // Gets reset on uploadAll
        this.pendingChangesES = new UIEventSource_1.UIEventSource(this._pendingChanges.length);
        this.isSaving = new UIEventSource_1.UIEventSource(false);
        this._changesetComment = changesetComment;
        this.login = login;
        this._allElements = allElements;
    }
    Changes.prototype.addTag = function (elementId, tagsFilter) {
        if (tagsFilter instanceof TagsFilter_1.Tag) {
            var tag = tagsFilter;
            this.addChange(elementId, tag.key, tag.value);
            return;
        }
        if (tagsFilter instanceof TagsFilter_1.And) {
            var and = tagsFilter;
            for (var _i = 0, _a = and.and; _i < _a.length; _i++) {
                var tag = _a[_i];
                this.addTag(elementId, tag);
            }
            return;
        }
        console.log("Unsupported tagsfilter element to addTag", tagsFilter);
        throw "Unsupported tagsFilter element";
    };
    /**
     * Adds a change to the pending changes
     * @param elementId
     * @param key
     * @param value
     */
    Changes.prototype.addChange = function (elementId, key, value) {
        console.log("Received change", key, value);
        if (key === undefined || key === null) {
            console.log("Invalid key");
            return;
        }
        if (value === undefined || value === null) {
            console.log("Invalid value for ", key);
            return;
        }
        var eventSource = this._allElements.getElement(elementId);
        eventSource.data[key] = value;
        eventSource.ping();
        // We get the id from the event source, as that ID might be rewritten
        this._pendingChanges.push({ elementId: eventSource.data.id, key: key, value: value });
        this.pendingChangesES.setData(this._pendingChanges.length);
    };
    /**
     * Create a new node element at the given lat/long.
     * An internal OsmObject is created to upload later on, a geojson represention is returned.
     * Note that the geojson version shares the tags (properties) by pointer, but has _no_ id in properties
     */
    Changes.prototype.createElement = function (basicTags, lat, lon) {
        var osmNode = new OsmObject_1.OsmNode(Changes._nextId);
        this.newElements.push(osmNode);
        Changes._nextId--;
        var id = "node/" + osmNode.id;
        osmNode.lat = lat;
        osmNode.lon = lon;
        var properties = { id: id };
        var geojson = {
            "type": "Feature",
            "properties": properties,
            "id": id,
            "geometry": {
                "type": "Point",
                "coordinates": [
                    lon,
                    lat
                ]
            }
        };
        this._allElements.addOrGetElement(geojson);
        // The basictags are COPIED, the id is included in the properties
        // The tags are not yet written into the OsmObject, but this is applied onto a 
        for (var _i = 0, basicTags_1 = basicTags; _i < basicTags_1.length; _i++) {
            var kv = basicTags_1[_i];
            this.addChange(id, kv.key, kv.value); // We use the call, to trigger all the other machinery (including updating the geojson itsel
            properties[kv.key] = kv.value;
        }
        return geojson;
    };
    Changes.prototype.uploadAll = function (optionalContinuation) {
        if (optionalContinuation === void 0) { optionalContinuation = undefined; }
        var self = this;
        this.isSaving.setData(true);
        var optionalContinuationWrapped = function () {
            self.isSaving.setData(false);
            if (optionalContinuation) {
                optionalContinuation();
            }
        };
        var pending = this._pendingChanges;
        this._pendingChanges = [];
        this.pendingChangesES.setData(this._pendingChanges.length);
        var newElements = this.newElements;
        this.newElements = [];
        var knownElements = {}; // maps string --> OsmObject
        function DownloadAndContinue(neededIds, continuation) {
            // local function which downloads all the objects one by one
            // this is one big loop, running one download, then rerunning the entire function
            if (neededIds.length == 0) {
                continuation();
                return;
            }
            var neededId = neededIds.pop();
            if (neededId in knownElements) {
                DownloadAndContinue(neededIds, continuation);
                return;
            }
            console.log("Downloading ", neededId);
            OsmObject_1.OsmObject.DownloadObject(neededId, function (element) {
                knownElements[neededId] = element; // assign the element for later, continue downloading the next element
                DownloadAndContinue(neededIds, continuation);
            });
        }
        var neededIds = [];
        for (var _i = 0, pending_1 = pending; _i < pending_1.length; _i++) {
            var change = pending_1[_i];
            var id = change.elementId;
            if (parseFloat(id.split("/")[1]) < 0) {
                console.log("Detected a new element! Exciting!");
            }
            else {
                neededIds.push(id);
            }
        }
        DownloadAndContinue(neededIds, function () {
            // Here, inside the continuation, we know that all 'neededIds' are loaded in 'knownElements'
            // We apply the changes on them
            for (var _i = 0, pending_2 = pending; _i < pending_2.length; _i++) {
                var change = pending_2[_i];
                if (parseInt(change.elementId.split("/")[1]) < 0) {
                    // This is a new element - we should apply this on one of the new elements
                    for (var _a = 0, newElements_1 = newElements; _a < newElements_1.length; _a++) {
                        var newElement = newElements_1[_a];
                        if (newElement.type + "/" + newElement.id === change.elementId) {
                            newElement.addTag(change.key, change.value);
                        }
                    }
                }
                else {
                    console.log(knownElements, change.elementId);
                    knownElements[change.elementId].addTag(change.key, change.value);
                    // note: addTag will flag changes with 'element.changed' internally
                }
            }
            // Small sanity check for duplicate information
            var changedElements = [];
            for (var elementId in knownElements) {
                var element = knownElements[elementId];
                if (element.changed) {
                    changedElements.push(element);
                }
            }
            if (changedElements.length == 0 && newElements.length == 0) {
                console.log("No changes in any object");
                return;
            }
            var handleMapping = function (idMapping) {
                for (var oldId in idMapping) {
                    var newId = idMapping[oldId];
                    var element = self._allElements.getElement(oldId);
                    element.data.id = newId;
                    self._allElements.addElementById(newId, element);
                    element.ping();
                }
            };
            console.log("Beginning upload...");
            // At last, we build the changeset and upload
            self.login.UploadChangeset(self._changesetComment, function (csId) {
                var modifications = "";
                for (var _i = 0, changedElements_1 = changedElements; _i < changedElements_1.length; _i++) {
                    var element = changedElements_1[_i];
                    if (!element.changed) {
                        continue;
                    }
                    modifications += element.ChangesetXML(csId) + "\n";
                }
                var creations = "";
                for (var _a = 0, newElements_2 = newElements; _a < newElements_2.length; _a++) {
                    var newElement = newElements_2[_a];
                    creations += newElement.ChangesetXML(csId);
                }
                var changes = "<osmChange version='0.6' generator='Mapcomplete 0.0.1'>";
                if (creations.length > 0) {
                    changes +=
                        "<create>" +
                            creations +
                            "</create>";
                }
                if (modifications.length > 0) {
                    changes +=
                        "<modify>" +
                            modifications +
                            "</modify>";
                }
                changes += "</osmChange>";
                return changes;
            }, handleMapping, optionalContinuationWrapped);
        });
    };
    Changes.prototype.asQuestions = function (qs) {
        var ls = [];
        for (var i in qs) {
            ls.push(new Question(this, qs[i]));
        }
        return ls;
    };
    Changes._nextId = -1; // New assined ID's are negative
    return Changes;
}());
exports.Changes = Changes;
