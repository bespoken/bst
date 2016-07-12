"use strict";
const bespoke_server_1 = require("./bespoke-server");
if (process.argv.length < 3) {
    console.error("No tool specified. Must be first argument.");
    process.exit(1);
}
let tool = process.argv[2];
if (tool === "server") {
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