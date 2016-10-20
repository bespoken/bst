#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {BSTAlexa} from "../lib/client/bst-alexa";

Global.initializeCLI();

program.version(Global.version());

program
    .usage("[options] <Intent> [SlotName=SlotValue...]")
    .option("-u, --url <alexa-skill-url>", "The URL of the Alexa skill to send to - defaults to current proxied skill")
    .option("-i, --intents <intent-schema-path>", "Path to the intent schema file - defaults to ./speechAssets/IntentSchema.json")
    .option("-s, --samples <sample-utterances-path>", "Path to the sample utterances file - defaults to ./speechAssets/SampleUtterances.txt")
    .option("-a, --appId <application-id>", "The application ID for the skill")
    .description("Creates an intent request based on the specified intent and sends it to your skill")
    .action(function () {
        // To handle utterances with multiple words, we need to look at the args
        let intentName = program.args[0];
        let slots: {[id: string]: string} = {};
        for (let i = 1; i < program.args.length; i++ ) {
            let slotArg = program.args[i];
            if (typeof slotArg !== "string") {
                continue;
            }

            if (slotArg.indexOf("=") === -1) {
                console.error("Invalid slot specified: " + slotArg + ". Must be in the form SlotName=SlotValue");
                console.error();
                process.exit(0);
                return;
            }

            let slotName = slotArg.split("=")[0];
            let slotValue = slotArg.split("=")[1];
            slots[slotName] = slotValue;
        }

        // Just by casting program to options, we can get all the options which are set on it
        let options: any = program;
        let url = options.url;
        let intentSchemaPath = options.intents;
        let samplesPath = options.samples;
        let applicationID = options.appId;

        if (options.url === undefined) {
            let proxyProcess = Global.running();
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

        let speaker = new BSTAlexa(url, intentSchemaPath, samplesPath, applicationID);
        speaker.start(function (error: string) {
            if (error !== undefined) {
                process.exit(0);
                return;
            }

            try {
                speaker.intended(intentName, slots, function(error: any, response: any, request: any) {
                    let jsonPretty = JSON.stringify(response, null, 4);
                    console.log("Intended: " + intentName);
                    console.log("");
                    console.log("Request:");
                    console.log(JSON.stringify(request, null, 4));
                    console.log("");
                    console.log("Response:");
                    console.log(jsonPretty);
                    console.log("");
                });
            } catch (e) {
                console.error("Error with intent:");
                console.error(e.message);
                console.error();
            }
        });
    });

// Forces help to be printed
if (process.argv.slice(2).length === 0) {
    program.outputHelp();
}

program.parse(process.argv);

