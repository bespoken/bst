#!/usr/bin/env node
import {program} from "commander";
import {Global} from "../lib/core/global";
import {BSTVirtualAlexa} from "../lib/client/bst-virtual-alexa";
import {LoggingHelper} from "../lib/core/logging-helper";
const chalk =  require("chalk");

program.version(Global.version());

program
    .usage("[options] <Intent> [SlotName=SlotValue...]")
    .option("-u, --url <alexa-skill-url>", "The URL of the Alexa skill to send to - defaults to current proxied skill")
    .option("-l, --locale <locale>", "The locale expected for the Alexa skill - defaults to en-US")
    .option("-m, --model <interaction-model-path>", "Path to the interaction model file - defaults to ./models/en-US.json")
    .option("-i, --intents <intent-schema-path>", "Path to the intent schema file - defaults to ./speechAssets/IntentSchema.json")
    .option("-s, --samples <sample-utterances-path>", "Path to the sample utterances file - defaults to ./speechAssets/SampleUtterances.txt")
    .option("-a, --appId <application-id>", "The application ID for the skill")
    .option("-U, --userId <user-id>", "Sets the user id to the specified value")
    .option("-t, --accessToken <accessToken>", "Sets the access token for emulating a user with a linked account")
    .option("-n, --newSession", "Starts a new session")
    .description("Creates an intent request based on the specified intent and sends it to your skill")
    .action(function () {
        // To handle utterances with multiple words, we need to look at the args
        const intentName = program.args[0];
        const slots: {[id: string]: string} = {};
        for (let i = 1; i < program.args.length; i++ ) {
            const slotArg = program.args[i];
            if (typeof slotArg !== "string") {
                continue;
            }

            if (slotArg.indexOf("=") === -1) {
                console.error("Invalid slot specified: " + slotArg + ". Must be in the form SlotName=SlotValue");
                console.error();
                process.exit(0);
                return;
            }

            const slotName = slotArg.split("=")[0];
            const slotValue = slotArg.split("=")[1];
            slots[slotName] = slotValue;
        }

        // Just by casting program to options, we can get all the options which are set on it
        const options: any = program.opts();
        let url = options.url;
        const interactionModel = options.model;
        const intentSchemaPath = options.intents;
        const samplesPath = options.samples;
        const applicationID = options.appId;
        const locale = options.locale;
        const newSession = options.newSession;
        const userId = options.userId;

        if (options.url === undefined) {
            const proxyProcess = Global.running();
            if (proxyProcess === null) {
                console.log("No URL specified and no proxy is currently running");
                console.log("");
                console.log("URL (--url) must be specified if no proxy is currently running");
                console.log("");
                console.log("If a proxy is running, intents will automatically be sent to it");
                process.exit(0);
                return;
            }

            url = "http://localhost:" + proxyProcess.port;
        }
        const savedSession = Global.config().loadSession() || {};
        const localeToUse = locale ? locale : savedSession.locale;
        const userIdToUse = userId ? userId : savedSession.userId;

        const speaker = new BSTVirtualAlexa(url, interactionModel, intentSchemaPath, samplesPath, applicationID, localeToUse, userIdToUse);

        try {
            speaker.start();
        } catch (error) {
            process.exit(0);
            return;
        }

        if (userIdToUse) {
            speaker.context().user().setID(userIdToUse);
        }

        if (options.accessToken) {
            speaker.context().setAccessToken(options.accessToken);
        }

        try {
            if (newSession) {
                speaker.deleteSession();
            }

            speaker.intended(intentName, slots, function(error: any, response: any, request: any) {
                console.log("Intended: " + intentName);
                console.log("");
                if (request) {
                    console.log("Request:");
                    console.log(chalk.hex(LoggingHelper.REQUEST_COLOR)(JSON.stringify(request, null, 4)));
                    console.log("");
                }

                if (error) {
                    console.log(chalk.red("Error: " + error.message));
                    return;
                }
                const jsonPretty = JSON.stringify(response, null, 4);
                console.log("Response:");
                console.log(chalk.cyan(jsonPretty));
                console.log("");
            });
        } catch (e) {
            console.error(chalk.red("Error with intent:"));
            console.error(chalk.red(e.message));
            console.error();
        }
    });

// Forces help to be printed
if (process.argv.slice(2).length === 0) {
    program.outputHelp();
}

Global.initializeCLI().then(
    () => program.parse(process.argv)
);
