import {get, post} from "request-promise-native";
const HttpsProxyAgent = require("https-proxy-agent");

export class SourceNameGenerator {
    public async callService() {
        const options: any = {
            uri: "https://source-api.bespoken.tools/v1/sourceId",
            json: true,
            timeout: 30000
        };

        const proxy = process.env.HTTPS_PROXY;

        if (proxy) {
            options.agent = new HttpsProxyAgent(proxy);
        }

        return get(options);
    }

    public async createDashboardSource(id: string, secretKey: string) {
        const options: any = {
            uri: "https://source-api.bespoken.tools/v1/createSource",
            headers: {
            },
            body: {
                source: {
                    id,
                    secretKey,
                    name: id,
                    liveDebug: true,
                },
            },
            json: true,
            timeout: 30000
        };

        const proxy = process.env.HTTPS_PROXY;

        if (proxy) {
            options.agent = new HttpsProxyAgent(proxy);
        }

        return post(options);
    }
}