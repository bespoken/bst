"use strict";
const net = require("net");
class TCPClient {
    constructor() {
    }
    transmit(host, port, data, callback) {
        var client = new net.Socket();
        client.connect(port, host, function (info) {
            console.log("Testasdfasdf");
            client.write(data);
        });
        client.on('data', function (data) {
            callback(data);
        });
        client.on('close', function () {
            console.log('Connection closed');
        });
    }
    close() {
    }
}
exports.TCPClient = TCPClient;
//# sourceMappingURL=tcp-client.js.map