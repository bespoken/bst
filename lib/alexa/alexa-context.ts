import {AudioPlayer} from "./audio-player";
const uuid = require("node-uuid");

export class AlexaContext {
    private _applicationID: string;
    private _userID: string;
    private _audioPlayer: AudioPlayer;

    public constructor(public skillURL: string, audioPlayer: AudioPlayer, applicationID?: string) {
        this._applicationID = applicationID;
        this._audioPlayer = audioPlayer;
    }

    public applicationID(): string {
        // Generate an application ID if it is not set
        if (this._applicationID === undefined || this._applicationID === null) {
            this._applicationID = "amzn1.echo-sdk-ams.app." + uuid.v4();
        }
        return this._applicationID;
    }


    public userID(): string {
        if (this._userID === undefined || this._userID === null) {
            this._userID = "amzn1.ask.account." + uuid.v4();
        }
        return this._userID;
    }

    public audioPlayer(): AudioPlayer {
        return this._audioPlayer;
    }

    public audioPlayerEnabled(): boolean {
        return this._audioPlayer !== null;
    }
}
