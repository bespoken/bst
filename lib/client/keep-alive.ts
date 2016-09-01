import {SocketHandler} from "../core/socket-handler";
import {Global} from "../core/global";

const KeepAlivePeriod = 30000; // Ping every 30 seconds
const KeepAliveWindowPeriod = 300000; // Check over a 5 Minute period
const KeepAliveWarningThreshold = 5; // Need to get more than five pings in that period

/**
 * Handles keeping the client connection alive.
 * I resisted the urge to call this "Stayin' Alive" - you're welcome!
 */
export class KeepAlive {
    public pingPeriod: number = KeepAlivePeriod;
    public windowPeriod: number = KeepAliveWindowPeriod;
    public warningThreshold: number = KeepAliveWarningThreshold;

    private keepAliveArray: Array<number> = []; // Rolling window of timestamps that correspond to errors
    private startedTimestamp: number;
    private onFailureCallback: () => void;
    private timeout: any = null;

    public constructor (private socket: SocketHandler) {}

    /**
     * Pings the server on a 5-second period to keep the connection alive
     */
    public start (onFailureCallback: () => void) {
        this.onFailureCallback = onFailureCallback;
        this.reset();
        this.keepAlive();
    }

    public reset (): void {
        this.startedTimestamp = new Date().getTime();
    }

    private keepAlive (): void {
        let self = this;

        // Do not start checking keep alives until the process has been running for some time
        if ((new Date().getTime() - this.startedTimestamp) > this.windowPeriod) {
            this.keepAliveArray = this.keepAlivesInPeriod(this.windowPeriod);
            if (this.keepAliveArray.length <= this.warningThreshold) {
                this.onFailureCallback();
                this.reset();
            }
        }

        this.timeout = setTimeout(function () {
            self.socket.send(Global.KeepAliveMessage);
            self.keepAlive();
        }, this.pingPeriod);
    }

    private keepAlivesInPeriod (periodInMilliseconds: number): Array<number> {
        // Create a new clean array each time to expire out old values
        let newArray: Array<number> = [];

        // Loops through the array
        let rightNow = new Date().getTime();
        for (let timestamp of this.keepAliveArray) {
            let secondsPassed: number = rightNow - timestamp;
            if (secondsPassed < periodInMilliseconds) {
                newArray.push(timestamp);
            }
        }

        return newArray;
    }

    public received () {
        this.keepAliveArray.push(new Date().getTime());
    }

    public stop(): void {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
        }
    }
}
