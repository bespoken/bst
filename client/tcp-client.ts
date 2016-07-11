/// <reference path="../typings/globals/node/index.d.ts" />

import * as net from "net";
import EventEmitter = NodeJS.EventEmitter;
import {NetworkErrorType} from "../service/global";

export interface TCPClientCallback {
    (data: string, errorType: NetworkErrorType, errorMessage: string): void;
}

export class TCPClient {
    public constructor () {}

    public transmit(host: string, port: number, data: string, callback: TCPClientCallback) {
        let client = new net.Socket();
        console.log("TCP-CLIENT " + host + ":" + port + " Connected");

        client.setTimeout(1000, function (message: string) {
            console.log("TCP-CLIENT " + host + ":" + port + " TimedOut");
            callback(null, NetworkErrorType.TIME_OUT, message);
        });

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
        client.on("data", function(data: string) {
            callback(data, null, null);
        });

        // Add a 'close' event handler for the client socket
        client.on("close", function() {
            console.log("Connection closed");
        });
    }

    public close(): void {

    }

}
