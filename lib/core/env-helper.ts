/// <reference path="../../typings/index.d.ts" />

import {config} from "dotenv";
const configFile:string = '.bst.env';

export class Env {
    public static AWS_ENVIRONMENT:string;
    public static CONFIG_FILE:string;
    public static EXCLUDE_GLOBS:string;
    public static AWS_ACCESS_KEY_ID:string;
    public static AWS_SECRET_ACCESS_KEY:string;
    public static AWS_SESSION_TOKEN:string;
    public static AWS_REGION:string;
    public static AWS_FUNCTION_NAME:string;
    public static AWS_HANDLER:string;
    public static AWS_ROLE:string;
    public static AWS_MEMORY_SIZE:number;
    public static AWS_TIMEOUT:number;
    public static AWS_DESCRIPTION:string;
    public static AWS_RUNTIME:string;
    public static AWS_PUBLISH:boolean;
    public static AWS_FUNCTION_VERSION:string;
    public static AWS_VPC_SUBNETS:string;
    public static AWS_VPC_SECURITY_GROUPS:string;
    public static PACKAGE_DIRECTORY:string;
    public static PREBUILT_DIRECTORY:string;

    public static initialize():void {
        try {
            config({path: configFile});
        } catch (err) {
            if (err.code === 'ENOENT') {
                throw configFile + 'not found!';
            } else {
                throw err;
            }
        }

        Env.AWS_ENVIRONMENT = process.env.AWS_ENVIRONMENT || '';
        Env.CONFIG_FILE = process.env.CONFIG_FILE || '';
        Env.EXCLUDE_GLOBS = process.env.EXCLUDE_GLOBS || '';
        Env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
        Env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
        Env.AWS_SESSION_TOKEN = process.env.AWS_SESSION_TOKEN || '';
        Env.AWS_REGION = process.env.AWS_REGION || 'us-east-1,us-west-2,eu-west-1';
        Env.AWS_FUNCTION_NAME = process.env.AWS_FUNCTION_NAME || 'UnnamedFunction';
        Env.AWS_HANDLER = process.env.AWS_HANDLER || 'index.handler';
        Env.AWS_ROLE = process.env.AWS_ROLE_ARN || process.env.AWS_ROLE || 'missing';
        Env.AWS_MEMORY_SIZE = process.env.AWS_MEMORY_SIZE || 128;
        Env.AWS_TIMEOUT = process.env.AWS_TIMEOUT || 60;
        Env.AWS_DESCRIPTION = process.env.AWS_DESCRIPTION || '';
        Env.AWS_RUNTIME = process.env.AWS_RUNTIME || 'nodejs4.3';
        Env.AWS_PUBLISH = process.env.AWS_PUBLISH || false;
        Env.AWS_FUNCTION_VERSION = process.env.AWS_FUNCTION_VERSION || '';
        Env.AWS_VPC_SUBNETS = process.env.AWS_VPC_SUBNETS || '';
        Env.AWS_VPC_SECURITY_GROUPS = process.env.AWS_VPC_SECURITY_GROUPS || '';
        Env.PACKAGE_DIRECTORY = process.env.PACKAGE_DIRECTORY;
        Env.PREBUILT_DIRECTORY = process.env.PREBUILT_DIRECTORY || '';
    }

    constructor() {}
}
