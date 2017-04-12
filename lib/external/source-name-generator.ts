import {get} from "request-promise-native";

export class SourceNameGenerator {
    public async callService() {
        const response = await get("https://source-api.bespoken.tools/v1/sourceId");
        return JSON.parse(response);
    };
}