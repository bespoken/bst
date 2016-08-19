/// <reference path="../../typings/index.d.ts" />

import * as net from "net";
import EventEmitter = NodeJS.EventEmitter;
import {NetworkErrorType} from "../core/global";
import {LoggingHelper} from "../core/logging-helper";

let Logger = "TCP-CLIENT";

export interface TCPClientCallback {
    (data: string, errorType: NetworkErrorType, errorMessage: string): void;
}

export class TCPClient {


    public constructor () {}

    public transmit(host: string, port: number, data: string, callback: TCPClientCallback) {
        let client = new net.Socket();
        LoggingHelper.info(Logger, "Forwarding " + host + ":" + port);

        client.on("error", function (e: any) {
            if (e.code ===  "ECONNREFUSED") {
                callback(null, NetworkErrorType.CONNECTION_REFUSED, e.message);
            } else {
                callback(null, NetworkErrorType.OTHER, e.message);
            }
        });

        client.connect(port, host, function () {
            // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
            client.write(data);
        });


        // Add a 'data' event handler for the client socket
        // data is what the server sent to this socket
        client.on("data", function(data: Buffer) {
            callback(data.toString(), null, null);
        });

        // Add a 'close' event handler for the client socket
        client.on("close", function() {
            LoggingHelper.debug(Logger, "Connection closed");
        });
    }

    public close(): void {

    }

}
