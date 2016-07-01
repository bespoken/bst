var ConnectionHandler = (function () {
    function ConnectionHandler(port) {
        this.port = port;
    }
    ConnectionHandler.prototype.start = function () {
        console.log("Test!");
    };
    return ConnectionHandler;
})();
exports.__esModule = true;
exports["default"] = ConnectionHandler;
//# sourceMappingURL=connection-handler.js.map