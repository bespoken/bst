"use strict";
const global_1 = require("./../service/global");
const string_util_1 = require("./string-util");
const buffer_util_1 = require("./buffer-util");
class SocketHandler {
    constructor(socket, onMessage) {
        this.socket = socket;
        this.onMessage = onMessage;
        this.message = null;
        let self = this;
        this.resetBuffer();
        this.onDataCallback = function (data) {
            console.log('DATA READ ' + self.socket.localAddress + ':' + self.socket.localPort + ' ' + buffer_util_1.BufferUtil.prettyPrint(data));
            let dataString = data.toString();
            if (dataString.indexOf(global_1.Global.MessageDelimiter) == -1) {
                self.message += dataString;
            }
            else {
                self.handleData(dataString);
            }
        };
        this.socket.on('data', this.onDataCallback);
    }
    handleData(dataString) {
        let delimiterIndex = dataString.indexOf(global_1.Global.MessageDelimiter);
        if (delimiterIndex == -1) {
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
        let self = this;
        message = message + global_1.Global.MessageDelimiter;
        this.socket.write(message, function () {
            console.log("DATA SENT " + self.socket.localAddress + ":" + self.socket.localPort + " " + string_util_1.StringUtil.prettyPrint(message));
        });
    }
    call(message, onReply) {
        this.onMessage = onReply;
        this.send(message);
    }
    remoteAddress() {
        return this.socket.remoteAddress;
    }
}
exports.SocketHandler = SocketHandler;
//# sourceMappingURL=socket-handler.js.map