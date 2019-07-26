import * as fs from "fs";

export class InitUtil {

    public static async createFilesStructure(type: string, platform: string,
        locales: string, virtualDeviceToken?: string): Promise<void> {
        const testingForUnit = {
            handler: "relative or absolute path to your voice app entry point",
            locales,
        };
        const testingForE2e = {
            virtualDeviceToken: virtualDeviceToken || "[your virtual device token goes here]",
            locales,
            type: "e2e",
        };

        const platformSufix = ["unit", "both"].indexOf(type) &&
            ["google", "both"].indexOf(platform) > -1 ? "google" : "";
        if (type === "both") {
            await this.createFilesStructureByType("unit", platformSufix, locales, testingForUnit);
            await this.createFilesStructureByType("e2e", "", locales, testingForE2e);
        } else if (type === "unit") {
            await this.createFilesStructureByType("unit", platformSufix, locales, testingForUnit);
        } else if (type === "e2e") {
            await this.createFilesStructureByType("e2e", "", locales, testingForE2e);
        }
    }

    private static async createFilesStructureByType(type: string, platform: string,
        locales: string, testingJson: object): Promise<void> {
        const isMultiLocale = locales.split(",").length > 1;
        const currentFolder =  process.cwd();
        if (!fs.existsSync(`${currentFolder}/test`)) {
            fs.mkdirSync(`${currentFolder}/test`);
        }
        const testFolder = `${currentFolder}/test/${type}`;
        if (!fs.existsSync(testFolder)) {
            fs.mkdirSync(testFolder);
        }

        const target = `${testFolder}/index.test.yml`;
        const sufix = platform === "google" ? "-google" : "";
        let source = `${__dirname}/resources/${type}${sufix}.yml`;

        if (isMultiLocale) {
            source = `${__dirname}/resources/${type}-multilocale${sufix}.yml`;
            if (!fs.existsSync(`${currentFolder}/test/${type}/locales`)) {
                fs.mkdirSync(`${currentFolder}/test/${type}/locales`);
            }

            await Promise.all(locales.split(",").map(async (locale) => {
                const localizacionPathSufix = locale === "en-US" ? "-en-US" : "";
                return await this.copyFile(`${__dirname}/resources/localization${localizacionPathSufix}.txt`,
                    `${currentFolder}/test/${type}/locales/${locale.trim()}.yml`);
            }));

        }
        await this.copyFile(source, target);
        await this.writeFile(`${currentFolder}/test/${type}/testing.json`,
            JSON.stringify(testingJson, null, 4));
    }

    private static async copyFile(source: string, target: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const rd = fs.createReadStream(source);
            rd.on("error", function(err) {
                reject(err);
            });
            const wr = fs.createWriteStream(target);
            wr.on("error", function(err) {
                reject(err);
            });
            wr.on("close", function() {
                resolve();
            });
            rd.pipe(wr);
        });
    }

    private static async writeFile(path: string, toWrite: any): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, toWrite, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
     }
}