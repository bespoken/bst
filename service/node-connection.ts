/// <reference path="../typings/modules/node-uuid/index.d.ts" />

import * as uuid from 'node-uuid';
import {Socket} from "net";
import {NodeManager} from "./node-manager";

export class NodeConnection {
    public uuid:string;

    constructor(private nodeManager:NodeManager, private socket:Socket) {
        let self = this;
        this.uuid = uuid.v4();

        // Add a 'data' event handler to this instance of socket
        this.socket.on('data', function(data) {
            console.log('DATA ' + self.socket.remoteAddress + ': ' + data);
            // Write the data back to the socket, the client will receive it as data from the server
            self.socket.write('You said "' + data + '"');

            self.nodeManager.onReceive(self, data);
        });

        // Add a 'close' event handler to this instance of socket
        socket.on('close', function() {
            self.nodeManager.onClose(self);
        });
    }

    public remoteAddress():string {
        return this.socket.remoteAddress;
    }
}