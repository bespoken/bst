export class SpokesClient {
    public constructor(private _id: string, private _secretKey: string) {
    }

    public verifyUUIDisNew() {
        return true;
    }

    public createPipe () {
        return {
            uuid: this._secretKey,
            diagnosticsKey: null,
            endPoint: {
                name: this._id
            },
            http: {
                url: "https://proxy.bespoken.tools",
            },
            path: "/",
            pipeType: "HTTP",
            proxy: true
        };
    }
}
