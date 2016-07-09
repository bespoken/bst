/// <reference path="../typings/globals/node/index.d.ts" />

import * as net from "net";
import EventEmitter = NodeJS.EventEmitter;

export class TCPClient {
    public constructor () {}

    public transmit(host: string, port: number, data: string, callback: (response: string) => void) {
        var client = new net.Socket();

        client.connect(port, host, function (info:any) {
            console.log("Testasdfasdf");
            // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
            client.write(data);
        });


        // Add a 'data' event handler for the client socket
        // data is what the server sent to this socket
        client.on('data', function(data: string) {
            callback(data);
        });

        // Add a 'close' event handler for the client socket
        client.on('close', function() {
            console.log('Connection closed');
        });
    }

    public close(): void {

    }

}
