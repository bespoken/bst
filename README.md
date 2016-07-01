# Notes on setup

## Setting up typescript with Mocha
Got some info here:  
http://jonnyreeves.co.uk/2015/hello-typescript-and-mocha/

### Install tsd to get TypeScript definitions for libraries
npm install tsd -g

### Ran this to get typescript definition for mocha
typings install dt~mocha --global --save

### Typings for node
typings install dt~node --global --save