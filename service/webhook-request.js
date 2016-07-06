"use strict";
var querystring = require("querystring");
var WebhookRequest = (function () {
    function WebhookRequest(request, body) {
        this.request = request;
        this.body = body;
        this.queryParameters = {};
        this.prepare();
    }
    WebhookRequest.prototype.prepare = function () {
        if (this.request == null) {
            return;
        }
        console.log("QueryString URL: " + this.request.url);
        if (this.request.url.indexOf('?') >= 0) {
            this.queryParameters = querystring.parse(this.request.url.replace(/^.*\?/, ''));
        }
    };
    WebhookRequest.prototype.nodeID = function () {
        var nodeID = this.queryParameters["node-id"];
        return nodeID;
    };
    WebhookRequest.prototype.process = function () {
    };
    return WebhookRequest;
}());
exports.WebhookRequest = WebhookRequest;
