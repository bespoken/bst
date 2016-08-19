#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {LoggingHelper} from "../lib/core/logging-helper";
import {BSTProxy} from "../lib/client/bst-proxy";

Global.initializeCLI();

let handleOptions = function(proxy: BSTProxy, options: any) {
    if (options.bstHost !== undefined) {
        proxy.bespokenServer(options.bstHost, options.bstPort);
    }
};

program.version(Global.version());

program
    .command("http <http-port>")
    .option("-h, --bstHost <bstHost>", "The host name of the BST server")
    .option("-p, --bstPort <bstPort>", "The port of the BST server", parseInt)
    .description("Proxies an HTTP service running at the specified port")
    .action(function (port: number, options: any) {
        let proxy: BSTProxy = BSTProxy.http(port);
        handleOptions(proxy, options);
        proxy.start();
    });

program
    .command("lambda <lambda-file>")
    .option("-h, --bstHost <bstHost>", "The host name of the BST server")
    .option("-p, --bstPort <bstPort>", "The port of the BST server", parseInt)
    .description("Proxies a AWS Lambda defined in the specified file")
    .action(function (lambdaFile: string, options: any) {
        let proxy: BSTProxy = BSTProxy.lambda(lambdaFile);
        handleOptions(proxy, options);
        proxy.start();
    });

program
    .command("urlgen <alexa-url>")
    .description("Generates the URL to be used in the Alexa Skill configuration")
    .action(function (url: string) {
        BSTProxy.urlgen(url);
    });

// Forces help to be printed
if (process.argv.slice(2).length === 0) {
    program.outputHelp();
}

program.parse(process.argv);

