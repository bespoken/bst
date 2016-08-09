"use strict";
const global_1 = require("../lib/core/global");
const logging_helper_1 = require("../lib/core/logging-helper");
const program = require("commander");
let Logger = "BST";
global_1.Global.initialize();
logging_helper_1.LoggingHelper.info(Logger, "Node Version: " + process.version);
let nodeMajorVersion = parseInt(process.version.substr(1, 2));
if (nodeMajorVersion < 4) {
    logging_helper_1.LoggingHelper.error(Logger, "!!!!Node version must be >= 4!!!!");
    logging_helper_1.LoggingHelper.error(Logger, "Please install to use bst");
    process.exit(1);
}
program
    .version(global_1.Global.version())
    .command("proxy (http|lambda)", "launches the bst proxy")
    .parse(process.argv);
//# sourceMappingURL=bst.js.map