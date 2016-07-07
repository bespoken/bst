"use strict";
const bespoke_server_1 = require("./bespoke-server");
const bespoke_client_1 = require("../client/bespoke-client");
if (process.argv.length < 3) {
    console.error("No tool specified. Must be first argument.");
    process.exit(1);
}
let tool = process.argv[2];
console.log("Tool: " + tool);
if (tool == "debug") {
    if (process.argv.length < 6) {
        console.error("For debug, must specify host, hostPort, and port to forward to!");
        process.exit(1);
    }
    let host = process.argv[3];
    let hostPort = parseInt(process.argv[4]);
    let targetPort = parseInt(process.argv[5]);
    let bespokeClient = new bespoke_client_1.BespokeClient("JPK", host, hostPort, targetPort);
    bespokeClient.connect();
}
if (tool == "server") {
    if (process.argv.length < 5) {
        console.error("For server, must specify port to forward to!");
        process.exit(1);
    }
    let webhookPort = parseInt(process.argv[3]);
    let serverPort = parseInt(process.argv[4]);
    let bespokeServer = new bespoke_server_1.BespokeServer(webhookPort, serverPort);
    bespokeServer.start();
}
//# sourceMappingURL=main.js.map