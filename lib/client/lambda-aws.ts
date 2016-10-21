import {LambdaConfig} from "./lambda-config";

const aws = require("aws-sdk");

/**
 * Create AWS roles for the lambdas
 */
export class LambdaAws {
    private iam: any = null;
    private lambda: any = null;
    private lambdaConfig: LambdaConfig = null;

    public static create(lambdaConfig: LambdaConfig): LambdaAws {
        let instance: LambdaAws = new LambdaAws();

        instance.lambdaConfig = lambdaConfig;

        let aws_security = {
            accessKeyId: lambdaConfig.AWS_ACCESS_KEY_ID,
            secretAccessKey: lambdaConfig.AWS_SECRET_ACCESS_KEY,
            region: "us-east-1"
        };

        aws.config.update(aws_security);

        instance.iam = new aws.IAM({
            apiVersion: "2016-03-01"
        });

        instance.lambda = new aws.Lambda({
            apiVersion: "2016-03-01"
        });

        return instance;
    }

    /**
     * Create role if doesn't exist. If exists use that. Resolve promise by the returning the arn string.
     * @param roleName
     * @returns {Promise<T>}
     */
    public createRole(roleName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let roleRrn: string = null;

            let assumeRolePolicy: any = {
                Version: "2012-10-17",
                Statement: [
                    {
                        Sid: "",
                        Effect: "Allow",
                        Principal: {
                            Service: "lambda.amazonaws.com"
                        },
                        Action: "sts:AssumeRole"
                    }
                ]
            };

            let createParams: any = {
                AssumeRolePolicyDocument: JSON.stringify(assumeRolePolicy, null, 2),
                RoleName: roleName
            };

            let createPromise = this.iam.createRole(createParams).promise();

            createPromise
                .then((data: any) => {
                    roleRrn = data.Role.Arn;

                    // Add policy (chain the policy promise)

                    return this.putRolePolicy(roleName);
                })
                .then((data: any) => {
                    resolve(roleRrn);
                })
                .catch((err: Error) => {
                    reject(err);
                });
        });
    }

    /**
     * Find role, return arn in resolve
     *
     * @param roleName
     * @returns {Promise<T>}
     */
    public getRole(roleName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let getRolePromise = this.iam.getRole({"RoleName": roleName}).promise();

            getRolePromise
                .then((data: any) => {
                    // console.log("AWS role " + roleName + " already existed. ARN: " + data.Role.Arn);
                    resolve(data.Role.Arn);
                })
                .catch((err: any) => {
                    if (err.code === "NoSuchEntity") {
                        resolve(null); // return null arn if not found
                    }
                    else {
                        reject(err);
                    }
                });
        });
    }

    /**
     * Find role, return arn in resolve
     *
     * @param roleName
     * @returns {Promise<T>}
     */
    public deleteRole(roleName: string): Promise<string> {
        return new Promise((resolve, reject) => {

            this.deleteRolePolicy(roleName)
                .then ((data: any) => {
                    // console.log("AWS role " + roleName + "-access policy was deleted");
                    return this.iam.deleteRole({"RoleName": roleName}).promise();
                })
                .then ((data: any) => {
                    // console.log("AWS role " + roleName + " was deleted");
                    resolve(null);
                })
                .catch((err: any) => {
                    if (err.code === "NoSuchEntity") {
                        resolve(null); // return null arn if not found
                    }
                    else {
                        reject(err);
                    }
                });
        });
    }

    /**
     * Remove associated (<RoleName>-access) policy
     *
     * @param roleName
     * @returns {Promise<T>}
     */
    private deleteRolePolicy(roleName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let policyName = roleName + "-access";

            this.iam.deleteRolePolicy({"PolicyName": policyName, "RoleName": roleName}).promise()
                .then((data: any) => {
                    resolve(data);
                })
                .catch((err: any) => {
                    if (err.code === "NoSuchEntity") {
                        resolve(err.code); // return null arn if not found
                    }
                    else {
                        reject(err);
                    }
                });
        });
    }

    /**
     * Attach default policy to our lambda role
     *
     * For it's logging, but S3 access and dyname (permanent storage) would be a good idea.
     *
     * @param roleName
     * @returns {Promise<T>}
     */
    private putRolePolicy(roleName: string): Promise<string> {
        return new Promise((resolve, reject) => {

            let rolePolicy: any = {
                Version: "2012-10-17",
                Statement: [
                    {
                        Sid: "",
                        Action: [
                            "dynamodb:DeleteItem",
                            "dynamodb:GetItem",
                            "dynamodb:PutItem",
                            "dynamodb:Query",
                            "dynamodb:Scan",
                            "dynamodb:UpdateItem"
                        ],
                        Effect: "Allow",
                        Resource: "*"
                    },
                    {
                        Effect: "Allow",
                        Action: [
                            "logs:*"
                        ],
                        Resource: "arn:aws:logs:*:*:*"
                    },
                    {
                        Effect: "Allow",
                        Action: [
                            "s3:GetObject"
                        ],
                        Resource: "arn:aws:s3:::'$source_bucket'/*"
                    },
                    {
                        Effect: "Allow",
                        Action: [
                            "s3:PutObject"
                        ],
                        Resource: "arn:aws:s3:::'$target_bucket'/*"
                    }
                ]
            };

            let putRolePolicyParams: any = {
                PolicyDocument: JSON.stringify(rolePolicy, null, 2),
                PolicyName: roleName + "-access",
                RoleName: roleName
            };

            let putRolePromise = this.iam.putRolePolicy(putRolePolicyParams).promise();

            putRolePromise
                .then((data: any) => {
                    resolve(data);
                })
                .catch((err: Error) => {
                    reject(err);
                });
        });
    }

    public invokeLambda(functionName: string, payload: string): Promise<any> {
        return new Promise((resolve, reject) => {

            let params: any = {
                FunctionName: functionName,
                // ClientContext: JSON.stringify({"foo": "bar"}),
                InvocationType: "RequestResponse",
                LogType: "None",
                Payload: JSON.stringify(payload)
            };

            let invokePromise = this.lambda.invoke(params).promise();

            invokePromise
                .then((data: any) => {
                    resolve(data);
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
    }

    public deleteFunction(functionName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.lambda.deleteFunction({"FunctionName": functionName}).promise()
                .then((data: any) => {
                    resolve(data);
                })
                .catch((err: any) => {
                    if (err.code === "NoSuchEntity") {
                        resolve(err.code);
                    }
                    else {
                        reject(err);
                    }
                });
        });
    }
}
