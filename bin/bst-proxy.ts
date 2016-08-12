#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {LoggingHelper} from "../lib/core/logging-helper";
import {BSTProxy} from "../lib/client/bst-proxy";

Global.initialize();

let handleOptions = function(proxy: BSTProxy, options: any) {
    if (options.bstHost !== undefined) {
        proxy.bespokenServer(options.bstHost, options.bstPort);
    }
};

program.version(Global.version());

program
    .command("http <node-id> <http-port>")
    .option("-h, --bstHost <bstHost>", "The host name of the BST server")
    .option("-p, --bstPort <bstPort>", "The port of the BST server", parseInt)
    .description("Proxies an HTTP service running at the specified port")
    .action(function (nodeID: string, port: number, options: any) {
        let proxy: BSTProxy = BSTProxy.http(nodeID, port);
        handleOptions(proxy, options);
        proxy.start();
    });

program
    .command("lambda <node-id> <lambda-file>")
    .option("-h, --bstHost <bstHost>", "The host name of the BST server")
    .option("-p, --bstPort <bstPort>", "The port of the BST server", parseInt)
    .description("Proxies a AWS Lambda defined in the specified file")
    .action(function (nodeID: string, lambdaFile: string, options: any) {
        let proxy: BSTProxy = BSTProxy.lambda(nodeID, lambdaFile);
        handleOptions(proxy, options);
        proxy.start();
    });

program
    .command("urlgen <node-id> <alexa-url>")
    .description("Generates the URL to be used in the Alexa Skill configuration")
    .action(function (nodeID: string, url: string) {
        BSTProxy.urlgen(nodeID, url);
    });

// Forces help to be printed
if (process.argv.slice(2).length === 0) {
    program.outputHelp();
}

program.parse(process.argv);

