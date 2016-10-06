/**
 * Information about an AudioItem.
 *
 * Directly ties off to the JSON payload from Alexa.
 */
export class AudioItem {
    public url: string = null;
    public token: string = null;
    public expectedPreviousToken: string = null;
    public offsetInMilliseconds: number;

    public constructor (private _json: any) {
        this.url = _json.stream.url;
        this.token = _json.stream.token;
        this.expectedPreviousToken = _json.stream.expectedPreviousToken;
        this.offsetInMilliseconds = _json.stream.offsetInMilliseconds;
    }

    public json(): any {
        return {
            stream: {
                url: this.url,
                token: this.token,
                expectedPreviousToken: this.expectedPreviousToken,
                offsetInMilliseconds: this.offsetInMilliseconds
            }
        };
    }
}