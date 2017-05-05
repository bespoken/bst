import {get, post} from "request-promise-native";
import {LoggingHelper} from "../core/logging-helper";

const Logger = "SPOKES-CLIENT";

export class SpokesClient {
    private _secretKey: string;
    private _id: string;
    public constructor(private id: string, private secretKey: string) {
        this._secretKey = secretKey;
        this._id = id;
    }

    public async verifyUUIDisNew(): Promise<boolean> {
        const options = {
            uri: `https://api.bespoken.link/pipe/${ this._secretKey }`,
            headers: {
                "x-access-token": "4772616365-46696f72656c6c61",
            },
            body: {

            },
            json: true, // Automatically parses the JSON string in the response
            timeout: 30000
        };

        try {
            await get(options);
        } catch (error) {
            if (error.statusCode && error.statusCode !== 404) {
                // different kind of error, we log and throw
                LoggingHelper.error(Logger, `Error while verifying id: ${ error.message }`);
                throw error;
            }
            // uuid doesn't exist
            return true;
        }

        return false;
    };

    public async createPipe(): Promise<any> {
        const options = {
            uri: "https://api.bespoken.link/pipe",
            headers: {
                "x-access-token": "4772616365-46696f72656c6c61",
            },
            body: {
                // The secret key for the Skill
                uuid: this._secretKey,
                diagnosticsKey: null,
                endPoint: {
                    // The unique name/ID for the skill
                    name: this._id,
                },
                http: {
                    url: "https://proxy.bespoken.tools",
                },
                path: "/",
                pipeType: "HTTP",
                proxy: true,
            },
            json: true, // Automatically parses the JSON string in the response
            timeout: 30000
        };
        const response = await post(options);
        // Spokes creates a endPointID but not return the endPoint name
        response.endPoint = {
            name: this._id,
        };
        return response;
    }
}