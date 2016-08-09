export interface Command {
    execute(): void;
    validate(): string;
}