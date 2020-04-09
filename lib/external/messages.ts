import {get} from "request-promise-native";
const HttpsProxyAgent = require("https-proxy-agent");

const SOURCE_API_URL = process.env.SOURCE_API_URL || "source-api.bespoken.tools";

export class BstMessages {
    public async callService() {
        const options: any = {
            uri: `https://${SOURCE_API_URL}/v1/messages`,
            json: true,
            timeout: 10000
        };

        const proxy = process.env.HTTPS_PROXY;

        if (proxy) {
            options.agent = new HttpsProxyAgent(proxy);
        }

        const messages = await get(options);
        const result: any = {};
        if (messages) {
            if (messages.customMessages) {
                result.customMessages = messages.customMessages;
            }
            if (messages.tips) {
                result.tips = messages.tips;
            } else if (messages.tip) {
                result.tips = [messages.tip];
            }
        }
        return result;
    }
}