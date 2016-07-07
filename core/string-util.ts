/// <reference path="../typings/globals/node/index.d.ts" />

export class StringUtil {
    public static replaceAll(s: string, val: string, newVal: string) {
        while (s.indexOf(val) != -1) {
            s = s.replace(val, newVal);
        }
        return s;
    }
}