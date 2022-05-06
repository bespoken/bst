#!/usr/bin/env node
import { program } from "commander";
import { Global } from "../lib/core/global";
import { BstStatistics, BstCommand } from "../lib/statistics/bst-statistics";

const skillTesting = require("skill-testing-ml");
const skippedOptions = [
    "jest.collectCoverageFrom",
    "jest.moduleFileExtensions",
    "jest.testPathIgnorePatterns",
    "jest.testMatch"
];

program.version(Global.version());

Global.initializeCLI(false).then(() => {
    program
        .argument("[testPattern]")
        .description("Runs unit or end-to-end tests for a skill - automatically searches for YML test files and runs them")
        .action((testPattern: string) => {
            // the first arguments include the node version and execution path
            const skillTesterArgs = process.argv.slice(0, 2);
            if (testPattern) {
                skillTesterArgs.push(testPattern);
            }

            const configurationOverrides = {
                client: "CLI",
            };
            const programOptions: any = program.opts();
            skillTesting.ConfigurationKeys.forEach(element => {
                if (programOptions[element.key]) {
                    configurationOverrides[element.key] = programOptions[element.key];
                }
            });
            const testCLI = new skillTesting.CLI();
            testCLI.run(skillTesterArgs, configurationOverrides).then((success) => {
                let nodeId = undefined;
                if (Global.config() && Global.config().secretKey && Global.config().secretKey()) {
                    nodeId = Global.config().secretKey();
                }
                BstStatistics.instance().record(BstCommand.test, undefined, nodeId, Global.version());
                process.exitCode = success ? 0 : 1;
            });
        });

    // dynamically set the options using the configuration from skill testing ml
    const optionsFiltered = skillTesting.ConfigurationKeys.filter(item => skippedOptions.indexOf(item.key) === -1);
    let regultarOptions = [];
    let jestOptions = [];
    for (let i = 0; i < optionsFiltered.length; i++) {
        if (optionsFiltered[i].key.startsWith("jest")) {
            jestOptions.push(optionsFiltered[i]);
        } else {
            regultarOptions.push(optionsFiltered[i]);
        }
    }
    const sortByKey = (itemA, itemB) => {
        if (itemA.key < itemB.key) return -1;
        if (itemA.key > itemB.key) return 1;
        return 0;
    };
    regultarOptions = regultarOptions.sort(sortByKey);
    jestOptions = jestOptions.sort(sortByKey);

    const options = regultarOptions.concat(jestOptions);
    options.forEach(element => {
        program.option(`--${element.key} <${element.key}>`, element.text);
    });
    program.parse(process.argv);

});
