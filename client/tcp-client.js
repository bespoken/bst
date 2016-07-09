/// <reference path="../typings/globals/node/index.d.ts" />
"use strict";
var net = require("net");
var TCPClient = (function () {
    function TCPClient() {
    }
    TCPClient.prototype.transmit = function (host, port, data, callback) {
        var client = new net.Socket();
        client.connect(port, host, function (info) {
            console.log("Testasdfasdf");
            // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
            client.write(data);
        });
        // Add a 'data' event handler for the client socket
        // data is what the server sent to this socket
        client.on('data', function (data) {
            callback(data);
        });
        // Add a 'close' event handler for the client socket
        client.on('close', function () {
            console.log('Connection closed');
        });
    };
    TCPClient.prototype.close = function () {
    };
    return TCPClient;
}());
exports.TCPClient = TCPClient;
