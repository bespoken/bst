/// <reference path="../typings/globals/node/index.d.ts" />
//Startup script for running BST
var bespoke_server_1 = require("./bespoke-server");
var bespoke_client_1 = require("../client/bespoke-client");
var config_1 = require("./config");
if (process.argv.length < 3) {
    console.error("No tool specified. Must be first argument.");
    process.exit(1);
}
var tool = process.argv[2];
console.log("Tool: " + tool);
if (tool == "debug") {
    if (process.argv.length < 4) {
        console.error("For debug, must specify port to forward to!");
        process.exit(1);
    }
    var port = parseInt(process.argv[3]);
    var config = new config_1.Config();
    var bespokeClient = new bespoke_client_1.BespokeClient("JPK", config.bespokeServerHost, config.bespokeServerPort, port);
    bespokeClient.connect();
}
if (tool == "server") {
    if (process.argv.length < 5) {
        console.error("For server, must specify port to forward to!");
        process.exit(1);
    }
    var webhookPort = parseInt(process.argv[3]);
    var serverPort = parseInt(process.argv[4]);
    var bespokeServer = new bespoke_server_1.BespokeServer(webhookPort, serverPort);
    bespokeServer.start();
}
//# sourceMappingURL=main.js.map