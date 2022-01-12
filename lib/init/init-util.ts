import * as fs from "fs";
import { TestParser } from "skill-testing-ml";

export class InitUtil {
    private isMultilocale: boolean;
    public lastTestingJSONFilename: string;

    constructor(
        private type: string,
        private platform: string,
        private handler: string,
        private locales: string,
        private projectName: string,
        private virtualDeviceToken?: string,
        private dialogFlow?: string,
        private testingExist?: boolean,
        private phoneNumber?: string,
    ) {
        this.isMultilocale = locales.split(",").length > 1;
        this.projectName = projectName || "voice hello world";
        this.handler = handler || "index.js";
        this.locales = locales || "en-US";
        this.virtualDeviceToken = virtualDeviceToken || "[your virtual device token goes here]";
        this.dialogFlow = dialogFlow || "Path to your Dialogflow directory. Read more at https://read.bespoken.io/unit-testing/guide-google/#configuration";
        this.testingExist = testingExist;
        this.phoneNumber = phoneNumber;
    }

    public async createFiles(): Promise<void> {
        this.lastTestingJSONFilename = this.getTesTingJSONName();
        await this.createTestFilesForType(this.type, this.platform);
    }

    public static isThereTestingJsonFile() {
        const currentFolder = process.cwd();
        return fs.existsSync(`${currentFolder}/testing.json`);
    }

    public getTesTingJSONName() {
        const path = process.cwd();
        let lastTestingJsonFile = "testing.json";
        if (fs.existsSync(`${path}/${lastTestingJsonFile}`) && !this.testingExist) {
            let lastCreatedTime = 0;
            fs.readdirSync(path).forEach(file => {
                const filePath = `${path}/${file}`;
                const _file = fs.lstatSync(filePath);
                if (_file.isFile() && file.match(/testing.*\.json/)) {
                    const { birthtimeMs } = _file;
                    if (birthtimeMs > lastCreatedTime) {
                        lastCreatedTime = birthtimeMs;
                        lastTestingJsonFile = file;
                    }
                }
            });
            const [, afterDash] = lastTestingJsonFile.split("_");
            if (!afterDash) {
                return "testing_01.json";
            } else {
                let [_index] = afterDash.split(".");
                const index = parseInt(_index);
                const newIndex = index < 9 ? `0${index + 1}` : index + 1;
                return `testing_${newIndex}.json`;
            }
        }
        return lastTestingJsonFile;
    }

    private async createTestFilesForType(type: string, platform: string): Promise<void> {
        const currentFolder = process.cwd();
        if (!fs.existsSync(`${currentFolder}/test`)) {
            fs.mkdirSync(`${currentFolder}/test`);
        }
        const testFolder = `${currentFolder}/test/${type}`;
        if (!fs.existsSync(testFolder)) {
            fs.mkdirSync(testFolder);
        }

        await this.createMultilocaleFiles(type);

        const ymlContent = this.getYmlContent(type, platform);
        const testingFileContent = this.getTestingJson();
        const preExtension = type === "unit" ? "test" : "e2e";
        await this.writeFile(`${testFolder}/index.${preExtension}.yml`, ymlContent);
        await this.writeFile(`${currentFolder}/${this.lastTestingJSONFilename}`, JSON.stringify(testingFileContent, null, 4));
    }

    private getYmlContent(type: string, platform: string): string {
        const parser = new TestParser();

        const configuration = {
            description: this.getTestSuiteDescription(type),
        };
        const interactions = [this.getLaunchInteraction(type, platform)];
        if (platform !== "phone") {
            interactions.push(this.getHelpInteraction(type, platform));
        }
        const yamlObject = {
            configuration,
            "tests": [
                {
                    interactions,
                    "name": this.getTestName(),
                },
            ],
        };


        parser.loadYamlObject(yamlObject);
        let contents = parser.contents;
        // hacky way, because yaml to object doesnt support comments
        if (type === "unit" && platform === "google") {
            contents = `${contents}`.replace("- HelpIntent :", "- HelpIntent : #replace with the intent for help");
        }
        const comment = this.getHeaderComment(type);
        return `${comment}${contents}`;
    }

    private getTestSuiteDescription(type: string): string {
        if (this.isMultilocale) {
            return "$testSuiteDescription";
        }

        if (type === "unit") {
            return "My first unit test suite";
        } else if (type === "e2e") {
            return "My first e2e test suite";
        }
        return "";
    }

    private getTestName(): string {
        if (this.isMultilocale) {
            return "$firstTestName";
        } else if (this.platform === "phone") {
            return "Dial and ask for help";
        } else if (["whatsapp", "sms"].indexOf(this.platform) > -1) {
            return "Ask for help";
        }
        return "Launch and ask for help";
    }

    private getLaunchInteraction(type: string, platform?: string): object {
        let expected = "";
        let input = "";
        if (this.isMultilocale) {
            input = "$INVOCATION_UTTERANCE";
            expected = "$launchPrompt";
        } else {
            if (type === "unit") {
                input = "LaunchRequest";
                expected = `Welcome to ${this.projectName}`;
            } else if (type === "e2e") {
                if (platform === "phone") {
                    input = "$DIAL";
                    expected = `Welcome to ${this.projectName}`;
                } else if (["sms", "whatsapp"].indexOf(platform) > -1) {
                    input = "hello";
                    expected = `Welcome to ${this.projectName}`;
                } else {
                    input = `open ${this.projectName}`;
                    expected = `Welcome to ${this.projectName}`;
                }
            }
        }
        const expectedItems = [
            {
                "action": "prompt",
                "operator": ":",
                "value": expected,
            },
        ];
        if (platform === "phone") {
            expectedItems.push({
                "action": "set finishOnPhrase",
                "operator": ":",
                "value": "what can I help you with?",
            });
        }
        return {
            "expected": expectedItems,
            input,
        };
    }

    private getHelpInteraction(type: string, platform: string): object {
        let expectedPrompt = "helpPrompt";
        let input = "";

        if (this.isMultilocale) {
            if (type === "unit") {
                input = platform === "alexa" ? "AMAZON.HelpIntent" : "HelpIntent";
            } else if (type === "e2e") {
                input = "$HELP_UTTERANCE";
                expectedPrompt = "$helpPrompt"
            }
        } else {
            if (type === "unit") {
                input = platform === "alexa" ? "AMAZON.HelpIntent" : "HelpIntent";

            } else if (type === "e2e") {
                input = "help";
            }
            expectedPrompt = "What can I help you with";
        }
        return {
            "expected": [
                {
                    "action": "prompt",
                    "operator": ":",
                    "value": expectedPrompt,
                },
            ],
            input,
        };
    }

    private getTestingJson(): any {
        const testingJsonForUnit = {
            handler: this.handler,
            locales: this.locales,
        };
        const testingJsonForE2e = {
            virtualDeviceToken: this.virtualDeviceToken,
            ...testingJsonForUnit,
            type: "e2e",
        };

        delete testingJsonForE2e.handler;

        if (this.platform === "google") {
            testingJsonForUnit["platform"] = "google";
            testingJsonForUnit["dialogFlow"] = this.dialogFlow;
        } else if (["phone", "sms", "whatsapp"].indexOf(this.platform) > -1) {
            testingJsonForE2e["platform"] = this.platform;
            testingJsonForE2e["phoneNumber"] = this.phoneNumber;
        }
        return this.type === "unit" ? testingJsonForUnit : testingJsonForE2e;
    }

    private getHeaderComment(type: string): string {
        let link = type === "e2e" ?
            "https://read.bespoken.io/end-to-end/getting-started/" :
            "https://read.bespoken.io/unit-testing/getting-started/";
        const multilocaleComment = `# This is the test file for your ${type} tests, feel free to copy and modify the template test
# as many times as you want. In this same folder, you'll also find a testing.json
# file. It contains global configurations for future test files you might create in the future.
# You'll also find a folder called locales, it contains the localization files for all your supported
# locales. Just put a value to each variable and they will be replaced here. Add, remove or modify
# as necessary.
#
# Find more info on ${link}
`;
        const singlelocaleComment = `# This is the test file for your ${type} tests, feel free to copy and modify the template test
# as many times as you want. In this same folder, you'll also find a testing.json
# file. It contains global configurations for future test files you might create in the future.
#
# Find more info on ${link}
`;
        return this.isMultilocale ? multilocaleComment : singlelocaleComment;
    }

    private async createMultilocaleFiles(type: string): Promise<void> {
        if (!this.isMultilocale) {
            return;
        }
        const currentFolder = process.cwd();

        if (!fs.existsSync(`${currentFolder}/test/${type}/locales`)) {
            fs.mkdirSync(`${currentFolder}/test/${type}/locales`);
        }

        const localizedValues = this.getLocalizedProperties();

        await Promise.all(this.locales.split(",").filter((x) => x).map((locale) => {
            locale = locale.trim();
            const enOnlyComment = locale === "en-US" ? " for en-US" : "";
            const comment = `# This is the localization file${enOnlyComment}. Please, modify the values so that they align
# with your voice app responses for this locale

`;
            let localizedFileContent = "";
            if (locale === "en-US") {
                localizedFileContent = Object.keys(localizedValues)
                    .map((key) => `${key}: ${localizedValues[key]}`)
                    .join("\n");
            } else {
                localizedFileContent = Object.keys(localizedValues)
                    .map((key) => `${key}:`)
                    .join("\n");
            }
            localizedFileContent = `${comment}${localizedFileContent}`;
            return this.writeFile(`${currentFolder}/test/${type}/locales/${locale}.yml`,
                localizedFileContent);
        }));
    }

    getLocalizedProperties(): Object {
        if (this.isMultilocale && this.type === 'e2e') {
            return {
                $testSuiteDescription: "My first unit test suite",
                $firstTestName: "Launch and ask for help",
                $launchPrompt: `Welcome to ${this.projectName}`,
                $helpPrompt: "What can I help you with?",
                $INVOCATION_UTTERANCE: `Open ${this.projectName} overview`,
                $HELP_UTTERANCE: "help"
            };
        }

        return {
            testSuiteDescription: "My first unit test suite",
            firstTestName: "Launch and ask for help",
            launchPrompt: `Welcome to ${this.projectName}`,
            helpPrompt: "What can I help you with?",
            helpCardContent: "What can I help you with?",
            helpCardTitle: this.projectName,
        };
    }

    private async writeFile(path: string, toWrite: any): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, toWrite, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}
