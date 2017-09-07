
This tutorial shows you how to use the Bespoken tools to test and deploy your Node.js AWS Lambdas.
It will also show you how to install a Lambda that will access resources inside your private VPC.

## Use case
We would like to create an Alexa skill that tells random quotes from famous people.
I'm sure nobody thought about this before...

We will try two versions. A simple skill that chooses a random quote from a static array. 
To make it more interesting, later we will pull the quotes from a local AWS resource, a REST service with Mongo 
we installed on an EC2 instance. 

## Prerequisites

### Install bst

```bsh
$ npm install bespoken-tools -g
```

[Full Installation Instructions](/getting_started/)

### AWS Privileges 

Make sure you have the privileges to manage Lambdas on AWS. Ok, it's obvious, I know...

You will need AWS access keys - the secret access key and the access key id.
If you have the AWS command line tools installed, you probably already have these keys in the ~/.aws/credentials file.
Installing the AWS CLI is not required, but it is very useful. 

Alternatively you can set these two shell environment variables with the respective values.

```shell
$ export AWS_SECRET_ACCESS_KEY=...
$ export AWS_ACCESS_KEY_ID=...
```

*Note*
It's not the scope of this tutorial to pontificate about security, but please don't use your root AWS credentials!

### Zip

You may need to install `zip` depending on your operating system. It's needed for packaging the Lambdas.

## Creating The Lambda Skill

The sources for this demo are [here](https://github.com/bespoken/deploy-vpc-demo). Feel free to clone the repo.

There are two folders. The `quote-server-mongo` is a simple express REST service with Mongo. 
We will use that for the backend later. If you want to try the demo end-to-end, then copy the code to your
EC2 instance. Simple instructions to run the service are in the README.md file.

The actual skill Lambda is in the `quote-skill` folder. Navigate to the folder and run

```shell
npm install
```

**Important**
Your project have to follow the node.js conventions. That is you need a package.json in top the level folder.

Now let's take a peek into index.js. That is our Lambda. Very simple skill, 
wired to fetch the quotes from a static array by default.

We used Matt Kruse's [excellent SDK](https://github.com/matt-kruse/alexa-app).

```javascript
var Alexa = require('alexa-app');
var skill = new Alexa.app('randomquote');

var dataProvider = require('./dataProviderStatic');

skill.launch(function(request, response) {
    response
        .say("<speak>Greetings! You can say random quote to hear a quote.</speak>")
        .reprompt("<speak>No kidding! Just say it!</speak>")
        .shouldEndSession(false);
});

skill.intent('RandomQuote',
    {
        "utterances": [
            "Tell me a Quote",
            "Random Quote"
        ]
    },
    function(request, response) {
        dataProvider.findItem(function(quote) {
            if (quote) {
                response
                    .say("<speak> " + quote.author + " said once " + quote.text + " </speak>")
                    .reprompt("<speak>You can say random quote to hear a quote.</speak>")
                    .shouldEndSession(false).send();
            } else {
                response
                    .say("<speak>We have a database connection error. Sorry!</speak>")
                    .shouldEndSession(true).send();
            }
        });

        // Async (!)
        return false;
    }
);

// Expose the handler
exports.handler = skill.lambda();
```

## Kick the tires with BST

Start the BST proxy to expose the Lambda for the BST tools.

```shell
$ cd quote-skill/
$ bst proxy lambda index.js 
BST: v1.0.4  Node: v6.3.0

Your public URL for accessing your local service:
https://your-proxy.bespoken.link

INFO  2016-11-04T01:32:01.139Z LambdaServer started on port: 10000
INFO  2016-11-04T01:32:01.250Z Connected - proxy.bespoken.tools:5000
```

Now let's "tell" something to our skill. From another shell session run the BST `speak` command!

"random qoute" is one of the sample utterances. The command prints out the matching request (intent) and the response. 
No need to go to the Amazon Alexa UI to do basic tests. 

You can read more about the `bst speak` command [here](/commands/speak/)

```shell
$ bst speak random quote
BST: v1.0.4  Node: v6.3.0

Intent: RandomQuote Session: null
INFO  2016-11-04T01:35:10.096Z CALLING: IntentRequest
Spoke: random quote

Request:
{
    "request": {
        "type": "IntentRequest",
        "locale": "en-US",
        "requestId": "amzn1.echo-api.request.5c3e96b6-0de7-4b7c-9537-95bc7b17b03a",
        "timestamp": "2016-11-04T01:35:10Z",
        "intent": {
            "name": "RandomQuote"
        }
    },
    "context": {
        "System": {
            "application": {
                "applicationId": "amzn1.echo-sdk-ams.app.1a5e4446-234c-4dcf-84fb-05198a631305"
            },
            "device": {
                "supportedInterfaces": {
                    "AudioPlayer": {}
                }
            },
            "user": {
                "userId": "amzn1.ask.account.4f906b29-d5e5-4c42-adfc-d6c8d2fc6a9c"
            }
        },
        "AudioPlayer": {
            "playerActivity": "IDLE"
        }
    },
    "version": "1.0",
    "session": {
        "sessionId": "SessionID.5e17be6c-be98-48e0-aa35-038e94d3e13e",
        "application": {
            "applicationId": "amzn1.echo-sdk-ams.app.1a5e4446-234c-4dcf-84fb-05198a631305"
        },
        "user": {
            "userId": "amzn1.ask.account.4f906b29-d5e5-4c42-adfc-d6c8d2fc6a9c"
        },
        "new": true,
        "attributes": {}
    }
}

Response:
{
    "version": "1.0",
    "sessionAttributes": {},
    "response": {
        "shouldEndSession": false,
        "outputSpeech": {
            "type": "SSML",
            "ssml": "<speak>Yogi Berra said once I never said half the things I said.</speak>"
        },
        "reprompt": {
            "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>You can say random quote to hear a quote.</speak>"
            }
        }
    }
}
```

If something isn't right, you can debug the skill locally with BST. 
You can step through your code using your favorite IDE. [Follow this tutorial](/tutorials/tutorial_lambda_debugger)
to learn how easy that is.

## Install the Lambda

Everything meant to be easy with BST. The installation is no exception. BST has a "one line deployer" feature.

All you have to do is running the following command. The last parameter is the path to the Lambda project.
It could be relative or absolute path.

```shell
$ bst deploy lambda . 
INFO  2016-11-04T00:22:31.654Z No configuration. Creating one: /Users/opendog/.bst/config
BST: v1.0.4  Node: v6.3.0

We named your lambda function quote-skill (same as the project folder)
We created a AWS role for your lambda and called it lambda-bst-execution. You are welcome!
Note that this lambda execution role is very basic. You may have to customize it on the AWS console!
Waiting for AWS to propagate the changes
Waiting for AWS to propagate the changes
Zip file(s) done uploading.
Enter this ARN(s) on the Configuration tab of your skill:

	arn:aws:lambda:us-east-1:6376:function:quote-skill

$ 
```

What happened? 

- The tool created (or updated if it existed) the BST configuration file in `~/.bst` where you can tweak the install parameters later
- Created a role called `lambda-bst-execution` for your Lambda with an associated basic policy
- Packaged and uploaded your Lambda to AWS

You can ask BST to give a specific name to the function with the `--lambdaName` option.
Otherwise the tool uses the folder name. 

At the end BST handed you over the `arn` to setup your Lambda skill on the Alexa setup UI.

That was it! You can now modify your code and call the `bst deploy` command again the same way. BST will update your Lambda.

## Customization

### Config file

Let's take a look at the BST config file I mentioned before. It looks like this:

```json
{
    "nodeID": "bdd4aad4-2339-4e85-aa33-2bbcd2e03168",
    "lambdaDeploy": {
        "runtime": "nodejs4.3",
        "role": "lambda-bst-execution",
        "handler": "index.handler",
        "description": "My BST lambda skill",
        "timeout": 3,
        "memorySize": 128,
        "vpcSubnets": "",
        "vpcSecurityGroups": "",
        "excludeGlobs": "event.json"
    }
}
```

You can tailor these parameters as you wish. They are similar to the AWS API parameters except the `excludeGlobs`.
The `excludeGlobs` is a comma delimited list of files and folders that you can exclude from the packaged lambda.
Things you don't need at runtime.

The `nodeID` is used by the BST proxy to expose your Lambda or local http endpoint on the public internet.

### Lambda role

The `lambda-bst-execution` role only has the basics. Access rights to logging, S3 (put, get) and Dynamo (persistent storage).
If you need more access rights, you will have to modify it on the AWS console.

This is the default policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "",
            "Action": [
                "dynamodb:DeleteItem",
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:UpdateItem"
            ],
            "Effect": "Allow",
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:*"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::'$source_bucket'/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::'$target_bucket'/*"
        }
    ]
}
```

## Local resources within your VPC

Lambdas should be written in a stateless manner. This means we cannot maintain a connection pool to a database.
One solution is a REST microservice that looks up the data for you.

This is what our little Express application does. I have already installed it on an EC2 instance (no kidding)
and it's eagerly listening on port 3000.

### Modify the skill code

To pull the quotes from our REST service just change the data provider import line in the skill (`index.js`)
from 
```javascript
var dataProvider = require('./dataProviderStatic');
```
to
```javascript
var dataProvider = require('./dataProvider');
```

Also change the REST server IP address and port in the data provider (`dataProvider.js`).

### Add VPC subnet and security group to you Lambda function

Before our Lambda can access private VPC resources we need a few things.

#### We need to update the policy on the Lambda execution role 

By default BST does not grant access to ENI (elastic network interface) functions. 
Future will tell if this is a bug or a feature, but for now you have to add it manually.
The reason is security. I'm open for a debate.

**Important**
You need to add ENI access to the policy on the **Lambda execution role**, 
not on the role of the entity that installs the Lambda!

Go to the `IAM > Roles` menu on the AWS console and select `lambda-bst-execution`,
and edit the policy. It's called `lambda-bst-execution-access` by default. 

Add this to the JSON array and save:

```json
        {
            "Effect": "Allow",
            "Resource": "*",
            "Action": [
                "ec2:CreateNetworkInterface",
                "ec2:DeleteNetworkInterface",
                "ec2:DescribeNetworkInterfaces"
            ]
        }
```

#### We also need the subnet id of our server's EC2 instance and a security group id

**Important**
We need the ids not the names!

The vpc subnet id is the `Subnet ID` field on the EC2 instance detail page. It starts with `subnet-`

To find the security group id, click on the security group on the EC2 instance detail page (on the right). 
If you used the AWS wizard to spin up the instance, the name will be something like `launch-wizard-1`.
You can use that group. The id starts with `sg-`. 

It probably already has the ssh (22) port open. Let's add our server port, the 3000.

<img src='../../assets/images/add-tcp-3000.png' />

Add the ids to the BST config file in `~/.bst/config` like this:

```json
{
    "nodeID": "fdd376c8-3d3e-74-41924af",
    "lambdaDeploy": {
        "runtime": "nodejs4.3",
        "role": "lambda-bst-execution",
        "handler": "index.handler",
        "description": "My BST lambda skill",
        "timeout": 3,
        "memorySize": 128,
        "vpcSubnets": "subnet-e6dcb",
        "vpcSecurityGroups": "sg-c66b7",
        "excludeGlobs": "event.json"
    }
}
```


## Update the Lambda

The Lambda function code update is easy with BST. The same command will update the Lambda. 
From the Lambda project folder run this:

```shell
$ bst deploy lambda . 
BST: v1.0.4  Node: v6.3.0

We named your lambda function quote-skill (same as the project folder)
Re-using existing BST lambda role.
Zip file(s) done uploading.
Enter this ARN(s) on the Configuration tab of your skill:

	arn:aws:lambda:us-east-1:876:function:quote-skill

$ 
```

I hope this was helpful. If you have any questions or problems with this tutorial 
you can email me at bela@opendog.org.
