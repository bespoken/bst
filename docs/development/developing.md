# Initial Setup
## Install packages
`npm install`

This will grab all the npm packages associated with the project and set it up.

## Run gulp build
`npm run build`

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

5) Publish the new version as beta:
`npm publish --tag beta`

6) Create and merge a pull request for the branch

7) Add release notes:  
https://github.com/bespoken/bst/releases

8) Test the npm deployed package (new changes, sanity checks)

9) Mark the newest package as latest
`npm dist-tag add bespoken-tools@<version> latest`

**Notes on testing:**
To test your new package before publishing, follow these instructions:  
https://docs.npmjs.com/misc/developers

# Deploying server versions
Deploy new server version (from Docker Templates):
`python ecs_manager.py deploy conf/bst-server bst-server.json dev`
