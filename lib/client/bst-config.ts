import * as fs from "fs";
import {ProxyType} from "./bst-proxy";
import {LoggingHelper} from "../core/logging-helper";
import {LambdaConfig} from "./lambda-config";
import {SourceNameGenerator} from "../external/source-name-generator";
import {SpokesClient} from "../external/spokes";

const Logger = "CONFIG";
const BSTDirectoryName = ".bst";

/**
 * Handles setting up initial configuration and ongoing state of BST
 */
export class BSTConfig {
    public configuration: any = null;
    public process: any = null;

    /**
     * Loads the configuration
     * Done all synchronously as this is done first thing at startup and everything waits on it
     */
    public static async load(): Promise<BSTConfig> {
        await BSTConfig.bootstrapIfNeeded();

        let data = fs.readFileSync(BSTConfig.configPath());
        let config = JSON.parse(data.toString());

        let bstConfig = new BSTConfig();
        bstConfig.loadFromJSON(config);
        return bstConfig;
    }

    public save() {
        BSTConfig.saveConfig(this.configuration);
    }

    public static getBstVersion() {
        const packageInfo: any = require("../../package.json");
        return packageInfo.version;
    }
    public sourceID(): string {
        return this.configuration.sourceID;
    }

    public secretKey(): string {
        return this.configuration.secretKey;
    }

    public applicationID(): string {
        return this.configuration.applicationID;
    }

    public updateApplicationID(applicationID: string): void {
        this.configuration.applicationID = applicationID;
        this.commit();
    }

    public updateVirtualDeviceToken(virtualDeviceToken: string): void {
        this.configuration.virtualDeviceToken = virtualDeviceToken;
        this.commit();
    }

    public deleteSession(): void {
        if (fs.existsSync(BSTConfig.sessionPath())) {
            fs.unlinkSync(BSTConfig.sessionPath());
        }
    }

    public saveSession(session: any): void {
        const sessionBuffer = new Buffer(JSON.stringify(session, null, 4) + "\n");
        fs.writeFileSync(BSTConfig.sessionPath(), sessionBuffer);
    }

    public loadSession(): any {
        if (!fs.existsSync(BSTConfig.sessionPath())) {
            return null;
        }
        const data = fs.readFileSync(BSTConfig.sessionPath());
        return JSON.parse(data.toString());
    }

    public virtualDeviceToken(): string {
        return this.configuration.virtualDeviceToken;
    }

    public commit() {
        let configBuffer = new Buffer(JSON.stringify(this.configuration, null, 4) + "\n");
        fs.writeFileSync(BSTConfig.configPath(), configBuffer);
    }

    private loadFromJSON(config: any): void {
        this.configuration = config;
    }

    private static configDirectory(): string {
        return getUserHome() + "/" + BSTDirectoryName;
    }

    private static configPath(): string {
        return BSTConfig.configDirectory() + "/config";
    }

    private static sessionPath(): string {
        return BSTConfig.configDirectory() + "/session";
    }

    /**
     * Creates a new configuration file if one does not exist
     */
    private static async bootstrapIfNeeded(): Promise<void> {
        let directory = BSTConfig.configDirectory();
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }

        if (!fs.existsSync(BSTConfig.configPath())) {
            LoggingHelper.info(Logger, "No configuration. Creating one: " + BSTConfig.configPath());

            // Create the config file if it does not yet exist
            let configJSON = await BSTConfig.createConfig();

            BSTConfig.saveConfig(configJSON);
        } else {
            // If config exists but doesn't have sourceID update it
            let data = fs.readFileSync(BSTConfig.configPath());
            let config = JSON.parse(data.toString());

            if (!config.sourceID || !config.version) {
                await BSTConfig.updateConfig(config);
            }
        }
    }

    private static async updateConfig(config: any): Promise<void> {
        const previousKey = config.nodeID || config.secretKey;
        const generatedConfig = await BSTConfig.createConfig(previousKey, config.sourceID);
        config.sourceID = generatedConfig.sourceID;
        config.secretKey = generatedConfig.secretKey;
        config.version = generatedConfig.version;
        delete config.nodeID;
        BSTConfig.saveConfig(config);
    }

    private static saveConfig(config: any) {
        let configBuffer = new Buffer(JSON.stringify(config, null, 4) + "\n");
        fs.writeFileSync(BSTConfig.configPath(), configBuffer);
    }

    private static async createConfig(nodeID?: string, sourceID?: string): Promise<any> {
        const lambdaConfig = LambdaConfig.defaultConfig().lambdaDeploy;
        const pipeInfo = await BSTConfig.createExternalResources(nodeID, sourceID);

        return {
            "sourceID": pipeInfo.endPoint.name,
            "secretKey": pipeInfo.uuid,
            "lambdaDeploy": lambdaConfig,
            "version": this.getBstVersion(),
        };
    }

    private static async createSpokesPipe(id: string, secretKey: string): Promise<any> {
        const spokesClient = new SpokesClient(id, secretKey);
        const isUUIDUnassigned = await spokesClient.verifyUUIDisNew();
        if (isUUIDUnassigned) {
            return spokesClient.createPipe();
        }

        // Pipe exists, we return the info we have as pipe
        return {
            endPoint: {
                name: id,
            },
            uuid: secretKey,
        };
    }

    private static async createSource(secretKey?: string, sourceID?: string): Promise<any> {
        const sourceNameGenerator = new SourceNameGenerator();
        let id;
        let key;

        // Covers new users case and also
        // If someone have only sourceID but not secretKey then he modified the config, so it's ok to drop
        if (!secretKey) {
            const generatedKey = await sourceNameGenerator.callService();
            id = generatedKey.id;
            key = generatedKey.secretKey;
        }

        // This means it has nodeID but have no pipe or key
        if (secretKey && !sourceID) {
            const generatedKey = await sourceNameGenerator.callService();
            id = generatedKey.id;
            key = secretKey;
        }

        if (sourceID && secretKey) {
            // We have a previously created config, we try to create it directly
            id = sourceID;
            key = secretKey;
        }

        try {
            await sourceNameGenerator.createDashboardSource(id, key);
        } catch (e) {
            // If the source already exists everything is fine
            if (e.statusCode !== 403) {
                throw(e);
            }
        }

        return {
            id,
            key,
        };
    }

    private static async createExternalResources(secretKey?: string, sourceID?: string): Promise<any> {
        const sourceData = await this.createSource(secretKey, sourceID);
        const pipe = await this.createSpokesPipe(sourceData.id, sourceData.key);
        return pipe;
    }
}

export class BSTProcess {
    public port: number;
    public proxyType: ProxyType;
    public pid: number;

    public constructor() {}

    /**
     * Returns the running process, if any
     */
    public static running(): BSTProcess {
        let process: BSTProcess = null;
        if (fs.existsSync(BSTProcess.processPath())) {
            let data = fs.readFileSync(BSTProcess.processPath());
            let json = JSON.parse(data.toString());

            // Check if the process is actually running - otherwise discount it
            if (BSTProcess.isRunning(json.pid)) {
                process = new BSTProcess();
                process.loadJSON(json);
            }
        }
        return process;
    }

    // Excellent code from the internet
    //  https://github.com/nisaacson/is-running/blob/master/index.js
    //  http://stackoverflow.com/questions/14390930/how-to-check-if-an-arbitrary-pid-is-running-using-node-js
    private static isRunning (pid: number): boolean {
        try {
            process.kill(pid, 0);
            return true;
        } catch (e) {
            return e.code === "EPERM";
        }
    }

    public static processPath(): string {
        return getUserHome() + "/" + BSTDirectoryName + "/process";
    }

    public static run(port: number, proxyType: ProxyType, pid: number): BSTProcess {
        let process = new BSTProcess();
        process.port = port;
        process.proxyType = proxyType;
        process.pid = pid;

        let json = process.json();
        let jsonBuffer = new Buffer(JSON.stringify(json, undefined, 4) + "\n");

        fs.writeFileSync(BSTProcess.processPath(), jsonBuffer);
        return process;
    }

    public kill(): boolean {
        try {
            process.kill(this.pid, "SIGKILL");
            return true;
        } catch (e) {
            console.error("Error killing process[" + this.pid + "] Message: " + e.message);
            return false;
        }
    }

    private loadJSON(json: any) {
        this.port = json.port;
        this.proxyType = json.proxyType;
        this.pid = json.pid;
    }

    private json() {
        return {
            "port": this.port,
            "type": this.proxyType,
            "pid": this.pid
        };
    }
}

// Internet code:
//  http://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way
function getUserHome(): string {
    return process.env[(process.platform === "win32") ? "USERPROFILE" : "HOME"];
}
