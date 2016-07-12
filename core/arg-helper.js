"use strict";
class ArgHelper {
    constructor(args) {
        this.args = args;
        this.keyValueArguments = {};
        this.orderedArguments = [];
        this.parse();
    }
    parse() {
        console.log("arg: " + this.args);
        for (let i = 2; i < this.args.length; i++) {
            let arg = this.args[i];
            if (arg.startsWith("--")) {
                let key = arg.substring(2);
                let value = null;
                if (this.args.length > (i + 1)) {
                    value = this.args[i + 1];
                }
                this.keyValueArguments[key] = value;
                i++;
            }
            else {
                this.orderedArguments.push(arg);
            }
        }
    }
    forIndex(index) {
        let value = null;
        if (this.orderedArguments.length > index) {
            value = this.orderedArguments[index];
        }
        return value;
    }
    forKey(key) {
        let value = null;
        if (key in this.keyValueArguments) {
            value = this.keyValueArguments[key];
        }
        return value;
    }
}
exports.ArgHelper = ArgHelper;
//# sourceMappingURL=arg-helper.js.map