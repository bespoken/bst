import {get, post} from "request-promise-native";

export class SourceNameGenerator {
    public async callService() {
        const response = await get("https://source-api.bespoken.tools/v1/sourceId");
        return JSON.parse(response);
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
                },
            },
            json: true

        };
        return post(options);
    }
}