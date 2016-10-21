/// <reference path="../../typings/index.d.ts" />

import {Global} from "../core/global";

let PropertiesReader = require("properties-reader");

export class LambdaConfig {

    /**
     * Mockery friendly factory method
     *
     * @param lambdaFolder
     * @returns {LambdaConfig}
     */
    public static create(): LambdaConfig {
        let instance: LambdaConfig = new LambdaConfig();
        return instance;
    }

    public EXCLUDE_GLOBS: string;

    public AWS_ACCESS_KEY_ID: string;
    public AWS_SECRET_ACCESS_KEY: string;
    public AWS_REGION: string;
    public AWS_FUNCTION_NAME: string;
    public AWS_HANDLER: string;
    public AWS_ROLE: string;
    public AWS_MEMORY_SIZE: number;
    public AWS_TIMEOUT: number;
    public AWS_DESCRIPTION: string;
    public AWS_RUNTIME: string;
    public AWS_PUBLISH: boolean;
    public AWS_VPC_SUBNETS: string;
    public AWS_VPC_SECURITY_GROUPS: string;

    // Future use
    public PACKAGE_DIRECTORY: string;
    public PREBUILT_DIRECTORY: string;
    public AWS_FUNCTION_VERSION: string;

    // Looked up
    public AWS_ROLE_ARN: string;

    public static defaultConfig(): any {
        return {
            "lambdaDeploy": {
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
        };
    }

    public initialize(): void {
        let awsConfig: any = null;

        // If bst lambdaDeploy is missing we need to upgrade

        if (!Global.config().configuration.lambdaDeploy) {
            Global.config().configuration.lambdaDeploy = LambdaConfig.defaultConfig().lambdaDeploy;
            Global.config().save();
        }

        let bstConfig: any = Global.config().configuration.lambdaDeploy;

        // Get AWS credentials and region first

        try {
            let home: string = process.env[(process.platform === "win32") ? "USERPROFILE" : "HOME"];

            awsConfig = PropertiesReader(home + "/.aws/config").append(home + "/.aws/credentials");
        } catch (err) {
            if (err.code === "ENOENT") {
                console.log("Warning! AWS configuration files (in ~/.aws) are missing!");
            } else {
                throw err;
            }
        }

        // Process anv variables take precedence

        if (awsConfig) {
            this.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || awsConfig.get("default.aws_access_key_id");
            this.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || awsConfig.get("default.aws_secret_access_key");
            this.AWS_REGION = process.env.AWS_REGION || awsConfig.get("default.region") || "us-east-1";
        } else {
            this.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
            this.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
            this.AWS_REGION = process.env.AWS_REGION || "us-east-1";
        }

        this.AWS_FUNCTION_NAME = bstConfig.functionName || "";
        this.AWS_RUNTIME = bstConfig.runtime || "nodejs4.3";
        this.AWS_ROLE = bstConfig.role;
        this.AWS_HANDLER = bstConfig.hander || "index.handler";
        this.AWS_DESCRIPTION = bstConfig.description || "My BST lambda skill";

        this.AWS_TIMEOUT = bstConfig.timeout || 5;
        this.AWS_MEMORY_SIZE = bstConfig.memorySize || 128;

        this.AWS_PUBLISH = true;

        this.AWS_VPC_SUBNETS = bstConfig.vpcSubnets || "";
        this.AWS_VPC_SECURITY_GROUPS = bstConfig.vpcSecurityGroups || "";

        this.EXCLUDE_GLOBS = bstConfig.excludeGlobs || "";

    }

    public validate(): void {
        // Validate
    }
}
