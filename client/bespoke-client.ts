/// <reference path="../typings/modules/es6-promise/index.d.ts" />

import * as net from 'net';
import {Socket} from 'net';
import {Promise} from 'es6-promise';
import {Global} from "../service/global";
import {OnMessage} from "../service/socket-handler";
import {SocketHandler} from "../service/socket-handler";
import {WebhookReceivedCallback} from "../service/webhook-manager";
import {WebhookRequest} from "../service/webhook-request";
import {TCPClient} from "./tcp-client";

export class BespokeClient {
    public onWebhookReceived: WebhookReceivedCallback;

    private client: Socket;
    private socketHandler: SocketHandler;

    constructor(public nodeID: string,
                private host:string,
                private port:number,
                private targetPort: number) {}

    public connect():void {
        let self = this;

        this.client = new net.Socket();
        this.socketHandler = new SocketHandler(this.client, function(data: string) {
            self.onMessage(data);
        });

        //Once connected, send the Node ID
        this.client.connect(this.port, this.host, function() {
           //As soon as we connect, we send our ID
            let messageJSON = {"id": self.nodeID};
            let message = JSON.stringify(messageJSON);

            self.send(message);
        });

        this.onWebhookReceived = function(socket: Socket, request: WebhookRequest) {
            let tcpClient = new TCPClient();
            tcpClient.transmit("localhost", self.targetPort, request.toTCP(), function(data: string) {
                self.socketHandler.send(data);
            });
        }
    }

    public send(message: string) {
        this.socketHandler.send(message);
    }

    public onMessage (message: string) {
        if (message.indexOf("ACK") != -1) {
            //console.log("Client: ACK RECEIVED");
        } else {
            this.onWebhookReceived(this.client, WebhookRequest.fromString(message));
        }

    }

    public disconnect():void {
        this.client.end();
    }
}
