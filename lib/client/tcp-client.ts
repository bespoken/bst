import * as net from "net";
import {NetworkErrorType} from "../core/global";
import {LoggingHelper} from "../core/logging-helper";

let Logger = "TCP-CLIENT";

export interface TCPClientCallback {
    (data: Buffer, errorType: NetworkErrorType, errorMessage: string): void;
}

export class TCPClient {
    public onCloseCallback: () => void;
    public constructor (public id: string) {}

    public transmit(host: string, port: number, requestData: string, callback: TCPClientCallback) {
        let self = this;
        let client = new net.Socket();
        console.log("Full data (this should only be request)", requestData);
        LoggingHelper.info(Logger, "Forwarding " + host + ":" + port);

        client.on("error", function (e: any) {
            console.log("TCPClient Error: " + e.message);
            if (e.code ===  "ECONNREFUSED") {
                callback(null, NetworkErrorType.CONNECTION_REFUSED, e.message);
            } else {
                callback(null, NetworkErrorType.OTHER, e.message);
            }
        });

        client.connect(port, host, function () {
            // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
            client.write(requestData);
        });


        // Add a 'data' event handler for the client socket
        // data is what the server sent to this socket
        client.on("data", function(incommingData: Buffer) {
            const receivedData =  incommingData.toString();
            const httpResponseCode = receivedData.substr(9, 3);
            // On Redirect we need to write data again to correct location
            console.log("httpResponseCode", httpResponseCode);
            if (httpResponseCode === "302") {
                const splitResponse = receivedData.split("Location: ");
                if (splitResponse.length === 1) {
                    // 302 but no location, use the callback to continue flow
                    callback(incommingData, null, null);
                    return;
                }

                const fullLocationUri = splitResponse[1].split("\r\n")[0];

                let isHttps = false;
                if (fullLocationUri.startsWith("https")) {
                    // we need to change HTTP to HTTPS
                    isHttps = true;
                }
                const locationWithoutProtocol = fullLocationUri.split("//")[1];
                console.log(locationWithoutProtocol, "locationWithoutProtocol");
                const splittedUri = locationWithoutProtocol.split("/");
                const newLocation = splittedUri[0];
                const splittedPath = splittedUri.slice(1);
                splittedPath.splice(0, 0, "");
                const newPath = splittedPath.join("/");
                console.log("newLocation", newLocation);
                console.log("path", newPath);
                client.destroy();
                const splitRequestData = requestData.split("\r\n");
                console.log("splittedRequestData", splitRequestData);
                const requestDataHttpLine = splitRequestData[0];
                console.log("requestDataHttpLine", requestDataHttpLine);

                const splittedHttpLine = requestDataHttpLine.split(" ");
                console.log("splittedHttpLine", splittedHttpLine);

                splittedHttpLine.splice(1, 1, newPath);
                // if (isHttps) {
                //    splittedHttpLine[2] = splittedHttpLine[2].replace("HTTP", "HTTPS");
                // }
                console.log("splittedHttpLine", splittedHttpLine);
                const newHttpLine = splittedHttpLine.join(" ");
                console.log("newHttpLine", newHttpLine);
                splitRequestData.splice(0, 1, newHttpLine);

                const modifiedRequest = splitRequestData.join("\r\n");
                console.log("modifiedRequest", modifiedRequest);

                // this case only happens on context of redirection
                let newPort = port;
                if (port === 80 && isHttps) {
                    newPort = 443;
                }
                client.connect(newPort, newLocation, function () {
                    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
                    client.write(modifiedRequest);
                });
                return;
            }

            console.log("Data from the client :", receivedData);

            callback(incommingData, null, null);
        });

        // Add a 'close' event handler for the client socket
        client.on("close", function(had_error: boolean) {
            LoggingHelper.debug(Logger, "Connection closed ID: " + self.id + " HadError: " + had_error);
            if (self.onCloseCallback !== undefined && self.onCloseCallback !== null) {
                self.onCloseCallback();
            }
        });
    }

    public close(): void {

    }

}
