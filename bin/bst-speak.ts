#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {LoggingHelper} from "../lib/core/logging-helper";
import {BSTProxy} from "../lib/client/bst-proxy";
import {BSTSpeak} from "../lib/client/bst-speak";

Global.initializeCLI();

program.version(Global.version());

program
    .usage("[options] <utterance>")
    .option("-u, --url <alexa-skill-url>", "The URL of the Alexa skill to speak to - defaults to current proxied skill")
    .option("-i, --intents <intent-schema-path>", "Path to the intent schema file - defaults to ./speechAssets/IntentSchema.json")
    .option("-s, --samples <sample-utterances-path>", "Path to the sample utterances file - defaults to ./speechAssets/SampleUtterances.txt")
    .description("Creates an intent request based on the specified utterance and sends it to your skill")
    .action(function () {
        // To handle utterances with multiple words, we need to look at the args
        let utterance: string = "";
        for (let i = 0; i < program.args.length; i++ ) {
            let arg = program.args[i];
            if (typeof arg !== "string") {
                break;
            }

            if (utterance.length > 0) {
                utterance += " ";
            }
            utterance += arg;
        }

        // Just by casting program to options, we can get all the options which are set on it
        let options: any = program;
        let url = options.url;
        let intentSchemaPath = options.intents;
        let samplesPath = options.samples;

        if (options.url === undefined) {
            let proxyProcess = Global.running();
            if (proxyProcess === null) {
                console.log("No URL specified and no proxy is currently running");
                console.log("");
                console.log("URL (--url) must be specified if no proxy is currently running");
                console.log("");
                console.log("If a proxy is running, utterances will automatically be sent to it");
                process.exit(0);
                return;
            }

            url = "http://localhost:" + proxyProcess.port;
        }

        let speaker = new BSTSpeak(url, intentSchemaPath, samplesPath, null);
        speaker.initialize(function (error: string) {
            if (error !== undefined) {
                console.error("Error loading Interaction Model!");
                console.error("Cause: " + error);
                console.error("");
                process.exit(0);
                return;
            }

            speaker.speak(utterance, function(request: any, response: any) {
                let jsonPretty = JSON.stringify(response, null, 4);
                console.log("Spoke: " + utterance);
                console.log("");
                console.log("Request:");
                console.log(JSON.stringify(request, null, 4));
                console.log("");
                console.log("Response:");
                console.log(jsonPretty);
                console.log("");
            });
        });
    });

// Forces help to be printed
if (process.argv.slice(2).length === 0) {
    program.outputHelp();
}

program.parse(process.argv);

