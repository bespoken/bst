#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {LoggingHelper} from "../lib/core/logging-helper";

let Logger = "BST";

Global.initializeCLI();
LoggingHelper.info(Logger, "BST: v" + Global.version() + "  Node: " + process.version);
let nodeMajorVersion = parseInt(process.version.substr(1, 2));

if (nodeMajorVersion < 4) {
    LoggingHelper.error(Logger, "!!!!Node version must be >= 4!!!!");
    LoggingHelper.error(Logger, "Please install to use bst");
    process.exit(1);
}

program
    .version(Global.version())
    .command("proxy (lambda|http)", "Proxies a Lambda or http service")
    .command("speak <utterance>", "Sends an intent with the specified utterance to your service");

program.parse(process.argv);

