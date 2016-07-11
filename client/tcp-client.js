/// <reference path="../typings/globals/node/index.d.ts" />
"use strict";
var net = require("net");
var global_1 = require("../service/global");
var TCPClient = (function () {
    function TCPClient() {
    }
    TCPClient.prototype.transmit = function (host, port, data, callback) {
        var client = new net.Socket();
        console.log("TCP-CLIENT " + host + ":" + port + " Connected");
        client.setTimeout(1000, function (message) {
            console.log("TCP-CLIENT " + host + ":" + port + " TimedOut");
            callback(null, global_1.NetworkErrorType.TIME_OUT, message);
        });
        client.on("error", function (e) {
            if (e.code === "ECONNREFUSED") {
                callback(null, global_1.NetworkErrorType.CONNECTION_REFUSED, e.message);
            }
            else {
                callback(null, global_1.NetworkErrorType.OTHER, e.message);
            }
        });
        client.connect(port, host, function () {
            // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
            client.write(data);
        });
        // Add a 'data' event handler for the client socket
        // data is what the server sent to this socket
        client.on("data", function (data) {
            callback(data, null, null);
        });
        // Add a 'close' event handler for the client socket
        client.on("close", function () {
            console.log("Connection closed");
        });
    };
    TCPClient.prototype.close = function () {
    };
    return TCPClient;
}());
exports.TCPClient = TCPClient;
