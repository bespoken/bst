import {Global} from "../../lib/core/global";
import * as os from "os";
import {LambdaDeploy} from "../../lib/client/lambda-deploy";
import {LambdaConfig} from "../../lib/client/lambda-config";

const exec = require("child_process").exec;
const dotenv = require("dotenv");

import * as fs from "fs";
import {LambdaAws} from "../../lib/client/lambda-aws";
import {LoggingHelper} from "../../lib/core/logging-helper";

const testAwsRole = "bst-unit-test-role-" + process.version.replace(/\./g, "-");
const testAwsLambda = "bstUnittestLambda-" + process.version.replace(/\./g, "-");

const testPayload: any = {
    "session": {
        "sessionId": "SessionId.11afee96-771f-4ff1-a35c-54187de3be8c",
        "application": {
            "applicationId": "amzn1.ask.skill.0377a357-92e2-43f3-a45d-88c75aaaa087"
        },
        "attributes": {},
        "user": {
            "userId": "amzn1.ask.account.AFP3ZWPOS2BGJR7OWJZ3DHPKMOMN6SADCW3AMW3ORP4S6SWX63PASNGYVQAWFNUZQLREA7XL243NYKEU7RCLJ3FID2Z2DP34U6N2N5NJYD6EH4BBGXLFLPMETEJISKTO7J3U2IB3G7IOGZMVWVPATQQ5QGFYORVNTQRD66DC6BEJFOJ26B5NELHK2ZE67GSJEFUW2QJWKRGEL5A"
        },
        "new": true
    },
    "request": {
        "type": "IntentRequest",
        "requestId": "EdwRequestId.506cb904-a6cb-4f73-a6e9-0a40d3e39640",
        "locale": "en-US",
        "timestamp": "2016-09-30T22:30:02Z",
        "intent": {
            "name": "MoreChoices",
            "slots": {}
        }
    },
    "version": "1.0"
};

// Sets up environment variables from .env file
dotenv.config();

describe("BST Deploy", async function() {
    let lambdaConfig = null;
    let skip: boolean = false;
    let awsHelper = null;

    before(async function() {
        this.timeout(10000);
        await Global.initializeCLI();
        lambdaConfig = LambdaConfig.create();
        lambdaConfig.initialize();
        if (!lambdaConfig.AWS_ACCESS_KEY_ID) {
            console.log("Skipping deployer tests. No AWS credentials set in local .env file - please set them to run these.");
            skip = true;
        }

        awsHelper = LambdaAws.create(lambdaConfig);
    });

    let deployProject: string = "./deployProject";
    let destinationFolder: string  = os.tmpdir() + "/.bst-deploy-test";

    let testRoleArn: string = null;


    describe("initializes the lambda configuration", function() {
        let oldHome: string = null;
        let oldKey: string = null;

        beforeEach(function () {
            if (skip) this.skip();

            oldHome = process.env.HOME;
            oldKey = process.env.AWS_ACCESS_KEY_ID;
        });

        afterEach(function () {
            process.env.HOME = oldHome;
            process.env.AWS_ACCESS_KEY_ID = oldKey;
        });

        it("checks existing key", function (done) {
            process.env.HOME = "/Users/foo";
            process.env.AWS_ACCESS_KEY_ID = "foo";

            let testConfig = LambdaConfig.create();
            testConfig.initialize();

            if (testConfig.AWS_ACCESS_KEY_ID === "foo") {
                done();
            } else {
                done(new Error("AWS access key is missing"));
            }
        });

        it("checks missing key", function (done) {
            process.env.HOME = "/Users/foo";
            process.env.AWS_ACCESS_KEY_ID = "";

            let testConfig = LambdaConfig.create();
            testConfig.initialize();

            if (!testConfig.AWS_ACCESS_KEY_ID) {
                done();
            } else {
                done(new Error("AWS access key is present: \"" + testConfig.AWS_ACCESS_KEY_ID + "\""));
            }
        });

    });

    describe("prepares the lambda function code", function() {
        let deployer: LambdaDeploy = null;

        before(async function () {
            await Global.initializeCLI();
            lambdaConfig.initialize();
            deployer = LambdaDeploy.create(deployProject, lambdaConfig);
        });

        beforeEach(function () {
            if (skip) this.skip();

            process.chdir("test/resources");
        });

        afterEach(function () {
            process.chdir("../..");
        });


        it("copies the project folder", function (done) {
            exec("rm -rf " + destinationFolder, function (err: string) {
                if (err) {
                    throw err;
                }

                deployer.copyFiles(deployProject, destinationFolder, true, function (err: Error) {
                    if (err) {
                        done(err);
                    }

                    fs.exists(destinationFolder + "/package.json", function(exists: boolean) {
                        if (!exists) {
                            done(new Error("File package.json is not in the destination folder: " + destinationFolder));
                        } else {
                            done();
                        }
                    });
                });
            });
        });

        it("runs npm", function (done) {
            this.timeout(20000);

            deployer.npmInstall(destinationFolder, function (err: Error) {
                if (err) {
                    done(err);
                }

                fs.exists(destinationFolder + "/node_modules/alexa-app/index.js", function (exists: boolean) {
                    if (!exists) {
                        done(new Error("Alexa app index.js is not in the node_modules folder: " + destinationFolder));
                    } else {
                        done();
                    }
                });
            });
        });

        it("zips the folder", function(done) {
            this.timeout(10000);

            deployer.nativeZipFiles(destinationFolder, function (err: Error, buffer: Buffer) {
                if (err) {
                    done(err);
                }

                done();
            });
        });
    });

    describe("manipulates the aws roles", function() {
        this.timeout(10000);

        beforeEach(function () {
            if (skip) this.skip();
        });

        it("creates a role", function(done) {
            awsHelper.deleteRole(testAwsRole)
                .then((arn: string) => {
                    console.log("Deleted role");
                })
                .catch((err) => {
                    console.error("Error deleting AWS role: " + err);
                    done(err);
                });

            // We can put this in the callback (then) of the delete above, but the problem is the propagation time

            setTimeout(() => {
                console.log("Waited a few seconds for AWS after delete");
                awsHelper.createRole(testAwsRole)
                    .then((arn: string) => {
                        console.log("Created role: " + arn);
                        testRoleArn = arn;
                        done();
                    })
                    .catch((err) => {
                        console.error("Error creating AWS role: " + err);
                        done(err);
                    });
            }, 2000);
        });

        it("creates invalid role", function (done) {
            awsHelper.createRole("#$%^&*_i_hope_invalid")
                .then((arn: string) => {
                    console.error("Created role: " + arn);
                    testRoleArn = arn;
                    done(new Error("Created invalid role"));
                })
                .catch((err) => {
                    console.log("Error creating AWS role: " + err);
                    done();
                });
        });

        it("finds a role", function(done) {
            setTimeout(() => {
                console.log("Waited a few seconds for AWS before role lookup");
                awsHelper.getRole(testAwsRole)
                    .then((arn: string) => {
                        console.log("Role was found: " + arn);
                        done();
                    })
                    .catch((err) => {
                        console.error("Error finding AWS role: " + err);
                        done(err);
                    });
            }, 2000);
        });

        it("finds nonexistent role", function(done) {
            awsHelper.getRole("this_doesnt_exist")
                .then((arn: string) => {
                    if (arn) {
                        console.error("Role was found");
                        done(new Error("Nonexistent role found"));
                    } else {
                        done();
                    }
                })
                .catch((err) => {
                    console.log("Error finding AWS role: " + err);
                    done();
                });
        });

        it("deletes nonexistent role", function(done) {
            awsHelper.deleteRole("this_doesnt_exist")
                .then((arn: string) => {
                    if (arn) {
                        console.error("Role was found");
                        done(new Error("Nonexistent role was deleted"));
                    } else {
                        done();
                    }
                })
                .catch((err) => {
                    console.log("Error deleting AWS role: " + err);
                    done();
                });
        });

        it("deletes nonexistent function", function(done) {
            awsHelper.deleteFunction("this_doesnt_exist")
                .then((arn: string) => {
                    if (arn) {
                        console.error("function was found");
                        done(new Error("Nonexistent function was deleted"));
                    } else {
                        done();
                    }
                })
                .catch((err) => {
                    console.log("Error deleting function " + err);
                    done();
                });
        });

    });

    describe("installs new lambda", function() {
        this.timeout(60000);

        before(function(done) {
            if (skip) this.skip();

            process.chdir("test/resources");

            awsHelper.deleteFunction(testAwsLambda)
                .then((arn: string) => {
                    if (arn) {
                        console.log("Function was deleted");
                    } else {
                        console.log("Function was not deleted (wasn't there)");
                    }
                })
                .catch((err) => {
                    console.log("Error deleting function: " + err);
                });

            lambdaConfig.AWS_ROLE_ARN = testRoleArn;
            lambdaConfig.AWS_FUNCTION_NAME = testAwsLambda;

            let deployer: LambdaDeploy = LambdaDeploy.create(deployProject, lambdaConfig);

            LoggingHelper.setVerbose(true);

            console.log("Waited a few seconds for AWS before function deploy");
            setTimeout(() => {
                deployer.deploy(function(error: Error) {
                    if (error) {
                        done (error);
                    } else {
                        done();
                    }
                });
            }, 3000);

        });

        after(function () {
            process.chdir("../..");
        });

        it("creates new", function(done) {
            console.log("Wait is over! We have the lambda!");
            done();
        });

        it("talks to lamda", function(done) {
            awsHelper.invokeLambda(testAwsLambda, testPayload)
                .then((data: any) => {
                    console.log("Lambda said: status=" + data.StatusCode + ", payload=" + data.Payload);

                    if (data.Payload.indexOf("Play Haiku ") !== -1) {
                        done();
                    } else {
                        done(new Error("Unexpected payload from lambda (no haiku)"));
                    }
                })
                .catch((err) => {
                    console.error("Error talking to AWS lambda: " + err);
                    done(err);
                });
        });
    });

    describe("updates lambda", function() {
        this.timeout(60000);

        before(function(done) {
            if (skip) this.skip();

            process.chdir("test/resources");

            lambdaConfig.AWS_ROLE_ARN = testRoleArn;
            lambdaConfig.AWS_FUNCTION_NAME = testAwsLambda;

            let deployer: LambdaDeploy = LambdaDeploy.create(deployProject, lambdaConfig);

            // LoggingHelper.setVerbose(true);

            setTimeout(() => {
                deployer.deploy(function(error: Error) {
                    if (error) {
                        done (error);
                    } else {
                        done();
                    }
                });
            }, 3000);

        });

        after(function () {
            process.chdir("../..");
        });

        it("updates existing", function(done) {
            console.log("Wait is over! We have updated lambda!");
            done();
        });

        it("talks to lambda", function(done) {
            awsHelper.invokeLambda(testAwsLambda, testPayload)
                .then((data: any) => {
                    console.log("Lambda said: status=" + data.StatusCode + ", payload=" + data.Payload);

                    if (data.Payload.indexOf("Play Haiku ") !== -1) {
                        done();
                    } else {
                        done(new Error("Unexpected payload from lambda (no haiku)"));
                    }
                })
                .catch((err) => {
                    console.error("Error talking to AWS lambda: " + err);
                    done(err);
                });
        });
    });

});