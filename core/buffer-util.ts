/// <reference path="../typings/globals/node/index.d.ts" />

import {StringUtil} from "./string-util";

export class BufferUtil {
    public static prettyPrint(buffer: Buffer) {
        let s = buffer.toString();
        return StringUtil.replaceAll(s, "\r\n", "\\n");
    }
}
