import {Global} from "./global";
import {Socket} from "net";
import {StringUtil} from "./string-util";
import {BufferUtil} from "./buffer-util";
import {LoggingHelper} from "./logging-helper";

import * as net from "net";

let Logger = "SOCKET";

/**
 * Manages the low-level socket communications
 */
export class SocketHandler {
    public message: string = null;
    public onDataCallback: (data: Buffer) => void;
    public onCloseCallback: () => void = null;
    private onConnect: (error?: any) => void;
    private connected: boolean = false;

    public static connect(host: string, port: number, onConnect: (error?: any) => void, onMessage: (message: string) => void): SocketHandler {
        let socket = new net.Socket();
        let handler = new SocketHandler(socket, onMessage);
        handler.onConnect = onConnect;
        socket.connect(port, host, function () {
            this.connected = true;
            handler.onConnect();
        });
        return handler;
    }

    public constructor (public socket: Socket, private onMessage: (message: string) => void) {
        let self = this;
        this.resetBuffer();

        // Set this as instance variable to make it easier to test
        this.onDataCallback = function(data: Buffer) {
            self.handleData(data.toString());
        };

        // Add a 'data' event handler to this instance of socket
        this.socket.on("data", this.onDataCallback);

        // Do some basic error-handling - needs to be improved
        this.socket.on("error", function (e: any) {
            if (e.code === "ECONNREFUSED") {
                // Could not connect
                self.onConnect(e);
            } else {
                LoggingHelper.debug(Logger, "SocketError From: " + self.remoteEndPoint() + " Error: " + e.code + " Message: " + e.message);
            }
        });

        this.socket.on("close", function() {
            // Don't worry about this unless connected
            // This gets called on connection failures, which is silly
            if (this.connected) {
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
        let delimiterIndex = dataString.indexOf(Global.MessageDelimiter);
        if (delimiterIndex === -1) {
            this.message += dataString;
        } else {
            this.message += dataString.substr(0, delimiterIndex);
            LoggingHelper.debug(Logger, "DATA READ " + this.remoteEndPoint() + " " + StringUtil.prettyPrint(this.message));

            this.onMessage(this.message);
            this.resetBuffer();

            // If we have received more than one packet at a time, handle it recursively
            if (dataString.length > (dataString.indexOf(Global.MessageDelimiter) + Global.MessageDelimiter.length)) {
                dataString = dataString.substr(dataString.indexOf(Global.MessageDelimiter) + Global.MessageDelimiter.length);
                this.handleData(dataString);
            }
        }

    }

    private resetBuffer(): void {
        this.message = "";
    }

    public send(message: string) {
        LoggingHelper.debug(Logger, "DATA SENT " + this.remoteEndPoint() + " " + StringUtil.prettyPrint(message));

        // Use TOKEN as message delimiter
        message = message + Global.MessageDelimiter;
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

