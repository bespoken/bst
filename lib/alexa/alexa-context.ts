import {AudioPlayer} from "./audio-player";
import {InteractionModel} from "./interaction-model";
import {AlexaSession} from "./alexa-session";
const uuid = require("uuid");

/**
 * Manages state of the Alexa device interaction across sessions.
 *
 * Holds information about the user, the current session, as well as the AudioPlayer, if in use.
 *
 * To emulate a user with a linked account, set the access token property.
 */
export class AlexaContext {
    private _accessToken: string = null;
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

    public setUserID(userID: string) {
        this._userID = userID;
    }

    public accessToken(): string {
        return this._accessToken;
    }

    public setAccessToken(token: string): void {
        this._accessToken = token;
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
