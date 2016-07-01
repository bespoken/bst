var net = require('net');
var BespokeClient = (function () {
    function BespokeClient(host, port) {
        this.host = host;
        this.port = port;
    }
    BespokeClient.prototype.connect = function () {
        var client = new net.Socket();
        var self = this;
        client.connect(this.port, this.host, function () {
            client.write('I am Chuck Norris!');
        });
    };
    return BespokeClient;
})();
exports.__esModule = true;
exports["default"] = BespokeClient;
//# sourceMappingURL=bespoke-client.js.map