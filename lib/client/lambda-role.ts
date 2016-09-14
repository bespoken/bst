import {LambdaConfig} from "./lambda-config";

const aws = require("aws-sdk");

/**
 * Create AWS roles for the lambdas
 */
export class LambdaRole {
    private iam: any = null;

    public constructor() {
        let aws_security = {
            accessKeyId: LambdaConfig.AWS_ACCESS_KEY_ID,
            secretAccessKey: LambdaConfig.AWS_SECRET_ACCESS_KEY,
        };

        aws.config.update(aws_security);

        this.iam = new aws.IAM({
            apiVersion: "2016-03-01"
        });
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
                    console.log("AWS role " + roleName + " already existed. ARN: " + data.Role.Arn);
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
}
