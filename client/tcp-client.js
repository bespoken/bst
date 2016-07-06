/// <reference path="../typings/globals/node/index.d.ts" />
"use strict";
var net = require("net");
var TCPClient = (function () {
    function TCPClient() {
    }
    TCPClient.prototype.transmit = function (host, port, data, callback) {
        var client = new net.Socket();
        client.connect(port, host, function () {
            console.log('CONNECTED TO: ' + host + ':' + port);
            // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
            client.write(data);
        });
        // Add a 'data' event handler for the client socket
        // data is what the server sent to this socket
        client.on('data', function (data) {
            console.log('DATA: ' + data);
            callback(data);
        });
        // Add a 'close' event handler for the client socket
        client.on('close', function () {
            console.log('Connection closed');
        });
    };
    return TCPClient;
}());
exports.TCPClient = TCPClient;
