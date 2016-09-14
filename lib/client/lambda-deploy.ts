import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import async = require("async");
import wrench = require("wrench");

import {LambdaConfig} from "./lambda-config";
import {LoggingHelper} from "../core/logging-helper";

const aws = require("aws-sdk");
const nodeZip = require("node-zip");
const exec = require("child_process").exec;

let logger = "LambdaDeploy";

/**
 * Deploys a lambda project to AWS
 */
export class LambdaDeploy {
    public constructor(public lambdaFolder: string) {}

    public deploy(): void {
        LambdaConfig.validate();

        let self = this;

        let regions = LambdaConfig.AWS_REGION.split(",");

        this.archive(function (err, buffer) {
            if (err) {
                throw err;
            }

            LoggingHelper.verbose(logger, "Reading zip file to memory");

            let params = self.params(buffer);

            async.map(regions, cb, function (err: Error, results: string[]): void {
                if (err) {
                    throw err;
                } else {
                    console.log("Zip file(s) done uploading.");
                    console.log("Enter this ARN(s) on the Configuration tab of your skill:");

                    results.map((result: any) => {
                        console.log();
                        console.log("\t" + result.FunctionArn);
                        console.log();
                    })
                }
            });

            function cb(region: string, callback: (err: Error, result: string) => any) {
                LoggingHelper.verbose(logger, "Uploading zip file to lambda " + region + " with parameters:");

                self.logParams(params);

                let aws_security = {
                    accessKeyId: LambdaConfig.AWS_ACCESS_KEY_ID,
                    secretAccessKey: LambdaConfig.AWS_SECRET_ACCESS_KEY,
                    region: region
                };

                aws.config.update(aws_security);

                let lambda = new aws.Lambda({
                    apiVersion: "2015-03-31"
                });

                return lambda.getFunction({
                    "FunctionName": params.FunctionName
                }, function (err: string) {
                    if (err) {
                        return self.uploadNew(lambda, params, callback);
                    }

                    return self.uploadExisting(lambda, params, callback);
                });
            }
        });
    };

    /**
     * Log the params without the buffer
     * @param params
     */
    private logParams(params:any) {
        let buff = params.Code.ZipFile;
        params.Code.ZipFile = "<"+buff.length+" bytes>";
        LoggingHelper.verbose(logger, JSON.stringify(params, null, 2));
        params.Code.ZipFile = buff;
    }

    /**
     * Creates a deployable zip file of a lambda project
     * (not used yet)
     */
    public pack(): void {
        if (!LambdaConfig.PACKAGE_DIRECTORY) {
            throw "packageDirectory not specified!";
        } else {
            try {
                let isDir = fs.lstatSync(LambdaConfig.PACKAGE_DIRECTORY).isDirectory();

                if (!isDir) {
                    throw LambdaConfig.PACKAGE_DIRECTORY + " is not a directory!";
                }
            } catch (err) {
                if (err.code === "ENOENT") {
                    LoggingHelper.verbose(logger, "Creating package directory");
                    fs.mkdirSync(LambdaConfig.PACKAGE_DIRECTORY);
                } else {
                    throw err;
                }
            }
        }

        this.archive(function (err: Error, buffer: Buffer) {
            if (err) {
                throw err;
            }

            let basename = LambdaConfig.AWS_FUNCTION_NAME;
            let zipfile = path.join(LambdaConfig.PACKAGE_DIRECTORY, basename + ".zip");

            LoggingHelper.verbose(logger, "Writing packaged zip");

            fs.writeFile(zipfile, buffer, function (err: string) {
                if (err) {
                    throw err;
                }

                LoggingHelper.verbose(logger, "Packaged zip created: " + zipfile);
            });
        });
    }

    private uploadExisting(lambda: any, params: any, callback: (err: Error, result: string) => any) {
        return lambda.updateFunctionCode({
            "FunctionName": params.FunctionName,
            "ZipFile": params.Code.ZipFile,
            "Publish": params.publish
        }, function(err: Error, data: string) {
            if (err) {
                return callback(err, data);
            }

            return lambda.updateFunctionConfiguration({
                "FunctionName": params.FunctionName,
                "Description": params.Description,
                "Handler": params.Handler,
                "MemorySize": params.MemorySize,
                "Role": params.Role,
                "Timeout": params.Timeout,
                "VpcConfig": params.VpcConfig
            }, function(err: Error, data: string) {
                return callback(err, data);
            });
        });
    }

    private uploadNew(lambda: any, params: any, callback: (err: Error, result: string) => any) {
        return lambda.createFunction(params, function(err: Error, functionData: any) {
            if (!err) {
                LoggingHelper.verbose(logger, "Lambda function was created: "+params.FunctionName);
            }

            // Lets wait a second before we use the function

            setTimeout(() => {
                return lambda.addPermission({
                    "FunctionName": params.FunctionName,
                    "Action": "lambda:InvokeFunction",
                    "Principal": "alexa-appkit.amazon.com",
                    "StatementId": new Date().getTime() + ""
                }, function (err:Error, data:string) {
                    if (!err) {
                        LoggingHelper.verbose(logger, "Alexa trigger was added to the function");
                    }

                    return callback(err, functionData);
                });
            }, 1000);
        });
    }

    private params(buffer: Buffer): any {
        let params = {
            FunctionName: LambdaConfig.AWS_FUNCTION_NAME,
            Code: {
                ZipFile: buffer
            },
            Handler: LambdaConfig.AWS_HANDLER,
            Role: LambdaConfig.AWS_ROLE,
            Runtime: LambdaConfig.AWS_RUNTIME,
            Description: LambdaConfig.AWS_DESCRIPTION,
            MemorySize: LambdaConfig.AWS_MEMORY_SIZE,
            Timeout: LambdaConfig.AWS_TIMEOUT,
            Publish: LambdaConfig.AWS_PUBLISH,
            VpcConfig: {}
        };

        if (LambdaConfig.AWS_FUNCTION_VERSION) {
            params.FunctionName += ("-" + LambdaConfig.AWS_FUNCTION_VERSION);
        }

        if (LambdaConfig.AWS_VPC_SUBNETS && LambdaConfig.AWS_VPC_SECURITY_GROUPS) {
            params.VpcConfig = {
                "SubnetIds": LambdaConfig.AWS_VPC_SUBNETS.split(","),
                "SecurityGroupIds": LambdaConfig.AWS_VPC_SECURITY_GROUPS.split(",")
            };
        }

        return params;
    };

    private archive(callback: (err: Error, buffer: Buffer) => any) {
        return LambdaConfig.PREBUILT_DIRECTORY
            ? this.archivePrebuilt(callback) : this.buildAndArchive(callback);
    }

    private buildAndArchive(callback: (err: Error, buffer?: Buffer) => any) {
        let self = this;

        let codeDirectory = this.codeDirectory();

        this.cleanDirectory(codeDirectory, function (err: Error) {

            if (err) {
                return callback(err);
            }

            LoggingHelper.verbose(logger, "Moving files to temporary directory");

            // Move files to tmp folder
            self.rsync(self.lambdaFolder, codeDirectory, true, function (err: Error) {
                if (err) {
                    return callback(err);
                }

                LoggingHelper.verbose(logger, "Running npm install --production");

                self.npmInstall(codeDirectory, function (err: Error) {
                    if (err) {
                        return callback(err);
                    }

                    self.postInstallScript(codeDirectory, function (err: Error) {
                        if (err) {
                            return callback(err);
                        }

                        LoggingHelper.verbose(logger, "Zipping deployment package");

                        if (process.platform !== "win32") {
                            self.nativeZip(codeDirectory, callback);
                        } else {
                            self.zip(codeDirectory, callback);
                        }
                    });
                });
            });
        });
    }

    private postInstallScript(codeDirectory: string, callback: (err: Error) => any) {
        let script_filename = "post-install.sh";
        let cmd = this.lambdaFolder + "/" + script_filename;

        let filePath = [codeDirectory, script_filename].join("/");

        fs.exists(filePath, function (exists: boolean) {
            if (exists) {
                LoggingHelper.verbose(logger, "Running post install script " + script_filename);
                exec(cmd, {
                    cwd: codeDirectory,
                    maxBuffer: 50 * 1024 * 1024
                }, function (error: Error, stdout: string, stderr: string) {

                    if (error) {
                        error.message = error.message + " stdout: " + stdout + "stderr" + stderr;
                        callback(error);
                    } else {
                        LoggingHelper.verbose(logger, "\t\t" + stdout);
                        callback(null);
                    }
                });

            } else {
                callback(null);
            }
        });
    }

    private npmInstall(codeDirectory: string, callback: (err: Error) => any) {
        exec("npm -s install --production --prefix " + codeDirectory, function (err: Error) {
            if (err) {
                return callback(err);
            }

            return callback(null);
        });
    }

    private archivePrebuilt(callback: (err: Error, buffer?: Buffer) => any) {
        let codeDirectory = this.codeDirectory();

        this.rsync(LambdaConfig.PREBUILT_DIRECTORY, codeDirectory, false, function (err: Error) {
            if (err) {
                return callback(err);
            }

            LoggingHelper.verbose(logger, "Zipping deployment package");

            if (process.platform !== "win32") {
                this.nativeZip(codeDirectory, callback);
            } else {
                this.zip(codeDirectory, callback);
            }
        });
    }

    private codeDirectory = function () {
        let epoch_time = +new Date();

        return os.tmpdir() + "/" + LambdaConfig.AWS_FUNCTION_NAME + "-" + epoch_time;
    };

    private nativeZip = function (codeDirectory: string, callback: (err: Error, buffer?: Buffer) => any) {
        let ms_since_epoch: number = new Date().getTime();
        let filename: string = LambdaConfig.AWS_FUNCTION_NAME + "-" + ms_since_epoch + ".zip";
        let zipfile: string = path.join(os.tmpdir(), filename);

        let cmd: string = "zip -r " + zipfile + " .";

        exec(cmd, {
            cwd: codeDirectory,
            maxBuffer: 50 * 1024 * 1024
        }, function (err: Error) {
            if (err !== null) {
                return callback(err, null);
            }

            let data = fs.readFileSync(zipfile);
            callback(null, data);
        });

        LoggingHelper.verbose(logger, "Packaged zip created: " + zipfile);

    };

    private zip = function (codeDirectory: string, callback: (err: Error, buffer?: Buffer) => any) {
        let options = {
            type: "nodebuffer",
            compression: "DEFLATE"
        };

        LoggingHelper.verbose(logger, "Zipping repo. This might take some time");

        let files: string[] = wrench.readdirSyncRecursive(codeDirectory);
        files.forEach(function (file: string) {
            let filePath = [codeDirectory, file].join("/");
            let isFile = fs.lstatSync(filePath).isFile();
            if (isFile) {
                let content = fs.readFileSync(filePath);
                nodeZip.file(file, content);
            }
        });

        let data = nodeZip.generate(options);

        return callback(null, data);
    };

    private rsync(src: string, dest: string, excludeNodeModules: boolean, callback: (err: Error) => any) {
        // Usual suspects
        let excludes = [".git*", "*.swp", ".editorconfig", "deploy.env", "*.log", "build/", ".DS_Store"];

        let excludeGlobs: string[] = [];

        if (LambdaConfig.EXCLUDE_GLOBS) {
            excludeGlobs = LambdaConfig.EXCLUDE_GLOBS.split(" ");
        }

        let excludeArgs = excludeGlobs
            .concat(excludes)
            .concat(excludeNodeModules ? ["node_modules"] : [])
            .map(function (exclude) {
                return "--exclude=" + exclude;
            }).join(" ");

        exec("mkdir -p " + dest, function (err: Error) {
            if (err) {
                return callback(err);
            }

            // we need the extra / after src to make sure we are copying the content
            // of the directory, not the directory itself.
            exec("rsync -rL " + excludeArgs + " " + src.trim() + "/ " + dest, function (err: Error) {
                if (err) {
                    return callback(err);
                }

                return callback(null);
            });
        });
    }

    private cleanDirectory(codeDirectory: string, callback: (err: Error) => any) {
        exec("rm -rf " + codeDirectory, function (err: string) {
            if (err) {
                throw err;
            }

            fs.mkdir(codeDirectory, function (err?: NodeJS.ErrnoException) {
                if (err) {
                    throw err;
                }

                return callback(null);
            });
        });
    };
}
