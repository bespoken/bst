import {resetCache} from "mockery";
import {LoggingHelper} from "./logging-helper";

const Logger = "NODEUTIL"
/**
 * Helper functions for core Node stuff
 */
export class NodeUtil {
    public static load(file: string): any {
        // Invalidates local files every time - basically forces a reload
        NodeUtil.resetCache();
        let module: any = require(file);
        return module;
    }

    public static resetCache () {
        let directory: string = process.cwd();
        for (let file in require.cache) {
            if (file.startsWith(directory) && file.indexOf("node_modules") === -1) {
                delete require.cache[require.resolve(file)];
                let localPart = file.substr(directory.length);
                LoggingHelper.debug(Logger, "ReloadCache: " + localPart);
            }
        }
    }
}
