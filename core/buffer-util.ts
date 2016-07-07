/// <reference path="../typings/globals/node/index.d.ts" />

import {StringUtil} from "./string-util";

export class BufferUtil {
    public static prettyPrint(buffer: Buffer) {
        let s = buffer.toString();
        s = StringUtil.replaceAll(s, "\r\n", "\\n");
        s = StringUtil.replaceAll(s, "\n", "\\n");
        return s;
    }
}
