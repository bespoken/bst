import {get, post} from "request-promise-native";

export class SourceNameGenerator {
    public async callService() {
        const options = {
            uri: "https://source-api.bespoken.tools/v1/sourceId",
            json: true,
            timeout: 30000
        };
        return get(options);
    };

    public async createDashboardSource(id: string, secretKey: string) {
        const options = {
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
        return post(options);
    }
}