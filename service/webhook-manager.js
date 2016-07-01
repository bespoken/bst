"use strict";
var http = require("http");
var webhook_request_1 = require("./webhook-request");
var WebhookManager = (function () {
    function WebhookManager() {
        this.onWebhookReceived = null;
    }
    WebhookManager.prototype.start = function () {
        var self = this;
        this.server = http.createServer();
        this.server.on('request', function (request, response) {
            var requestBytes = [];
            //Standard stuff for reading in body of a request
            request.on('data', function (chunk) {
                requestBytes.push(chunk);
            }).on('end', function () {
                var requestString = Buffer.concat(requestBytes).toString();
                var webhookRequest = new webhook_request_1.WebhookRequest(request, requestString);
                if (self.onWebhookReceived != null) {
                    self.onWebhookReceived(webhookRequest);
                }
            });
        });
        this.server.listen(8080);
    };
    return WebhookManager;
}());
exports.WebhookManager = WebhookManager;
