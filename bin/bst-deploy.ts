#!/usr/bin/env node
import * as program from "commander";
import {Global} from "../lib/core/global";
import {LoggingHelper} from "../lib/core/logging-helper";
import {LambdaConfig} from "../lib/client/lambda-config";
import {LambdaDeploy} from "../lib/client/lambda-deploy";
import {LambdaAws} from "../lib/client/lambda-aws";

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
            console.error(lambdaFolder + " is not a folder! You need to specify the project folder!");
            console.error("");
            process.exit(1);
            return;
        }

        let lambdaConfig = LambdaConfig.create();

        try {
            lambdaConfig.initialize();
            lambdaConfig.validate();
        } catch (err) {
            console.error("Parameter validation error: " + err);
            console.error("");
            process.exit(1);
            return;
        }

        if (options.lambdaName !== undefined) {
            lambdaConfig.AWS_FUNCTION_NAME = options.lambdaName;
        }

        // If there's no function name, create one from the folder path.

        if (!lambdaConfig.AWS_FUNCTION_NAME) {
            lambdaConfig.AWS_FUNCTION_NAME = path.resolve(lambdaFolder).split(path.sep).pop();
            console.log("We named your lambda function " + lambdaConfig.AWS_FUNCTION_NAME + " (same as the project folder)");
        }

        let deployer = LambdaDeploy.create(lambdaFolder, lambdaConfig);
        let roleHelper = LambdaAws.create(lambdaConfig);

        if (lambdaConfig.AWS_ROLE && lambdaConfig.AWS_ROLE !== defaultLambdaRoleName) {
            let getRolePromise: Promise<string> = roleHelper.getRole(lambdaConfig.AWS_ROLE);

            getRolePromise
                .then((arn: string) => {
                    if (arn) {
                        console.log("Re-using existing lambda role.");
                        lambdaConfig.AWS_ROLE_ARN = arn;

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
            let reuse: boolean = false;

            getRolePromise
                .then((arn: string) => {
                    if (arn) {
                        console.log("Re-using existing BST lambda role.");
                        reuse = true;
                        return arn;
                    } else {
                        console.log("We created a AWS role for your lambda and called it " + defaultLambdaRoleName + ". You are welcome!");
                        console.log("Note that this lambda execution role is very basic. You may have to customize it on the AWS console!");
                        return roleHelper.createRole(defaultLambdaRoleName);
                    }
                })
                .then((arn: string) => {
                    lambdaConfig.AWS_ROLE = defaultLambdaRoleName;
                    lambdaConfig.AWS_ROLE_ARN = arn;

                    Global.config().configuration.lambdaDeploy.role = lambdaConfig.AWS_ROLE;
                    Global.config().save();

                    if (reuse) {
                        deployer.deploy();
                    } else {
                        console.log("Waiting for AWS to propagate the changes");
                        setTimeout(() => {
                            deployer.deploy();
                        }, 3000);
                    }
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

