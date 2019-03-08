// Startup script for running BST
import {BespokeServer} from "../lib/server/bespoke-server";
import * as program from "commander";

program
    .command("start <webhookPort> <nodePorts ...>")
    .description("Starts the BST server")
    .action(function () {
        let webhookPort: number = parseInt(process.argv[3]);
       
        // We typically listen on multiple ports - 5000 and 80
        // All the args after the webhook port are treated as node (tunnel) ports
        let serverPorts: number[] = [];
        for (let i = 4; i < process.argv.length; i++) {
            serverPorts.push(parseInt(process.argv[i]));
        }
        let bespokeServer = new BespokeServer(webhookPort, serverPorts);
        bespokeServer.start();
    });

program.parse(process.argv);