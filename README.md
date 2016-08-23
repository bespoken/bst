Bespoken Tools (bst) - CLI Tools for Alexa Skills Development
====================

[![Build Status](https://travis-ci.org/bespoken/bst.svg?branch=master)](https://travis-ci.org/bespoken/bst) [![Coverage Status](https://coveralls.io/repos/github/bespoken/bst/badge.svg?branch=master)](https://coveralls.io/github/bespoken/bst?branch=master) [![npm version](https://img.shields.io/npm/v/bespoken-tools.svg)](https://www.npmjs.com/package/bespoken-tools)
[![Stories in Ready](https://badge.waffle.io/bespoken/bst.svg?label=ready&title=Ready)](http://waffle.io/bespoken/bst)

## Overview
The **bst** (aka Bespoken Tools aka the BEAST) makes it easy to develop for Alexa/Echo.

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



## Questions/Feedback?
Email jpk@xappmedia.com with any questions or comments. We love to hear feedback.
