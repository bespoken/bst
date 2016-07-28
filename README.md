Bespoken Tools (bst) - CLI Tools for Alexa Skills Development
====================

[![Build Status](https://travis-ci.org/bespoken/bst.svg?branch=master)](https://travis-ci.org/bespoken/bst) [![Coverage Status](https://coveralls.io/repos/github/bespoken/bst/badge.svg?branch=master)](https://coveralls.io/github/bespoken/bst?branch=master)

## Overview
The **bst** (aka Bespoken Tools aka the BEAST :smile: ) makes it easy to develop for Alexa/Echo.

The current version provides two commands - **proxy http** and **proxy lambda**.

These proxies make it super-easy to develop and debug your Alexa skill on your local machine.
Just point the bst at the local service running on your machine, and your code changes will be instantaneously available via Alexa.  

The proxies can work either with a service listening on a port (**proxy http**),  
or directly with a Lambda written with Node/JavaScript (**proxy lambda**).

It works by forwarding traffic from Alexa to our server, which in turns sends it to your machine.  
A Node ID that you designate is how we know which traffic should come to you.

Keep an eye out as we add more features and commands in the future. Current plans:  
- **deploy**: Automatically deploy Alexa Lambdas to the cloud with a single command
- **test**: Run phrases through and get the exact input sent to your Skill service

## Getting Started

Make sure you have NPM and node installed:
```
$ node --version && npm --version
```
We support node version `4.x.x` and above.  For help installing, see see [How To Install NPM](http://blog.npmjs.org/post/85484771375/how-to-install-npm)


Next, install the bespoken tools command line tool (bst):
```
$ npm install bespoken-tools -g
```
__Note:__ If you are on MacOS and the command fails, it is probably because you need to run it with sudo, like this:
```
$ sudo npm install bespoken-tools -g
```
Verify the installation by typing:
```
$ bst
```

## bst proxy Command

The proxy command allows you to interact with a local service running on your machine via an Alexa device.

### Your Node ID

You will need to determine a unique identifier to pass to **bst** so the bst server can identify which calls to point to your local machine.  It essentially allows any local HTTP service to be accessed via Alexa.

Your Node ID can be any unique alphanumeric string.

### $ proxy http
**Overview**  
Proxy http allows you to interact with a local service running on your machine (on a port) via an Alexa device.

**Usage**  
Syntax:
```
$ bst proxy http <NODE_ID> <PORT>
```

Example:
```
$ bst proxy http JPK 9999
```

The `<NODE_ID>` value, "JPK", is the name for your machine.

The second parameter, `<PORT>`, represents the port that your local Alexa service is listening on.  Set this to whatever port your local server is running on. All traffic coming from Alexa will be forwarded to it.

You can learn more here at our [JAVA Tutorial](https://github.com/XappMedia/bst/blob/master/docs/TUTORIAL_JAVA.md)

### $ proxy lambda (Experimental)
**Overview**  
The proxy lambda command allows you to run a Lambda as a local service your machine.

**Note**
- The command currently only supports Node Lambdas.
- The command **must** be restarted after changes are made to your Lambda.

**Usage**  
To use it, invoke it with the full path to the Lambda file to run, along with your machine's Node ID.

The Lambda will automatically be passed the incoming request.

Syntax:
```
$ bst proxy lambda <NODE_ID> <FULL_PATH_TO_LAMBDA>
```

Example:  
```
$ bst proxy lambda JPK /Users/jpk/dev/samples/src/index.js
```

You can learn more here at our [NODE Tutorial](https://github.com/XappMedia/bst/blob/master/docs/TUTORIAL_NODE.md):

## $ proxy urlgen

**Overview**

Your skill must be setup to point at our server. For example, if the URL for your skill is normally:
```
https://myskill.example.com/skillA
```

It should instead be configured to point at the bst server, like so:
```
https://bst.xappmedia.com/skillA?node-id=JPK
```

_Also note that the Node ID set with the proxy command must be passed in the query string.  This is what ties off your local proxy with our server._

The rest of the URL path and query string should be unchanged.

For more information on configuring your Skill see [Skill Configuration](https://github.com/XappMedia/bst/blob/master/docs/SKILL_CONFIGURATION.md).

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


## Questions/Feedback?
Email jpk@xappmedia.com with any questions or comments. We love to hear feedback.
