import {AudioPlayer} from "./audio-player";
import {InteractionModel} from "./interaction-model";
import {AlexaSession} from "./alexa-session";
const uuid = require("node-uuid");

export class AlexaContext {
    private _userID: string;
    private _session: AlexaSession;

    public constructor(private _skillURL: string,
                       private _interactionModel: InteractionModel,
                       private _audioPlayer: AudioPlayer,
                       private _applicationID?: string) {}

    public applicationID(): string {
        // Generate an application ID if it is not set
        if (this._applicationID === undefined || this._applicationID === null) {
            this._applicationID = "amzn1.echo-sdk-ams.app." + uuid.v4();
        }
        return this._applicationID;
    }

    public skillURL(): string {
        return this._skillURL;
    }

    public interactionModel(): InteractionModel {
        return this._interactionModel;
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

    public newSession(): void {
        this._session = new AlexaSession();
    }

    public session(): AlexaSession {
        return this._session;
    }

    public endSession(): void {
        this._session = null;
    }

    public activeSession(): boolean {
        return this._session !== null;
    }
}
