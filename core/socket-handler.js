"use strict";
const global_1 = require("./global");
const string_util_1 = require("./string-util");
const buffer_util_1 = require("./buffer-util");
const winston = require("winston");
class SocketHandler {
    constructor(socket, onMessage) {
        this.socket = socket;
        this.onMessage = onMessage;
        this.message = null;
        let self = this;
        this.resetBuffer();
        this.onDataCallback = function (data) {
            winston.debug("DATA READ " + self.socket.localAddress + ":" + self.socket.localPort + " " + buffer_util_1.BufferUtil.prettyPrint(data));
            let dataString = data.toString();
            if (dataString.indexOf(global_1.Global.MessageDelimiter) === -1) {
                self.message += dataString;
            }
            else {
                self.handleData(dataString);
            }
        };
        this.socket.on("data", this.onDataCallback);
    }
    handleData(dataString) {
        let delimiterIndex = dataString.indexOf(global_1.Global.MessageDelimiter);
        if (delimiterIndex === -1) {
            this.message += dataString;
        }
        else {
            this.message += dataString.substr(0, delimiterIndex);
            this.onMessage(this.message);
            this.resetBuffer();
            if (dataString.length > (dataString.indexOf(global_1.Global.MessageDelimiter) + global_1.Global.MessageDelimiter.length)) {
                dataString = dataString.substr(dataString.indexOf(global_1.Global.MessageDelimiter) + global_1.Global.MessageDelimiter.length);
                this.handleData(dataString);
            }
        }
    }
    resetBuffer() {
        this.message = "";
    }
    send(message) {
        winston.debug("DATA SENT " + this.socket.localAddress + ":" + this.socket.localPort + " " + string_util_1.StringUtil.prettyPrint(message));
        message = message + global_1.Global.MessageDelimiter;
        this.socket.write(message, null);
    }
    call(message, onReply) {
        this.onMessage = onReply;
        this.send(message);
    }
    remoteAddress() {
        return this.socket.remoteAddress;
    }
    disconnect() {
        if (this.isOpen()) {
            this.socket.end();
            this.socket = null;
        }
    }
    isOpen() {
        return this.socket != null;
    }
}
exports.SocketHandler = SocketHandler;
//# sourceMappingURL=socket-handler.js.map