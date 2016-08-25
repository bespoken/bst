import * as net from "net";
import {Socket} from "net";
import {Global} from "../core/global";
import {SocketHandler} from "../core/socket-handler";
import {WebhookReceivedCallback} from "../server/webhook-manager";
import {WebhookRequest} from "../core/webhook-request";
import {TCPClient} from "./tcp-client";
import {NetworkErrorType} from "../core/global";
import {LoggingHelper} from "../core/logging-helper";
import {KeepAlive} from "./keep-alive";

const Logger = "BST-CLIENT";

/**
 * Handles between the bespoken server and the service running on the local machine
 * Initiates a TCP connection with the server
 */
export class BespokeClient {
    public onConnect: () => void = null;
    public onWebhookReceived: WebhookReceivedCallback;
    public onError: (errorType: NetworkErrorType, message: string) => void;

    private keepAlive: KeepAlive;
    private socketHandler: SocketHandler;

    constructor(public nodeID: string,
                private host: string,
                private port: number,
                private targetPort: number) {}

    public connect(): void {
        let self = this;

        this.socketHandler = SocketHandler.connect(this.host, this.port,
            function(error: any) {
                self.connected(error);
            },
            function(data: string) {
                self.messageReceived(data);
            }
        );

        // If the socket gets closed, probably server-side issue
        // We do not do anything in this case other than
        this.socketHandler.onCloseCallback = function() {
            LoggingHelper.error(Logger, "Socket closed by bst server: " + self.host + ":" + self.port);
            LoggingHelper.error(Logger, "Check your network settings - and try connecting again.");
            LoggingHelper.error(Logger, "If the issue persists, contact us at Bespoken:");
            LoggingHelper.error(Logger, "\thttps://gitter.im/bespoken/bst");
            self.shutdown();
        };

        this.onWebhookReceived = function(socket: Socket, request: WebhookRequest) {
            let self = this;
            LoggingHelper.info(Logger, "OnWebhook: " + request.toString());

            let tcpClient = new TCPClient();
            tcpClient.transmit("localhost", self.targetPort, request.toTCP(), function(data: string, error: NetworkErrorType, message: string) {
                if (data != null) {
                    self.socketHandler.send(data);
                } else if (error === NetworkErrorType.CONNECTION_REFUSED) {
                    LoggingHelper.error(Logger, "CLIENT Connection Refused, Port " + self.targetPort + ". Is your server running?");
                    if (self.onError != null) {
                        self.onError(error, message);
                    }
                }
            });
        };

        this.keepAlive = new KeepAlive(this.socketHandler);
        this.keepAlive.start(function () {
            LoggingHelper.error(Logger, "Socket not communicating with bst server: " + self.socketHandler.remoteEndPoint());
            LoggingHelper.error(Logger, "Check your network settings - and maybe try connecting again.");
            LoggingHelper.error(Logger, "If the issue persists, contact us at Bespoken:");
            LoggingHelper.error(Logger, "\thttps://gitter.im/bespoken/bst");
        });
    }

    public send(message: string) {
        this.socketHandler.send(message);
    }

    private connected(error?: any): void {
        if (error !== undefined && error !== null) {
            LoggingHelper.error(Logger, "Unable to connect to: " + this.host + ":" + this.port);
            this.shutdown();

        } else {
            LoggingHelper.info(Logger, "Connected - " + this.host + ":" + this.port);
            // As soon as we connect, we send our ID
            let messageJSON = {"id": this.nodeID};
            let message = JSON.stringify(messageJSON);

            this.send(message);
            if (this.onConnect !== null) {
                this.onConnect();
            }
        }
    }

    private messageReceived (message: string) {
        // First message we get back is an ack
        if (message.indexOf("ACK") !== -1) {
            // console.log("Client: ACK RECEIVED");
        } else if (message.indexOf(Global.KeepAliveMessage) !== -1) {
            this.keepAlive.received();
        } else {
            this.onWebhookReceived(this.socketHandler.socket, WebhookRequest.fromString(message));
        }
    }

    public shutdown(): void {
        LoggingHelper.info(Logger, "Shutting down proxy");
        this.keepAlive.stop();
        this.socketHandler.disconnect();
    }
}
