/// <reference path="../../typings/index.d.ts" />

export class StringUtil {
    public static replaceAll(s: string, val: string, newVal: string): string {
        while (s.indexOf(val) !== -1) {
            s = s.replace(val, newVal);
        }
        return s;
    }

    public static prettyPrint(bufferString: string): string {
        let s: string = StringUtil.replaceAll(bufferString, "\r\n", "\\n");
        s = StringUtil.replaceAll(s, "\n", "\\n");
        return s;
    }

    /**
     * Pads a string on the right - truncates if it is longer than length
     * @param s
     * @param padString
     * @param length
     * @returns {string}
     */
    public static rpad(s: string, padString: string, length: number): string {
        let str = s;
        while (str.length < length)
            str = str + padString;

        if (str.length > length) {
            str = str.substr(0, length);
        }

        return str;
    }

    public static isIn(input: string, values: Array<string>): boolean {
        let match = false;
        for (let s of values) {
            if (input === s) {
                match = true;
                break;
            }
        }
        return match;
    }
}