export class RequestError extends Error {
    public statusCode;

    public constructor (message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}