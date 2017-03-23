import * as fs from "fs";
import {LoggingHelper} from "../core/logging-helper";
import {FSWatcher} from "fs";
import {NodeUtil} from "../core/node-util";

let Logger = "MODULE-MGR";

/**
 * Common code for FunctionServer and LambdaServer
 * For managing changes to files
 */
export class ModuleManager {
    public onDirty: (filename: string) => void = null; // Callback for test-ability

    private dirty: boolean = false;
    private modules: {[id: string]: any} = {};
    private watcher: FSWatcher = null;


    public constructor(private directory: string) {
        // If the directory path is not absolute, make it so
        if (!this.directory.startsWith("/")) {
            this.directory = [process.cwd(), this.directory].join("/");
        }
    }

    public start(): void {
        const self = this;
        const watchOptions = {"persistent": false, "recursive": true};
        this.watcher = fs.watch(this.directory, watchOptions, function(event: string, filename: string) {
            let exclude = false;
            if (filename.indexOf("node_modules") !== -1) {
                exclude = true;
            } else if (filename.endsWith("___")) {
                exclude = true;
            } else if (filename.startsWith(".")) {
                exclude = true;
            }

            if (!exclude) {
                LoggingHelper.info(Logger, "FS.Watch Event: " + event + ". File: " + filename + ". Reloading.");
                self.dirty = true;
                if (self.onDirty !== undefined && self.onDirty !== null) {
                    self.onDirty(filename);
                }
            }
        });
    }

    public module(filePath: string): any {
        const fullPath = [this.directory, filePath].join("/");
        console.log("Loading: " + fullPath);
        let module: any = null;
        if (fullPath in this.modules && !this.dirty) {
            module = this.modules[fullPath];
        } else {
            module = NodeUtil.load(fullPath);
            this.modules[fullPath] = module;
            this.dirty = false;
        }
        return module;
    }

    public stop(): void {
        this.watcher.close();
    }
}
    