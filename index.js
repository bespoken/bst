/**
 * This holds all the "public" classes from bespoken-tools
 */
var AudioPlayer = require('./lib/alexa/audio-player').AudioPlayer;
var BSTSpeak = require('./lib/client/bst-speak').BSTSpeak;
var LambdaRunner = require('./lib/client/lambda-runner').LambdaRunner;

exports.AudioPlayer = AudioPlayer;
exports.BSTSpeak = BSTSpeak;
exports.LambdaRunner = LambdaRunner;
