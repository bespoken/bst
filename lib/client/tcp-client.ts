/// <reference path="../../typings/index.d.ts" />

import * as net from "net";
import {NetworkErrorType} from "../core/global";
import {LoggingHelper} from "../core/logging-helper";

let Logger = "TCP-CLIENT";

export interface TCPClientCallback {
    (data: Buffer, errorType: NetworkErrorType, errorMessage: string): void;
}

export class TCPClient {
    public onCloseCallback: () => void;
    public constructor (public id: string) {}

    public transmit(host: string, port: number, data: string, callback: TCPClientCallback) {
        let self = this;
        let client = new net.Socket();
        LoggingHelper.info(Logger, "Forwarding " + host + ":" + port);

        client.on("error", function (e: any) {
            console.log("TCPClient Error: " + e.message);
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
            callback(data, null, null);
        });

        // Add a 'close' event handler for the client socket
        client.on("close", function(had_error: boolean) {
            LoggingHelper.debug(Logger, "Connection closed ID: " + self.id + " HadError: " + had_error);
            if (self.onCloseCallback !== undefined && self.onCloseCallback !== null) {
                self.onCloseCallback();
            }
        });
    }

    public close(): void {

    }

}
