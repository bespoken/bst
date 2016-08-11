/**
 * Helper functions for core Node stuff
 */
export class NodeUtil {
    public static runJS(file: string) {
        // Invalidates the file every time - basically forces a reload
        delete require.cache[require.resolve(file)];
        let bst: any = require(file);
    }
}
