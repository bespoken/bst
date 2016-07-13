# Notes on setup

## Setting up typescript with Mocha
Got some info here:  
http://jonnyreeves.co.uk/2015/hello-typescript-and-mocha/

### Install typings to get TypeScript definitions for libraries
npm install typings --global

### Ran this to get typescript definition for mocha
typings install dt~mocha --global --save

### Typings for node
typings install dt~node --global --save

### Did a bunch of other stuff

## Getting WebStorm working correctly with TSC
Go To preferences
Enable typescript compiler
Point WebStorm at the node_modules/typescript/lib directory for the TypeScript compiler
Use tsconfig.json settings

### Setting up Javascript
Set the project preferences to ECMAScript 6

## Setting up NPM
Need to do this the first time to publish:
`npm adduser`

Updated the version number:
`npm version minor`

Ran publish command:
`npm publish`



