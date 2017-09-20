<p align="center">
  <a href="https://bespoken.io/">
    <img alt="BST" src="https://bespoken.io/wp-content/uploads/Bespoken-Logo-RGB-e1500333659572.png" width="546">
  </a>
</p>

<p align="center">
  Switch to BEAST mode<br>
  Rampage through code/test iterations for Alexa and Lambda development
</p>

<p align="center">
    <a href="https://travis-ci.org/bespoken/bst">
        <img alt="Build Status" class="badge" src="https://travis-ci.org/bespoken/bst.svg?branch=master">
    </a>
    <a href="https://codecov.io/gh/bespoken/bst">
      <img src="https://codecov.io/gh/bespoken/bst/branch/master/graph/badge.svg" alt="Codecov" />
    </a>
    <a href='https://coveralls.io/github/bespoken/bst?branch=master'>
        <img src='https://coveralls.io/repos/github/bespoken/bst/badge.svg?branch=master' alt='Coverage Status' />
    </a>
    <a href="https://www.npmjs.com/package/bespoken-tools">
        <img alt="NPM Version" class="badge" src="https://img.shields.io/npm/v/bespoken-tools.svg">
    </a>
    <a href="http://docs.bespoken.io/">
        <img alt="Read The Docs" class="badge" src="https://img.shields.io/badge/docs-latest-brightgreen.svg?style=flat">
    </a>
    <a href="https://gitter.im/bespoken/bst?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge">
        <img alt="Read The Docs" class="badge" src="https://badges.gitter.im/bespoken/bst.svg">
    </a>
</p>

---
# Overview
With Bespoken, develop faster and better. Do not slow-down for:

* Time-consuming server deployments
* Over-complicated and highly manual testing routines
* Complex ffmpeg encoding and configuration

The command-line tools include:

* [Proxy](http://docs.bespoken.io/en/latest/commands/proxy) - Easily debug Alexa requests by having them send directly to your laptop
* [Launch](http://docs.bespoken.io/en/latest/commands/launch) - Send a Launch Request to your Alexa skill
* [Utter](http://docs.bespoken.io/en/latest/commands/utter) and [Intend](http://docs.bespoken.io/en/latest/commands/intend) - Send intents and utterances to your Alexa skill
* [Speak](http://docs.bespoken.io/en/latest/commands/speak) - Send a request directly an Alexa Virtual Device - uses the "real" Alexa! Magic!
* [Deploy](http://docs.bespoken.io/en/latest/commands/deploy) - One-command deployment of Lambda functions

The library provides:

* [BSTAlexa](http://docs.bespoken.io/en/latest/api/classes/bstalexa.html) - Alexa emulator for unit-testing and functional-testing of your skills
* [BSTEncode](http://docs.bespoken.io/en/latest/api/classes/bstencode.html) - Encodes audio files for use in SSML without pesky ffmpeg
* [Logless](http://docs.bespoken.io/en/latest/api/classes/logless.html) - Completely painless, serverless logging

# Installation

For use of the CLI:

```bash
$ npm install bespoken-tools -g
```

For use of the Bespoken library (including Logless and the Emulator):

```bash
$ npm install bespoken-tools --save
```

For additional help, see [Getting Started](http://docs.bespoken.io/en/latest/getting_started)

## Tutorials For Alexa Skills
* [Nodejs Lambda Tutorial](http://docs.bespoken.io/en/latest/tutorials/tutorial_lambda_nodejs)
* [Java Server Tutorial](http://docs.bespoken.io/en/latest/tutorials/tutorial_local_server_java)
* [Python & Flask-Ask](http://docs.bespoken.io/en/latest/tutorials/tutorial_flask_ask_python)
* [Alexa Emulator Tutorial - Node.js](http://docs.bespoken.io/en/latest/tutorials/tutorial_bst_emulator_nodejs)

## Tutorials For Actions on Google
* [With Cloud Functions](http://docs.bespoken.io/en/latest/tutorials/tutorial_cloud_function)
* [With API.AI](http://docs.bespoken.io/en/latest/tutorials/tutorial_configuring_api_ai)

## Tutorials For General Lambdas
* [Running Lambdas Locally](http://docs.bespoken.io/en/latest/tutorials/tutorial_lambda_local)
* [Debugging Lambdas Locally](http://docs.bespoken.io/en/latest/tutorials/tutorial_lambda_debugger)
* [Deploying Lambdas](http://docs.bespoken.io/en/latest/tutorials/tutorial_lambda_deploy)

## Questions/Feedback?

Talk to us on [Gitter](https://gitter.im/bespoken/bst), also feel free to open an [issue](https://github.com/bespoken/bst/issues/new) for a bug or feature request.

We love to hear feedback.
