#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {BstStatistics, BstCommand} from "../lib/statistics/bst-statistics";

const skillTesting = require("skill-testing-ml");

program.version(Global.version());

Global.initializeCLI(false).then(() => {

    program
        .usage("[test-pattern-regex]")
        .description("Runs unit-tests for a skill - automatically searches for YML test files and runs them")
        .parse(process.argv);

    const testCLI = new skillTesting.CLI();
    testCLI.run(process.argv).then((success) => {
        let nodeId = undefined;
        if (Global.config() && Global.config().secretKey && Global.config().secretKey()) {
            nodeId = Global.config().secretKey();
        }
        BstStatistics.instance().record(BstCommand.test, undefined, nodeId);
        process.exitCode = success ? 0 : 1;
    });
});
