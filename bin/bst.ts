#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {LoggingHelper} from "../lib/core/logging-helper";

let Logger = "BST";

console.log("BST: v" + Global.version() + "  Node: " + process.version);
console.log("");

let nodeMajorVersion = parseInt(process.version.substr(1, 2));

if (nodeMajorVersion < 4) {
    LoggingHelper.error(Logger, "!!!!Node version must be >= 4!!!!");
    LoggingHelper.error(Logger, "Please install to use bst");
    LoggingHelper.prepareForFileLoggingAndDisableConsole("bst-debug.log");
    LoggingHelper.error(Logger, "!!!!Node version must be >= 4!!!!");
    LoggingHelper.error(Logger, "Please install to use bst");
    process.exit(1);
}

program
    .command("proxy <lambda|function|http>", "Proxies a Lambda, Google Cloud Function or HTTP service")
    .command("launch", "Sends a launch request to your service")
    .command("intend <intent> [SlotName=SlotValue...]", "Sends the specified intent to your service")
    .command("utter <utterance>", "Sends an intent with the specified utterance to your service")
    .command("sleep <location>", "Instructs bst to sleep using specified location")
    .command("deploy <lambda>", "Deploys a lambda")
    .command("speak <utterance>", "Sends your message to your virtual alexa device");


Global.initializeCLI().then(
    () => program.parse(process.argv)
).catch((error) => {
    // Request to create pipe or source failed
    if (error.code === "ETIMEDOUT") {
        LoggingHelper.error(Logger, "Could not establish connection." +
            " Please check your network connection and try again.");
    } else {
        LoggingHelper.error(Logger, "Something went wrong. Please check your network connection and try again.");
    }
    LoggingHelper.error(Logger, "If the issue persists, contact us at Bespoken:");
    LoggingHelper.error(Logger, "\thttps://gitter.im/bespoken/bst");
    LoggingHelper.prepareForFileLoggingAndDisableConsole("bst-debug.log");
    LoggingHelper.error(Logger, "Error using bst version: " + Global.version() + " on Node: " + process.version);
    LoggingHelper.error(Logger, error);
});


