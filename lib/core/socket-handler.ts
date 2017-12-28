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
    public buffer: Buffer = Buffer.from("");
    public onDataCallback: (data: Buffer) => void;
    public onCloseCallback: () => void = null;
    private connected: boolean = true;

    public static connect(host: string, port: number, onConnect: (error?: any) => void, onMessage: (socketMessage: SocketMessage) => void): SocketHandler {
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

    public constructor (public socket: Socket, private onMessage: (socketMessage: SocketMessage) => void) {
        let self = this;

        // Set this as instance variable to make it easier to test
        this.onDataCallback = function(data: Buffer) {
            self.handleData(data);
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
     * @param data
     */
    private handleData(data: Buffer): void {
        if (data !== null) {
            this.buffer = Buffer.concat([this.buffer, data]);
        }

        const delimiterIndex = this.buffer.indexOf(Global.MessageDelimiter);

        if (delimiterIndex > -1) {
            const messageIDIndex = delimiterIndex - Global.MessageIDLength;

            let badMessage: boolean = messageIDIndex < 0;

            const message = this.buffer.slice(0, messageIDIndex);
            // Grab the message ID - it precedes the delimiter
            const messageIDString = this.buffer.slice(delimiterIndex - Global.MessageIDLength, delimiterIndex).toString();
            const messageID: number = parseInt(messageIDString);
            if (isNaN(messageID) || (messageID + "").length < 13) {
                badMessage = true;
            }

            if (badMessage) {
                LoggingHelper.error(Logger, "Bad message received: " + this.buffer.toString());
            } else {
                const socketMessage = new SocketMessage(message, messageID);

                LoggingHelper.debug(Logger, "DATA READ " + this.remoteEndPoint() + " ID: " + messageID +  " MSG: "
                    + StringUtil.prettyPrint(socketMessage.messageForLogging()));

                this.onMessage(socketMessage);
            }

            this.buffer = this.buffer.slice(delimiterIndex + Global.MessageDelimiter.length);

            // If we have received more than one packet at a time, handle it recursively
            if (this.buffer.toString().indexOf(Global.MessageDelimiter) !== -1) {
                this.handleData(null);
            }
        }
    }

    public send(socketMessage: SocketMessage) {
        // If the socket was already closed, do not write anything
        if (this.socket === null) {
            LoggingHelper.warn(Logger, "Writing message to closed socket: " + socketMessage.getMessageID());
            return;
        }

        const dataSent = socketMessage.isString() ? socketMessage.asString() : "< Binary Data >";
        LoggingHelper.debug(Logger, "DATA SENT " + this.remoteEndPoint() + " SEQUENCE: " + socketMessage.getMessageID() + " " + StringUtil.prettyPrint(dataSent));

        this.socket.write(socketMessage.getFullMessage(), null);
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

export class SocketMessage {
    private message: Buffer = Buffer.from("");
    public constructor(message: string | Buffer, private sequenceNumber?: number) {
        if (typeof message === "string") {
            this.message = Buffer.concat([this.message, Buffer.from(message)]);
        } else {
            this.message = Buffer.concat([this.message, message]);
        }
    }

    public getMessageID(): number {
        return this.sequenceNumber ? this.sequenceNumber : new Date().getTime();
    }

    public asString(): string {
        return this.message.toString();
    }

    public isString(): boolean {
        return !/[\x00-\x1F]/.test(this.asString());
    }

    public isJSON(): boolean {
        try {
            JSON.parse(this.asString());
            return true;
        } catch (error) {
            return false;
        }
    }

    public asJSON() {
        return JSON.parse(this.asString());
    }

    public messageForLogging(): string {
        return this.isString() ? this.asString() : "< Binary Data>";
    }

    public getMessage() {
        return this.message;
    }

    public getFullMessage() {
        const messageID = this.getMessageID();
        return Buffer.concat([this.message, Buffer.from(messageID.toString()), Buffer.from(Global.MessageDelimiter)]);
    }

    public contains(stringToFind: string) {
        return this.asString().indexOf(stringToFind) > -1;
    }
}