#!/usr/bin/env node
/// <reference path="../typings/globals/node/index.d.ts" />

// Startup script for running BST
import {BespokeClient} from "./bespoke-client";
import {WebhookRequest} from "./../core/webhook-request";
import {ArgHelper} from "../core/arg-helper";

let argHelper = new ArgHelper(process.argv);

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

    let agentID: string  = argHelper.forIndex(1);
    let targetPort: number = parseInt(argHelper.forIndex(2));
    let serverHost: string  = argHelper.forKeyWithDefaultString("serverHost", "bst.xappmedia.com");
    let serverPort: number = argHelper.forKeyWithDefaultNumber("serverPort", 5000);


    let bespokeClient = new BespokeClient(agentID, serverHost, serverPort, targetPort);
    bespokeClient.connect();
}

if (tool === "sleep") {
    console.error("Not until Brooklyn!");
    process.exit(1);
}
