import {Global} from "./global";
import {Socket} from "net";
import {StringUtil} from "./string-util";
import {BufferUtil} from "./buffer-util";
import * as winston from "winston";
import {LoggingHelper} from "./logging-helper";

export interface OnMessage {
    (message: string): void;
}

export interface OnClose {
    (): void;
}

/**
 * Manages the low-level socket communications
 */
export class SocketHandler {
    public message: string = null;
    public onDataCallback: (data: Buffer) => void;
    public onCloseCallback: OnClose;

    public constructor (private socket: Socket, private onMessage: OnMessage) {
        let self = this;
        this.resetBuffer();

        // Set this as instance variable to make it easier to test
        this.onDataCallback = function(data: Buffer) {
            LoggingHelper.debug("SOCKET", "DATA READ " + self.socket.localAddress + ":" + self.socket.localPort + " " + BufferUtil.prettyPrint(data));

            let dataString: string = data.toString();
            if (dataString.indexOf(Global.MessageDelimiter) === -1) {
                self.message += dataString;
            } else {
                self.handleData(dataString);
            }
        };

        // Add a 'data' event handler to this instance of socket
        this.socket.on("data", this.onDataCallback);

        // Do some basic error-handling - needs to be improved
        this.socket.on("error", function (e: any) {
            console.log("SocketError: " + e.code + " Message: " + e.message);
        });

        this.socket.on("close", function() {
            if (self.onCloseCallback() != null) {
                self.onCloseCallback();
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
        winston.debug("DATA SENT " + this.socket.localAddress + ":" + this.socket.localPort + " " + StringUtil.prettyPrint(message));

        // Use TOKEN as message delimiter
        message = message + Global.MessageDelimiter;
        this.socket.write(message, null);
    }

    public call(message: string, onReply: OnMessage) {
        this.onMessage = onReply;
        this.send(message);
    }

    public remoteAddress (): string {
        return this.socket.remoteAddress;
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

