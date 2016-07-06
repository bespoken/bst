/// <reference path="../typings/modules/es6-promise/index.d.ts" />

import * as net from 'net';
import {Socket} from 'net';
import {Promise} from 'es6-promise';
import {Global} from "../service/global";
import {OnMessage} from "../service/socket-handler";
import {SocketHandler} from "../service/socket-handler";
import {WebhookReceivedCallback} from "../service/webhook-manager";
import {WebhookRequest} from "../service/webhook-request";

export class BespokeClient {
    public onWebhookReceived: WebhookReceivedCallback;

    private client: Socket;
    private socketHandler: SocketHandler;

    constructor(public nodeID: string,
                private host:string,
                private port:number) {}

    public connect():void {
        let self = this;

        this.client = new net.Socket();
        this.socketHandler = new SocketHandler(this.client, function(data: string) {
            console.log("ClientReceived: " + data);
            self.onMessage(data);
        });

        //Use a promise to so that other things wait on the connection
        this.client.connect(this.port, this.host, function() {
           //As soon as we connect, we send our ID
            let messageJSON = {"id": self.nodeID};
            let message = JSON.stringify(messageJSON);

            self.send(message);
        });
    }

    public send(message: string) {
        this.socketHandler.send(message);
    }

    public onMessage (message: string) {
        if (message.indexOf("ACK") != -1) {
            console.log("Client: ACK RECEIVED");
        } else {
            this.onWebhookReceived(WebhookRequest.fromString(message));
        }

    }

    public disconnect():void {
        this.client.end();
    }
}