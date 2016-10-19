import * as fs from "fs";

export class FileUtil {
    // StackOverflow code - always the best :-)
    // http://stackoverflow.com/questions/11293857/fastest-way-to-copy-file-in-node-js
    public static copyFile(source: string, target: string, callback?: (error?: Error) => void) {
        let cbCalled = false;

        let readStream = fs.createReadStream(source);
        readStream.on("error", function(error: Error) {
            done(error);
        });

        let writeStream = fs.createWriteStream(target);
        writeStream.on("error", function(error: Error) {
            done(error);
        });

        writeStream.on("close", function() {
            done();
        });
        readStream.pipe(writeStream);

        function done(error?: Error) {
            if (!cbCalled) {
                if (callback !== undefined && callback !== null) {
                    callback(error);
                }
                cbCalled = true;
            }
        }
    }

    public static readFile(source: string, callback: (data: Buffer) => void) {
        fs.readFile(source, null, function (error: NodeJS.ErrnoException, data: Buffer) {
            if (error !== null) {
                callback(null);
            } else {
                callback(data);
            }
        });
    }
}