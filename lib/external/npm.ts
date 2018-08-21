import {get} from "request-promise-native";

export class NpmClient {

    public static async getLastVersion(): Promise<string> {
        const options = {
            uri: "https://registry.npmjs.org/bespoken-tools/latest",
            timeout: 30000
        };

        try {
            const result = await get(options);
            if (result) {
                const resultJson = JSON.parse(result);
                return resultJson && resultJson.version;
            }
        } catch (error) {
            if (process.env.DISPLAY_ERRORS) {
                console.log("error", error);
            }
        }
        return undefined;
    };

    public static isVersionGreaterThan(versionA: string, versionB: string) {
        const [majorA, minorA, patchA] = versionA.split(".");
        const [majorB, minorB, patchB] = versionB.split(".");
        if (parseInt(majorA) < parseInt(majorB)) return false;
        else if (parseInt(majorA) > parseInt(majorB)) return true;

        if (parseInt(minorA) < parseInt(minorB)) return false;
        else if (parseInt(minorA) > parseInt(minorB)) return true;

        if (parseInt(patchA) < parseInt(patchB)) return false;
        else if (parseInt(patchA) > parseInt(patchB)) return true;

        return false;
    }
}