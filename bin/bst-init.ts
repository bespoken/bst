import * as program from "commander";
import {prompt} from "inquirer";
import {Global} from "../lib/core/global";
import {InitUtil} from "../lib/init/init-util";
const chalk = require("chalk");

program.version(Global.version());

const questions = [
    {
      type: "list",
      name: "type",
      message: "Are you looking to create:",
      choices: [
        {
            name: "unit tests",
            value: "unit",
        },
        {
            name: "e2e tests",
            value: "e2e",
        },
        {
            name: "both",
            value: "both",
        },
      ],
      default: "both",
    },
    {
        type: "input",
        name: "projectName",
        message: "What's the name of your voice app?:",
        default: "voice hello world"
    },
    {
        type: "list",
        name: "platform",
        message: "Are you developing for alexa, google or both?",
        choices: [
            "alexa",
            "google",
            "both",
          ],
        default: "both",
    },
    {
        type: "input",
        name: "locales",
        message: "Does your voice app target multiple languages?\nIf so, please type your locales separated by a comma.\nType your locales:",
        default: "en-US",
    },
    {
        type: "input",
        name: "virtualDevice",
        message: "For e2e tests, type in your virtual device token.\nIf you don't have one or are not sure just leave it blank.\nYou can create virtual devices here: https://apps.bespoken.io/dashboard/virtualdevice\nType in your token:",
        when: (answers: any) => ["e2e", "both"].indexOf(answers["type"]) > -1,
    },
];

program
    .description("setup example project and configuration")
    .action(() => {
        console.log(chalk.yellow("Welcome to the bespoken tools CLI."));
        console.log(chalk.yellow("We'll set up all you need for you to start testing your voice apps."));
        console.log(chalk.yellow("Please tell us:"));
        prompt(questions).then(answers => {
            const initUtil = new InitUtil(answers["type"], answers["platform"],
                answers["locales"], answers["projectName"], answers["virtualDevice"]);
            initUtil.createFiles();
        });
    });

program.parse(process.argv);