/// <reference path="../typings/modules/es6-promise/index.d.ts" />
"use strict";
var net = require('net');
var es6_promise_1 = require('es6-promise');
var BespokeClient = (function () {
    function BespokeClient(host, port) {
        this.host = host;
        this.port = port;
    }
    BespokeClient.prototype.connect = function () {
        var _this = this;
        this.client = new net.Socket();
        var self = this;
        this.initialized = new es6_promise_1.Promise(function (resolve, reject) {
            self.client.connect(_this.port, _this.host, function () {
                // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
                resolve(true);
            });
        });
    };
    BespokeClient.prototype.write = function (data) {
        var self = this;
        this.initialized.then(function () {
            console.log("Test");
            self.client.write(data);
        });
    };
    BespokeClient.prototype.disconnect = function () {
        this.client.end();
        //this.client.destroy();
    };
    return BespokeClient;
}());
exports.BespokeClient = BespokeClient;
