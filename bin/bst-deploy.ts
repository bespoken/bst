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
            console.error(lambdaFolder+" is not a folder! You need to specify the project folder!");
            console.error("");
            process.exit(1);
            return;
        }

        try {
            LambdaConfig.initialize();
            LambdaConfig.validate();
        } catch (err) {
            console.error("Parameter validation error: "+err);
            console.error("");
            process.exit(1);
            return;
        }

        if (options.lambdaName !== undefined) {
            LambdaConfig.AWS_FUNCTION_NAME = options.lambdaName;
        }

        // If there's no function name, create one from the folder path.

        if (!LambdaConfig.AWS_FUNCTION_NAME) {
            LambdaConfig.AWS_FUNCTION_NAME = path.resolve(lambdaFolder).split(path.sep).pop();
            console.log("We named your lambda " + LambdaConfig.AWS_FUNCTION_NAME + " (after your project folder). You are welcome!");
        }

        let deployer = new LambdaDeploy(lambdaFolder);
        let roleHelper = new LambdaRole();

        if (LambdaConfig.AWS_ROLE) {
            let getRolePromise: Promise<string> = roleHelper.getRole(LambdaConfig.AWS_ROLE);

            getRolePromise
                .then((arn: string) => {
                    if (arn) {
                        console.log("Re-using existing lambda role.");
                        LambdaConfig.AWS_ROLE_ARN = arn;

                        deployer.deploy();
                    } else {
                        console.error("The lambda role you have specified doesn't exist.");
                        console.error("Create it or delete it from the config and we create one for you!");
                        process.exit(1);
                        return;
                    }
                })
                .catch((err) => {
                    console.error("Error looking up AWS role: " + err);
                });

        } else {
            // Create role if not specified (use the existing one).

            let getRolePromise: Promise<string> = roleHelper.getRole(defaultLambdaRoleName);

            getRolePromise
                .then((arn: string) => {
                    if (arn) {
                        console.log("Re-using existing BST lambda role.");
                        return arn;
                    } else {
                        console.log("We created a AWS role for your lambda and called it " + defaultLambdaRoleName + ". You are welcome!");
                        console.log("Note that this lambda execution role is very basic. You may have to customize it on the AWS console!");
                        return roleHelper.createRole(defaultLambdaRoleName);
                    }
                })
                .then((arn: string) => {
                    LambdaConfig.AWS_ROLE = defaultLambdaRoleName;
                    LambdaConfig.AWS_ROLE_ARN = arn;

                    Global.config().configuration.lambdaDeploy.role = LambdaConfig.AWS_ROLE;
                    Global.config().save();

                    console.log("We need to wait for the AWS role change to propagate. Zzzz...");
                    setTimeout(() => {
                        deployer.deploy();
                    }, 3000);
                })
                .catch((err) => {
                    console.error("Error creating AWS role: " + err);
                });
        }
    });

if (process.argv.length < 3) {
    program.outputHelp();
}

program.parse(process.argv);

