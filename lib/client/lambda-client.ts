import fs = require('fs');
import os = require('os');
import path = require('path');

import async = require('async');
import wrench = require('wrench');

import {Env} from "../core/env-helper";

const aws = require('aws-sdk');
const nodeZip = require('node-zip');
const exec = require('child_process').exec;
const Logger = "LAMBDA";

/**
 * Description ...
 */
export class LambdaClient {
    public pack():void {
        if (!Env.PACKAGE_DIRECTORY) {
            throw 'packageDirectory not specified!';
        } else {
            try {
                var isDir = fs.lstatSync(Env.PACKAGE_DIRECTORY).isDirectory();

                if (!isDir) {
                    throw Env.PACKAGE_DIRECTORY + ' is not a directory!';
                }
            } catch (err) {
                if (err.code === 'ENOENT') {
                    console.log('=> Creating package directory');
                    fs.mkdirSync(Env.PACKAGE_DIRECTORY);
                } else {
                    throw err;
                }
            }
        }

        this.archive(function (err:Error, buffer:Buffer) {
            if (err) {
                throw err;
            }

            var basename = Env.AWS_FUNCTION_NAME + (Env.AWS_ENVIRONMENT ? '-' + Env.AWS_ENVIRONMENT : '');
            var zipfile = path.join(Env.PACKAGE_DIRECTORY, basename + '.zip');

            console.log('=> Writing packaged zip');

            fs.writeFile(zipfile, buffer, function (err:string) {
                if (err) {
                    throw err;
                }

                console.log('Packaged zip created: ' + zipfile);
            });
        });
    }

    public deploy():void {
        let self = this;

        let regions = Env.AWS_REGION.split(',');

        this.archive(function (err, buffer) {
            if (err) {
                throw err;
            }

            console.log('=> Reading zip file to memory');

            let params = self.params(buffer);

            async.map(regions, cb, function (err: Error, results: string[]): void {
                if (err) {
                    throw err;
                } else {
                    console.log('=> Zip file(s) done uploading. Results: ');
                    console.log(results);
                }
            });

            function cb(region:string, callback:(err:Error, result:string) => any) {
                console.log('=> Uploading zip file to AWS Lambda ' + region + ' with parameters:');
                console.log(params);

                let aws_security = {
                    accessKeyId: Env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: Env.AWS_SECRET_ACCESS_KEY,
                    region: region,
                    //sessionToken: Env.AWS_SESSION_TOKEN
                };

                aws.config.update(aws_security);

                let lambda = new aws.Lambda({
                    apiVersion: '2015-03-31'
                });

                return lambda.getFunction({
                    'FunctionName': params.FunctionName
                }, function (err:string) {
                    if (err) {
                        return self.uploadNew(lambda, params, callback);
                    }

                    return self.uploadExisting(lambda, params, callback);
                });
            }
        });
    };

    private uploadExisting(lambda:any, params:any, callback:(err:Error, result:string)=>any) {
        return lambda.updateFunctionCode({
            'FunctionName': params.FunctionName,
            'ZipFile': params.Code.ZipFile,
            'Publish': params.publish
        }, function(err:Error, data:string) {
            if(err) {
                return callback(err, data);
            }

            return lambda.updateFunctionConfiguration({
                'FunctionName': params.FunctionName,
                'Description': params.Description,
                'Handler': params.Handler,
                'MemorySize': params.MemorySize,
                'Role': params.Role,
                'Timeout': params.Timeout,
                'VpcConfig': params.VpcConfig
            }, function(err:Error, data:string) {
                return callback(err, data);
            });
        });
    }

    private uploadNew(lambda:any, params:any, callback:(err:Error, result:string)=>any) {
        return lambda.createFunction(params, function(err:Error, data:string) {
            return callback(err, data);
        });
    }

    private params(buffer:Buffer):any {
        let params = {
            FunctionName: Env.AWS_FUNCTION_NAME + (Env.AWS_ENVIRONMENT ? '-' + Env.AWS_ENVIRONMENT : ''),
            Code: {
                ZipFile: buffer
            },
            Handler: Env.AWS_HANDLER,
            Role: Env.AWS_ROLE,
            Runtime: Env.AWS_RUNTIME,
            Description: Env.AWS_DESCRIPTION,
            MemorySize: Env.AWS_MEMORY_SIZE,
            Timeout: Env.AWS_TIMEOUT,
            Publish: Env.AWS_PUBLISH,
            VpcConfig: {}
        };

        if (Env.AWS_FUNCTION_VERSION) {
            params.FunctionName += ('-' + Env.AWS_FUNCTION_VERSION);
        }

        if (Env.AWS_VPC_SUBNETS && Env.AWS_VPC_SECURITY_GROUPS) {
            params.VpcConfig = {
                'SubnetIds': Env.AWS_VPC_SUBNETS.split(','),
                'SecurityGroupIds': Env.AWS_VPC_SECURITY_GROUPS.split(',')
            };
        }

        return params;
    };

    private archive(callback:(err:Error, buffer:Buffer) => any) {
        return Env.PREBUILT_DIRECTORY
            ? this.archivePrebuilt(callback) : this.buildAndArchive(callback);
    }

    private buildAndArchive(callback:(err:Error, buffer?:Buffer) => any) {
        let self = this;

        var codeDirectory = this.codeDirectory();

        this.cleanDirectory(codeDirectory, function (err:Error) {

            if (err) {
                return callback(err);
            }

            console.log('=> Moving files to temporary directory');

            // Move files to tmp folder
            self.rsync('.', codeDirectory, true, function (err:Error) {
                if (err) {
                    return callback(err);
                }

                console.log('=> Running npm install --production');

                self.npmInstall(codeDirectory, function (err:Error) {
                    if (err) {
                        return callback(err);
                    }

                    self.postInstallScript(codeDirectory, function (err:Error) {
                        if (err) {
                            return callback(err);
                        }

                        console.log('=> Zipping deployment package');

                        if (process.platform !== 'win32') {
                            self.nativeZip(codeDirectory, callback);
                        } else {
                            self.zip(codeDirectory, callback);
                        }
                    });
                });
            });
        });
    }

    private postInstallScript(codeDirectory:string, callback:(err:Error)=>any) {
        var script_filename = 'post_install.sh';
        var cmd = './' + script_filename;

        var filePath = [codeDirectory, script_filename].join('/');

        fs.exists(filePath, function (exists:boolean) {
            if (exists) {
                console.log('=> Running post install script ' + script_filename);
                exec(cmd, {
                    cwd: codeDirectory,
                    maxBuffer: 50 * 1024 * 1024
                }, function (error:Error, stdout:string, stderr:string) {

                    if (error) {
                        error.message = error.message + " stdout: " + stdout + "stderr" + stderr;
                        callback(error);
                    } else {
                        console.log("\t\t" + stdout);
                        callback(null);
                    }
                });

            } else {
                callback(null);
            }
        });
    }

    private npmInstall(codeDirectory:string, callback:(err:Error)=>any) {
        exec('npm -s install --production --prefix ' + codeDirectory, function (err:Error) {
            if (err) {
                return callback(err);
            }

            return callback(null);
        });
    }

    private archivePrebuilt(callback:(err:Error, buffer?:Buffer) => any) {
        var codeDirectory = this.codeDirectory();

        this.rsync(Env.PREBUILT_DIRECTORY, codeDirectory, false, function (err:Error) {
            if (err) {
                return callback(err);
            }

            console.log('=> Zipping deployment package');

            if (process.platform !== 'win32') {
                this.nativeZip(codeDirectory, callback);
            } else {
                this.zip(codeDirectory, callback);
            }
        });
    }

    private codeDirectory = function () {
        let epoch_time = +new Date();

        return os.tmpdir() + '/' + Env.AWS_FUNCTION_NAME + '-' + epoch_time;
    };

    private nativeZip = function (codeDirectory:string, callback:(err:Error, buffer?:Buffer) => any) {
        let zipfile = this.zipfileTmpPath();
        let cmd:string = 'zip -r ' + zipfile + ' .';

        exec(cmd, {
            cwd: codeDirectory,
            maxBuffer: 50 * 1024 * 1024
        }, function (err:Error) {
            if (err !== null) {
                return callback(err, null);
            }

            var data = fs.readFileSync(zipfile);
            callback(null, data);
        });
    };

    private zipfileTmpPath = function () {
        let ms_since_epoch = +new Date();
        let filename = Env.AWS_FUNCTION_NAME + '-' + ms_since_epoch + '.zip';
        let zipfile = path.join(os.tmpdir(), filename);

        return zipfile;
    };

    private zip = function (codeDirectory:string, callback:(err:Error, buffer?:Buffer) => any) {
        var options = {
            type: 'nodebuffer',
            compression: 'DEFLATE'
        };

        console.log('=> Zipping repo. This might take up to 30 seconds');

        let files:string[] = wrench.readdirSyncRecursive(codeDirectory);
        files.forEach(function (file:string) {
            var filePath = [codeDirectory, file].join('/');
            var isFile = fs.lstatSync(filePath).isFile();
            if (isFile) {
                var content = fs.readFileSync(filePath);
                nodeZip.file(file, content);
            }
        });

        var data = nodeZip.generate(options);

        return callback(null, data);
    };

    private rsync(src:string, dest:string, excludeNodeModules:boolean, callback:(err:Error) => any) {
        let excludes = ['.git*', '*.swp', '.editorconfig', 'deploy.env', '*.log', 'build/'];
        let excludeGlobs:string[] = [];

        if (Env.EXCLUDE_GLOBS) {
            excludeGlobs = Env.EXCLUDE_GLOBS.split(' ');
        }

        let excludeArgs = excludeGlobs
            .concat(excludes)
            .concat(excludeNodeModules ? ['node_modules'] : [])
            .map(function (exclude) {
                return '--exclude=' + exclude;
            }).join(' ');

        exec('mkdir -p ' + dest, function (err:Error) {
            if (err) {
                return callback(err);
            }

            // we need the extra / after src to make sure we are copying the content
            // of the directory, not the directory itself.
            exec('rsync -rL ' + excludeArgs + ' ' + src.trim() + '/ ' + dest, function (err:Error) {
                if (err) {
                    return callback(err);
                }

                return callback(null);
            });
        });
    }

    private cleanDirectory(codeDirectory:string, callback:(err:Error)=>any) {
        exec('rm -rf ' + codeDirectory, function (err:string) {
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
