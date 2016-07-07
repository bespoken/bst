/// <reference path="../typings/globals/node/index.d.ts" />
//Startup script for running BST
var bespoke_server_1 = require("./bespoke-server");
var bespoke_client_1 = require("../client/bespoke-client");
if (process.argv.length < 3) {
    console.error("No tool specified. Must be first argument.");
    process.exit(1);
}
var tool = process.argv[2];
console.log("Tool: " + tool);
if (tool == "debug") {
    if (process.argv.length < 6) {
        console.error("For debug, must specify host, hostPort, and port to forward to!");
        process.exit(1);
    }
    var host = parseInt(process.argv[3]);
    var hostPort = parseInt(process.argv[4]);
    var targetPort = parseInt(process.argv[5]);
    var bespokeClient = new bespoke_client_1.BespokeClient("JPK", host, hostPort, targetPort);
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