[![Build Status](https://travis-ci.org/bespoken/bst.svg?branch=master){: class="badge" }](https://travis-ci.org/bespoken/bst) [![Coverage Status](https://coveralls.io/repos/github/bespoken/bst/badge.svg?branch=master){: class="badge" }](https://coveralls.io/github/bespoken/bst?branch=master) [![npm version](https://img.shields.io/npm/v/bespoken-tools.svg){: class="badge" }](https://www.npmjs.com/package/bespoken-tools) [![Read the Docs](https://img.shields.io/badge/docs-latest-brightgreen.svg?style=flat){: class="badge" }](http://docs.bespoken.tools/) [![Stories in Ready](https://badge.waffle.io/bespoken/bst.svg?label=ready&title=Ready){: class="badge" }](http://waffle.io/bespoken/bst) [![Join the chat at https://gitter.im/bespoken/bst](https://badges.gitter.im/bespoken/bst.svg){: class="badge" }](https://gitter.im/bespoken/bst?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Overview
The **bst** (aka Bespoken Tools) makes it easy to develop for Alexa/Echo.  

We call it working in BEAST mode - rampage through code/test iterations as Alexa requests are sent **directly** to your laptop.
Do not slow-down for:  
* Time-consuming server deployments
* Over-complicated and error-prone packaging scripts
* Seemingly-innocuous-but-still-pesky service restarts

The current version provides three commands - **proxy http**, **proxy lambda** and **speak**.

The proxies make it super-easy to develop and debug your Alexa skill on your local machine.
Just point the bst at the local service running on your machine, and your code changes will be instantaneously available via Alexa.  

The proxies can work either with a service listening on a port (**proxy http**),  
or directly with a Lambda written with Node/JavaScript (**proxy lambda**).

The **speak** command simulates the Alexa service by sending any utterance from the command-line to your service.  
The request sent to your service is a properly formatted intent request.  
It then prints out the JSON payload returned by your service.

Keep an eye out as we add more features and commands in the future. Current plans:  
- **deploy**: Automatically deploy Alexa Lambdas to the cloud with a single command

## Installation

Using NPM:

```bash
$ npm install bespoken-tools -g
```

For additional help, see [Getting Started](/getting_started)

## bst proxy Command

The proxy command allows you to interact with a local service running on your machine via an Alexa device.  

Read the docs [here](/commands/proxy).

## bst speak Command

The speak command generates intent requests for your service as if they were coming from Alexa itself.  
It works in a manner very similar to the Alexa simulator available via the Alexa developer console.  

Read the docs [here](/commands/speak).

## Tutorials

* [Nodejs Lambda Tutorial](/tutorials/tutorial_lambda_nodejs)
* [Java Server Tutorial](/tutorials/tutorial_local_server_java)

## Questions/Feedback?

Talk to us on [Gitter](https://gitter.im/bespoken/bst), also feel free to open an [issue](https://github.com/bespoken/bst/issues/new) for a bug or feature request.

We love to hear feedback.
