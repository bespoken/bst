import {ISilentResult, SilentEcho} from "silent-echo-sdk";
import {Global} from "../core/global";

export class SilentEchoClient {
    public static speak(utterance: string, token?: string): Promise<ISilentResult> {
        if (token) {
            if (Global.config()) {
                Global.config().updateSilentEchoToken(token);
            }
        }

        const tokenToUse = token ? token : Global.config().silentEchoToken();

        if (!tokenToUse) {
            throw new Error("Token Required");
        }

        const silentEcho = new SilentEcho(tokenToUse);

        return silentEcho.message(utterance);
    }
}

