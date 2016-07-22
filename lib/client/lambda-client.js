"use strict";
const fs = require('fs');
const os = require('os');
const path = require('path');
const async = require('async');
const wrench = require('wrench');
const env_helper_1 = require("../core/env-helper");
const aws = require('aws-sdk');
const nodeZip = require('node-zip');
const exec = require('child_process').exec;
const Logger = "LAMBDA";
class LambdaClient {
    constructor() {
        this.codeDirectory = function () {
            let epoch_time = +new Date();
            return os.tmpdir() + '/' + env_helper_1.Env.AWS_FUNCTION_NAME + '-' + epoch_time;
        };
        this.nativeZip = function (codeDirectory, callback) {
            let zipfile = this.zipfileTmpPath();
            let cmd = 'zip -r ' + zipfile + ' .';
            exec(cmd, {
                cwd: codeDirectory,
                maxBuffer: 50 * 1024 * 1024
            }, function (err) {
                if (err !== null) {
                    return callback(err, null);
                }
                var data = fs.readFileSync(zipfile);
                callback(null, data);
            });
        };
        this.zipfileTmpPath = function () {
            let ms_since_epoch = +new Date();
            let filename = env_helper_1.Env.AWS_FUNCTION_NAME + '-' + ms_since_epoch + '.zip';
            let zipfile = path.join(os.tmpdir(), filename);
            return zipfile;
        };
        this.zip = function (codeDirectory, callback) {
            var options = {
                type: 'nodebuffer',
                compression: 'DEFLATE'
            };
            console.log('=> Zipping repo. This might take up to 30 seconds');
            let files = wrench.readdirSyncRecursive(codeDirectory);
            files.forEach(function (file) {
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
    }
    pack() {
        if (!env_helper_1.Env.PACKAGE_DIRECTORY) {
            throw 'packageDirectory not specified!';
        }
        else {
            try {
                var isDir = fs.lstatSync(env_helper_1.Env.PACKAGE_DIRECTORY).isDirectory();
                if (!isDir) {
                    throw env_helper_1.Env.PACKAGE_DIRECTORY + ' is not a directory!';
                }
            }
            catch (err) {
                if (err.code === 'ENOENT') {
                    console.log('=> Creating package directory');
                    fs.mkdirSync(env_helper_1.Env.PACKAGE_DIRECTORY);
                }
                else {
                    throw err;
                }
            }
        }
        this.archive(function (err, buffer) {
            if (err) {
                throw err;
            }
            var basename = env_helper_1.Env.AWS_FUNCTION_NAME + (env_helper_1.Env.AWS_ENVIRONMENT ? '-' + env_helper_1.Env.AWS_ENVIRONMENT : '');
            var zipfile = path.join(env_helper_1.Env.PACKAGE_DIRECTORY, basename + '.zip');
            console.log('=> Writing packaged zip');
            fs.writeFile(zipfile, buffer, function (err) {
                if (err) {
                    throw err;
                }
                console.log('Packaged zip created: ' + zipfile);
            });
        });
    }
    deploy() {
        let self = this;
        let regions = env_helper_1.Env.AWS_REGION.split(',');
        this.archive(function (err, buffer) {
            if (err) {
                throw err;
            }
            console.log('=> Reading zip file to memory');
            let params = self.params(buffer);
            async.map(regions, cb, function (err, results) {
                if (err) {
                    throw err;
                }
                else {
                    console.log('=> Zip file(s) done uploading. Results: ');
                    console.log(results);
                }
            });
            function cb(region, callback) {
                console.log('=> Uploading zip file to AWS Lambda ' + region + ' with parameters:');
                console.log(params);
                let aws_security = {
                    accessKeyId: env_helper_1.Env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: env_helper_1.Env.AWS_SECRET_ACCESS_KEY,
                    region: region,
                };
                aws.config.update(aws_security);
                let lambda = new aws.Lambda({
                    apiVersion: '2015-03-31'
                });
                return lambda.getFunction({
                    'FunctionName': params.FunctionName
                }, function (err) {
                    if (err) {
                        return self.uploadNew(lambda, params, callback);
                    }
                    return self.uploadExisting(lambda, params, callback);
                });
            }
        });
    }
    ;
    uploadExisting(lambda, params, callback) {
        return lambda.updateFunctionCode({
            'FunctionName': params.FunctionName,
            'ZipFile': params.Code.ZipFile,
            'Publish': params.publish
        }, function (err, data) {
            if (err) {
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
            }, function (err, data) {
                return callback(err, data);
            });
        });
    }
    uploadNew(lambda, params, callback) {
        return lambda.createFunction(params, function (err, data) {
            return callback(err, data);
        });
    }
    params(buffer) {
        let params = {
            FunctionName: env_helper_1.Env.AWS_FUNCTION_NAME + (env_helper_1.Env.AWS_ENVIRONMENT ? '-' + env_helper_1.Env.AWS_ENVIRONMENT : ''),
            Code: {
                ZipFile: buffer
            },
            Handler: env_helper_1.Env.AWS_HANDLER,
            Role: env_helper_1.Env.AWS_ROLE,
            Runtime: env_helper_1.Env.AWS_RUNTIME,
            Description: env_helper_1.Env.AWS_DESCRIPTION,
            MemorySize: env_helper_1.Env.AWS_MEMORY_SIZE,
            Timeout: env_helper_1.Env.AWS_TIMEOUT,
            Publish: env_helper_1.Env.AWS_PUBLISH,
            VpcConfig: {}
        };
        if (env_helper_1.Env.AWS_FUNCTION_VERSION) {
            params.FunctionName += ('-' + env_helper_1.Env.AWS_FUNCTION_VERSION);
        }
        if (env_helper_1.Env.AWS_VPC_SUBNETS && env_helper_1.Env.AWS_VPC_SECURITY_GROUPS) {
            params.VpcConfig = {
                'SubnetIds': env_helper_1.Env.AWS_VPC_SUBNETS.split(','),
                'SecurityGroupIds': env_helper_1.Env.AWS_VPC_SECURITY_GROUPS.split(',')
            };
        }
        return params;
    }
    ;
    archive(callback) {
        return env_helper_1.Env.PREBUILT_DIRECTORY
            ? this.archivePrebuilt(callback) : this.buildAndArchive(callback);
    }
    buildAndArchive(callback) {
        let self = this;
        var codeDirectory = this.codeDirectory();
        this.cleanDirectory(codeDirectory, function (err) {
            if (err) {
                return callback(err);
            }
            console.log('=> Moving files to temporary directory');
            self.rsync('.', codeDirectory, true, function (err) {
                if (err) {
                    return callback(err);
                }
                console.log('=> Running npm install --production');
                self.npmInstall(codeDirectory, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    self.postInstallScript(codeDirectory, function (err) {
                        if (err) {
                            return callback(err);
                        }
                        console.log('=> Zipping deployment package');
                        if (process.platform !== 'win32') {
                            self.nativeZip(codeDirectory, callback);
                        }
                        else {
                            self.zip(codeDirectory, callback);
                        }
                    });
                });
            });
        });
    }
    postInstallScript(codeDirectory, callback) {
        var script_filename = 'post_install.sh';
        var cmd = './' + script_filename;
        var filePath = [codeDirectory, script_filename].join('/');
        fs.exists(filePath, function (exists) {
            if (exists) {
                console.log('=> Running post install script ' + script_filename);
                exec(cmd, {
                    cwd: codeDirectory,
                    maxBuffer: 50 * 1024 * 1024
                }, function (error, stdout, stderr) {
                    if (error) {
                        error.message = error.message + " stdout: " + stdout + "stderr" + stderr;
                        callback(error);
                    }
                    else {
                        console.log("\t\t" + stdout);
                        callback(null);
                    }
                });
            }
            else {
                callback(null);
            }
        });
    }
    npmInstall(codeDirectory, callback) {
        exec('npm -s install --production --prefix ' + codeDirectory, function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null);
        });
    }
    archivePrebuilt(callback) {
        var codeDirectory = this.codeDirectory();
        this.rsync(env_helper_1.Env.PREBUILT_DIRECTORY, codeDirectory, false, function (err) {
            if (err) {
                return callback(err);
            }
            console.log('=> Zipping deployment package');
            if (process.platform !== 'win32') {
                this.nativeZip(codeDirectory, callback);
            }
            else {
                this.zip(codeDirectory, callback);
            }
        });
    }
    rsync(src, dest, excludeNodeModules, callback) {
        let excludes = ['.git*', '*.swp', '.editorconfig', 'deploy.env', '*.log', 'build/'];
        let excludeGlobs = [];
        if (env_helper_1.Env.EXCLUDE_GLOBS) {
            excludeGlobs = env_helper_1.Env.EXCLUDE_GLOBS.split(' ');
        }
        let excludeArgs = excludeGlobs
            .concat(excludes)
            .concat(excludeNodeModules ? ['node_modules'] : [])
            .map(function (exclude) {
            return '--exclude=' + exclude;
        }).join(' ');
        exec('mkdir -p ' + dest, function (err) {
            if (err) {
                return callback(err);
            }
            exec('rsync -rL ' + excludeArgs + ' ' + src.trim() + '/ ' + dest, function (err) {
                if (err) {
                    return callback(err);
                }
                return callback(null);
            });
        });
    }
    cleanDirectory(codeDirectory, callback) {
        exec('rm -rf ' + codeDirectory, function (err) {
            if (err) {
                throw err;
            }
            fs.mkdir(codeDirectory, function (err) {
                if (err) {
                    throw err;
                }
                return callback(null);
            });
        });
    }
    ;
}
exports.LambdaClient = LambdaClient;
//# sourceMappingURL=lambda-client.js.map