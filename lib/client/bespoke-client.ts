import * as net from "net";
import {Socket} from "net";
import {Global} from "../core/global";
import {OnMessage} from "../core/socket-handler";
import {SocketHandler} from "../core/socket-handler";
import {WebhookReceivedCallback} from "../server/webhook-manager";
import {WebhookRequest} from "../core/webhook-request";
import {TCPClient} from "./tcp-client";
import {NetworkErrorType} from "../core/global";
import {LoggingHelper} from "../core/logging-helper";

let Logger = "BST-CLIENT";
let KeepAlivePeriod = 5000;
/**
 * Handles between the bespoken server and the service running on the local machine
 * Initiates a TCP connection with the server
 */
export class BespokeClient {
    public onConnect: () => void = null;
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
            LoggingHelper.info(Logger, "Connected - " + self.host + ":" + self.port);
            // As soon as we connect, we send our ID
            let messageJSON = {"id": self.nodeID};
            let message = JSON.stringify(messageJSON);

            self.send(message);
            if (self.onConnect !== null) {
                self.onConnect();
            }
        });

        this.onWebhookReceived = function(socket: Socket, request: WebhookRequest) {
            let self = this;
            LoggingHelper.info(Logger, "OnWebhook: " + request.toString());

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

        this.keepAliveTimer();
    }

    /**
     * Pings the server on a 5-second period to keep the connection alive
     */
    private keepAliveTimer (): void {
        let self = this;
        setTimeout(function () {
            self.keepAlive();
        }, KeepAlivePeriod);
    }

    /**
     * Pings the server with a keep-alive message
     */
    public keepAlive(): void {
        LoggingHelper.debug(Logger, "KeepAlive PING");
        this.send(Global.KeepAliveMessage);
        this.keepAliveTimer();
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
