/// <reference path="../typings/modules/es6-promise/index.d.ts" />
"use strict";
var net = require('net');
var es6_promise_1 = require('es6-promise');
var BespokeClient = (function () {
    function BespokeClient(host, port) {
        this.host = host;
        this.port = port;
        this.connected = null;
    }
    BespokeClient.prototype.connect = function () {
        var _this = this;
        this.client = new net.Socket();
        var self = this;
        //Use a connected promise to wait on any other stuff that needs to happen
        this.connected = new es6_promise_1.Promise(function (resolve) {
            self.client.connect(_this.port, _this.host, function () {
                resolve();
            });
        });
    };
    BespokeClient.prototype.write = function (data, callback) {
        if (this.connected == null) {
            return;
        }
        var self = this;
        this.connected.then(function () {
            self.client.write(data, callback);
        });
    };
    BespokeClient.prototype.disconnect = function () {
        var self = this;
        this.connected.then(function () {
            self.client.end();
        });
    };
    return BespokeClient;
}());
exports.BespokeClient = BespokeClient;
