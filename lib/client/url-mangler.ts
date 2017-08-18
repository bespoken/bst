import * as url from "url";
import {Url} from "url";
import {Global} from "../core/global";
export class URLMangler {
    public static mangle(urlString: string, sourceID: string, secretKey: string): string {
        let urlValue: Url = url.parse(urlString, true, false);
        return URLMangler.mangleJustPath(urlValue.path, sourceID, secretKey);
    }

    public static manglePipeToPath(sourceID: string, secretKey?: string) {
        const secureParam = secretKey ? "?bespoken-key=" + secretKey : "";
        return `https://${ sourceID }.${ Global.SpokesPipeDomain }${ secureParam }`;
    }

    public static mangleJustPath(path: string, sourceID: string, secretKey: string): string {
        let newUrl: string = "https://";
        newUrl += Global.SpokesDashboardHost;
        newUrl += path;
        if (path.indexOf("?") !== -1) {
            newUrl += "&";
        } else {
            newUrl += "?";
        }
        newUrl += "id=" + sourceID;
        newUrl += "&key=" + secretKey;

        return newUrl;
    }

    /**
     * Creates the BST proxy URL when there is no path
     * @param sourceID
     * @returns {string}
     * @param secretKey
     * @returns {string}
     */
    public static mangleNoPath(sourceID: string, secretKey: string): string {
        let newUrl: string = "https://";
        newUrl += Global.SpokesDashboardHost;
        newUrl += "?id=" + sourceID;
        newUrl += "&key=" + secretKey;
        return newUrl;
    }
}