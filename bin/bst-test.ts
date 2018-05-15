#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";

const skillTesting = require("skill-testing-ml");

program.version(Global.version());

program
    .usage("[options] <test-file>")
    .option("-e, --endtoend", "Run end-to-end tests")
    .description("Runs unit-tests for a skill - automatically searches for YML test files and runs them")
    .action( function () {
        console.log("Running action");
        const testCLI = new skillTesting.CLI();
        testCLI.run().then(() => {
            console.log("DONE WIHT TEST");
        });
    });

program.parse(process.argv);

// const testCLI = new skillTesting.CLI();
// testCLI.run().then(() => {
//     console.log("DONE");
// });