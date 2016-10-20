#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {LoggingHelper} from "../lib/core/logging-helper";

let Logger = "BST";

Global.initializeCLI();
console.log("BST: v" + Global.version() + "  Node: " + process.version);
console.log("");

let nodeMajorVersion = parseInt(process.version.substr(1, 2));

if (nodeMajorVersion < 4) {
    LoggingHelper.error(Logger, "!!!!Node version must be >= 4!!!!");
    LoggingHelper.error(Logger, "Please install to use bst");
    process.exit(1);
}

program
    .command("proxy <lambda|http>", "Proxies a Lambda or http service")
    .command("intend <intent> [SlotName=SlotValue...]", "Sends the specified intent to your service")
    .command("speak <utterance>", "Sends an intent with the specified utterance to your service")
    .command("sleep <location>", "Instructs bst to sleep using specified location")
    .command("deploy <lambda>", "Deploys a skill");

program.parse(process.argv);

