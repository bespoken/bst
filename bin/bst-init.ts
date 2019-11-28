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
      message: "What type of tests are you creating - unit, end-to-end:",
      choices: [
        {
            name: "unit",
            value: "unit",
        },
        {
            name: "end-to-end",
            value: "e2e",
        },
      ],
    },
    {
        type: "input",
        name: "projectName",
        message: "Enter the name of your voice app:",
        default: "voice hello world"
    },
    {
        type: "list",
        name: "platform",
        message: "Are you developing for Alexa, Google?",
        choices: [
          {
              name: "Alexa",
              value: "alexa",
          },
          {
              name: "Google",
              value: "google",
          },
        ],
    },
    {
        type: "input",
        name: "handler",
        message: "Please provide the name of your handler file (or leave blank for index.js):",
        default: "index.js",
        when: (answers: any) => answers["type"].includes("unit"),
    },
    {
        type: "input",
        name: "locales",
        message: "Does your voice app target multiple languages?\nIf so, please enter your locales separated by a comma.\nEnter your locales:",
        default: "en-US",
    },
    {
        type: "input",
        name: "virtualDevice",
        message: "For end-to-end tests, we require a virtual device token.\nIf you don't have one or are not sure just leave it blank.\nYou can create virtual devices here: https://apps.bespoken.io/dashboard/virtualdevice\nEnter your token:",
        when: (answers: any) => answers["type"].includes("e2e"),
    },
    {
        type: "input",
        name: "dialogFlow",
        message: "Please provide the path to your Dialogflow directory\n(if you don't know what this is, please take a look at https://read.bespoken.io/unit-testing/guide-google/#configuration-google-specific):",
        when: (answers: any) => answers["type"].includes("unit") && answers["platform"].includes("google"),
    },
];

program
    .description("Setup example project and configuration")
    .action(() => {
        console.log(chalk.yellow("Welcome to the Bespoken CLI."));
        console.log(chalk.yellow("We'll set up all you need for you to start testing your voice apps."));
        console.log(chalk.yellow("Please tell us:"));
        prompt(questions).then(answers => {
            const { type, platform, handler, locales, projectName, virtualDevice, dialogFlow } = answers;
            const initUtil = new InitUtil(type, platform, handler, locales, projectName, virtualDevice, dialogFlow);
            initUtil.createFiles();
            console.log(chalk.green("\nThat's it! We've created your test files for you. To run them, simply type:\n`bst test`\nLearn more about testing for voice at https://read.bespoken.io"));
        });
    });

program.parse(process.argv);
