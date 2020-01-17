import * as assert from "assert";
import {InitUtil} from "../../lib/init/init-util";
import * as fs from "fs";

describe("init util", function() {
    beforeEach(() => {
        if (!fs.existsSync("test/init/temp")) {
            fs.mkdirSync("test/init/temp");
        }
        process.chdir("test/init/temp");
    });

    afterEach(() => {
        process.chdir("../../..");
        deleteFolderRecursive("test/init/temp");
    });

    describe("testing.json does not exist", () => {
        it("create file structure for unit tests", async () => {
            await new InitUtil("unit", "alexa", "index.js", "en-US", "hello world").createFiles();

            const existUnitTestFile = fs.existsSync("test/unit/index.test.yml");
            const existE2eTestFile = fs.existsSync("test/e2e/index.e2e.yml");
            const existTestingFile = fs.existsSync("testing.json");

            assert.equal(existUnitTestFile, true);
            assert.equal(existE2eTestFile, false);
            assert.equal(existTestingFile, true);
        });

        it("create file structure for e2e tests", async () => {
            await new InitUtil("e2e", "alexa", "index.js", "en-US", "hello world").createFiles();

            const existUnitTestFile = fs.existsSync("test/unit/index.test.yml");
            const existE2eTestFile = fs.existsSync("test/e2e/index.e2e.yml");
            const existTestingFile = fs.existsSync("testing.json");
            assert.equal(existUnitTestFile, false);
            assert.equal(existE2eTestFile, true);
            assert.equal(existTestingFile, true);
        });
    });

    describe("testing.json exists", () => {

        describe("user selects overwrite current testing.json", () => {
            it("create file structure for unit tests", async () => {
                await new InitUtil("unit", "alexa", "index.js", "en-US", "hello world", undefined, undefined, true).createFiles();

                const existUnitTestFile = fs.existsSync("test/unit/index.test.yml");
                const existE2eTestFile = fs.existsSync("test/e2e/index.e2e.yml");
                const existTestingFile = fs.existsSync("testing.json");

                assert.equal(existUnitTestFile, true);
                assert.equal(existE2eTestFile, false);
                assert.equal(existTestingFile, true);
            });

            it("create file structure for e2e tests", async () => {
                await new InitUtil("e2e", "alexa", "index.js", "en-US", "hello world", undefined, undefined, true).createFiles();

                const existUnitTestFile = fs.existsSync("test/unit/index.test.yml");
                const existE2eTestFile = fs.existsSync("test/e2e/index.e2e.yml");
                const existTestingFile = fs.existsSync("testing.json");
                assert.equal(existUnitTestFile, false);
                assert.equal(existE2eTestFile, true);
                assert.equal(existTestingFile, true);
            });
        });

        describe("user decides not to overwrite his current testing.json file", () => {
            it("create file structure for unit tests", async () => {
                fs.writeFileSync("testing.json", "");
                await new InitUtil("unit", "alexa", "index.js", "en-US", "hello world", undefined, undefined, false).createFiles();

                const existUnitTestFile = fs.existsSync("test/unit/index.test.yml");
                const existE2eTestFile = fs.existsSync("test/e2e/index.e2e.yml");
                const existTestingFile = fs.existsSync("testing.json");
                const existTestingFile1 = fs.existsSync("testing_01.json");
                assert.equal(existUnitTestFile, true);
                assert.equal(existE2eTestFile, false);
                assert.equal(existTestingFile, true);
                assert.equal(existTestingFile1, true);
            });

            it("create file structure for e2e tests", async () => {
                fs.writeFileSync("testing.json", "");
                await new InitUtil("e2e", "alexa", "index.js", "en-US", "hello world", undefined, undefined, false).createFiles();

                const existUnitTestFile = fs.existsSync("test/unit/index.test.yml");
                const existE2eTestFile = fs.existsSync("test/e2e/index.e2e.yml");
                const existTestingFile = fs.existsSync("testing.json");
                const existTestingFile1 = fs.existsSync("testing_01.json");
                assert.equal(existUnitTestFile, false);
                assert.equal(existE2eTestFile, true);
                assert.equal(existTestingFile, true);
                assert.equal(existTestingFile1, true);
            });
        });
    });

    function deleteFolderRecursive(path: string) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function(file, index) {
                const curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }
});
