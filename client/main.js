#!/usr/bin/env node
"use strict";
const bespoke_client_1 = require("./bespoke-client");
if (process.argv.length < 3) {
    console.error("No tool specified. Must be first argument.");
    process.exit(1);
}
let tool = process.argv[2];
if (tool === "debug") {
    if (process.argv.length <= 6) {
        console.error("For debug, must specify dev-id, host, hostPort, and port to forward to!");
        process.exit(1);
    }
    let id = process.argv[3];
    let host = process.argv[4];
    let hostPort = parseInt(process.argv[5]);
    let targetPort = parseInt(process.argv[6]);
    let bespokeClient = new bespoke_client_1.BespokeClient(id, host, hostPort, targetPort);
    bespokeClient.connect();
}
if (tool === "sleep") {
    console.error("Not until Brooklyn!");
    process.exit(1);
}
//# sourceMappingURL=main.js.map