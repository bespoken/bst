/// <reference path="../../typings/index.d.ts" />

import {Command} from "../core/command";
import ICommand = commander.ICommand;
export class ProxyCommand implements Command {
    public constructor(public commandInfo: ICommand) {}

    public execute(): void {

    }

    public validate(): string {
        return null;
    }
}
