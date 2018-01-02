#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {BSTVirtualAlexa} from "../lib/client/bst-virtual-alexa";
import {LoggingHelper} from "../lib/core/logging-helper";
const chalk =  require("chalk");

program.version(Global.version());

program
    .usage("[options]")
    .option("-u, --url <alexa-skill-url>", "The URL of the Alexa skill to speak to - defaults to current proxied skill")
    .option("-l, --locale <locale>", "The locale expected for the Alexa skill - defaults to en-US")
    .option("-m, --model <interaction-model-path>", "Path to the interaction model file - defaults to ./models/en-US.json")
    .option("-i, --intents <intent-schema-path>", "Path to the intent schema file - defaults to ./speechAssets/IntentSchema.json")
    .option("-s, --samples <sample-utterances-path>", "Path to the sample utterances file - defaults to ./speechAssets/SampleUtterances.txt")
    .option("-a, --appId <application-id>", "The application ID for the skill")
    .option("-U, --userId <user-id>", "Sets the user id to the specified value")
    .option("-t, --accessToken <accessToken>", "Sets the access token for emulating a user with a linked account")
    .description("Creates an launch request and sends it to your skill")
    .action(function () {
        // Just by casting program to options, we can get all the options which are set on it
        const options: any = program;
        let url = options.url;
        const interactionModel = options.model;
        const intentSchemaPath = options.intents;
        const samplesPath = options.samples;
        const applicationID = options.appId;
        const locale = options.locale;

        if (process.argv.some( arg => arg === "-h" || arg === "--help")) {
            program.outputHelp();
            process.exit(0);
            return;
        }

        if (!options.url) {
            const proxyProcess = Global.running();
            if (proxyProcess === null) {
                console.error("No URL specified and no proxy is currently running");
                console.log();
                console.log("URL (--url) must be specified if no proxy is currently running");
                console.log();
                console.log("If a proxy is running, the launch request will automatically be sent to it");
                console.log();
                process.exit(0);
                return;
            }

            url = "http://localhost:" + proxyProcess.port;
        }

        const speaker = new BSTVirtualAlexa(url, interactionModel, intentSchemaPath, samplesPath, applicationID, locale);
        try {
            speaker.start();
        } catch (error) {
            process.exit(0);
            return;
        }

        if (options.userId) {
            speaker.context().user().setID(options.userId);
        }

        if (options.accessToken) {
            speaker.context().setAccessToken(options.accessToken);
        }

        speaker.launched(function (errorInLaunch: any, response: any, request: any) {
            if (errorInLaunch) {
                console.error(chalk.red("Error: " + errorInLaunch));
                return;
            }

            const jsonPretty = JSON.stringify(response, null, 4);
            console.log("Request:");
            console.log(chalk.hex(LoggingHelper.REQUEST_COLOR)(JSON.stringify(request, null, 4)));
            console.log("");
            console.log("Response:");
            console.log(chalk.cyan(jsonPretty));
            console.log("");
        });
    });

Global.initializeCLI().then(
    () => {
        // When a command doesn't have obligatory parameters it's not working correctly
        // so we are inserting an extra parameter even is not
        process.argv.splice(2, 0, "extra");
        program.parse(process.argv);
    }
);

