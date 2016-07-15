"use strict";
const url = require("url");
const global_1 = require("../core/global");
class URLMangler {
    constructor(urlString, nodeID) {
        this.urlString = urlString;
        this.nodeID = nodeID;
    }
    mangle() {
        let urlValue = url.parse(this.urlString, true, false);
        let newUrl = "https://";
        newUrl += global_1.Global.BespokeServerHost;
        newUrl += urlValue.path;
        if (urlValue.path.indexOf("?") !== -1) {
            newUrl += "&";
        }
        else {
            newUrl += "?";
        }
        newUrl += "node-id=" + this.nodeID;
        return newUrl;
    }
}
exports.URLMangler = URLMangler;
//# sourceMappingURL=url-mangler.js.map