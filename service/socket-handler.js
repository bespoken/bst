"use strict";
const global_1 = require("./global");
class SocketHandler {
    constructor(socket, onMessage) {
        this.socket = socket;
        this.onMessage = onMessage;
        this.message = null;
        let self = this;
        this.resetBuffer();
        this.socket.on('data', function (data) {
            console.log('DATA READ ' + self.socket.remoteAddress + ': ' + data);
            let dataString = data.toString();
            if (dataString.indexOf(global_1.Global.MessageDelimiter) == -1) {
                self.message += dataString;
            }
            else {
                self.message += dataString.substr(0, dataString.indexOf(global_1.Global.MessageDelimiter));
                self.onMessage(self.message);
                self.resetBuffer();
            }
        });
    }
    resetBuffer() {
        this.message = "";
    }
    send(message) {
        let self = this;
        message = message + global_1.Global.MessageDelimiter;
        this.socket.write(message, function () {
            console.log("DATA SENT " + self.remoteAddress() + ": " + message);
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