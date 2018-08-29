#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {BstStatistics, BstCommand} from "../lib/statistics/bst-statistics";

const skillTesting = require("skill-testing-ml");

program.version(Global.version());

Global.initializeCLI(false).then(() => {
    program
        .usage("[test-pattern-regex]")
        .description("Runs unit-tests for a skill - automatically searches for YML test files and runs them");

    const options = skillTesting.ConfigurationKeys.sort((itemA, itemB) => {
        if (itemA.key < itemB.key) return -1;
        if (itemA.key > itemB.key) return 1;
        return 0;
    });
    options.forEach(element => {
        program.option(`--${element.key} <${element.key}>`, element.text);
    });
    program.parse(process.argv);

    // if the third parameter is an option, will be deleted
    const skillTesterArgs = process.argv.slice(0, 3);
    if (skillTesterArgs.length >= 3) {
        if (skillTesterArgs[2].substring(0, 2) === "--") {
            skillTesterArgs.pop();
        }
    }

    const configurationOverrides = {};
    skillTesting.ConfigurationKeys.forEach(element => {
        if (program[element.key]) {
            configurationOverrides[element.key] = program[element.key];
        }
    });
    const testCLI = new skillTesting.CLI();
    testCLI.run(skillTesterArgs, configurationOverrides).then((success) => {
        let nodeId = undefined;
        if (Global.config() && Global.config().secretKey && Global.config().secretKey()) {
            nodeId = Global.config().secretKey();
        }
        BstStatistics.instance().record(BstCommand.test, undefined, nodeId);
        process.exitCode = success ? 0 : 1;
    });
});
