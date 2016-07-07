/// <reference path="../typings/globals/node/index.d.ts" />
var querystring = require("querystring");
var WebhookRequest = (function () {
    function WebhookRequest() {
        this.queryParameters = {};
        this.rawContents = new Buffer("");
        this.body = "";
    }
    WebhookRequest.fromString = function (payload) {
        var webhookRequest = new WebhookRequest();
        webhookRequest.append(Buffer.from(payload));
        return webhookRequest;
    };
    WebhookRequest.prototype.append = function (data) {
        this.rawContents = Buffer.concat([this.rawContents, data]);
        if (this.headers == null) {
            this.headers = {};
            var contentsString = this.rawContents.toString();
            var endIndex = contentsString.indexOf("\r\n\r\n");
            if (endIndex != -1) {
                this.parseHeaders(contentsString.substr(0, endIndex));
                if (endIndex + 4 < contentsString.length) {
                    var bodyPart = contentsString.substr((endIndex + 4));
                    this.appendBody(bodyPart);
                }
            }
        }
        else {
            this.appendBody(data.toString());
        }
    };
    WebhookRequest.prototype.appendBody = function (bodyPart) {
        this.body += bodyPart;
    };
    WebhookRequest.prototype.done = function () {
        if (this.method == "GET") {
            return true;
        }
        return (this.body.length == this.contentLength());
    };
    WebhookRequest.prototype.contentLength = function () {
        var contentLength = -1;
        if (this.headers != null) {
            var contentLengthString = this.headers["Content-Length"];
            contentLength = parseInt(contentLengthString);
        }
        return contentLength;
    };
    WebhookRequest.prototype.isPing = function () {
        console.log("ISPING: " + (this.uri.indexOf("/ping") != -1));
        return (this.uri.indexOf("/ping") != -1);
    };
    WebhookRequest.prototype.parseHeaders = function (headersString) {
        var lines = headersString.split("\n");
        var requestLine = lines[0];
        var requestLineParts = requestLine.split(" ");
        this.method = requestLineParts[0];
        this.uri = requestLineParts[1];
        console.log("QueryString URL: " + this.uri);
        if (this.uri.indexOf('?') >= 0) {
            this.queryParameters = querystring.parse(this.uri.replace(/^.*\?/, ''));
        }
        //Handle the headers
        console.log("Request: " + requestLine);
        for (var i = 1; i < lines.length; i++) {
            var headerLine = lines[i];
            var headerParts = headerLine.split(":");
            var key = headerParts[0];
            var value = headerParts[1].trim();
            this.headers[key] = value;
        }
    };
    WebhookRequest.prototype.nodeID = function () {
        return this.queryParameters["node-id"];
    };
    //Turns the webhook HTTP request into straight TCP payload
    WebhookRequest.prototype.toTCP = function () {
        return this.rawContents.toString();
    };
    return WebhookRequest;
})();
exports.WebhookRequest = WebhookRequest;
//# sourceMappingURL=webhook-request.js.map