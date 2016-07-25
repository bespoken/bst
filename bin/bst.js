#!/usr/bin/env node
"use strict";
const bespoke_client_1 = require("../lib/client/bespoke-client");
const arg_helper_1 = require("../lib/core/arg-helper");
const global_1 = require("../lib/core/global");
const url_mangler_1 = require("../lib/client/url-mangler");
const lambda_runner_1 = require("../lib/client/lambda-runner");
const logging_helper_1 = require("../lib/core/logging-helper");
const string_util_1 = require("../lib/core/string-util");
let Logger = "BST";
global_1.Global.initialize();
logging_helper_1.LoggingHelper.info(Logger, "Node Version: " + process.version);
let nodeMajorVersion = parseInt(process.version.substr(1, 2));
if (nodeMajorVersion < 4) {
    logging_helper_1.LoggingHelper.error(Logger, "!!!!Node version must be >= 4!!!!");
    logging_helper_1.LoggingHelper.error(Logger, "Please install to use bst");
    process.exit(1);
}
let argHelper = new arg_helper_1.ArgHelper(process.argv);
let command = null;
let matchedCommand = false;
if (argHelper.orderedCount() === 0) {
    console.error("No command specified. Must be first argument.");
}
else {
    command = argHelper.forIndex(0);
}
if (command === "proxy") {
    matchedCommand = true;
    if (argHelper.orderedCount() === 1) {
        console.error("For proxy, must specify sub-command - either http, lambda or urlgen");
        process.exit(1);
    }
    let subCommand = argHelper.forIndex(1);
    if (!string_util_1.StringUtil.isIn(subCommand, ["http", "lambda", "urlgen"])) {
        console.error("Invalid sub-command - must be either http, lambda or urlgen");
        process.exit(1);
    }
    let agentID = argHelper.forIndex(2);
    let serverHost = argHelper.forKeyWithDefaultString("serverHost", global_1.Global.BespokeServerHost);
    let serverPort = argHelper.forKeyWithDefaultNumber("serverPort", 5000);
    if (subCommand === "http") {
        let targetPort = parseInt(argHelper.forIndex(3));
        let bespokeClient = new bespoke_client_1.BespokeClient(agentID, serverHost, serverPort, targetPort);
        bespokeClient.connect();
    }
    else if (subCommand === "lambda") {
        if (argHelper.orderedCount() < 4) {
            console.error("The node-id and full-path to the Lambda entry-point must be specified");
            process.exit(1);
        }
        let lambdaPort = 10000;
        let handler = argHelper.forIndex(3);
        let bespokeClient = new bespoke_client_1.BespokeClient(agentID, serverHost, serverPort, lambdaPort);
        bespokeClient.connect();
        let lambdaRunner = new lambda_runner_1.LambdaRunner();
        lambdaRunner.start(handler, lambdaPort);
    }
    else if (subCommand === "urlgen") {
        if (argHelper.orderedCount() < 4) {
            console.error("For urlgen, must specify the node-id and original URL to be transformed");
            process.exit(1);
        }
        let url = argHelper.forIndex(3);
        let mangler = new url_mangler_1.URLMangler(url, agentID);
        let newUrl = mangler.mangle();
        console.log("");
        console.log("Use this URL in the Alexa Skills configuration:");
        console.log("");
        console.log("   " + newUrl);
        console.log("");
    }
}
else if (command === "sleep") {
    matchedCommand = true;
    console.error("Not until Brooklyn!");
    process.exit(1);
}
if (command === "help" || !matchedCommand) {
    console.log("");
    console.log("Usage: bst <command>");
    console.log("");
    console.log("Commands:");
    console.log("bst proxy http <node-id> <service-port>        Forwards traffic from Alexa to your local Skill service, listening on <service-port>");
    console.log("bst proxy lambda <node-id> <handler-file>      Runs a lambda as a local service. Must be the full path to the lambda file.");
    console.log("bst proxy urlgen <node-id> <alexa-url>            Takes a normal URL and modifies to include the <node-id> in the query string");
    console.log("");
}
//# sourceMappingURL=bst.js.map