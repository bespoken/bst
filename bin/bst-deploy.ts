#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {LoggingHelper} from "../lib/core/logging-helper";
import {LambdaConfig} from "../lib/client/lambda-config";
import {LambdaDeploy} from "../lib/client/lambda-deploy";
import {LambdaRole} from "../lib/client/lambda-role";

import * as fs from "fs";
import * as path from "path";

const defaultLambdaRoleName = "lambda-bst-execution";

Global.initializeCLI();

program
    .command("lambda <lambda-folder>")
    .option("--lambdaName <lambdaName>", "The name of the lambda function")
    .option("--verbose", "Print out verbose diagnostics")
    .description("Deploys a AWS Lambda defined in the specified folder")
    .action(function (lambdaFolder: string, options: any) {

        if (options.verbose !== undefined && options.verbose) {
            console.log("Enabling verbose logging");
            LoggingHelper.setVerbose(true);
        }

        let isDir = fs.lstatSync(lambdaFolder).isDirectory();

        if (!isDir) {
            throw lambdaFolder+ " is not a directory!";
        }

        LambdaConfig.initialize();

        if (options.lambdaName !== undefined) {
            LambdaConfig.AWS_FUNCTION_NAME = options.lambdaName;
        }

        // If there's no function name, create one from the folder path.

        if (!LambdaConfig.AWS_FUNCTION_NAME) {
            LambdaConfig.AWS_FUNCTION_NAME = path.resolve(lambdaFolder).split(path.sep).pop();
            console.log("We named your lambda "+LambdaConfig.AWS_FUNCTION_NAME+" (your project folder). You are welcome!");

            Global.config().configuration.lambdaDeploy.functionName = LambdaConfig.AWS_FUNCTION_NAME;
            Global.config().save();
        }

        let deployer = new LambdaDeploy(lambdaFolder);

        // Create role if not specified (use the existing one).

        if (!LambdaConfig.AWS_ROLE) {
            let roleHelper = new LambdaRole();

            let getRolePromise: Promise<string> = roleHelper.getRole(defaultLambdaRoleName);

            getRolePromise
                .then((arn: string) => {
                    if (arn) {
                        console.log("Re-using existing BST lambda role.");
                        return arn;
                    } else {
                        console.log("We created a AWS role for your lambda and called it "+defaultLambdaRoleName+". You are welcome!");
                        console.log("Note that this lambda execution role is very basic. You may have to customize it on the AWS console!");
                        return roleHelper.createRole(defaultLambdaRoleName);
                    }
                })
                .then((arn: string) => {
                    LambdaConfig.AWS_ROLE = arn;
                    Global.config().configuration.lambdaDeploy.role = LambdaConfig.AWS_ROLE;
                    Global.config().save();

                    console.log("We need to wait for the AWS role change to propagate. Zzzz....");

                    setTimeout(() => {
                        deployer.deploy();
                    }, 3000);
                })
                .catch((err) => {
                    console.log("Error: " + err);
                });

        } else {
            deployer.deploy();
        }
    });

if (process.argv.length < 3) {
    program.outputHelp();
}

program.parse(process.argv);

