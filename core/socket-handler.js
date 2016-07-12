"use strict";
var global_1 = require("./global");
var string_util_1 = require("./string-util");
var buffer_util_1 = require("./buffer-util");
var SocketHandler = (function () {
    function SocketHandler(socket, onMessage) {
        this.socket = socket;
        this.onMessage = onMessage;
        this.message = null;
        var self = this;
        this.resetBuffer();
        // Set this as instance variable to make it easier to test
        this.onDataCallback = function (data) {
            console.log("DATA READ " + self.socket.localAddress + ":" + self.socket.localPort + " " + buffer_util_1.BufferUtil.prettyPrint(data));
            var dataString = data.toString();
            if (dataString.indexOf(global_1.Global.MessageDelimiter) === -1) {
                self.message += dataString;
            }
            else {
                self.handleData(dataString);
            }
        };
        // Add a 'data' event handler to this instance of socket
        this.socket.on("data", this.onDataCallback);
    }
    /**
     * Handles incoming data
     * Finds the delimiter and sends callbacks, potentially multiple times as multiple messages can be received at once
     * @param dataString
     */
    SocketHandler.prototype.handleData = function (dataString) {
        var delimiterIndex = dataString.indexOf(global_1.Global.MessageDelimiter);
        if (delimiterIndex === -1) {
            this.message += dataString;
        }
        else {
            this.message += dataString.substr(0, delimiterIndex);
            this.onMessage(this.message);
            this.resetBuffer();
            // If we have received more than one packet at a time, handle it recursively
            if (dataString.length > (dataString.indexOf(global_1.Global.MessageDelimiter) + global_1.Global.MessageDelimiter.length)) {
                dataString = dataString.substr(dataString.indexOf(global_1.Global.MessageDelimiter) + global_1.Global.MessageDelimiter.length);
                this.handleData(dataString);
            }
        }
    };
    SocketHandler.prototype.resetBuffer = function () {
        this.message = "";
    };
    SocketHandler.prototype.send = function (message) {
        console.log("DATA SENT " + this.socket.localAddress + ":" + this.socket.localPort + " " + string_util_1.StringUtil.prettyPrint(message));
        // Use TOKEN as message delimiter
        message = message + global_1.Global.MessageDelimiter;
        this.socket.write(message, null);
    };
    SocketHandler.prototype.call = function (message, onReply) {
        this.onMessage = onReply;
        this.send(message);
    };
    SocketHandler.prototype.remoteAddress = function () {
        return this.socket.remoteAddress;
    };
    SocketHandler.prototype.disconnect = function () {
        if (this.isOpen()) {
            this.socket.end();
            this.socket = null;
        }
    };
    SocketHandler.prototype.isOpen = function () {
        return this.socket != null;
    };
    return SocketHandler;
}());
exports.SocketHandler = SocketHandler;
