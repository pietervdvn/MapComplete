"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OsmRelation = exports.OsmWay = exports.OsmNode = exports.OsmObject = void 0;
var $ = require("jquery");
var OsmObject = /** @class */ (function () {
    function OsmObject(type, id) {
        this.tags = {};
        this.changed = false;
        this.id = id;
        this.type = type;
    }
    OsmObject.DownloadObject = function (id, continuation) {
        var splitted = id.split("/");
        var type = splitted[0];
        var idN = splitted[1];
        switch (type) {
            case ("node"):
                return new OsmNode(idN).Download(continuation);
            case ("way"):
                return new OsmWay(idN).Download(continuation);
            case ("relation"):
                return new OsmRelation(idN).Download(continuation);
        }
    };
    /**
     * Replaces all '"' (double quotes) by '&quot;'
     * Bugfix where names containing '"' were not uploaded, such as '"Het Zwin" nature reserve'
     * @param string
     * @constructor
     */
    OsmObject.prototype.Escape = function (string) {
        while (string.indexOf('"') >= 0) {
            string = string.replace('"', '&quot;');
        }
        return string;
    };
    /**
     * Generates the changeset-XML for tags
     * @constructor
     */
    OsmObject.prototype.TagsXML = function () {
        var tags = "";
        for (var key in this.tags) {
            var v = this.tags[key];
            if (v !== "") {
                tags += '        <tag k="' + this.Escape(key) + '" v="' + this.Escape(this.tags[key]) + '"/>\n';
            }
        }
        return tags;
    };
    OsmObject.prototype.Download = function (continuation) {
        var self = this;
        $.getJSON("https://www.openstreetmap.org/api/0.6/" + this.type + "/" + this.id, function (data) {
            var element = data.elements[0];
            self.tags = element.tags;
            self.version = element.version;
            self.SaveExtraData(element);
            continuation(self);
        });
        return this;
    };
    OsmObject.prototype.addTag = function (k, v) {
        if (k in this.tags) {
            var oldV = this.tags[k];
            if (oldV == v) {
                return;
            }
            console.log("WARNING: overwriting ", oldV, " with ", v, " for key ", k);
        }
        this.tags[k] = v;
        this.changed = true;
    };
    OsmObject.prototype.VersionXML = function () {
        if (this.version === undefined) {
            return "";
        }
        return 'version="' + this.version + '"';
    };
    return OsmObject;
}());
exports.OsmObject = OsmObject;
var OsmNode = /** @class */ (function (_super) {
    __extends(OsmNode, _super);
    function OsmNode(id) {
        return _super.call(this, "node", id) || this;
    }
    OsmNode.prototype.ChangesetXML = function (changesetId) {
        var tags = this.TagsXML();
        var change = '        <node id="' + this.id + '" changeset="' + changesetId + '" ' + this.VersionXML() + ' lat="' + this.lat + '" lon="' + this.lon + '">\n' +
            tags +
            '        </node>\n';
        return change;
    };
    OsmNode.prototype.SaveExtraData = function (element) {
        this.lat = element.lat;
        this.lon = element.lon;
    };
    return OsmNode;
}(OsmObject));
exports.OsmNode = OsmNode;
var OsmWay = /** @class */ (function (_super) {
    __extends(OsmWay, _super);
    function OsmWay(id) {
        return _super.call(this, "way", id) || this;
    }
    OsmWay.prototype.ChangesetXML = function (changesetId) {
        var tags = this.TagsXML();
        var nds = "";
        for (var node in this.nodes) {
            nds += '      <nd ref="' + this.nodes[node] + '"/>\n';
        }
        var change = '    <way id="' + this.id + '" changeset="' + changesetId + '" ' + this.VersionXML() + '>\n' +
            nds +
            tags +
            '        </way>\n';
        return change;
    };
    OsmWay.prototype.SaveExtraData = function (element) {
        this.nodes = element.nodes;
    };
    return OsmWay;
}(OsmObject));
exports.OsmWay = OsmWay;
var OsmRelation = /** @class */ (function (_super) {
    __extends(OsmRelation, _super);
    function OsmRelation(id) {
        return _super.call(this, "relation", id) || this;
    }
    OsmRelation.prototype.ChangesetXML = function (changesetId) {
        var members = "";
        for (var memberI in this.members) {
            var member = this.members[memberI];
            members += '      <member type="' + member.type + '" ref="' + member.ref + '" role="' + member.role + '"/>\n';
        }
        var tags = this.TagsXML();
        var change = '    <relation id="' + this.id + '" changeset="' + changesetId + '" ' + this.VersionXML() + '>\n' +
            members +
            tags +
            '        </relation>\n';
        return change;
    };
    OsmRelation.prototype.SaveExtraData = function (element) {
        this.members = element.members;
    };
    return OsmRelation;
}(OsmObject));
exports.OsmRelation = OsmRelation;
