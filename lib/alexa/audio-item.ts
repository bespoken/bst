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

    public constructor (public json: any) {
        this.url = json.stream.url;
        this.token = json.stream.token;
        this.expectedPreviousToken = json.stream.expectedPreviousToken;
        this.offsetInMilliseconds = json.stream.offsetInMilliseconds;
    }
}