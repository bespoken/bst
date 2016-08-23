import * as url from "url";
import {Url} from "url";
import {Global} from "../core/global";
export class URLMangler {
    public static mangle(urlString: string, nodeID: string): string {
        let urlValue: Url = url.parse(urlString, true, false);
        return URLMangler.mangleJustPath(urlValue.path, nodeID);
    }

    public static mangleJustPath(path: string, nodeID: string): string {
        let newUrl: string = "https://";
        newUrl += Global.BespokeServerHost;
        newUrl += path;
        if (path.indexOf("?") !== -1) {
            newUrl += "&";
        } else {
            newUrl += "?";
        }
        newUrl += "node-id=" + nodeID;
        return newUrl;
    }

    /**
     * Creates the BST proxy URL when there is no path
     * @param nodeID
     * @returns {string}
     */
    public static mangleNoPath(nodeID: string): string {
        let newUrl: string = "https://";
        newUrl += Global.BespokeServerHost;
        newUrl += "?node-id=" + nodeID;
        return newUrl;
    }
}