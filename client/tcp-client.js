"use strict";
var net = require("net");
var TCPClient = (function () {
    function TCPClient() {
    }
    TCPClient.prototype.transmit = function (host, port, data, callback) {
        var client = new net.Socket();
        client.connect(port, host, function () {
            console.log('CONNECTED TO: ' + host + ':' + port);
            client.write(data);
        });
        client.on('data', function (data) {
            console.log('DATA: ' + data);
            callback(data);
        });
        client.on('close', function () {
            console.log('Connection closed');
        });
    };
    return TCPClient;
}());
exports.TCPClient = TCPClient;
//# sourceMappingURL=tcp-client.js.map