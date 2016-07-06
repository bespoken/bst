var global_1 = require("./global");
var SocketHandler = (function () {
    function SocketHandler(socket, onMessage) {
        this.socket = socket;
        this.onMessage = onMessage;
        this.message = null;
        var self = this;
        // Add a 'data' event handler to this instance of socket
        this.socket.on('data', function (data) {
            console.log('DATA ' + self.socket.remoteAddress + ': ' + data + " DELIM: " + global_1.Global.MessageDelimiter);
            if (self.message == null) {
                self.message = "";
            }
            var dataString = data.toString();
            if (dataString.indexOf(global_1.Global.MessageDelimiter) == -1) {
                self.message += dataString;
            }
            else {
                var completeMessage = dataString.substr(0, dataString.indexOf(global_1.Global.MessageDelimiter));
                console.log("FullMessage: " + completeMessage);
                self.onMessage(completeMessage);
                self.message = null;
            }
        });
    }
    SocketHandler.prototype.send = function (message) {
        console.log("SendingMessage: " + message);
        //Use TOKEN as message delimiter
        message = message + global_1.Global.MessageDelimiter;
        this.socket.write(message, function () {
            console.log("WroteData: " + message);
        });
    };
    SocketHandler.prototype.call = function (message, onReply) {
        console.log("CallingWith: " + message);
        this.onMessage = onReply;
        this.send(message);
    };
    SocketHandler.prototype.remoteAddress = function () {
        return this.socket.remoteAddress;
    };
    return SocketHandler;
})();
exports.SocketHandler = SocketHandler;
//# sourceMappingURL=socket-handler.js.map