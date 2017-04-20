import * as assert from "assert";
import * as fs from "fs";
import {ModuleManager} from "../../lib/client/module-manager";
import {FileUtil} from "../../lib/core/file-util";

describe("ModuleManager", function() {
    it("Handles Reload Correctly", function(done) {
        let manager = new ModuleManager("test/resources");
        manager.start();

        let example = manager.module("ExampleLambda.js");
        example.id = "TEST";
        example = manager.module("ExampleLambda.js");
        assert.equal(example.id, "TEST");

        manager.onDirty = () => {
            example = manager.module("ExampleLambda.js");
            // Make sure after being dirty, new module is loaded
            assert(example.id === undefined);

            // Then make sure the dirty flag is flipped back to false
            example.id = "ANOTHER";
            example = manager.module("ExampleLambda.js");
            assert.equal(example.id, "ANOTHER");
            manager.stop();
            done();
        };

        FileUtil.copyFile("test/resources/ExampleLambda.js", "test/resources/ExampleLambdaCopy.js");
    });

    it("Handles Reload Exclusions Correctly", function(done) {
        let sourceFile = "test/resources/ExampleLambda.js";
        let manager = new ModuleManager("test/resources");
        manager.start();

        if (!fs.existsSync("test/resources/node_modules")) {
            fs.mkdirSync("test/resources/node_modules");
        }

        manager.onDirty = function (filename: string) {
            if (filename === "ExampleLambdaCopy.js") {
                // We some times get the change from the previous test - we can ignore it
            } else {
                assert(false, "Should not be called");
            }
        };

        FileUtil.copyFile(sourceFile, "test/resources/ExampleLambda.js___");
        FileUtil.copyFile(sourceFile, "test/resources/.dummy");
        FileUtil.copyFile(sourceFile, "test/resources/node_modules/CopiedLambda.js");

        setTimeout(function () {
            fs.unlinkSync("test/resources/ExampleLambda.js___");
            fs.unlinkSync("test/resources/.dummy");
            fs.unlinkSync("test/resources/node_modules/CopiedLambda.js");
            fs.rmdirSync("test/resources/node_modules");
            manager.stop();
            done();
        }, 100);
    });

    it("Handles No Reload after stop", function(done) {
        let tempFile = "test/resources/ExampleLambdaCopy.js";
        let manager = new ModuleManager("test/resources");
        let dirtyCalled = false;
        manager.onDirty = function () {
            dirtyCalled = true;
        };

        manager.start();
        manager.stop();

        FileUtil.copyFile("test/resources/ExampleLambda.js", tempFile);

        // We use a timeout, because we do not know when the watcher is going to fire exactly
        //  Need to give it some time
        setTimeout(function () {
            assert.equal(dirtyCalled, false);
            done();
        }, 100);
    });

});