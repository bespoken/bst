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

    describe.only("createFilesStructure()", () => {
        it("create file structure for unit tests", async () => {
            await InitUtil.createFilesStructure("unit", "alexa", "en-US");

            const existUnitTestFile = fs.existsSync("test/unit/index.test.yml");
            const existUnitTestingFile = fs.existsSync("test/unit/testing.json");
            const existE2eTestFile = fs.existsSync("test/e2e/index.test.yml");
            const existE2eTestingFile = fs.existsSync("test/e2e/testing.json");

            assert.equal(existUnitTestFile, true);
            assert.equal(existUnitTestingFile, true);
            assert.equal(existE2eTestFile, false);
            assert.equal(existE2eTestingFile, false);
        });

        it("create file structure for e2e tests", async () => {
            await InitUtil.createFilesStructure("e2e", "alexa", "en-US");

            const existUnitTestFile = fs.existsSync("test/unit/index.test.yml");
            const existUnitTestingFile = fs.existsSync("test/unit/testing.json");
            const existE2eTestFile = fs.existsSync("test/e2e/index.test.yml");
            const existE2eTestingFile = fs.existsSync("test/e2e/testing.json");
            assert.equal(existUnitTestFile, false);
            assert.equal(existUnitTestingFile, false);
            assert.equal(existE2eTestFile, true);
            assert.equal(existE2eTestingFile, true);
        });

        it("create file structure for unit and e2e tests", async () => {
            await InitUtil.createFilesStructure("both", "alexa", "en-US");

            const existUnitTestFile = fs.existsSync("test/unit/index.test.yml");
            const existUnitTestingFile = fs.existsSync("test/unit/testing.json");
            const existE2eTestFile = fs.existsSync("test/e2e/index.test.yml");
            const existE2eTestingFile = fs.existsSync("test/e2e/testing.json");
            assert.equal(existUnitTestFile, true);
            assert.equal(existUnitTestingFile, true);
            assert.equal(existE2eTestFile, true);
            assert.equal(existE2eTestingFile, true);
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