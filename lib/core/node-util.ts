import {resetCache} from "mockery";
import {LoggingHelper} from "./logging-helper";

const Logger = "NODEUTIL";
/**
 * Helper functions for core Node stuff
 */
export class NodeUtil {
    public static load(file: string): any {
        // Invalidates local files every time - basically forces a reload
        NodeUtil.resetCache();
        return require(file);
    }

    /**
     * Invalidates the require cache for files that are in the working directory
     * Excludes files in the node_modules
     * The idea is to re-load the programmer's code
     */
    public static resetCache () {
        let directory: string = process.cwd();
        for (let file in require.cache) {
            if (require.cache.hasOwnProperty(file)
                && file.startsWith(directory)
                && file.indexOf("node_modules") === -1) {
                delete require.cache[require.resolve(file)];
                let localPart = file.substr(directory.length);
                LoggingHelper.debug(Logger, "ReloadCache: " + localPart);
            }
        }
    }
}
