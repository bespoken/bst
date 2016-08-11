export interface Tool {
    execute(): void;
    validate(): string;
}