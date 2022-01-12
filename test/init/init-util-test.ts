import * as assert from "assert";
import { InitUtil } from "../../lib/init/init-util";
import * as fs from "fs";
import { get } from "lodash";
import { TestParser } from "skill-testing-ml";
import { Global } from "../../lib/core/global";

describe("init util", function () {
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

    describe("init with multi locale and e2e", () => {
        it("Should create only $INVOCATION_UTTERANCE and $HELP_UTTERANCE and use variables $firstTestName and $testSuiteDescription for test and test suite descriptions", async () => {
            const locales = ["en-US", "es-PE"];
            const projectName = "hello world";
            await new InitUtil("e2e", "alexa", "index.js", locales.join(","), projectName, undefined, undefined, false).createFiles();

            const existUnitTestFile = "test/unit/index.test.yml";
            const existE2eTestFile = "test/e2e/index.e2e.yml";
            const existTestingFile = "testing.json";


            assert.ok(!fs.existsSync(existUnitTestFile));
            assert.ok(fs.existsSync(existE2eTestFile));
            assert.ok(fs.existsSync(existTestingFile));

            assert.ok(fs.existsSync(existTestingFile));
            assert.ok(fs.existsSync(existTestingFile));

            // validate files were create
            assert.ok(locales.map(f => fs.existsSync(`test/e2e/locales/${f}.yml`)).filter(v => v === false).length === 0);

            await Global.loadConfig();
            const parser: TestParser = new TestParser("test/e2e/index.e2e.yml");
            const testSuite = parser.parse({});
            await testSuite.loadLocalizedValues();

            assert.ok(testSuite.tests.length === 1)

            assert.deepStrictEqual("$testSuiteDescription", get(testSuite, "configuration.description", "").toString());
            assert.deepStrictEqual("$firstTestName", get(testSuite, "tests[0].description", "").toString());
            assert.deepStrictEqual(["$INVOCATION_UTTERANCE", "$HELP_UTTERANCE"], get(testSuite, "tests[0].interactions", []).map(v => get(v, "utterance", null)));
        });

        it("Should localized have only these keys: $testSuiteDescription, $firstTestName, $launchPrompt, $helpPrompt when is multi-localized", async () => {
            const expectedKey = ["$testSuiteDescription", "$firstTestName", "$launchPrompt", "$helpPrompt", "$INVOCATION_UTTERANCE", "$HELP_UTTERANCE"];
            const locales = ["en-US", "es-PE"];
            const projectName = "hello world";
            await new InitUtil("e2e", "alexa", "index.js", locales.join(","), projectName, undefined, undefined, false).createFiles();

            const existUnitTestFile = "test/unit/index.test.yml";
            const existE2eTestFile = "test/e2e/index.e2e.yml";
            const existTestingFile = "testing.json";


            assert.ok(!fs.existsSync(existUnitTestFile));
            assert.ok(fs.existsSync(existE2eTestFile));
            assert.ok(fs.existsSync(existTestingFile));

            assert.ok(fs.existsSync(existTestingFile));
            assert.ok(fs.existsSync(existTestingFile));

            // validate files were create
            assert.ok(locales.map(f => fs.existsSync(`test/e2e/locales/${f}.yml`)).filter(v => v === false).length === 0);

            await Global.loadConfig();
            const parser: TestParser = new TestParser("test/e2e/index.e2e.yml");
            const testSuite = parser.parse({});
            await testSuite.loadLocalizedValues();

            assert.deepStrictEqual(Object.keys(get(testSuite, `localizedValues[${locales[0]}]`, {})), expectedKey);
        });

        it("Should not create locale files if only one locale", async () => {
            const locales = ["en-US"];
            const projectName = "hello world";
            await new InitUtil("e2e", "alexa", "index.js", locales.join(","), projectName, undefined, undefined, false).createFiles();

            const existUnitTestFile = "test/unit/index.test.yml";
            const existE2eTestFile = "test/e2e/index.e2e.yml";
            const existTestingFile = "testing.json";


            assert.ok(!fs.existsSync(existUnitTestFile));
            assert.ok(fs.existsSync(existE2eTestFile));
            assert.ok(fs.existsSync(existTestingFile));

            assert.ok(fs.existsSync(existTestingFile));
            assert.ok(fs.existsSync(existTestingFile));

            // validate files were create
            assert.ok(locales.map(f => fs.existsSync(`test/e2e/locales/${f}.yml`)).filter(v => v === true).length === 0);
        });
    });

    function deleteFolderRecursive(path: string) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
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
