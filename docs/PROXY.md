bst proxy
=========

## Overview
The proxy command allows you to interact with a local service running on your machine via an Alexa device.  
Using it, you can make changes to code running on your machine and immediately make them available via an Echo or the Alexa simulator.

### $ proxy lambda
**Overview**  
The proxy lambda command allows you to run a Lambda as a local service your machine.

**Note**
- The command currently only supports Node Lambdas.

**Usage**  
To use it, invoke it with the Lambda file to run.  
The proxy will automatically use the latest code in your working directory.

Syntax:
```
$ bst proxy lambda <PATH_TO_LAMBDA>
```

Example:  
```
$ bst proxy lambda index.js
```

You can learn more here at our [NODE Tutorial](https://github.com/bespoken/bst/blob/master/docs/TUTORIAL_NODE.md):

### $ proxy http
**Overview**  
Proxy http allows you to interact with a local service running on your machine (on a port) via an Alexa device.

**Usage**  
Syntax:
```
$ bst proxy http <PORT>
```

Example:
```
$ bst proxy http 9999
```

The <PORT> parameter represents the port that your local Alexa service is listening on.  Set this to whatever port your local server is running on. All traffic coming from Alexa will be forwarded to it.

You can learn more here at our [JAVA Tutorial](https://github.com/bespoken/bst/blob/master/docs/TUTORIAL_JAVA.md)


## $ proxy urlgen

**Overview**

Your skill must be setup to point at our server. For example, if the URL for your skill is normally:
```
https://myskill.example.com/skillA
```

It should instead be configured to point at the bst server, like so:
```
https://proxy.bespoken.tools/skillA?node-id=JPK
```

_Note the Node ID set with the proxy command must be passed in the query string.  This is what ties off your local proxy with our server._

The rest of the URL path and query string should be unchanged.

For more information on configuring your Skill see [Skill Configuration](https://github.com/bespoken/bst/blob/master/docs/SKILL_CONFIGURATION.md).

**Usage**

The proxy urlgen command can help generate the endpoint.

Syntax:
```
$ bst proxy urlgen <NODE_ID> <URL>
```

Example:
```
$ bst proxy urlgen JPK https://myskill.example.com/skillA
```

The above example command will then provide you with HTTPS Endpoint that is required during the configuration step when you setup your Alexa Skill.
