# Notes on setup

## Setting up typescript with Mocha
Got some info here:  
http://jonnyreeves.co.uk/2015/hello-typescript-and-mocha/

### Install typings to get TypeScript definitions for libraries
npm install typings --global

### Run npm install to setup packages
npm install

## Getting WebStorm working correctly with TSC
Go To preferences
Enable typescript compiler
Point WebStorm at the node_modules/typescript/lib directory for the TypeScript compiler
Use tsconfig.json settings

### Setting up Javascript
Set the project preferences to ECMAScript 6

## Publishing to NPM
Need to do this the first time to publish:
`npm adduser`

Updated the version number:
`npm version patch`

Run publish command to push new client to NPM:
`npm publish`

To test your new package before publishing, follow these instructions:  
https://docs.npmjs.com/misc/developers

## Deploying server versions
Deploy new server version (from Docker Templates):
`python ecs_manager.py deploy conf/bst-server bst-server.json dev`



