/// <reference path="../../typings/index.d.ts" />

import {StringUtil} from "./string-util";

export class BufferUtil {
    public static prettyPrint(buffer: Buffer): string {
        let s = buffer.toString();
        return StringUtil.prettyPrint(s);
    }

    public static fromString(s: string): Buffer {
        return new Buffer(s);
    }

    // Find the specified value within the buffer
    public static scan(body: Buffer, sequence: Array<number>): number {
        let index = -1;
        for (let i = 0; i < body.length; i++) {
            let val = body[i];
            if (val === sequence[0]) {
                let match = true;
                for (let ii = 1; ii < sequence.length; ii++) {
                    let bodyIndex = i + ii;
                    if (bodyIndex >= body.length) {
                        match = false;
                        break;
                    }

                    val = body[bodyIndex];
                    if (val !== sequence[ii]) {
                        match = false;
                        break;
                    }
                }

                if (match) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    }
}
