#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {LoggingHelper} from "../lib/core/logging-helper";
import {BSTProxy} from "../lib/client/bst-proxy";
import {URLMangler} from "../lib/client/url-mangler";

Global.initializeCLI();

let handleOptions = function(proxy: BSTProxy, options: any) {
    if (options.bstHost !== undefined) {
        proxy.bespokenServer(options.bstHost, options.bstPort);
    }

    if (options.verbose !== undefined && options.verbose) {
        console.log("Enabling verbose logging");
        LoggingHelper.setVerbose(true);
    }
};

program
    .command("http <http-port>")
    .option("--bstHost <bstHost>", "The host name of the BST server")
    .option("--bstPort <bstPort>", "The port of the BST server", parseInt)
    .option("--verbose", "Print out verbose diagnostics")
    .description("Proxies an HTTP service running at the specified port")
    .action(function (port: number, options: any) {
        console.log("Your URL for Alexa Skill configuration:");
        console.log(URLMangler.mangleJustPath("/YOUR/SKILL/PATH", Global.config().nodeID()));
        console.log("(Be sure to put in your real path and other query string parameters!)");
        console.log("");

        let proxy: BSTProxy = BSTProxy.http(port);
        handleOptions(proxy, options);
        proxy.start();
    });

program
    .command("lambda <lambda-file>")
    .option("--bstHost <bstHost>", "The host name of the BST server")
    .option("--bstPort <bstPort>", "The port of the BST server", parseInt)
    .option("--verbose", "Print out verbose diagnostics")
    .description("Proxies a AWS Lambda defined in the specified file")
    .action(function (lambdaFile: string, options: any) {
        console.log("Your URL for Alexa Skill configuration:");
        console.log(URLMangler.mangleNoPath(Global.config().nodeID()));
        console.log("");

        let proxy: BSTProxy = BSTProxy.lambda(lambdaFile);
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

program
    .command("urlgen <alexa-url>")
    .description("Generates the URL to be used in the Alexa Skill configuration")
    .action(function (url: string) {
        let bstURL: string = BSTProxy.urlgen(url);
        console.log("Enter this URL on the Configuration tab of your skill:");
        console.log();
        console.log("\t" + bstURL);
        console.log();
    });

// Forces help to be printed if neither lambda nor HTTP is printed
if (process.argv.length < 3) {
    program.outputHelp();
}

program.parse(process.argv);

