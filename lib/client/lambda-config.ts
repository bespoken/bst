/// <reference path="../../typings/index.d.ts" />

import {Global} from "../core/global";
import {LoggingHelper} from "../core/logging-helper";

let PropertiesReader = require("properties-reader");

let Logger = "LambdaConfig";
let home:string = process.env[(process.platform === "win32") ? "USERPROFILE" : "HOME"];

export class LambdaConfig {
    public static EXCLUDE_GLOBS:string;

    public static AWS_ACCESS_KEY_ID:string;
    public static AWS_SECRET_ACCESS_KEY:string;
    public static AWS_REGION:string;
    public static AWS_FUNCTION_NAME:string;
    public static AWS_HANDLER:string;
    public static AWS_ROLE:string;
    public static AWS_MEMORY_SIZE:number;
    public static AWS_TIMEOUT:number;
    public static AWS_DESCRIPTION:string;
    public static AWS_RUNTIME:string;
    public static AWS_PUBLISH: boolean;
    public static AWS_VPC_SUBNETS:string;
    public static AWS_VPC_SECURITY_GROUPS:string;

    // Future use
    public static PACKAGE_DIRECTORY: string;
    public static PREBUILT_DIRECTORY: string;
    public static AWS_FUNCTION_VERSION: string;

    public static defaultConfig(): any {
        return {
            "lambdaDeploy": {
                "functionName": "",
                "runtime": "nodejs4.3",
                "role": "",
                "handler": "index.handler",
                "description": "My BST lambda skill",
                "timeout": 3,
                "memorySize": 128,

                "vpcSubnets": "",
                "vpcSecurityGroups": "",

                "excludeGlobs": "event.json"
            }
        }
    }

    public static initialize():void {
        let awsConfig:any = null;

        // If bst lambdaDeploy is missing we need to upgrade

        if (!Global.config().configuration.lambdaDeploy) {
            Global.config().configuration.lambdaDeploy = this.defaultConfig().lambdaDeploy;
            Global.config().save();
        }

        let bstConfig: any = Global.config().configuration.lambdaDeploy;

        // Get AWS credentials and region first

        try {
            awsConfig = PropertiesReader(home + "/.aws/config").append(home + "/.aws/credentials");
        } catch (err) {
            if (err.code === "ENOENT") {
                throw "AWS configuration files (in ~/.aws) are missing!";
            } else {
                throw err;
            }
        }

        LambdaConfig.AWS_ACCESS_KEY_ID = awsConfig.get("default.aws_access_key_id");
        LambdaConfig.AWS_SECRET_ACCESS_KEY = awsConfig.get("default.aws_secret_access_key");
        LambdaConfig.AWS_REGION = awsConfig.get("default.region") || "us-east-1";

        LambdaConfig.AWS_FUNCTION_NAME = bstConfig.functionName || "";
        LambdaConfig.AWS_RUNTIME = bstConfig.runtime || "nodejs4.3";
        LambdaConfig.AWS_ROLE = bstConfig.role;
        LambdaConfig.AWS_HANDLER = bstConfig.hander || "index.handler";
        LambdaConfig.AWS_DESCRIPTION = bstConfig.description || "My BST lambda skill";

        LambdaConfig.AWS_TIMEOUT = bstConfig.timeout || 5;
        LambdaConfig.AWS_MEMORY_SIZE = bstConfig.memorySize || 128;

        LambdaConfig.AWS_PUBLISH = true;

        LambdaConfig.AWS_VPC_SUBNETS = bstConfig.vpcSubnets || "";
        LambdaConfig.AWS_VPC_SECURITY_GROUPS = bstConfig.vpcSecurityGroups || "";

        LambdaConfig.EXCLUDE_GLOBS = bstConfig.excludeGlobs || "";

    }

    public static validate():void {
        if (!LambdaConfig.AWS_ROLE) {
            throw "Lambda execution role is not defined!";
        }
    }

    constructor() {
    }
}
