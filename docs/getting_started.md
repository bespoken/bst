## Installation

Make sure you have NPM and node installed:
```
$ node --version && npm --version
```
We support node version `4.x.x` and above.  For help installing, see [How To Install NPM](http://blog.npmjs.org/post/85484771375/how-to-install-npm)


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

To work with the Bespoken Tools API, install it with your project as part of the package.json:
```
npm install bespoken-tools --save
```

You will then be able to use our:
 
* [BSTAlexa](http://docs.bespoken.tools/en/latest/api/classes/bstalexa.html) emulator 
* [BSTEncode](http://docs.bespoken.tools/en/latest/api/classes/bstalexa.html) audio encoder
* [Logless](http://docs.bespoken.tools/en/latest/api/classes/logless.html) effortless logging and diagnostics service

## Updating

To update bst:
```
$ npm update bespoken-tools -g
```
