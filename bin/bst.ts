#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {LoggingHelper} from "../lib/core/logging-helper";
import * as updateNotifier from "update-notifier";
const chalk = require("chalk");

const displayMessagesAndTips = () => {
    const messages = Global.messages();
    if (messages) {
        if (messages.customMessage && messages.customMessage.message) {
            console.log(chalk.cyan(messages.customMessage.message));
        }

        if (messages.tip && messages.tip.message) {
            console.log(chalk.green(messages.tip.message));
        }
        console.log("");
    }
};

console.log("");
console.log(chalk.green("BST: v" + Global.version() + "  Node: " + process.version));

updateNotifier({
    pkg: {
        name: "bespoken-tools",
        version: Global.version(),
    },
    updateCheckInterval: 0
}).notify({
    defer: false,
    isGlobal: true,
});

let Logger = "BST";

let nodeMajorVersion = parseInt(process.version.substr(1, 2));

if (nodeMajorVersion < 4) {
    LoggingHelper.error(Logger, "!!!!Node version must be >= 4!!!!");
    LoggingHelper.error(Logger, "Please install to use bst");
    LoggingHelper.prepareForFileLoggingAndDisableConsole("bst-debug.log");
    LoggingHelper.error(Logger, "!!!!Node version must be >= 4!!!!");
    LoggingHelper.error(Logger, "Please install to use bst");
    process.exit(1);
}

program.version("", "-v, --version");

program
    .command("proxy <lambda|function|http>", "Proxies a Lambda, Google Cloud Function or HTTP service")
    .command("launch", "Sends a launch request to your service")
    .command("intend <intent> [SlotName=SlotValue...]", "Sends the specified intent to your service")
    .command("utter <utterance>", "Sends an intent with the specified utterance to your service")
    .command("sleep <location>", "Instructs bst to sleep using specified location")
    .command("speak <utterance>", "Sends your message to your virtual alexa device")
    .command("test [testPattern]", "Runs tests - by default runs all tests scripts found")
    .command("init", "setup example project and configuration");

// We don't initialize when running tests - perhaps for other cases as well?
// For hooking into CI, we do not want to keep creating new sources
const isTestCommand = process.argv.length >= 3 && process.argv[2] === "test";
const createSource = !isTestCommand;

Global.initializeCLI(createSource).then(
    () => {
        displayMessagesAndTips();
        program.parse(process.argv);
    }
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



