/// <reference path="../../typings/index.d.ts" />

import {StringUtil} from "./string-util";

export class BufferUtil {
    public static prettyPrint(buffer: Buffer): string {
        let s = buffer.toString();
        return StringUtil.prettyPrint(s);
    }
}
