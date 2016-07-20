#!/usr/bin/env node
/// <reference path="../typings/index.d.ts" />

// Startup script for running BST
import {BespokeClient} from "../lib/client/bespoke-client";
import {WebhookRequest} from "../lib/core/webhook-request";
import {ArgHelper} from "../lib/core/arg-helper";
import {Global} from "../lib/core/global";
import {URLMangler} from "../lib/client/url-mangler";

Global.initialize();

let argHelper = new ArgHelper(process.argv);

if (argHelper.orderedCount() === 0) {
    console.error("No command specified. Must be first argument.");
    process.exit(1);
}

let command = argHelper.forIndex(0);
if (command === "proxy") {
    if (argHelper.orderedCount() < 2) {
        console.error("For proxy, must specify node ID and port to forward to!");
        process.exit(1);
    }

    let agentID: string  = argHelper.forIndex(1);
    let targetPort: number = parseInt(argHelper.forIndex(2));
    let serverHost: string  = argHelper.forKeyWithDefaultString("serverHost", Global.BespokeServerHost);
    let serverPort: number = argHelper.forKeyWithDefaultNumber("serverPort", 5000);


    let bespokeClient = new BespokeClient(agentID, serverHost, serverPort, targetPort);
    bespokeClient.connect();
}

if (command === "sleep") {
    console.error("Not until Brooklyn!");
    process.exit(1);
}

if (command === "proxy-url") {
    let agentID: string  = argHelper.forIndex(1);
    let url: string = argHelper.forIndex(2);

    let mangler = new URLMangler(url, agentID);
    let newUrl = mangler.mangle();
    console.log("");
    console.log("Use this URL in the Alexa Skills configuration:");
    console.log("");
    console.log("   " + newUrl);
    console.log("");
}

if (command === "help") {
    console.log("");
    console.log("Usage: bst <command>");
    console.log("");
    console.log("Commands:");
    console.log("bst debug <node-id> <service-port>        Forwards traffic from Alexa to your local Skill service, listening on <service-port>");
    console.log("bst debug-url <node-id> <alexa-url>       Takes a normal URL and modifies to include the <node-id> in the query string");
    console.log("");
}