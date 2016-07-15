import * as url from "url";
import {Url} from "url";
import {Global} from "../core/global";
export class URLMangler {
    public constructor(private urlString: string, private nodeID: string) {

    }

    public mangle(): string {
        let urlValue: Url = url.parse(this.urlString, true, false);
        let newUrl: string = "https://";
        newUrl += Global.BespokeServerHost;
        newUrl += urlValue.path;
        if (urlValue.path.indexOf("?") !== -1) {
            newUrl += "&";
        } else {
            newUrl += "?";
        }
        newUrl += "node-id=" + this.nodeID;
        return newUrl;
    }
}