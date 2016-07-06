/// <reference path="../typings/modules/node-uuid/index.d.ts" />

import * as uuid from 'node-uuid';
import {Socket} from "net";
import {NodeManager} from "./node-manager";
import {Global} from "./global";
import {SocketHandler} from "./socket-handler";
import {WebhookRequest} from "./webhook-request";

export class Node {
    private activeRequest: WebhookRequest;

    constructor(public id: string, public socketHandler: SocketHandler) {}

    public forward(sourceSocket: Socket, request: WebhookRequest) {
        console.log("Node Sending: " + request.toTCP());
        this.socketHandler.call(request.toTCP(), function(data: string) {
            console.log("OnReply: " + data);
            sourceSocket.write(data, function() {
                //sourceSocket.end();
            });
        });

        this.activeRequest = request;
    }

    public hasActiveRequest(): boolean {
        return this.activeRequest != null;
    }

    public webhookRequest(): WebhookRequest {
        return this.activeRequest;
    }
}