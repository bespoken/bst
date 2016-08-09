import {Global} from "../lib/core/global";
import {LoggingHelper} from "../lib/core/logging-helper";
import * as program from "commander";

let Logger = "BST";

Global.initialize();
LoggingHelper.info(Logger, "Node Version: " + process.version);
let nodeMajorVersion = parseInt(process.version.substr(1, 2));

if (nodeMajorVersion < 4) {
    LoggingHelper.error(Logger, "!!!!Node version must be >= 4!!!!");
    LoggingHelper.error(Logger, "Please install to use bst");
    process.exit(1);
}

program
    .version(Global.version())
    .command("proxy (http|lambda)", "launches the bst proxy")
    .parse(process.argv);

