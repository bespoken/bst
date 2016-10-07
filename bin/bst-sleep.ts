#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";

Global.initializeCLI();

program.version(Global.version());

program
    .usage("<location>")
    .description("Instructs bst to sleep using specified location")
    .action(function (location: string) {
        if (location === undefined || location.toLowerCase() !== "brooklyn") {
            console.error("Not until Brooklyn");
            console.log();
            console.log("Did you know bst can be pronounced different ways?");
            console.log("It can be pronounced Bee-Ess-Tee, Beast (preferred) or even Bee-Stee?");
            console.log();
        } else {
            console.log("Yeah!!!");
            console.log();
        }
    });

// Forces help to be printed
if (process.argv.slice(2).length === 0) {
    program.outputHelp();
}

program.parse(process.argv);

