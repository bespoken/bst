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
        try {
            await BSTConfig.bootstrapIfNeeded();
        } catch (error) {
            throw error;
        }

        let data = fs.readFileSync(BSTConfig.configPath());
        let config = JSON.parse(data.toString());

        let bstConfig = new BSTConfig();
        bstConfig.loadFromJSON(config);
        return bstConfig;
    }

    public save() {
        BSTConfig.saveConfig(this.configuration);
    }

    public nodeID(): string {
        return this.configuration.nodeID;
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
            try {
                let configJSON = await BSTConfig.createConfig();

                BSTConfig.saveConfig(configJSON);
            } catch (error) {
                throw error;
            }
        } else {
            // If config exists but doesn't have sourceID update it
            let data = fs.readFileSync(BSTConfig.configPath());
            let config = JSON.parse(data.toString());

            if (!config.sourceID) {
                try {
                    const pipeConfig = await BSTConfig.createConfig();
                    config.sourceID = pipeConfig.sourceID;
                    config.secretKey = pipeConfig.secretKey;
                    BSTConfig.saveConfig(config);
                } catch (error) {
                    throw error;
                }
            }
        }
    }

    private static saveConfig(config: any) {
        let configBuffer = new Buffer(JSON.stringify(config, null, 4) + "\n");
        fs.writeFileSync(BSTConfig.configPath(), configBuffer);
    }

    private static async createConfig(): Promise<any> {
        let lambdaConfig = LambdaConfig.defaultConfig().lambdaDeploy;
        try {
            const pipeInfo = await BSTConfig.createSpokesPipe();

            return {
                "sourceID": pipeInfo.endpoint.name,
                "secretKey": pipeInfo.uuid,
                "lambdaDeploy": lambdaConfig
            };
        } catch (error) {
            LoggingHelper.error(Logger, "Error : " + error.stack);
            throw error;
        }
    }

    private static async createSpokesPipe(): Promise<any> {
        let isUUIDUnassigned = false;
        let sourceNameGenerator = null;
        let spokesClient = null;
        let spokesPipe = null;
        try {
            sourceNameGenerator = new SourceNameGenerator();
            const generatedKey = await sourceNameGenerator.callService();
            spokesClient = new SpokesClient(generatedKey.id, generatedKey.secretKey);
            isUUIDUnassigned = await spokesClient.verifyUUIDisNew();
            if (isUUIDUnassigned) {
                spokesPipe = await spokesClient.createPipe();
            }
        } catch (error) {
            LoggingHelper.error(Logger, "Error : " + error.stack);
            throw Error("Unable to create spokes connection");
        }
        return spokesPipe;
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