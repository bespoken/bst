<p align="center">
  <a href="https://bespoken.tools/">
    <img alt="BST" src="https://bespoken.tools/assets/bst-cli-9f9b8d685e450d33985b23d86505ffd7217635305f126625bc992b0865ff7a4d.png" width="546">
  </a>
</p>

<p align="center">
  Switch to BEAST mode<br>
  Rampage through code/test iterations for Alexa development
</p>

<p align="center">
    <a href="https://travis-ci.org/bespoken/bst">
        <img alt="Build Status" class="badge" src="https://travis-ci.org/bespoken/bst.svg?branch=master">
    </a>
    <a href="https://coveralls.io/repos/github/bespoken/bst/badge.svg?branch=master">
        <img alt="Coverage Status" class="badge" src="https://coveralls.io/github/bespoken/bst?branch=master">
    </a>
    <a href="https://coveralls.io/repos/github/bespoken/bst/badge.svg?branch=master">
        <img alt="NPM Version" class="badge" src="https://img.shields.io/npm/v/bespoken-tools.svg">
    </a>
    <a href="http://docs.bespoken.tools/">
        <img alt="Read The Docs" class="badge" src="https://img.shields.io/badge/docs-latest-brightgreen.svg?style=flat">
    </a>
    <a href="https://gitter.im/bespoken/bst?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge">
        <img alt="Read The Docs" class="badge" src="https://badges.gitter.im/bespoken/bst.svg">
    </a>
</p>

---
# Overview
With Bespoken Tools, develop faster and better. Do not slow-down for:

* Time-consuming server deployments
* Over-complicated and highly manual testing routines
* Complex ffmpeg encoding and configuration

With Bespoken tools, build high-quality, faster.

The command-line tools include:

* [Deploy](http://docs.bespoken.tools/en/latest/commands/deploy) - One-command deployment of Lambda functions  
* [Proxy](http://docs.bespoken.tools/en/latest/commands/proxy) - Easily debug Alexa requests by having them send directly to your laptop  
* [Speak](http://docs.bespoken.tools/en/latest/commands/speak) and [Intend](http://docs.bespoken.tools/en/latest/commands/intend) - Send intents and utterances to your Alexa skill

The library provides:

* [BSTAlexa](http://docs.bespoken.tools/en/latest/api/classes/bstalexa.html) - Alexa emulator for unit-testing and functional-testing of your skills
* [BSTEncode](http://docs.bespoken.tools/en/latest/api/classes/bstencode.html) - Encodes audio files for use in SSML without pesky ffmpeg
* [Logless](http://docs.bespoken.tools/en/latest/api/classes/logless.html) - Completely painless, serverless logging

# Installation

For use of the CLI:

```bash
$ npm install bespoken-tools -g
```

For use of the Bespoken Tools library (including Logless and the Emulator):

```bash
$ npm install bespoken-tools --save
```

For additional help, see [Getting Started](http://docs.bespoken.tools/en/latest/getting_started)

# Tutorials

* [Nodejs Lambda Tutorial](http://docs.bespoken.tools/en/latest/tutorials/tutorial_lambda_nodejs)
* [Java Server Tutorial](http://docs.bespoken.tools/en/latest/tutorials/tutorial_local_server_java)
* [Python & Flask-Ask](http://docs.bespoken.tools/en/latest/tutorials/tutorial_flask_ask_python)
* [Alexa Emulator Tutorial - Node.js](http://docs.bespoken.tools/en/latest/tutorials/tutorial_bst_emulator_nodejs)

## Questions/Feedback?

Talk to us on [Gitter](https://gitter.im/bespoken/bst), also feel free to open an [issue](https://github.com/bespoken/bst/issues/new) for a bug or feature request.

We love to hear feedback.
