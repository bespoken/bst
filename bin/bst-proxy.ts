#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {LoggingHelper} from "../lib/core/logging-helper";
import {BSTProxy} from "../lib/client/bst-proxy";
import {URLMangler} from "../lib/client/url-mangler";
const chalk =  require("chalk");

let handleOptions = function(proxy: BSTProxy, options: any) {
    if (options.bstHost) {
        proxy.bespokenServer(options.bstHost, options.bstPort);
    }

    if (options.targetDomain) {
        proxy.targetDomain(options.targetDomain);
    }

    if (options.pithy) {
        console.log("Disabling verbose logging");
        LoggingHelper.setVerbose(false);
    } else {
        LoggingHelper.setVerbose(true);
    }

    if (options.secure) {
        proxy.activateSecurity();
    }
};

program
    .command("http <http-port>")
    .option("--bstHost <bstHost>", "The host name of the BST server")
    .option("--bstPort <bstPort>", "The port of the BST server", parseInt)
    .option("--targetDomain <targetDomain>", "Set this to forward requests to something other than localhost")
    .option("--pithy", "Disables verbose diagnostics")
    .option("--verbose", "Enable verbose diagnostics (activated by default)")
    .option("--secure", "Enables security forcing inclusion of secret key on query or headers (should be named bespoken-key) ")
    .description("Proxies an HTTP service running at the specified port")
    .action( function (port: number, options: any) {
        if (options.secure) {
            console.log("You are in secure mode, requests must include the bespoken-key in the query or the headers");
            console.log("");
            console.log("Your public URL for accessing your local service with bespoken-key in the query:");
            console.log(chalk.hex(LoggingHelper.LINK_COLOR)(URLMangler.manglePipeToPath(Global.config().sourceID(), Global.config().secretKey())));
            console.log("");
        } else {
            console.log("Your public URL for accessing your local service:");
            console.log(chalk.hex(LoggingHelper.LINK_COLOR)(URLMangler.manglePipeToPath(Global.config().sourceID())));
            console.log("");
        }

        console.log("Your URL for viewing requests/responses sent to your service:");
        console.log(chalk.hex(LoggingHelper.LINK_COLOR)(URLMangler.mangleNoPath(Global.config().sourceID(), Global.config().secretKey())));
        console.log("Copy and paste this to your browser to view your transaction history and summary data.");
        console.log("");

        let proxy: BSTProxy = BSTProxy.http(port);
        handleOptions(proxy, options);
        proxy.start();
    });

program
    .command("lambda [lambda-file] [function-name]")
    .option("--bstHost <bstHost>", "The host name of the BST server")
    .option("--bstPort <bstPort>", "The port of the BST server", parseInt)
    .option("--pithy", "Disables verbose diagnostics")
    .option("--verbose", "Enable verbose diagnostics (activated by default)")
    .option("--secure", "Enables security forcing inclusion of secret key on query or headers (should be named bespoken-key) ")
    .description("Proxies a AWS Lambda defined in the specified file")
    .action( function (lambdaFile: string, functionName: string, options: any) {
        if (options.secure) {
            console.log("You are in secure mode, requests must include the bespoken-key in the query or the headers");
            console.log("");
            console.log("Your public URL for accessing your local service with bespoken-key in the query:");
            console.log(chalk.hex(LoggingHelper.LINK_COLOR)(URLMangler.manglePipeToPath(Global.config().sourceID(), Global.config().secretKey())));
            console.log("");
        } else {
            console.log("Your public URL for accessing your local service:");
            console.log(chalk.hex(LoggingHelper.LINK_COLOR)(URLMangler.manglePipeToPath(Global.config().sourceID())));
            console.log("");
        }

        console.log("Your URL for viewing requests/responses sent to your service:");
        console.log(chalk.hex(LoggingHelper.LINK_COLOR)(URLMangler.mangleNoPath(Global.config().sourceID(), Global.config().secretKey())));
        console.log("Copy and paste this to your browser to view your transaction history and summary data.");
        console.log("");
        let proxy: BSTProxy = BSTProxy.lambda(lambdaFile, functionName);
        handleOptions(proxy, options);
        proxy.start();
    });

program
    .command("function <http-function-file> <function-name>")
    .option("--bstHost <bstHost>", "The host name of the BST server")
    .option("--bstPort <bstPort>", "The port of the BST server", parseInt)
    .option("--pithy", "Disables verbose diagnostics")
    .option("--verbose", "Enable verbose diagnostics (activated by default)")
    .option("--secure", "Enables security forcing inclusion of secret key on query or headers (should be named bespoken-key) ")
    .description("Proxies a Google HTTP Cloud Function defined in the specified file with the specified name")
    .action( function (functionFile: string, functionName: string, options: any) {
        if (options.secure) {
            console.log("You are in secure mode, requests must include the bespoken-key in the query or the headers");
            console.log("");
            console.log("Your URL for Fulfillment configuration with bespoken-key in the query:");
            console.log(chalk.hex(LoggingHelper.LINK_COLOR)(URLMangler.manglePipeToPath(Global.config().sourceID(), Global.config().secretKey())));
            console.log("");
        } else {
            console.log("Your URL for Fulfillment configuration:");
            console.log(chalk.hex(LoggingHelper.LINK_COLOR)(URLMangler.manglePipeToPath(Global.config().sourceID())));
            console.log("");
        }

        console.log("Your URL for viewing your function data:");
        console.log(chalk.hex(LoggingHelper.LINK_COLOR)(URLMangler.mangleNoPath(Global.config().sourceID(), Global.config().secretKey())));
        console.log("Copy and paste this to your browser to view your transaction history and summary data.");
        console.log("");

        let proxy: BSTProxy = BSTProxy.cloudFunction(functionFile, functionName);
        handleOptions(proxy, options);
        proxy.start();
    });

program
    .command("stop")
    .description("Stops any existing proxy that is running")
    .action(function (port: number, options: any) {
        // If there is no running process, just print a message
        if (Global.running() === null) {
            console.log("We do not see any proxy running");
            console.log();
        } else {
            if (Global.running().kill()) {
                console.log("Proxy process stopped.");
                console.log();
            } else {
                console.error("Proxy process failed to stop.");
                console.error();
            }
        }

    });

// Forces help to be printed if neither lambda nor HTTP is printed
if (process.argv.length < 3) {
    program.outputHelp();
    process.exit();
}

if (["function", "http", "lambda", "stop", "urlgen"].indexOf(process.argv[2]) < 0) {
    console.error("  error: unknown command: " + process.argv[2] + "\n");
    process.exit();
}

program.Command.prototype.missingArgument = function(name: string): void {
    console.error("  error: missing required argument " + name);
    console.error();
    process.exit(1);
};

Global.initializeCLI().then(
    () => program.parse(process.argv)
);

