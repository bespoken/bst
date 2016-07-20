#!/usr/bin/env node
/// <reference path="../typings/index.d.ts" />

// Startup script for running BST
import {BespokeClient} from "../lib/client/bespoke-client";
import {WebhookRequest} from "../lib/core/webhook-request";
import {ArgHelper} from "../lib/core/arg-helper";
import {Global} from "../lib/core/global";
import {URLMangler} from "../lib/client/url-mangler";
import {LambdaRunner} from "../lib/client/lambda-runner";
import {LoggingHelper} from "../lib/core/logging-helper";

let Logger = "BST";

Global.initialize();
LoggingHelper.info(Logger, "Node Version: " + process.version);
let nodeMajorVersion = parseInt(process.version.substr(1, 2));

if (nodeMajorVersion < 4) {
    LoggingHelper.error(Logger, "!!!!Node version must be >= 4!!!!");
    LoggingHelper.error(Logger, "Please install to use bst");
    process.exit(1);
}

let argHelper = new ArgHelper(process.argv);

// By default, use help as the command
let command: string = null;
let matchedCommand = false;
if (argHelper.orderedCount() === 0) {
    console.error("No command specified. Must be first argument.");
} else {
   command = argHelper.forIndex(0);
}

if (command === "proxy") {
    matchedCommand = true;

    if (argHelper.orderedCount() < 3) {
        console.error("For proxy, must specify node ID and port to forward to!");
        process.exit(1);
    }

    let agentID: string  = argHelper.forIndex(1);
    let targetPort: number = parseInt(argHelper.forIndex(2));
    let serverHost: string  = argHelper.forKeyWithDefaultString("serverHost", Global.BespokeServerHost);
    let serverPort: number = argHelper.forKeyWithDefaultNumber("serverPort", 5000);


    let bespokeClient = new BespokeClient(agentID, serverHost, serverPort, targetPort);
    bespokeClient.connect();
} else if (command === "proxy-url") {
    matchedCommand = true;

    let agentID: string  = argHelper.forIndex(1);
    let url: string = argHelper.forIndex(2);

    let mangler = new URLMangler(url, agentID);
    let newUrl = mangler.mangle();
    console.log("");
    console.log("Use this URL in the Alexa Skills configuration:");
    console.log("");
    console.log("   " + newUrl);
    console.log("");
} else if (command === "proxy-lambda") {
    matchedCommand = true;

    let agentID: string  = argHelper.forIndex(1);
    let handler: string  = argHelper.forIndex(2);

    let serverHost: string  = argHelper.forKeyWithDefaultString("serverHost", Global.BespokeServerHost);
    let serverPort: number = argHelper.forKeyWithDefaultNumber("serverPort", 5000);

    let lambdaPort: number = 10000;
    let bespokeClient = new BespokeClient(agentID, serverHost, serverPort, lambdaPort);
    bespokeClient.connect();

    let lambdaRunner = new LambdaRunner();
    lambdaRunner.start(handler, lambdaPort);
} else if (command === "sleep") {
    matchedCommand = true;

    console.error("Not until Brooklyn!");
    process.exit(1);
}

if (command === "help" || !matchedCommand) {
    console.log("");
    console.log("Usage: bst <command>");
    console.log("");
    console.log("Commands:");
    console.log("bst proxy <node-id> <service-port>        Forwards traffic from Alexa to your local Skill service, listening on <service-port>");
    console.log("bst proxy-url <node-id> <alexa-url>       Takes a normal URL and modifies to include the <node-id> in the query string");
    console.log("bst proxy-lambda <node-id> <handler-file> Runs a lambda as a local service. Must be the full path to the lambda file.");

    console.log("");
}