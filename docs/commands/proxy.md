
## Overview
The proxy command allows you to interact with a local service running on your machine via an Alexa device.  Using it, you can make changes to code running on your machine and immediately make them available via an Echo or the Alexa simulator.

The proxy tool works either directly with Node/JavaScript lambda code - **proxy lambda**.  Or it can proxy any http service using **proxy http**.  

The two commands are described below, as well as the urlgen helper command.

## bst proxy lambda

**Overview**  

The proxy lambda command allows you to run a Lambda as a local service your machine.

**Note**

- The command currently only supports Node/JavaScript Lambdas.

**Usage**  

To use it, invoke it with the Lambda file to run.  The proxy will automatically use the latest code in your working directory.

Syntax:
```bash
$ bst proxy lambda <PATH_TO_LAMBDA>
```

Example:  
```bash
$ bst proxy lambda index.js
```

You can learn more here at our [Node.js Tutorial](/tutorials/tutorial_lambda_nodejs):

## bst proxy http

**Overview**  

Proxy http allows you to interact with a local service running on your machine (on a port) via an Alexa device.

**Usage**  

The proxy http command takes one command, the <PORT> that your local Alexa service is listening on.  All traffic coming from Alexa will be forwarded to it.

Syntax:
```bash
$ bst proxy http <PORT>
```

Example:
```bash
$ bst proxy http 9999
```

You can learn more here at our [Java Tutorial](/tutorials/tutorial_local_server_java)

**Options**

The `--verbose` flag will print out the requests and responses from all calls made to your skill.

To use it, just start up the proxy with:
```bash
$ bst proxy http 9999 --verbose
```


## bst proxy function

**Overview**

The proxy function command allows you to run a Google Cloud Function as a local service your machine.

**Usage**

To use it, invoke it with the Cloud Function file to run.  The proxy will automatically use the latest code in your working directory.

Syntax:
```bash
$ bst proxy function <FUNCTION_FILE> <FUNCTION_NAME>
```

Example:
```bash
$ bst proxy function index.js myFunction
```