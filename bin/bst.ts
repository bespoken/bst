#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {NpmClient} from "../lib/external/npm";
import {LoggingHelper} from "../lib/core/logging-helper";

NpmClient.getLastVersion().then((lastVersion) => {
    const actualVersion = Global.version();
    const displayUpdateVersion = lastVersion && NpmClient.isVersionGreaterThan(lastVersion, actualVersion);
    if (displayUpdateVersion) {
        console.log("\x1b[33m", `Update available ${actualVersion} -> ${lastVersion}`);
        console.log("");
    }

    let Logger = "BST";

    console.log("\x1b[32m", "BST: v" + Global.version() + "  Node: " + process.version);
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
        .command("speak <utterance>", "Sends your message to your virtual alexa device")
        .command("test [testPattern]", "Runs tests - by default runs all tests scripts found");

    // We don't initialize when running tests - perhaps for other cases as well?
    // For hooking into CI, we do not want to keep creating new configurations
    const skipInitialize = process.argv.length >= 3 && process.argv[2] === "test";
    if (skipInitialize) {
        program.parse(process.argv);
    } else {
        Global.initializeCLI().then(
            () => {
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
    }
});





