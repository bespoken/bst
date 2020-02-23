import {get} from "request-promise-native";

const SOURCE_API_URL = process.env.SOURCE_API_URL || "source-api.bespoken.tools";

export class BstMessages {
    public async callService() {
        const options = {
            uri: `https://${SOURCE_API_URL}/v1/messages`,
            json: true,
            timeout: 10000
        };
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