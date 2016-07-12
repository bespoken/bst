/// <reference path="../typings/modules/es6-promise/index.d.ts" />

import * as net from "net";
import {Socket} from "net";
import {Promise} from "es6-promise";
import {Global} from "../core/global";
import {OnMessage} from "../core/socket-handler";
import {SocketHandler} from "../core/socket-handler";
import {WebhookReceivedCallback} from "../server/webhook-manager";
import {WebhookRequest} from "../core/webhook-request";
import {TCPClient} from "./tcp-client";
import {NetworkErrorType} from "../core/global";

/**
 * Handles between the BeSpoke server and the servic running on the local machine
 * Initiates a TCP connection with the server
 */
export class BespokeClient {
    public onWebhookReceived: WebhookReceivedCallback;
    public onError: (errorType: NetworkErrorType, message: string) => void;

    private client: Socket;
    private socketHandler: SocketHandler;

    constructor(public nodeID: string,
                private host: string,
                private port: number,
                private targetPort: number) {}

    public connect(): void {
        let self = this;

        this.client = new net.Socket();
        this.socketHandler = new SocketHandler(this.client, function(data: string) {
            self.onMessage(data);
        });

        // Once connected, send the Node ID
        this.client.connect(this.port, this.host, function() {
            console.log("CLIENT " + self.host + ":" + self.port + " Connected");
           // As soon as we connect, we send our ID
            let messageJSON = {"id": self.nodeID};
            let message = JSON.stringify(messageJSON);

            self.send(message);
        });

        this.onWebhookReceived = function(socket: Socket, request: WebhookRequest) {
            let self = this;
            console.log("CLIENT " + self.nodeID + " onWebhook: " + request.toString());

            let tcpClient = new TCPClient();
            tcpClient.transmit("localhost", self.targetPort, request.toTCP(), function(data: string, error: NetworkErrorType, message: string) {
                if (data != null) {
                    self.socketHandler.send(data);
                } else if (error === NetworkErrorType.CONNECTION_REFUSED) {
                    console.log("CLIENT Connection Refused, Port " + self.targetPort + ". Is your server running?");
                    if (self.onError != null) {
                        self.onError(error, message);
                    }
                }
            });
        };
    }

    public send(message: string) {
        this.socketHandler.send(message);
    }

    public onMessage (message: string) {
        // First message we get back is an ack
        if (message.indexOf("ACK") !== -1) {
            // console.log("Client: ACK RECEIVED");
        } else {
            this.onWebhookReceived(this.client, WebhookRequest.fromString(message));
        }

    }

    public disconnect(): void {
        this.client.end();
    }
}
