#!/usr/bin/env node
/// <reference path="../typings/globals/node/index.d.ts" />

// Startup script for running BST
import {BespokeClient} from "./bespoke-client";
import {WebhookRequest} from "./../core/webhook-request";

if (process.argv.length < 3) {
    console.error("No tool specified. Must be first argument.");
    process.exit(1);
}

let tool = process.argv[2];
// console.log("Tool: " + tool);

if (tool === "debug") {
    if (process.argv.length <= 6) {
        console.error("For debug, must specify dev-id, host, hostPort, and port to forward to!");
        process.exit(1);
    }

    let id: string  = process.argv[3];
    let host: string  = process.argv[4];
    let hostPort: number = parseInt(process.argv[5]);
    let targetPort: number = parseInt(process.argv[6]);

    let bespokeClient = new BespokeClient(id, host, hostPort, targetPort);
    bespokeClient.connect();
}

if (tool === "sleep") {
    console.error("Not until Brooklyn!");
    process.exit(1);
}
