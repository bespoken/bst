"use strict";
var global_1 = require("./global");
var string_util_1 = require("../core/string-util");
var buffer_util_1 = require("../core/buffer-util");
var SocketHandler = (function () {
    function SocketHandler(socket, onMessage) {
        this.socket = socket;
        this.onMessage = onMessage;
        this.message = null;
        var self = this;
        this.resetBuffer();
        // Add a 'data' event handler to this instance of socket
        this.socket.on('data', function (data) {
            console.log('DATA READ ' + self.socket.remoteAddress + ': ' + buffer_util_1.BufferUtil.prettyPrint(data));
            var dataString = data.toString();
            if (dataString.indexOf(global_1.Global.MessageDelimiter) == -1) {
                self.message += dataString;
            }
            else {
                self.message += dataString.substr(0, dataString.indexOf(global_1.Global.MessageDelimiter));
                //console.log("FullMessage: " + completeMessage);
                self.onMessage(self.message);
                self.resetBuffer();
            }
        });
    }
    SocketHandler.prototype.resetBuffer = function () {
        this.message = "";
    };
    SocketHandler.prototype.send = function (message) {
        var self = this;
        //console.log("SendingMessage: " + message);
        //Use TOKEN as message delimiter
        message = message + global_1.Global.MessageDelimiter;
        this.socket.write(message, function () {
            console.log("DATA SENT " + self.remoteAddress() + ": " + string_util_1.StringUtil.prettyPrint(message));
        });
    };
    SocketHandler.prototype.call = function (message, onReply) {
        //console.log("CallingWith: " + message);
        this.onMessage = onReply;
        this.send(message);
    };
    SocketHandler.prototype.remoteAddress = function () {
        return this.socket.remoteAddress;
    };
    return SocketHandler;
}());
exports.SocketHandler = SocketHandler;
