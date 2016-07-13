#!/usr/bin/env node
"use strict";
const bespoke_client_1 = require("./bespoke-client");
const arg_helper_1 = require("../core/arg-helper");
let argHelper = new arg_helper_1.ArgHelper(process.argv);
if (argHelper.orderedCount() === 0) {
    console.error("No tool specified. Must be first argument.");
    process.exit(1);
}
let tool = argHelper.forIndex(0);
if (tool === "debug") {
    if (argHelper.orderedCount() < 2) {
        console.error("For debug, must specify agent-id and port to forward to!");
        process.exit(1);
    }
    let agentID = argHelper.forIndex(1);
    let targetPort = parseInt(argHelper.forIndex(2));
    let serverHost = argHelper.forKeyWithDefaultString("serverHost", "bst.xappmedia.com");
    let serverPort = argHelper.forKeyWithDefaultNumber("serverPort", 5000);
    let bespokeClient = new bespoke_client_1.BespokeClient(agentID, serverHost, serverPort, targetPort);
    bespokeClient.connect();
}
if (tool === "sleep") {
    console.error("Not until Brooklyn!");
    process.exit(1);
}
//# sourceMappingURL=main.js.map