# Initial Setup
## Install typings and gulp
`npm install typings --global`  
`npm install gulp --global`

These commands will be used commonly for development tasks.

## Run gulp build
`gulp build`  

Under the covers this runs `npm install` and sets everything up.

# Publishing to NPM
## Pre-Requisites
Need to do this the first time to publish:  
`npm adduser`

## Steps
1) Make sure you are on master and have the latest:  
`git checkout master`  
`git pull`  

2) Create a branch to do NPM work - use the next version as the branch name:  
`git checkout -b Version0-6-5`

This is necessary because master is a protected branch - changes cannot be pushed directly to it.

3) Create a remote version of the new branch (MAKE SURE TO PUSH THIS FIRST OR THE VERSION COMMAND WILL FAIL):  
`git push --set-upstream origin <NewBranch>`

4) Updated the version number:  
`npm version patch`

5) Publish the new version:  
`npm publish`

6) Create and merge a pull request for the branch

7) Add release notes:  
https://github.com/bespoken/bst/releases

**Notes on testing:**
To test your new package before publishing, follow these instructions:  
https://docs.npmjs.com/misc/developers

# Deploying server versions
Deploy new server version (from Docker Templates):
`python ecs_manager.py deploy conf/bst-server bst-server.json dev`
