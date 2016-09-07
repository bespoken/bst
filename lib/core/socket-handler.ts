import {Global} from "./global";
import {Socket} from "net";
import {StringUtil} from "./string-util";
import {LoggingHelper} from "./logging-helper";

import * as net from "net";

let Logger = "SOCKET";

/**
 * Manages the low-level socket communications
 */
export class SocketHandler {
    public buffer: string = "";
    public onDataCallback: (data: Buffer) => void;
    public onCloseCallback: () => void = null;
    private connected: boolean = true;

    public static connect(host: string, port: number, onConnect: (error?: any) => void, onMessage: (message: string, messageID?: number) => void): SocketHandler {
        let socket = new net.Socket();
        let handler = new SocketHandler(socket, onMessage);
        handler.connected = false;

        socket.connect(port, host, function () {
            handler.connected = true;
            onConnect();
        });

        socket.on("error", function (error: any) {
            if (!handler.connected) {
                onConnect(error);
            }
        });
        return handler;
    }

    public constructor (public socket: Socket, private onMessage: (message: string, sequenceNumber?: number) => void) {
        let self = this;

        // Set this as instance variable to make it easier to test
        this.onDataCallback = function(data: Buffer) {
            self.handleData(data.toString());
        };

        // Add a 'data' event handler to this instance of socket
        this.socket.on("data", this.onDataCallback);

        // Do some basic error-handling - needs to be improved
        this.socket.on("error", function (e: any) {
            if (self.connected) {
                LoggingHelper.debug(Logger, "SocketError From: " + self.remoteEndPoint() + " Error: " + e.code + " Message: " + e.message);
            }
        });

        this.socket.on("close", function() {
            // Don't worry about this unless connected
            // This gets called on connection failures, which is silly
            if (self.connected) {
                if (self.onCloseCallback != null) {
                    self.onCloseCallback();
                } else {
                    LoggingHelper.debug(Logger, "Socket closed");
                }
            }
        });
    }

    /**
     * Handles incoming data
     * Finds the delimiter and sends callbacks, potentially multiple times as multiple messages can be received at once
     * @param dataString
     */
    private handleData(dataString: string): void {
        if (dataString !== null) {
            this.buffer += dataString;
        }

        let delimiterIndex = this.buffer.indexOf(Global.MessageDelimiter);
        if (delimiterIndex > -1) {
            let messageIDIndex = delimiterIndex - Global.MessageIDLength;
            let badMessage = false;
            if (messageIDIndex < 0) {
                badMessage = true;
            }

            let message = this.buffer.substring(0, messageIDIndex);
            // Grab the message ID - it precedes the delimiter
            let messageIDString = this.buffer.substring(delimiterIndex - Global.MessageIDLength, delimiterIndex);
            let messageID: number = parseInt(messageIDString);
            if (isNaN(messageID) || (messageID + "").length < 13) {
                badMessage = true;
            }

            if (badMessage) {
                LoggingHelper.error(Logger, "Bad message received: " + dataString);
            } else {
                LoggingHelper.debug(Logger, "DATA READ " + this.remoteEndPoint() + " ID: " + messageID +  " MSG: " + StringUtil.prettyPrint(message));
                this.onMessage(message, messageID);
            }

            this.buffer = this.buffer.slice(delimiterIndex + Global.MessageDelimiter.length);

            // If we have received more than one packet at a time, handle it recursively
            if (this.buffer.indexOf(Global.MessageDelimiter) !== -1) {
                this.handleData(null);
            }
        }
    }

    public send(message: string, messageID?: number) {
        // If the socket was already closed, do not write anything
        if (this.socket === null) {
            LoggingHelper.warn(Logger, "Writing message to closed socket: " + messageID);
            return;
        }

        LoggingHelper.debug(Logger, "DATA SENT " + this.remoteEndPoint() + " SEQUENCE: " + messageID + " " + StringUtil.prettyPrint(message));

        // If no message ID is specified, just grab a timestamp
        if (messageID === undefined || messageID === null) {
            messageID = new Date().getTime();
        }
        // Use TOKEN as message delimiter
        message = message + messageID + Global.MessageDelimiter;
        this.socket.write(message, null);
    }

    public remoteAddress (): string {
        return this.socket.remoteAddress;
    }

    public remoteEndPoint (): string {
        if (this.socket === null) {
            return "";
        }
        return this.socket.remoteAddress + ":" + this.socket.remotePort;
    }

    public disconnect (): void {
        if (this.isOpen()) {
            this.socket.end();
            this.socket = null;
        }
    }

    public isOpen (): boolean {
        return this.socket != null;
    }
}

