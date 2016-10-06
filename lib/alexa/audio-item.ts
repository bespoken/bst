/**
 * Information about an AudioItem.
 *
 * Directly ties off to the JSON payload from Alexa.
 */
export class AudioItem {
    public stream: Stream;

    public constructor (private _json: any) {
        this.stream = new Stream();
        this.stream.url = _json.stream.url;
        this.stream.token = _json.stream.token;
        this.stream.expectedPreviousToken = _json.stream.expectedPreviousToken;
        this.stream.offsetInMilliseconds = _json.stream.offsetInMilliseconds;
    }

    /**
     * Clone function to prevent changes being made to internal state
     */
    public clone(): AudioItem {
        return new AudioItem(this);
    }
}

export class Stream {
    public url: string = null;
    public token: string = null;
    public expectedPreviousToken: string = null;
    public offsetInMilliseconds: number;
}