"use strict";
const net = require("net");
const global_1 = require("../core/global");
const logging_helper_1 = require("../core/logging-helper");
let Logger = "TCP-CLIENT";
class TCPClient {
    constructor() {
    }
    transmit(host, port, data, callback) {
        let client = new net.Socket();
        logging_helper_1.LoggingHelper.info(Logger, host + ":" + port + " Connected");
        client.on("error", function (e) {
            if (e.code === "ECONNREFUSED") {
                callback(null, global_1.NetworkErrorType.CONNECTION_REFUSED, e.message);
            }
            else {
                callback(null, global_1.NetworkErrorType.OTHER, e.message);
            }
        });
        client.connect(port, host, function () {
            client.write(data);
        });
        client.on("data", function (data) {
            callback(data.toString(), null, null);
        });
        client.on("close", function () {
            logging_helper_1.LoggingHelper.info(Logger, "Connection closed");
        });
    }
    close() {
    }
}
exports.TCPClient = TCPClient;
//# sourceMappingURL=tcp-client.js.map