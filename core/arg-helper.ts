/**
 * Helps with parsing out arguments passed to command-line programs
 */
export class ArgHelper {
    public keyValueArguments: {[id: string]: string} = {};
    public orderedArguments: Array<string> = [];

    public constructor(public args: Array<string>) {
        this.parse();
    }

    private parse(): void {
        console.log("arg: " + this.args);

        for (let i = 2; i < this.args.length; i++ ) {
            let arg = this.args[i];

            // If the argument starts with "-", means it is a key-value argument
            if (arg.startsWith("--")) {
                let key = arg.substring(2);
                let value: string = null;
                // Make sure a value is passed for the argument
                if (this.args.length > (i + 1)) {
                    value = this.args[i + 1];
                }

                this.keyValueArguments[key] = value;
                i++;
            } else {
                this.orderedArguments.push(arg);
            }
        }
    }

    public forIndex(index: number): string {
        let value: string = null;
        if (this.orderedArguments.length > index) {
            value = this.orderedArguments[index];
        }
        return value;
    }

    public forKey(key: string): string {
        let value: string = null;
        if (key in this.keyValueArguments) {
            value = this.keyValueArguments[key];
        }
        return value;
    }
}
