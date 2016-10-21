
## Overview
The deploy command allows you to install and update a Node/JavaScript lambda skill in the AWS cloud. 
You can make changes to your code and quickly install it to see if it works on your device (like an Echo).

The command is described below.

## bst deploy lambda


**Overview**  

The deploy lambda command allows you to deploy a Node/JavaScript lambda function to AWS


**Notes**

- The command currently only supports Node/JavaScript Lambdas and only works on OS X and Linux
- You need to have an AWS account with appropriate privileges and credentials
- Considering the options and complexity of the Amazon web services, this tool wasn't meant to be a production deploy tool,
  but it will help you to quickly verify your skill on the device
- `npm` and `zip` commands need to be installed and seen in your $PATH. On OS X the zip is installed by default. 
  On Linux you may have to install it, depending on your distribution. 


**Usage**  

To use it, invoke it with a Node/JavaScript Lambda project folder to install.

Syntax:
```bash
$ bst deploy lambda <PATH_TO_LAMBDA_PROJECT>
```

Example:  
```bash
$ bst deploy lambda ../test/resources/deployProject
```

You can learn more here at our [Node.js Tutorial](/tutorials/tutorial_lambda_nodejs):


**Options**

The `--verbose` flag will print out a more detailed chit-chat about what's happening.

To use it, just start up the command with

```bash
$ bst deploy lambda ../test/resources/deployProject --verbose
```

With the `--lambdaName` option you can name your lambda function. By default the tool will use your folder name.

To use it, just start up the command with

```bash
$ bst deploy lambda ../test/resources/deployProject --lambdaName BestSkillEver
```

The function will be named BestSkillEver instead of the deployProject. 


**Configuration**

Installing a lambda requires the creation of a few extras, like an IAM role with policy. Also you need to specify a few other things.
This tool is a quick test tool, it will install the function with some reasonable parameters. You can tweak a them
in the BST configuration file (.bst/config in your home folder). BST tools will create the config file for you at the first run. 
It is a JSON file. It looks like this below. This command uses the `lambdaDeploy` section of the file.


```
{
    "nodeID": "fdd376c8-3d3e-4a48-8b74-4d80a11924af",
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

Again, this tool is to get you going quickly with your lambda function, so the configuration parameters are far from the available
tweaks AWS offers. The fields are self explanatory (I hope).


**Notes about AWS**

- The command will try to use your credentials from the usual AWS config folder (.aws/credentials in your home folder). 
If you installed the aws command line tools you probably already have it.
Alternatively you can set the `AWS_SECRET_ACCESS_KEY` and `AWS_ACCESS_KEY_ID` shell environment variables to provide the keys.

- The command will create automatically a basic role for your Lambda function (a role your lambda assumes when it runs). 
This role has access to Dynamo for persistence, AWS logs and S3. If you need more, add more policies or use your own role in BST config above.


**Notes about the Lambda project folder**

- The tool uses `npm` and `zip` under the hood to package your project. Make sure your project follows the conventions 
of the Node.js projects. With --verbose you can see the actual zip file path that was deployed to AWS. 
Take a peek inside to make sure you have all the pieces (dependencies for instance) if your lambda function doesn't work.
