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
        message: "Enter the name of your voice experience:",
        default: "voice hello world"
    },
    {
        type: "list",
        name: "platform",
        message: "Are you developing for Alexa, Google, or an IVR system?",
        choices: [
          {
              name: "Alexa",
              value: "alexa",
          },
          {
              name: "Google",
              value: "google",
          },
          {
            name: "IVR",
            value: "twilio",
          },
        ],
    },
    {
        type: "input",
        name: "phoneNumber",
        message: "Please provide a valid phone number in the E.164 format to call to (e.g.: +14155552671):",
        when: (answers: any) => answers["platform"].includes("twilio"),
        validate: (input: any) => {
            if (!input) return false;
            return /^\+?[1-9]\d{1,14}$/.test(input);
        },
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
        message: "Enter the locale for your tests.\nIf you are targeting multiple locales, please separate them by a comma:",
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
    {
        type: "list",
        name: "testingExist",
        message: "There is already a testing.json file in your location would you like to overwrite it?",
        choices: [
            {
                name: "Yes",
                value: true,
            },
            {
                name: "No",
                value: false,
            },
        ],
        when: () => InitUtil.isThereTestingJsonFile(),
    }
];

program
    .description("Setup example project and configuration")
    .action(() => {
        console.log(chalk.yellow("Welcome to the Bespoken CLI."));
        console.log(chalk.yellow("We'll set up all you need for you to start testing your voice experiences."));
        console.log(chalk.yellow("Please tell us:"));
        prompt(questions).then(async (answers) => {
            const { type, platform, handler, locales, projectName,
                virtualDevice, dialogFlow, testingExist, phoneNumber } = answers;
            const initUtil = new InitUtil(type, platform, handler, locales,
                projectName, virtualDevice, dialogFlow, testingExist, phoneNumber);
            await initUtil.createFiles();
            let commandToExectute = "bst test";
            if (typeof testingExist !== "undefined" && !testingExist) {
                commandToExectute = `bst test --config ${initUtil.lastTestingJSONFilename}`;
            }
            console.log(chalk.green(`\nThat's it! We've created your voice app test files and you can find them under the \"test\" folder. To run them, simply type:\n${commandToExectute}\nLearn more about testing for voice at https://read.bespoken.io`));
        });
    });

program.parse(process.argv);
