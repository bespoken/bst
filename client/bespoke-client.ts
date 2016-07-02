/// <reference path="../typings/modules/es6-promise/index.d.ts" />

import * as net from 'net';
import {Socket} from 'net';
import {Promise} from 'es6-promise';
import {Global} from "../service/global";
import {OnMessage} from "../service/socket-handler";
import {SocketHandler} from "../service/socket-handler";

export class BespokeClient {
    private client: Socket;
    private socketHandler: SocketHandler;

    constructor(public nodeID: string,
                private host:string,
                private port:number) {}

    public connect():void {
        let self = this;

        this.client = new net.Socket();
        this.socketHandler = new SocketHandler(this.client, null);

        //Use a promise to so that other things wait on the connection
        this.client.connect(this.port, this.host, function() {
           //As soon as we connect, we send our ID
            let messageJSON = {"id": self.nodeID};
            let message = JSON.stringify(messageJSON);

            self.send(message, function(replyMessage: string) {
                console.log("ACK: " + replyMessage);
            });
        });
    }

    public send(message: string, onMessage: OnMessage) {
        this.socketHandler.send(message, onMessage);
    }

    public disconnect():void {
        this.client.end();
    }
}