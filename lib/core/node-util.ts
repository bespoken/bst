/**
 * Helper functions for core Node stuff
 */
export class NodeUtil {
    public static load(file: string): any {
        // Invalidates local files every time - basically forces a reload
        NodeUtil.resetCache();
        return require(file);
    }

    public static run(file: string): any {
        NodeUtil.requireClean(file);
    }

    public static requireClean(file: string) {
        // Invalidates local files every time - basically forces a reload
        delete require.cache[require.resolve(file)];
        return require(file);
    }
    /**
     * Invalidates the require cache for files that are in the working directory
     * Excludes files in the node_modules
     * The idea is to re-load the programmer's code
     */
    public static resetCache () {
        let directory: string = process.cwd();
        for (let file of Object.keys(require.cache)) {

            if (file.startsWith(directory)
                && file.indexOf("node_modules") === -1) {
                delete require.cache[require.resolve(file)];
            }
        }
    }
}