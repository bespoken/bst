"use strict";
var global_1 = require("./global");
var SocketHandler = (function () {
    function SocketHandler(socket, onMessage) {
        this.socket = socket;
        this.onMessage = onMessage;
        this.message = null;
        var self = this;
        this.socket.on('data', function (data) {
            console.log('DATA READ ' + self.socket.remoteAddress + ': ' + data);
            if (self.message == null) {
                self.message = "";
            }
            var dataString = data.toString();
            if (dataString.indexOf(global_1.Global.MessageDelimiter) == -1) {
                self.message += dataString;
            }
            else {
                var completeMessage = dataString.substr(0, dataString.indexOf(global_1.Global.MessageDelimiter));
                self.onMessage(completeMessage);
                self.message = null;
            }
        });
    }
    SocketHandler.prototype.send = function (message) {
        var self = this;
        message = message + global_1.Global.MessageDelimiter;
        this.socket.write(message, function () {
            console.log("DATA SENT " + self.remoteAddress() + ": " + message);
        });
    };
    SocketHandler.prototype.call = function (message, onReply) {
        this.onMessage = onReply;
        this.send(message);
    };
    SocketHandler.prototype.remoteAddress = function () {
        return this.socket.remoteAddress;
    };
    return SocketHandler;
}());
exports.SocketHandler = SocketHandler;
//# sourceMappingURL=socket-handler.js.map