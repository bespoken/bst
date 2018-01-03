import {Global} from "../core/global";
import {SocketHandler, SocketMessage} from "../core/socket-handler";
import {WebhookRequest} from "../core/webhook-request";
import {TCPClient} from "./tcp-client";
import {NetworkErrorType} from "../core/global";
import {LoggingHelper} from "../core/logging-helper";
import {KeepAlive} from "./keep-alive";
import {StringUtil} from "../core/string-util";
import {HTTPBuffer} from "../core/http-buffer";
const chalk =  require("chalk");

const Logger = "BST-CLIENT";

/**
 * Handles between the bespoken server and the service running on the local machine
 * Initiates a TCP connection with the server
 */
export class BespokeClient {
    public onConnect: (error?: any) => void = null;
    public onReconnect: (error?: any) => void = null;

    public onError: (errorType: NetworkErrorType, message: string) => void;

    public static RECONNECT_MAX_RETRIES: number = 3;
    private keepAlive: KeepAlive;
    private socketHandler: SocketHandler;
    private shuttingDown: boolean = false;
    private reconnectRetries: number = 0;

    constructor(public nodeID: string,
                private host: string,
                private port: number,
                private targetDomain: string,
                private targetPort: number,
                private secretKey?: string) {}

    public attemptConnection(): void {
        const self = this;
        if (this.socketHandler) {
            this.socketHandler.disconnect();
        }

        if (this.keepAlive) {
            this.keepAlive.stop();
        }

        this.socketHandler = SocketHandler.connect(this.host, this.port,
            function(error: any) {
                self.connected(error);
            },

            function(socketMessage: SocketMessage) {
                self.messageReceived(socketMessage);
            }
        );



        // If the socket gets closed, probably server-side issue
        // We do not do anything in this case other than
        this.socketHandler.onCloseCallback = function() {
            if (!self.shuttingDown) {
                LoggingHelper.error(Logger, "Socket closed by bst server: " + self.host + ":" + self.port);
            }

            if (self.reconnectRetries < BespokeClient.RECONNECT_MAX_RETRIES) {
                self.reconnectRetries++;
                LoggingHelper.error(Logger, "Attempting to reconnect in " + self.reconnectRetries + " seconds");
                setTimeout(function () {
                    self.attemptConnection();
                }, self.reconnectRetries * 1000);
            } else {
                LoggingHelper.error(Logger, "Check your network settings - and try connecting again.");
                LoggingHelper.error(Logger, "If the issue persists, contact us at Bespoken:");
                LoggingHelper.error(Logger, "\thttps://gitter.im/bespoken/bst");
                self.shutdown();
            }
        };
    }

    public connect(onConnect?: (error?: any) => void): void {
        if (onConnect !== undefined && onConnect !== null) {
            this.onConnect = onConnect;
        }

        this.attemptConnection();
    }

    // Factory method for testability
    protected newKeepAlive(handler: SocketHandler): KeepAlive {
        return new KeepAlive(handler);
    }

    private onWebhookReceived(request: WebhookRequest): void {
        const self = this;

        if (this.secretKey) {
            let secretKeyValidated: boolean = false;

            if (request.headers && request.headers["bespoken-key"] === this.secretKey) {
                secretKeyValidated = true;
            }

            if (request.queryParameters && request.queryParameters["bespoken-key"] === this.secretKey) {
                secretKeyValidated = true;
            }

            if (!secretKeyValidated) {
                const errorMessage = "Unauthorized request";
                this.socketHandler.send(new SocketMessage(HTTPBuffer.errorResponse(errorMessage).raw(), request.id()));
                return;
            }
        }

        // Print out the contents of the request body to the console
        LoggingHelper.info(Logger, "RequestReceived: " + request.toString() + " ID: " + request.id());

        const bodyToPrint = request.isJSON() ? StringUtil.prettyPrintJSON(request.body) : "< Binary data >";

        LoggingHelper.verbose(Logger, "Payload:\n" + chalk.hex(LoggingHelper.REQUEST_COLOR)(bodyToPrint));

        const tcpClient = new TCPClient(request.id() + "");
        const httpBuffer = new HTTPBuffer();
        tcpClient.transmit(self.targetDomain, self.targetPort, request.requestWithoutBespokenData(), function(data: Buffer, error: NetworkErrorType, message: string) {

            if (data != null) {
                // Grab the body of the response payload
                httpBuffer.append(data);

                // Don't send the data until we have it all
                if (httpBuffer.complete()) {
                    LoggingHelper.info(Logger, "ResponseReceived ID: " + request.id());
                    let payload: string = null;
                    const bodyToString = httpBuffer.body().toString();
                    if (httpBuffer.isJSON()) {
                        payload = StringUtil.prettyPrintJSON(bodyToString);
                    } else {
                        // Check for non printable characters
                        payload = /[\x00-\x1F]/.test(bodyToString) ? "< Binary data >" : bodyToString;
                    }

                    // Errors managed by us
                    if (payload.indexOf("Unhandle exception") !== -1 || payload.indexOf("Error: ") !== -1) {
                        LoggingHelper.verbose(Logger, "Payload:\n" + chalk.red(payload));
                    } else {
                        LoggingHelper.verbose(Logger, "Payload:\n" + chalk.cyan(payload));
                    }
                    self.socketHandler.send(new SocketMessage(httpBuffer.raw(), request.id()));
                }
            } else if (error !== null && error !== undefined) {
                if (error === NetworkErrorType.CONNECTION_REFUSED) {
                    LoggingHelper.error(Logger, chalk.red("CLIENT Connection Refused, Port " + self.targetPort + ". Is your server running?"));
                }

                const errorMessage = "BST Proxy - Local Forwarding Error\n" + message;
                self.socketHandler.send(new SocketMessage(HTTPBuffer.errorResponse(errorMessage).raw(), request.id()));

                if (self.onError != null) {
                    self.onError(error, message);
                }
            }
        });
    }

    private connected(error?: any): void {
        const self = this;

        if (error) {
            LoggingHelper.error(Logger, "Unable to connect to: " + this.host + ":" + this.port);
            if (this.reconnectRetries < BespokeClient.RECONNECT_MAX_RETRIES) {
                this.reconnectRetries++;
                LoggingHelper.error(Logger, "Attempting to reconnect in " + this.reconnectRetries + " seconds");
                setTimeout(function () {
                    self.attemptConnection();
                }, this.reconnectRetries * 1000);
                if (this.onReconnect) {
                    this.onReconnect(error);
                }
            } else {
                this.shutdown();
                if (this.onConnect) {
                    this.onConnect(error);
                }
            }
        } else {
            this.reconnectRetries = 0;
            LoggingHelper.info(Logger, "Connected - " + this.host + ":" + this.port);
            // As soon as we connect, we send our ID
            const messageJSON = {"id": this.nodeID};
            const message = JSON.stringify(messageJSON);

            this.socketHandler.send(new SocketMessage(message));
            if (this.onConnect !== undefined  && this.onConnect !== null) {
                this.onConnect();
            }

            this.keepAlive = this.newKeepAlive(this.socketHandler);
            this.keepAlive.start(function () {
                LoggingHelper.error(Logger, "Socket not communicating with bst server: " + self.socketHandler.remoteEndPoint());
                LoggingHelper.error(Logger, "Check your network settings - and maybe try connecting again.");
                LoggingHelper.error(Logger, "If the issue persists, contact us at Bespoken:");
                LoggingHelper.error(Logger, "\thttps://gitter.im/bespoken/bst");
            });
        }
    }

    private messageReceived (socketMessage: SocketMessage) {
        // First message we get back is an ack
        if (socketMessage.contains("ACK")) {

        } else if (socketMessage.contains(Global.KeepAliveMessage)) {
            this.keepAlive.received();
        } else {
            this.onWebhookReceived(WebhookRequest.fromBuffer(this.socketHandler.socket, socketMessage.getMessage(), socketMessage.getMessageID()));
        }
    }

    public shutdown(callback?: () => void): void {
        LoggingHelper.info(Logger, "Shutting down proxy");

        // We track that we are shutting down because a "close" event is sent to the main socket
        //  We normally print info on close, but not in this case
        this.shuttingDown = true;

        if (this.keepAlive) {
            this.keepAlive.stop();
        }

        // Do not disconnect until keep alive has stopped
        //  Otherwise it may try to push data through the socket
        this.reconnectRetries = BespokeClient.RECONNECT_MAX_RETRIES;

        this.socketHandler.disconnect();

        if (callback !== undefined && callback !== null) {
            callback();
        }
    }
}
