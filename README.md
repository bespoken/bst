[![Build Status](https://travis-ci.org/bespoken/bst.svg?branch=master)](https://travis-ci.org/bespoken/bst) [![Coverage Status](https://coveralls.io/repos/github/bespoken/bst/badge.svg?branch=master)](https://coveralls.io/github/bespoken/bst?branch=master)


# Overview
The **bst** (aka Bespoken Tools aka the BEAST :-)) makes it easy to develop for Alexa/Echo.
  
The current version provides two commands - **proxy http** and **proxy lambda**.  
These proxies make it super-easy to develop and debug your Alexa skill on your local machine.  
Just point the bst at the local service running on your machine, and your code changes will be instantaneously available via Alexa.  
  
The proxies can work either with a service listening on a port (**proxy http**),  
or directly with a Lambda written with Node/JavaScript (**proxy lambda**).
  
It works by forwarding traffic from Alexa to our server, which in turns sends it to your machine.  
A node ID that you designate is how we know which traffic should come to you.    

Keep an eye out as we add more features and commands in the future. Current plans:  
-Deploy: automatically deploy Alexa lambdas to the cloud with a single command  
-Test: run phrases through and get the exact input sent to your Skill service

# Getting Started
Install NPM (if not already):  
http://blog.npmjs.org/post/85484771375/how-to-install-npm

Install bespoken-tools:
`npm install bespoken-tools -g`

If you are on MacOS and the command fails, it is probably because you need to run it with sudo, like this:  
`sudo npm install bespoken-tools -g`

Ensure you have a compatible version of node installed.  
We support node version 4.x.x and higher. Check by entering:  
`node --version`

# Available Commands
## Proxy HTTP
**Overview**  
Proxy allows you to interact with a local service running on your machine (on a port) via an Alexa device.  

It essentially allows any local HTTP service to be accessed via Alexa.

**Usage**  
To use, it simply type in the following command:  
`bst proxy http <NODE_ID> <PORT>`

For example:  
`bst proxy http JPK 9999`

The node ID value, "JPK", is the name for your machine. It uniquely identifies it to our server.
We use this so we know which calls from Alexa to forward to your machine.

The second parameter, port, represents the port that your local Alexa service is listening on.

Set this to whatever port your local server is running on. All traffic coming from Alexa will be forwarded to it.

You can learn more here:  
https://github.com/XappMedia/bst/blob/master/TUTORIAL_JAVA.md

## Proxy Lambda (Experimental)
**Overview**  
The proxy lambda command allows you to run a lambda as a local service your machine.

The command currently only supports Node Lambdas.

**Usage**  
To use it, invoke it with the full path to the Lambda file to run, along with your machine's node-id.

The Lambda will automatically be passed the incoming request.

Syntax:  
`bst proxy lambda <NODE_ID> <FULL_PATH_TO_LAMBDA>`

Example:  
`bst proxy lambda JPK /Users/jpk/dev/samples/src/index.js`

You can learn more here:  
https://github.com/XappMedia/bst/blob/master/TUTORIAL_NODE.md

## Skill Configuration For Proxies
Your skill must be setup to point at our server. For example, if the URL for your skill is normally:  
https://myskill.example.com/skillA

It should instead be configured to point at the bst server, like so:  
https://bst.xappmedia.com/skillA?node-id=JPK

_Also note that the node ID set with the proxy command must be passed in the query string_  
This is what ties off your local proxy with our server.  

The rest of the URL path and query string should be unchanged.

You can enter the following command for help transforming your URL:  
`bst proxy urlgen <NODE_ID> <URL>`

This value should be entered as the endpoint on the Configuration section for your Alexa skill.

# Questions/Feedback?
Email jpk@xappmedia.com with any questions or comments. We love to hear feedback.