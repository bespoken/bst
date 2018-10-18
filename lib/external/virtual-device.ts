import {IVirtualDeviceResult, VirtualDevice} from "virtual-device-sdk";
import {Global} from "../core/global";

export class VirtualDeviceClient {
    public static async speak(utterance: string, token?: string, locale?: string, voiceID?: string): Promise<IVirtualDeviceResult> {
        if (token) {
            if (Global.config()) {
                Global.config().updateVirtualDeviceToken(token);
            }
        }

        const tokenToUse = token ? token : Global.config().virtualDeviceToken();

        if (!tokenToUse) {
            throw new Error("Token Required");
        }

        const virtualDevice = new VirtualDevice(tokenToUse, locale, voiceID);
        try {
            // We need to await here in order to trigger correctly the exception
            return await virtualDevice.message(utterance);
        } catch (error) {
            throw error;
        }
    }

    public static renderResult(result: IVirtualDeviceResult): string {
        let stringResult = "";
        if (result.transcript) {
            stringResult = "Transcript:\n";
            stringResult += result.transcript + "\n\n";

        }

        if (result.streamURL) {
            stringResult += "Stream:\n";
            stringResult += result.streamURL + "\n\n";
        }

        if (result.card) {
            stringResult += "Card:\n";
            if (result.card.mainTitle) {
                stringResult += result.card.mainTitle + "\n";
            }
            if (result.card.subTitle) {
                stringResult += result.card.subTitle + "\n";
            }
            if (result.card.textField) {
                stringResult += result.card.textField + "\n";
            }
            if (result.card.imageURL) {
                stringResult += result.card.imageURL + "\n";
            }
        }
        return stringResult;
    }
}

