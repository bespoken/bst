export class RequestError extends Error {
    public statusCode;
    public code;
    public constructor (message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}