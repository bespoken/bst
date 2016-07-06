/// <reference path="../typings/globals/node/index.d.ts" />

//Startup script for running BST
import {BespokeServer} from "./bespoke-server";
import {BespokeClient} from "../client/bespoke-client";
import {Config} from "./config";
import {WebhookRequest} from "./webhook-request";
if (process.argv.length < 3) {
    console.error("No tool specified. Must be first argument.");
    process.exit(1);
}

let tool = process.argv[2];
console.log("Tool: " + tool);

if (tool == "debug") {
    if (process.argv.length < 4) {
        console.error("For debug, must specify port to forward to!");
        process.exit(1);
    }

    let port: number = parseInt(process.argv[3]);
    let config = new Config();
    let bespokeClient = new BespokeClient("JPK", config.bespokeServerHost, config.bespokeServerPort, port);
    bespokeClient.connect();
}

if (tool == "server") {
    if (process.argv.length < 5) {
        console.error("For server, must specify port to forward to!");
        process.exit(1);
    }

    let webhookPort: number = parseInt(process.argv[3]);
    let serverPort: number = parseInt(process.argv[4]);
    let bespokeServer = new BespokeServer(webhookPort, serverPort);
    bespokeServer.start();
}
